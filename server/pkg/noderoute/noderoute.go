package noderoute

import "fmt"

func New[K uint | string | int](keys []K) *NodeKeys[K] {
	return &NodeKeys[K]{
		Keys: keys,
	}
}

type Node struct {
	KeyIndex int
	Prev     *Node
	Next     *Node
}

type NodeKeys[K uint | string | int] struct {
	Keys []K
}

// Add more traveler keys but keey the list unique
func (nk *NodeKeys[K]) AddKeys(keys []K) {
LOOP_NEW_KEYS:
	for _, newKey := range keys {
		for _, key := range nk.Keys {
			if key == newKey {
				continue LOOP_NEW_KEYS
			}
		}
		nk.Keys = append(nk.Keys, newKey)
	}
}

func (nk *NodeKeys[K]) Key(n *Node) K {
	return get(nk.Keys, n.KeyIndex)
}

func (nk *NodeKeys[K]) FindDistancePrevF(n *Node, f func(itrNode, n *Node) (found, stop bool)) (bool, *Node) {
	return nk.findDistanceF(n, true, f)
}
func (nk *NodeKeys[K]) FindDistanceNextF(n *Node, f func(itrNode, n *Node) (found, stop bool)) (bool, *Node) {
	return nk.findDistanceF(n, false, f)
}
func (nk *NodeKeys[K]) findDistanceF(n *Node, isPrev bool, f func(itrNode, n *Node) (found, stop bool)) (bool, *Node) {
	itr := n
	for range nk.Keys {
		found, stop := f(itr, n)
		if found {
			return true, itr
		}
		if stop {
			break
		}
		if isPrev {
			itr = itr.Prev
		} else {
			itr = itr.Next
		}
	}

	return false, nil
}

func (nk *NodeKeys[K]) NewNodeRoute(routeByKeys []K) []*Node {
	routeLen := len(routeByKeys)
	nodeRoute := make([]*Node, routeLen)
	nodeLast := &Node{KeyIndex: nk.GetIndexByKey(get(routeByKeys, -1))}
	prevNode := nodeLast
	for i, key := range routeByKeys {
		keyIndex := nk.GetIndexByKey(key)
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

func (nk *NodeKeys[K]) GetIndexByKey(key K) int {
	for i, v := range nk.Keys {
		if v == key {
			return i
		}
	}
	panic(fmt.Errorf("invalid key %v", key))
}

func (nk *NodeKeys[K]) Iterate(f func(node *Node)) {
	nr := nk.NewNodeRoute(nk.Keys)
	for _, n := range nr {
		f(n)
	}
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
