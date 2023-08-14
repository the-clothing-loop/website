package tsp

// https://github.com/medchik/Travelling-Salesman-Problem-Approximate-Solution-using-MST

const INT_MAX = float64(1e9)

func OptimizeRouteMST(matrix [][]float64) (float64, []int) {
	var n = len(matrix)

	var rootNode int
	var reached []int
	var unreached []int

	var tree = make([][]int, n)
	for i := 0; i < n; i++ {
		tree[i] = []int{}
	}

	unreached = make([]int, n)
	for i := 0; i < n; i++ {
		unreached[i] = i
	}

	var path = []int{}
	var cost = float64(0)

	// prim
	{
		var max float64
		var record float64
		var parent int
		var newNode int
		var indexNewNode int
		rootNode = unreached[0]
		reached = append(reached, unreached[0])
		unreached = append(unreached[:0], unreached[1:]...)

		for len(unreached) > 0 {
			max = INT_MAX
			for i := 0; i < len(reached); i++ {
				for j := 0; j < len(unreached); j++ {
					record = matrix[reached[i]][unreached[j]]
					if record < max {
						max = record
						indexNewNode = j
						parent = reached[i]
						newNode = unreached[j]
					}
				}
			}
			reached = append(reached, unreached[indexNewNode])
			unreached = append(unreached[:indexNewNode], unreached[indexNewNode+1:]...)
			tree[parent] = append(tree[parent], newNode)
		}
	}

	preorder(&tree, &path, rootNode)
	path = append(path, rootNode) // to create the cycle
	for i := 0; i < len(path)-1; i++ {
		src := path[i]
		dest := path[i+1]
		cost = cost + matrix[src][dest]
	}
	return cost, path
}

func preorder(tree *[][]int, path *[]int, index int) {
	*path = append(*path, index)
	for _, i := range (*tree)[index] {
		preorder(tree, path, i)
	}
}
