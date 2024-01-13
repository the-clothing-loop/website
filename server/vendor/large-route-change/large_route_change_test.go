package largeroutechange

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAddTravelerKeys(t *testing.T) {
	oKeys := []string{"1", "2", "3", "4", "5", "6"}
	nKeys := []string{"1", "7", "3"}

	in := New(oKeys)
	in.AddTravelerKeys(nKeys)

	assert.Equal(t, []string{"1", "2", "3", "4", "5", "6", "7"}, in.travelerKeys)
}

func TestNewNodeRoute(t *testing.T) {
	in := New([]string{"0", "1", "2"})
	nr := in.NewNodeRoute([]string{"0", "1", "2"})

	// Verify that the entire route is included
	assert.Equal(t, 0, nr[0].KeyIndex)
	assert.Equal(t, 1, nr[1].KeyIndex)
	assert.Equal(t, 2, nr[2].KeyIndex)

	// Test prev values
	assert.Equal(t, 2, nr[0].Prev.KeyIndex)
	assert.Equal(t, 0, nr[1].Prev.KeyIndex)
	assert.Equal(t, 1, nr[2].Prev.KeyIndex)

	// Test next values
	assert.Equal(t, 1, nr[0].Next.KeyIndex)
	assert.Equal(t, 2, nr[1].Next.KeyIndex)
	assert.Equal(t, 0, nr[2].Next.KeyIndex)

	// Test Pointers
	assert.Equal(t, nr[2], nr[0].Prev)
	assert.Equal(t, nr[0], nr[1].Prev)
	assert.Equal(t, nr[1], nr[2].Prev)

	assert.Equal(t, nr[1], nr[0].Next)
	assert.Equal(t, nr[2], nr[1].Next)
	assert.Equal(t, nr[0], nr[2].Next)
}

func TestNewNodeRouteLen2(t *testing.T) {
	in := New([]string{"0", "1"})
	nr := in.NewNodeRoute([]string{"0", "1"})

	assert.Equal(t, 0, nr[0].KeyIndex)
	assert.Equal(t, 1, nr[1].KeyIndex)

	assert.Equal(t, 1, nr[0].Prev.KeyIndex)
	assert.Equal(t, 0, nr[1].Prev.KeyIndex)

	assert.Equal(t, 1, nr[0].Next.KeyIndex)
	assert.Equal(t, 0, nr[1].Next.KeyIndex)
}

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
			in := New([]string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"})
			rOld := in.NewNodeRoute(test.RouteOld)
			rNew := in.NewNodeRoute(test.RouteNew)
			weights, totalAvg := in.IsLargeRouteChange(rOld, rNew, 0.5, 0.1)

			assert.Equal(t, test.ExpectedTotal, totalAvg, "total average")

			totalWeights := float64(0)
			for i, weight := range weights {
				key := in.travelerKeys[i]

				if testWeight, ok := test.Expected[key]; ok {
					totalWeights += testWeight
					assert.Equalf(t, testWeight, weight, "weight test for key %s", key)
				}
			}
		})
	}
}

func TestNodeFind(t *testing.T) {
	in := New([]string{"a", "b", "c", "d", "e", "f"})
	nr := in.NewNodeRoute([]string{"a", "b", "c", "d", "e", "f"})
	or := in.NewNodeRoute([]string{"b", "f", "e", "d", "c", "a"})

	// Working get index by key
	assert.Equal(t, 2, in.GetIndexByKey("c"))

	// Find from node "d"
	nn := nr[in.GetIndexByKey("d")]
	on := or[in.GetIndexByKey("d")]
	d1, d2 := nn.DiffNode(on)
	assert.Equal(t, 0, d1)
	assert.Equal(t, 1, d2)
}

func TestIndexCircular(t *testing.T) {
	arr := []string{"a", "b", "c"}
	v := get(arr, 9)
	assert.Equal(t, "a", v)

	v = get(arr, 2)
	assert.Equal(t, "c", v)

	v = get(arr, -1)
	assert.Equal(t, "c", v)
}
func TestIndexOutBound(t *testing.T) {
	arr := map[int]string{0: "a", 1: "b", 2: "c"}
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
