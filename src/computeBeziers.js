var invariant = require("invariant");
var BezierEasing = require("bezier-easing");

module.exports = function (points) {
  var prev = points[0], point;
  var beziers = [];
  for (var i=1; i<points.length; i++) {
    point = points[i];
    var a = prev.p;
    var b = point.p;
    var w = b[0] - a[0];
    var h = b[1] - a[1];
    var left = prev.upper || [ 0, 0 ];
    var right = point.lower || [ 0, 0 ];
    if (!w || !h)
      beziers.push(null);
    else {
      try {
        beziers.push(
          w && h ?
          BezierEasing(left[0] / w, left[1] / h, 1 + right[0] / w, 1 + right[1] / h) :
          null // constant
        );
      }
      catch (e) {
        invariant(false, "{upper,lower} for points["+(i-1)+".."+i+"]: "+e.message);
      }
    }
    prev = point;
  }
  return beziers;
};
