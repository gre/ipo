var invariant = require("invariant");
var BezierEasing = require("bezier-easing");

function makeOffset (easing, h) {
  return function (u) {
    return h * easing(u);
  };
}

function makeFlatBezier (tFromU, ly, ry) {
  return function (u) {
    var t = tFromU(u);
    return 3 * (1 - t) * (1 - t) * t * ly + 3 * (1 - t) * t * t * ry;
  };
}

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
    if (!w || (!h && !left[1] && !right[1]))
      beziers.push(null);
    else {
      try {
        if (h) {
          beziers.push(makeOffset(
            BezierEasing(left[0] / w, left[1] / h, 1 + right[0] / w, 1 + right[1] / h),
            h
          ));
        }
        else {
          // h is 0 but handles have non-zero Y (e.g. bounce curves).
          // BezierEasing with y1=1/3, y2=2/3 yields Y(t)=t, giving us t from normalized x.
          // Then compute the cubic bezier Y offset directly from t.
          beziers.push(makeFlatBezier(
            BezierEasing(left[0] / w, 1 / 3, 1 + right[0] / w, 2 / 3),
            left[1],
            right[1]
          ));
        }
      }
      catch (e) {
        invariant(false, "{upper,lower} for points["+(i-1)+".."+i+"]: "+e.message);
      }
    }
    prev = point;
  }
  return beziers;
};
