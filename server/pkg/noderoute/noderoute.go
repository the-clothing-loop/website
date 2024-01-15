package noderoute

import "fmt"

func New(keys []string) *NodeKeys {
	return &NodeKeys{
		Keys: keys,
	}
}

type Node struct {
	KeyIndex int
	Prev     *Node
	Next     *Node
}

type NodeKeys struct {
	Keys []string
}

// Add more traveler keys but keey the list unique
func (nk *NodeKeys) AddKeys(keys []string) {
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

func (nk *NodeKeys) NewNodeRoute(routeByKeys []string) []*Node {
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

func (nk *NodeKeys) GetIndexByKey(key string) int {
	for i, v := range nk.Keys {
		if v == key {
			return i
		}
	}
	panic(fmt.Errorf("invalid key %v", key))
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
