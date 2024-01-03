package largeroutechange

import "fmt"

// All maps keyed by an integer relate to the index of the traveler keys array.
type Instance struct {
	travelerKeys []string
}

func New(travelerKeys []string) *Instance {
	in := Instance{
		travelerKeys: travelerKeys,
	}

	return &in
}

// Add more traveler keys but keey the list unique
func (in *Instance) AddTravelerKeys(travelerKeys []string) {
LOOP_NEW_KEYS:
	for _, newKey := range travelerKeys {
		for _, key := range in.travelerKeys {
			fmt.Printf("%s diff %s: %v\n", key, newKey, key == newKey)
			if key == newKey {
				continue LOOP_NEW_KEYS
			}
		}
		in.travelerKeys = append(in.travelerKeys, newKey)

	}
}

func (in *Instance) IsLargeRouteChange(
	oldRoute, newRoute map[int]*Node,
	weightDirect, weightSecondary float64,
) (weights []float64, totalAvg float64) {
	weights = make([]float64, 0, len(newRoute))
	for i := range in.travelerKeys {
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
		d1, d2 := newN.DiffNode(oldN)
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

func (in *Instance) GetIndexByKey(key string) int {
	for i, v := range in.travelerKeys {
		if v == key {
			return i
		}
	}
	panic(fmt.Errorf("invalid key %v", key))
}

type Node struct {
	KeyIndex int
	Prev     *Node
	Next     *Node
}

func (n *Node) DiffNode(compare *Node) (sibling, cousin int) {
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

func (in *Instance) NewNodeRoute(routeByKeys []string) map[int]*Node {
	routeLen := len(routeByKeys)
	nodeRoute := make(map[int]*Node, routeLen)
	nodeLast := &Node{KeyIndex: in.GetIndexByKey(get(routeByKeys, -1))}
	prevNode := nodeLast
	for i, key := range routeByKeys {
		keyIndex := in.GetIndexByKey(key)
		if i == routeLen-1 {
			nodeLast.Prev = prevNode
			prevNode.Next = nodeLast
			nodeRoute[keyIndex] = nodeLast
			continue
		}
		node := &Node{
			KeyIndex: keyIndex,
			Prev:     prevNode,
		}
		prevNode.Next = node
		nodeRoute[keyIndex] = node
		prevNode = node
	}

	return nodeRoute
}

// Try to get an item from an array without crashing
func get[V any](arr []V, index int) V {
	lenArr := len(arr)

	if index < 0 {
		index = lenArr - ((index * -1) % lenArr)
	} else {
		index = index % lenArr
	}

	return arr[index]
}

func getErr[V any](arr map[int]V, index int) (*V, bool) {
	if index > len(arr)-1 || index < 0 {
		return nil, false
	}
	v := arr[index]
	return &v, true
}
