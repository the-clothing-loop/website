package throttle

import (
	"net/http"
	"net/http/httptest"
	"reflect"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

// Test Helpers
func expectSame(t *testing.T, a interface{}, b interface{}) {
	if a != b {
		t.Errorf("Expected %T: %v to be %T: %v", b, b, a, a)
	}
}

func expectApproximateTimestamp(t *testing.T, a int64, b int64) {
	if a != b && a != b+1 {
		t.Errorf("Expected %v to be bigger than or equal to %v", b, a)
	}
}

func expectStatusCode(t *testing.T, expectedStatusCode int, actualStatusCode int) {
	if actualStatusCode != expectedStatusCode {
		t.Errorf("Expected StatusCode %d, but received %d", expectedStatusCode, actualStatusCode)
	}
}

func utcTimestamp() int64 {
	return time.Now().Unix()
}

type Expectation struct {
	StatusCode         int
	Body               string
	RateLimitLimit     string
	RateLimitRemaining string
	RateLimitReset     int64
	Wait               time.Duration
	ForwardedFor       string
	Concurrent         bool
}

func setupGinWithPolicy(limit uint64, within time.Duration, options ...*Options) *gin.Engine {
	r := gin.New()

	addPolicy(r, limit, within, options...)

	r.Any("/test", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	return r
}

func addPolicy(r *gin.Engine, limit uint64, within time.Duration, options ...*Options) {
	r.Use(Policy(&Quota{
		Limit:  limit,
		Within: within,
	}, options...))
}

func setupGinWithPolicyAsHandler(limit uint64, within time.Duration, options ...*Options) *gin.Engine {
	r := gin.New()

	r.Any("/test", Policy(&Quota{
		Limit:  limit,
		Within: within,
	}, options...),
		func(c *gin.Context) {
			c.Status(http.StatusOK)
		})

	return r
}

func testResponseToExpectation(t *testing.T, r *gin.Engine, expectation *Expectation) {
	req, err := http.NewRequest("GET", "/test", strings.NewReader(""))

	if expectation.ForwardedFor != "" {
		req.Header.Set("X-Forwarded-For", expectation.ForwardedFor)
	} else {
		reflect.ValueOf(req).Elem().FieldByName("RemoteAddr").SetString("1.2.3.4:5000")
	}

	if err != nil {
		t.Error(err)
	}

	time.Sleep(expectation.Wait)
	recorder := httptest.NewRecorder()
	r.ServeHTTP(recorder, req)

	expectStatusCode(t, expectation.StatusCode, recorder.Code)
	if expectation.Body != "" {
		expectSame(t, recorder.Body.String(), expectation.Body)
	}

	header := recorder.Header()
	rateLimitLimit := header["X-Ratelimit-Limit"]
	rateLimitRemaining := header["X-Ratelimit-Remaining"]
	rateLimitReset := header["X-Ratelimit-Reset"]

	if expectation.RateLimitLimit != "" {
		expectSame(t, rateLimitLimit[0], expectation.RateLimitLimit)
	}

	if expectation.RateLimitRemaining != "" {
		expectSame(t, rateLimitRemaining[0], expectation.RateLimitRemaining)
	}

	if expectation.RateLimitReset != 0 {
		resetTime, err := strconv.ParseInt(rateLimitReset[0], 10, 64)
		if err != nil {
			t.Errorf(err.Error())
		}
		expectApproximateTimestamp(t, resetTime, expectation.RateLimitReset)
	}
}

func testResponses(t *testing.T, r *gin.Engine, expectations ...*Expectation) {
	runtime.GOMAXPROCS(runtime.NumCPU() * 2)
	wg := sync.WaitGroup{}
	for i, e := range expectations {
		if e.Concurrent {
			wg.Add(1)
			go func(k int, expectation *Expectation) {
				defer wg.Done()
				testResponseToExpectation(t, r, expectation)
			}(i, e)
		} else {
			wg.Wait()
			testResponseToExpectation(t, r, e)
		}
	}

	wg.Wait()
}

func TestTimeLimit(t *testing.T) {
	r := setupGinWithPolicyAsHandler(1, 10*time.Millisecond)
	testResponses(t, r, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
	}, &Expectation{
		StatusCode:         StatusTooManyRequests,
		Body:               "Too Many Requests",
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
	}, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
		Wait:               10 * time.Millisecond,
	})
}

func TestTimeLimitWhenForwarded(t *testing.T) {
	r := setupGinWithPolicyAsHandler(1, 10*time.Millisecond)
	testResponses(t, r, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
		ForwardedFor:       "2.3.4.5",
	}, &Expectation{
		StatusCode:         StatusTooManyRequests,
		Body:               "Too Many Requests",
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
		ForwardedFor:       "2.3.4.5",
	}, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
		Wait:               10 * time.Millisecond,
		ForwardedFor:       "2.3.4.5",
	})
}

