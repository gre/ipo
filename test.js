var assert = require("assert");
var IPO = require("./src");

function approx (a, b, epsilon) {
  epsilon = epsilon || 1e-6;
  assert(Math.abs(a - b) < epsilon, "Expected " + a + " to be close to " + b);
}

// --- checkPoints validation ---

assert.throws(function () { IPO([]); }, "empty array should throw");
assert.throws(function () { IPO("nope"); }, "non-array should throw");
assert.throws(function () {
  IPO([{ p: [0, 0] }, { p: [0, 10] }]);
}, "duplicate x should throw");
assert.throws(function () {
  IPO([{ p: [10, 0] }, { p: [5, 10] }]);
}, "unsorted x should throw");

// --- single point ---

var single = IPO([{ p: [50, 100] }]);
assert.strictEqual(single(50), 100, "exact x returns y");
assert.strictEqual(single(0), 100, "x before single point returns y");
assert.strictEqual(single(100), 100, "x after single point returns y");

// --- single point with handles (edge linear extrapolation) ---

var singleH = IPO([{ p: [50, 100], lower: [-10, -20], upper: [10, 20] }]);
assert.strictEqual(singleH(50), 100);
approx(singleH(60), 120); // 100 + (60-50)*20/10
approx(singleH(40), 80);  // 100 + (40-50)*(-20)/(-10)

// --- two points, no handles (linear) ---

var linear = IPO([{ p: [0, 0] }, { p: [100, 100] }]);
assert.strictEqual(linear(0), 0);
assert.strictEqual(linear(100), 100);
approx(linear(50), 50);
approx(linear(25), 25);

// --- two points with symmetric handles ---

var curved = IPO([
  { p: [0, 0], upper: [10, 20] },
  { p: [100, 100], lower: [-10, -20] }
]);
assert.strictEqual(curved(0), 0);
assert.strictEqual(curved(100), 100);
// symmetric S-curve passes through midpoint
approx(curved(50), 50);
// but deviates from linear elsewhere
assert(curved(25) !== 25, "curved should differ from linear");

// --- same Y with handles (issue #2 - bounce) ---

var bounce = IPO([
  { p: [0, 0], upper: [25, 50] },
  { p: [100, 0], lower: [-25, 50] }
]);
assert.strictEqual(bounce(0), 0, "bounce start");
assert.strictEqual(bounce(100), 0, "bounce end");
assert(bounce(50) > 0, "bounce midpoint should be above 0");
approx(bounce(50), 37.5);
// symmetric handles should produce symmetric curve
approx(bounce(25), bounce(75));

// --- same Y without handles (flat) ---

var flat = IPO([{ p: [0, 100] }, { p: [100, 100] }]);
assert.strictEqual(flat(0), 100);
assert.strictEqual(flat(50), 100);
assert.strictEqual(flat(100), 100);

// --- multiple segments ---

var multi = IPO([
  { p: [0, 0] },
  { p: [100, 100] },
  { p: [200, 0] }
]);
assert.strictEqual(multi(0), 0);
assert.strictEqual(multi(100), 100);
assert.strictEqual(multi(200), 0);
approx(multi(50), 50);
approx(multi(150), 50);

// --- README example (smoke test) ---

var readme = IPO([
  { "p": [100, 100], "upper": [10, 20] },
  { "p": [200, 190], "lower": [-10, 0], "upper": [10, 0] },
  { "p": [250, 100], "upper": [30, 0] },
  { "p": [280, 140] },
  { "p": [350, 160] },
  { "p": [400, 50], "lower": [-50, 40], "upper": [100, 0] },
  { "p": [600, 250], "lower": [-140, 0], "upper": [ 40, -40 ] }
]);
assert.strictEqual(readme(100), 100);
assert.strictEqual(readme(200), 190);
assert.strictEqual(readme(250), 100);
assert.strictEqual(readme(280), 140);
assert.strictEqual(readme(400), 50);
assert.strictEqual(readme(600), 250);
// interpolated values should be reasonable
assert(readme(150) > 100 && readme(150) < 190);

// --- same Y bounce with multiple segments ---

var multiBounce = IPO([
  { p: [0, 0], upper: [10, 30] },
  { p: [50, 0], lower: [-10, 30], upper: [10, 15] },
  { p: [100, 0], lower: [-10, 15] }
]);
assert.strictEqual(multiBounce(0), 0);
assert.strictEqual(multiBounce(50), 0);
assert.strictEqual(multiBounce(100), 0);
assert(multiBounce(25) > 0, "first bounce arc");
assert(multiBounce(75) > 0, "second bounce arc");

console.log("All tests passed.");
