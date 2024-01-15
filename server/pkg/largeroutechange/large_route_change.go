package largeroutechange

import (
	"github.com/the-clothing-loop/website/server/pkg/noderoute"
)

func IsLargeRouteChange(
	nk *noderoute.NodeKeys,
	oldRoute, newRoute []*noderoute.Node,
	weightDirect, weightSecondary float64,
) (weights []float64, totalAvg float64) {
	weights = make([]float64, 0, len(newRoute))
	for i := range nk.Keys {
		oldNP, ok1 := getErr(oldRoute, i)
		newNP, ok2 := getErr(newRoute, i)
		// if a node is created or removed from the new route don't look at it
		if !ok1 || !ok2 {
			if ok2 {
				weights = append(weights, 0)
			}
			continue
		}
		oldN, newN := (*oldNP), (*newNP)
		weight := float64(0)
		d1, d2 := DiffNode(newN, oldN)
		if d1 != 0 {
			weight += (weightDirect * float64(d1))
		}
		if weightSecondary > 0 && d2 != 0 {
			weight += (weightSecondary * float64(d2))
		}

		weights = append(weights, weight)
		totalAvg += weight
	}

	totalAvg = totalAvg / float64(len(weights))

	return weights, totalAvg
}

func DiffNode(n, compare *noderoute.Node) (sibling, cousin int) {
	// compare sibling sibling nodes
	if n.Prev.KeyIndex != compare.Prev.KeyIndex &&
		n.Prev.KeyIndex != compare.Next.KeyIndex {
		sibling++
	}
	if n.Next.KeyIndex != compare.Prev.KeyIndex &&
		n.Next.KeyIndex != compare.Next.KeyIndex {
		sibling++
	}

	// compare cousin nodes
	if n.Prev.Prev.KeyIndex != compare.Prev.Prev.KeyIndex &&
		n.Prev.Prev.KeyIndex != compare.Next.Next.KeyIndex {
		cousin++
	}
	if n.Next.Next.KeyIndex != compare.Prev.Prev.KeyIndex &&
		n.Next.Next.KeyIndex != compare.Next.Next.KeyIndex {
		cousin++
	}

	return sibling, cousin
}

func getErr[V any](arr []V, index int) (*V, bool) {
	if index > len(arr)-1 || index < 0 {
		return nil, false
	}
	v := arr[index]
	return &v, true
}