func TestTimeLimitWithOptions(t *testing.T) {
	r := setupGinWithPolicy(1, 10*time.Millisecond, &Options{
		StatusCode: http.StatusBadRequest,
		Message:    "Server says no",
	})

	testResponses(t, r, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
	}, &Expectation{
		StatusCode:         http.StatusBadRequest,
		Body:               "Server says no",
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
	}, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "1",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
		Wait:               10 * time.Millisecond,
	})
}

func TestLimitWhenDisabled(t *testing.T) {
	m := setupGinWithPolicy(1, 10*time.Millisecond, &Options{
		Disabled: true,
	})

	testResponses(t, m, &Expectation{
		StatusCode: http.StatusOK,
	}, &Expectation{
		StatusCode: http.StatusOK,
	}, &Expectation{
		StatusCode: http.StatusOK,
		Wait:       10 * time.Millisecond,
	})
}

func TestRateLimit(t *testing.T) {
	r := setupGinWithPolicy(2, 20*time.Millisecond)
	testResponses(t, r, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "2",
		RateLimitReset: utcTimestamp(),
	}, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "2",
		RateLimitReset: utcTimestamp(),
	}, &Expectation{
		StatusCode:         StatusTooManyRequests,
		Body:               "Too Many Requests",
		RateLimitLimit:     "2",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
	}, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "2",
		RateLimitRemaining: "1",
		RateLimitReset:     utcTimestamp(),
		Wait:               20 * time.Millisecond,
	})
}

func TestRateLimitWithOptions(t *testing.T) {
	r := setupGinWithPolicyAsHandler(2, 10*time.Millisecond, &Options{
		StatusCode: http.StatusBadRequest,
		Message:    "Server says no",
	})
	testResponses(t, r, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "2",
		RateLimitReset: utcTimestamp(),
		Concurrent:     true,
	}, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "2",
		RateLimitReset: utcTimestamp(),
		Concurrent:     true,
	}, &Expectation{
		StatusCode:         http.StatusBadRequest,
		Body:               "Server says no",
		RateLimitLimit:     "2",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
	}, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "2",
		RateLimitRemaining: "1",
		RateLimitReset:     utcTimestamp(),
		Wait:               10 * time.Millisecond,
	})
}

// func TestMultiplePolicies(t *testing.T) {
// 	r := setupGinWithPolicyAsHandler(2, 20*time.Millisecond)
// 	addPolicy(r, 1, 5*time.Millisecond)

// 	testResponses(t, r,
// 		&Expectation{
// 			StatusCode:         http.StatusOK,
// 			RateLimitLimit:     "2",
// 			RateLimitRemaining: "1",
// 			RateLimitReset:     utcTimestamp(),
// 		},
// 		&Expectation{ // Time Limit Throttling kicks in
// 			StatusCode:         StatusTooManyRequests,
// 			Body:               "Too Many Requests",
// 			RateLimitLimit:     "1",
// 			RateLimitRemaining: "0",
// 			RateLimitReset:     utcTimestamp(),
// 		},
// 		&Expectation{
// 			StatusCode:         http.StatusOK,
// 			RateLimitLimit:     "2",
// 			RateLimitRemaining: "0",
// 			RateLimitReset:     utcTimestamp(),
// 			Wait:               5 * time.Millisecond,
// 		},
// 		&Expectation{
// 			StatusCode:         StatusTooManyRequests,
// 			Body:               "Too Many Requests",
// 			RateLimitLimit:     "2",
// 			RateLimitRemaining: "0",
// 			RateLimitReset:     utcTimestamp(),
// 			Wait:               5 * time.Millisecond,
// 		},
// 	)
// }

func TestRateLimitWithConcurrentRequests(t *testing.T) {
	r := setupGinWithPolicy(5, 20*time.Millisecond)
	testResponses(t, r, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "5",
		RateLimitReset: utcTimestamp(),
		Concurrent:     true,
	}, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "5",
		RateLimitReset: utcTimestamp(),
		Concurrent:     true,
	}, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "5",
		RateLimitReset: utcTimestamp(),
		Concurrent:     true,
	}, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "5",
		RateLimitReset: utcTimestamp(),
		Concurrent:     true,
	}, &Expectation{
		StatusCode:     http.StatusOK,
		RateLimitLimit: "5",
		RateLimitReset: utcTimestamp(),
		Concurrent:     true,
	}, &Expectation{
		StatusCode:         StatusTooManyRequests,
		Body:               "Too Many Requests",
		RateLimitLimit:     "5",
		RateLimitRemaining: "0",
		RateLimitReset:     utcTimestamp(),
	}, &Expectation{
		StatusCode:         http.StatusOK,
		RateLimitLimit:     "5",
		RateLimitRemaining: "4",
		RateLimitReset:     utcTimestamp(),
		Wait:               20 * time.Millisecond,
	})
}
