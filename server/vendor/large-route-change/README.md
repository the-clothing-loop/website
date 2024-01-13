# Large route change

## Situation:

A bus route has been changed, bus stops might have been removed or added, they might be reversed in some arias. Which bus stop preserves the most changes in the 1st & 2nd stop in its route?

## Algorithm acknowledgements:

1. The route direction is ignored
2. The route is seen as a circle and doesn't have a specific begin or end.
3. Each route stop differential is calculated from the perspective of the bus stop (not the bus).
4. New bus stops are valued as 0 for themselves and add to the differential for surrounding bus stops (that aren't new).

## Example

```go
// Each bus stop should have a unique identifier
busStopKeys := []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}

// The old bus stop route
routeOldKeys := []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}

// The new bus stop route
routeNewKeys := []string{"a", "b", "c", "j", "e", "f", "h", "g", "i", "d"},

lrc := largeroutechange.New(busStopKeys)

// Reshape the route to a data format that contains pointers to the previous and next node. 
routeOldNodes := lrc.NewNodeRoute(routeOldIDs)
routeNewNodes := lrc.NewNodeRoute(routeNewIDs)

// A weight parameter that is applied when a bus stop's next or previous changes
weightDirect := 0.5
// A weight parameter that is applied when the 2nd stop away changes
weightSecondary := 0.1

weights, totalAvg := instance.IsLargeRouteChange(
   routeOldNodes, routeNewNodes, 
   weightDirect, weightSecondary,
)
// [weights] Calculate the differential for each stop
// > map[string]float64{
// >    "a": 0.5,
// >    "b": 0.0,
// >    "c": 0.5, // 1 sibling change
// >    "d": 1.1,
// >    "e": 0.6,
// >    "f": 0.7,
// >    "g": 0.7,
// >    "h": 0.7,
// >    "i": 1.1, // 2 sibling changes and 1 cousin change
// >    "j": 1.1,
// > }
//
// [totalAvg] The average of all the weights
// > 0.7
```

## License

MIT License