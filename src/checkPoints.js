var invariant = require("invariant");

module.exports = function (points) {
  invariant(points instanceof Array && points.length>0, "points is a non-empty array");
  var curX = -Infinity;
  for (var i=0; i<points.length; i++) {
    var x = points[i].p[0];
    invariant(x !== curX, "points["+i+"].p[0] must be unique (to avoid ambiguity)");
    invariant(x > curX, "points must be sorted by `p[0]` (x position)");
    curX = x;
  }
};
