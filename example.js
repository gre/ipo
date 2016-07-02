var IPO = require(".");

// for the little story, i've written this library in the airplane on my way to NY
// and everyone is sleeping... this is why everything is dark !!!
document.body.style.background = "black";

var points = [
  { "p": [100, 100], "upper": [10, 20] },
  { "p": [200, 190], "lower": [-10, 0], "upper": [10, 0] },
  { "p": [250, 100], "upper": [30, 0] },
  { "p": [280, 140] },
  { "p": [350, 160] },
  { "p": [400, 50], "lower": [-50, 40], "upper": [100, 0] },
  { "p": [600, 250], "lower": [-140, 0], "upper": [ 40, -40 ] }
];
var ipo = IPO(points);

// Quick draw in SVG

function addPoints (a, b) {
  return [ a[0] + b[0], a[1] + b[1] ];
}
function project (p) {
  return [  1 * p[0], 300 - p[1] ];
}

var svg = "<svg width='800' height='300' style='background:#111'>";

// curve
svg += "<path fill='none' stroke-width='2' stroke='#f00' d='";
var i, p, point, prev = points[0];
for (i = 1; i < points.length; i++) {
  point = points[i];
  svg += " M "+project(prev.p)+" C"+project(addPoints(prev.p, prev.upper||[0,0]))+" "+project(addPoints(point.p, point.lower||[0,0]))+" "+project(point.p);
  prev = point;
}
svg += "' />";

// points and handles
for (i = 0; i < points.length; i++) {
  point = points[i];
  p = project(point.p);
  var clr = "#f00";
  svg += "<circle cx='"+p[0]+"' cy='"+p[1]+"' r='3' fill='"+clr+"' />";
  [point.lower, point.upper].filter(function (o) { return o; }).map(function (handle) {
    handle = project(addPoints(handle, point.p));
    var d = "M "+p+" L"+handle;
    svg += "<path stroke='"+clr+"' d='"+d+"' />";
    svg += "<circle cx='"+handle[0]+"' cy='"+handle[1]+"' r='2' fill='"+clr+"' />";
  });
}

// interpolation sampling
for (var x=0; x<800; x += 4) {
  var y = ipo(x);
  p = project([ x, y ]);
  svg += "<circle cx='"+p[0]+"' cy='"+p[1]+"' r='1' fill='#ffa' />";
}

svg += "</svg>";

document.body.innerHTML = svg;
