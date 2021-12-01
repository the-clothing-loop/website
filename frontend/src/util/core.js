var assert = require('assert');

const getCentroid = () => {};

var coords = [
  [1, 3],
  [3, 1],
];
assert(getCentroid(coords) === [2, 2]);

