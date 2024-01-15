package largeroutechange

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/the-clothing-loop/website/server/pkg/noderoute"
)

func TestGenWeights(t *testing.T) {
	tests := []struct {
		Name               string
		RouteOld, RouteNew []string
		Expected           map[string]float64
		ExpectedTotal      float64
	}{
		{
			Name:     "should be circular",
			RouteOld: []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"},
			RouteNew: []string{"j", "a", "b", "c", "d", "e", "f", "g", "h", "i"},
			Expected: map[string]float64{
				"a": 0.0,
				"b": 0.0,
				"c": 0.0,
				"d": 0.0,
				"e": 0.0,
				"f": 0.0,
				"g": 0.0,
				"h": 0.0,
				"i": 0.0,
				"j": 0.0,
			},
			ExpectedTotal: 0.0,
		},
		{
			Name:     "differences in route for node C and I",
			RouteOld: []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"},
			RouteNew: []string{"a", "b", "c", "j", "e", "f", "h", "g", "i", "d"},
			Expected: map[string]float64{
				"a": 0.5,
				"b": 0.0,
				"c": 0.5, // 1 sibling change
				"d": 1.1,
				"e": 0.6,
				"f": 0.7,
				"g": 0.7,
				"h": 0.7,
				"i": 1.1, // 2 sibling changes and 1 cousin change
				"j": 1.1,
			},
			ExpectedTotal: 0.7,
		},
		{
			Name:     "one added in route node J",
			RouteOld: []string{"a", "b", "c", "d", "e", "f", "g", "h", "i"},
			RouteNew: []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"},
			Expected: map[string]float64{
				"a": 0.6,
				"b": 0.1,
				"c": 0.0,
				"d": 0.0,
				"e": 0.0,
				"f": 0.0,
				"g": 0.0,
				"h": 0.1,
				"i": 0.6,
				"j": 0.0,
			},
			ExpectedTotal: 0.139999999999999999,
		},
		{
			Name:     "one removed in route node J",
			RouteOld: []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"},
			RouteNew: []string{"a", "b", "c", "d", "e", "f", "g", "h", "i"},
			Expected: map[string]float64{
				"a": 0.6,
				"b": 0.1,
				"c": 0.0,
				"d": 0.0,
				"e": 0.0,
				"f": 0.0,
				"g": 0.0,
				"h": 0.1,
				"i": 0.6,
			},
			ExpectedTotal: 0.15555555555555555,
		},
	}

	for _, test := range tests {
		t.Run(test.Name, func(t *testing.T) {
			nk := noderoute.New([]string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"})
			rOld := nk.NewNodeRoute(test.RouteOld)
			rNew := nk.NewNodeRoute(test.RouteNew)
			weights, totalAvg := IsLargeRouteChange(nk, rOld, rNew, 0.5, 0.1)

			assert.Equal(t, test.ExpectedTotal, totalAvg, "total average")

			totalWeights := float64(0)
			for i, weight := range weights {
				key := nk.Keys[i]

				if testWeight, ok := test.Expected[key]; ok {
					totalWeights += testWeight
					assert.Equalf(t, testWeight, weight, "weight test for key %s", key)
				}
			}
		})
	}
}

func TestNodeFind(t *testing.T) {
	nk := noderoute.New([]string{"a", "b", "c", "d", "e", "f"})
	nr := nk.NewNodeRoute([]string{"a", "b", "c", "d", "e", "f"})
	or := nk.NewNodeRoute([]string{"b", "f", "e", "d", "c", "a"})

	// Working get index by key
	assert.Equal(t, 2, nk.GetIndexByKey("c"))

	// Find from node "d"
	nn := nr[nk.GetIndexByKey("d")]
	on := or[nk.GetIndexByKey("d")]
	d1, d2 := DiffNode(nn, on)
	assert.Equal(t, 0, d1)
	assert.Equal(t, 1, d2)
}

func TestIndexOutBound(t *testing.T) {
	arr := []string{"a", "b", "c"}
	v, err := getErr(arr, 9)
	assert.False(t, err)
	assert.Nil(t, v)

	v, err = getErr(arr, 2)
	assert.Equal(t, "c", *v)
	assert.True(t, err)

	v, err = getErr(arr, -1)
	assert.False(t, err)
	assert.Nil(t, v)
}
