var checkPoints = require("./checkPoints");
var computeBeziers = require("./computeBeziers");

function IPO (points) {
  if (!(this instanceof IPO)) return new IPO(points);
  this.get = this.get.bind(this);
  this.points = points;
}

IPO.prototype = {
  get: function (x) {
    var points = this._points;
    var prev, point, i;
    for (i=0; i<points.length; i++) {
      point = points[i];
      var p = point.p;
      if (x < p[0]) break; // We have found the points segment where x is
      else if (x === p[0]) return p[1]; // if x is exactly the point's x, return that point's y
      prev = point;
    }
    var pX = point.p[0];
    if (!prev || x > pX) {
      // There is no 2 points to interpolate between, it is just point's y unless an inf/sup is defined,
      // in that case, we do a linear interpolation on edges.
      var edge = x > pX && point.sup || x < pX && point.inf;
      return point.p[1] + (edge && edge[1] !== 0 ? (x-pX) * edge[1] / edge[0] : 0);
    }
    var bezier = this._beziers[i - 1];
    if (!bezier) return prev.p[1]; // this happens when two following points have the same Y.
    var a = prev.p;
    var b = point.p;
    var w = b[0] - a[0];
    var h = b[1] - a[1];
    // Get the bezier's value and map it to the points' domain
    return a[1] + h * bezier.get((x - a[0]) / w);
  }
};

Object.defineProperty(IPO.prototype, "points", {
  get: function () {
    return this._points;
  },
  set: function (points) {
    checkPoints(points);
    var beziers = computeBeziers(points);
    this._points = points;
    this._beziers = beziers;
  }
});

module.exports = IPO;
