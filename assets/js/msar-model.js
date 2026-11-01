/* Synthetic MSAR source expansion and retrieval, following paper Eqs. 10–12.
 * Also usable from Node for numerical validation; no learned model parameters. */
(function (root, factory) {
  const model = factory();
  if (typeof module === "object" && module.exports) module.exports = model;
  else root.MSARToy = model;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const DIM = 6;
  const TOKENS = 16;
  const LAYERS = 8;
  const KERNELS = [1, 4, 8, 12];
  const NAMES = ["Identity", "Conv-4", "Conv-8", "Conv-12"];
  const EPSILON = 1e-6;
  const vector = (fn) => Array.from({ length: DIM }, (_, d) => fn(d));
  const norm = (v) => Math.hypot(...v);
  const sum = (vectors) => vector((d) => vectors.reduce((total, v) => total + v[d], 0));

  // Fixed signed, channel-dependent values. Sources are shared by all streams.
  function activation(i, t) {
    if (t < 0) return vector(() => 0);
    return vector((d) => Math.sin((i + 1) * 0.71 + (t + 1) * 0.43 + d * 1.17)
      + 0.45 * Math.cos((i + 1) * (d + 1) * 0.37 - t * 0.61));
  }
  function coefficient(i, r, delta) {
    if (r === 0) return vector(() => delta === 0 ? 1 : 0);
    return vector((d) => (0.6 * Math.cos((i + 1) * 0.31 + r * 0.73 + delta * 0.57 + d * 0.41)
      + (delta === 0 ? 0.8 : 0)) / Math.sqrt(KERNELS[r]));
  }
  function query(layer, r) {
    return vector((d) => 0.65 * Math.sin(layer * 0.53 + r * 1.31 + d * 0.83));
  }
  function rmsNorm(v) {
    const rms = Math.sqrt(v.reduce((s, x) => s + x * x, 0) / DIM + EPSILON);
    return v.map((x) => x / rms); // Unit gain; normalization is only for keys.
  }
  function softmax(logits) {
    const maximum = Math.max(...logits);
    const exps = logits.map((x) => Math.exp(x - maximum));
    const denominator = exps.reduce((a, b) => a + b, 0);
    return exps.map((x) => x / denominator);
  }
  function retrieve(layer, token, stream) {
    if (!Number.isInteger(layer) || layer < 1 || layer > LAYERS
      || !Number.isInteger(token) || token < 0 || token >= TOKENS
      || !Number.isInteger(stream) || stream < 0 || stream >= KERNELS.length) {
      throw new RangeError("Invalid MSAR target or stream");
    }
    const kernel = KERNELS[stream];
    const q = query(layer, stream);
    const sources = Array.from({ length: layer }, (_, i) => {
      const terms = Array.from({ length: kernel }, (_, delta) => {
        const v = activation(i, token - delta);
        const c = coefficient(i, stream, delta);
        return v.map((x, d) => c[d] * x);
      });
      const expanded = sum(terms);
      const key = rmsNorm(expanded);
      const logit = key.reduce((score, x, d) => score + q[d] * x, 0);
      return { i, terms, expanded, logit };
    });
    const alpha = softmax(sources.map((s) => s.logit));
    sources.forEach((source, i) => {
      source.alpha = alpha[i];
      source.weighted = source.expanded.map((x) => alpha[i] * x);
      source.cells = Array.from({ length: TOKENS }, (_, position) => {
        const delta = token - position;
        const active = delta >= 0 && delta < kernel;
        const weighted = active ? source.terms[delta].map((x) => alpha[i] * x) : vector(() => 0);
        return { position, delta, active, weighted, magnitude: norm(weighted) };
      });
    });
    return { layer, token, stream, kernel, sources, z: sum(sources.map((s) => s.weighted)) };
  }
  // One fixed scale across all streams, target layers and target tokens.
  function contributionLimit() {
    let maximum = 0;
    KERNELS.forEach((_, r) => {
      for (let layer = 1; layer <= LAYERS; layer++) {
        for (let token = 0; token < TOKENS; token++) {
          retrieve(layer, token, r).sources.forEach((source) => {
            source.cells.forEach((cell) => { maximum = Math.max(maximum, cell.magnitude); });
          });
        }
      }
    });
    return Math.ceil(maximum * 10) / 10;
  }
  return { DIM, TOKENS, LAYERS, KERNELS, NAMES, EPSILON, activation, coefficient,
    query, rmsNorm, softmax, norm, retrieve, contributionLimit };
});
