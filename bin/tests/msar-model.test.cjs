// Run from the repository root: node --test bin/tests/msar-model.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const m = require("../../assets/js/msar-model.js");
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-10, `${message}: ${a} vs ${b}`);

test("all control settings obey depth normalization, causal masks, and retrieval reconstruction", () => {
  for (let r = 0; r < 4; r++) {
    for (let layer = 1; layer <= m.LAYERS; layer++) {
      for (let t = 0; t < m.TOKENS; t++) {
        const result = m.retrieve(layer, t, r);
        assert.equal(result.sources.length, layer);
        near(result.sources.reduce((s, source) => s + source.alpha, 0), 1, "softmax over sources");
        const reconstructed = Array(m.DIM).fill(0);
        let totalMagnitude = 0;
        result.sources.forEach((source) => {
          assert.ok(source.alpha > 0 && source.alpha <= 1);
          assert.equal(source.cells.filter((cell) => cell.active).length, Math.min(t + 1, m.KERNELS[r]));
          source.cells.forEach((cell) => {
            assert.ok(Number.isFinite(cell.magnitude));
            const active = cell.position <= t && cell.position > t - m.KERNELS[r];
            assert.equal(cell.active, active);
            if (!active) assert.equal(cell.magnitude, 0);
            cell.weighted.forEach((x, d) => { reconstructed[d] += x; });
            totalMagnitude += cell.magnitude;
          });
        });
        result.z.forEach((x, d) => near(x, reconstructed[d], "sum of vector terms equals retrieval"));
        assert.ok(m.norm(result.z) <= totalMagnitude + 1e-10, "triangle inequality");
      }
    }
  }
});

test("Identity retrieves unchanged values and normalizes keys only", () => {
  const result = m.retrieve(5, 7, 0);
  const q = m.query(5, 0);
  const logits = result.sources.map((source) => {
    const v = m.activation(source.i, 7);
    assert.deepEqual(source.expanded, v);
    const rms = Math.sqrt(v.reduce((s, x) => s + x * x, 0) / m.DIM + 1e-6);
    return v.reduce((s, x, d) => s + q[d] * x / rms, 0);
  });
  const denominator = logits.reduce((s, x) => s + Math.exp(x), 0);
  result.sources.forEach((source, i) => {
    const alpha = Math.exp(logits[i]) / denominator;
    near(source.alpha, alpha, "independent attention calculation");
    near(source.cells[7].magnitude, alpha * m.norm(m.activation(i, 7)), "identity contribution");
  });
});

test("convolution uses channel coefficients from the same source layer with left zero-padding", () => {
  const result = m.retrieve(4, 2, 3);
  result.sources.forEach((source) => {
    for (let d = 0; d < m.DIM; d++) {
      let expected = 0;
      for (let delta = 0; delta <= 2; delta++) {
        expected += m.coefficient(source.i, 3, delta)[d] * m.activation(source.i, 2 - delta)[d];
      }
      near(source.expanded[d], expected, "same-row convolution");
    }
    source.terms.slice(3).forEach((term) => near(m.norm(term), 0, "zero padding"));
  });
});

test("single-source attention is one, while contribution magnitudes need not sum to one", () => {
  for (let r = 0; r < 4; r++) assert.equal(m.retrieve(1, 0, r).sources[0].alpha, 1);
  const result = m.retrieve(6, 11, 1);
  const total = result.sources.flatMap((s) => s.cells).reduce((s, c) => s + c.magnitude, 0);
  assert.ok(Math.abs(total - 1) > 0.1);
  assert.ok(total > m.norm(result.z) + 0.1, "synthetic signed terms exhibit cancellation");
});

test("streams have independent queries; a larger kernel does not force older-layer attention", () => {
  assert.notDeepEqual(m.query(6, 1), m.query(6, 3));
  let widerPrefersNewer = false;
  let widerPrefersOlder = false;
  for (let t = 0; t < m.TOKENS; t++) {
    const meanDepth = (r) => m.retrieve(6, t, r).sources.reduce((s, source) => s + source.i * source.alpha, 0);
    widerPrefersNewer ||= meanDepth(3) > meanDepth(1);
    widerPrefersOlder ||= meanDepth(3) < meanDepth(1);
  }
  assert.ok(widerPrefersNewer && widerPrefersOlder);
});

test("fixed color limit covers every selectable contribution; softmax is numerically stable", () => {
  const limit = m.contributionLimit();
  assert.ok(Number.isFinite(limit) && limit > 0);
  for (let r = 0; r < 4; r++) {
    for (let layer = 1; layer <= 8; layer++) {
      for (let t = 0; t < 16; t++) {
        m.retrieve(layer, t, r).sources.forEach((s) => s.cells.forEach((c) => assert.ok(c.magnitude <= limit)));
      }
    }
  }
  const probabilities = m.softmax([10000, 10001, 9999]);
  near(probabilities.reduce((a, b) => a + b), 1, "stable softmax sum");
  assert.ok(probabilities.every(Number.isFinite));
  assert.throws(() => m.retrieve(0, 0, 0), RangeError);
});
