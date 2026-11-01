(function () {
  "use strict";
  const root = document.getElementById("msar-explorer");
  if (!root) return;
  const model = window.MSARToy;
  const get = (id) => document.getElementById("msar-" + id);
  const chart = get("chart");
  const limit = model.contributionLimit();
  let result;
  let geometry;
  let selectedSource = 2;
  let selectedToken = 10;
  const number = (x) => x.toFixed(3);
  const color = (fraction) => {
    const x = Math.max(0, Math.min(1, fraction));
    return `rgb(${Math.round(237 - 211 * x)}, ${Math.round(245 - 146 * x)}, ${Math.round(248 - 106 * x)})`;
  };
  const svg = (tag, attributes, text) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function label(x, y, text, attributes = {}) {
    chart.append(svg("text", { x, y, ...attributes }, text));
  }
  function populate(id, count, selected, format) {
    const select = get(id);
    select.replaceChildren();
    for (let i = 0; i < count; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = format(i);
      select.append(option);
    }
    select.value = selected;
  }
  populate("position", model.TOKENS, selectedToken, (i) => String(i));

  function inspect() {
    get("source").value = selectedSource;
    get("position").value = selectedToken;
    const source = result.sources[selectedSource];
    const cell = source.cells[selectedToken];
    const prefix = `Source ${selectedSource}, token ${selectedToken}: `;
    get("detail").textContent = cell.active
      ? `${prefix}offset δ = ${cell.delta}; depth weight α = ${number(source.alpha)}; unweighted term norm ‖c ⊙ v‖₂ = ${number(model.norm(source.terms[cell.delta]))}; weighted contribution = ${number(cell.magnitude)}. This α is shared by every token term in this row.`
      : `${prefix}masked — ${selectedToken > result.token ? "future token" : "outside this stream’s convolution window"}. Contribution is zero. The source still has depth weight α = ${number(source.alpha)}.`;
    chart.querySelector(".msar-selection")?.remove();
    const { left, top, cellWidth, rowHeight } = geometry;
    chart.append(svg("rect", { x: left + selectedToken * cellWidth + 1, y: top + selectedSource * rowHeight + 1,
      width: cellWidth - 2, height: rowHeight - 2, class: "msar-selection" }));
  }

  function draw() {
    const attention = get("mode").value === "attention";
    const width = Math.max(280, root.getBoundingClientRect().width);
    const left = 42;
    const top = 64;
    const right = width < 500 ? 80 : 112;
    const rowHeight = 33;
    const cellWidth = (width - left - right) / model.TOKENS;
    const gridWidth = cellWidth * model.TOKENS;
    const bottom = top + model.LAYERS * rowHeight;
    const barX = left + gridWidth + 10;
    const barWidth = right - 20;
    geometry = { left, top, cellWidth, rowHeight };
    chart.setAttribute("viewBox", `0 0 ${width} ${bottom + 86}`);
    chart.replaceChildren();
    chart.append(svg("title", { id: "msar-chart-title" }, attention ? "Token windows and depth-attention weights" : "Token-by-layer weighted contribution magnitudes"));
    chart.append(svg("desc", { id: "msar-chart-desc" }, `${model.NAMES[result.stream]}, target layer ${result.layer}, token ${result.token}. Rows are source layers 0 to 7; columns are token positions 0 to 15. ${attention ? "Only the separate right-hand column encodes attention. Dashed token cells indicate convolution support." : "Blue cells show the norm of each weighted convolution term."} Hatched cells are masked. Use the inspection selectors for exact values.`));
    const defs = svg("defs", {});
    const pattern = svg("pattern", { id: "msar-hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse" });
    pattern.append(svg("path", { d: "M-1,1 L1,-1 M0,6 L6,0 M5,7 L7,5", stroke: "var(--global-divider-color)", "stroke-width": 1 }));
    defs.append(pattern);
    const gradient = svg("linearGradient", { id: "msar-gradient" });
    gradient.append(svg("stop", { offset: "0%", "stop-color": color(0) }), svg("stop", { offset: "100%", "stop-color": color(1) }));
    defs.append(gradient);
    chart.append(defs);
    label(left, 15, attention ? "Convolution window (no token weights)" : "Weighted contribution magnitude", { class: "msar-axis" });
    label(barX, 38, "Depth α", { class: "msar-axis" });
    label(barX, 53, "0 → 1");
    label(14, top + 150, "Source layer i", { transform: `rotate(-90 14 ${top + 150})`, class: "msar-axis" });
    for (let i = 0; i < model.LAYERS; i++) {
      const y = top + i * rowHeight;
      label(left - 8, y + 21, String(i), { "text-anchor": "end" });
      for (let position = 0; position < model.TOKENS; position++) {
        const cell = result.sources[i]?.cells[position];
        const active = cell?.active;
        const rect = svg("rect", { x: left + position * cellWidth + 1, y: y + 1,
          width: cellWidth - 2, height: rowHeight - 2,
          class: `msar-cell ${!active ? "msar-masked" : attention ? "msar-window" : ""}`,
          ...(active && !attention ? { fill: color(Math.sqrt(cell.magnitude / limit)) } : {}) });
        chart.append(rect);
      }
      if (i < result.layer) {
        const alpha = result.sources[i].alpha;
        chart.append(svg("rect", { x: barX, y: y + 5, width: barWidth, height: 23, fill: "var(--global-code-bg-color)" }));
        chart.append(svg("rect", { x: barX, y: y + 5, width: barWidth * alpha, height: 23,
          fill: attention ? color(alpha) : "var(--global-divider-color)" }));
        label(barX + barWidth - 3, y + 21, number(alpha), { "text-anchor": "end", style: "paint-order:stroke;stroke:var(--global-bg-color);stroke-width:3px;stroke-linejoin:round" });
      } else label(barX, y + 21, "—");
    }
    chart.append(svg("rect", { x: left + result.token * cellWidth, y: top, width: cellWidth,
      height: rowHeight * model.LAYERS, class: "msar-target" }));
    const step = width < 500 ? 4 : 1;
    for (let t = 0; t < model.TOKENS; t += step) {
      label(left + (t + .5) * cellWidth, bottom + 18, String(t), { "text-anchor": "middle" });
    }
    label(left + gridWidth / 2, bottom + 40, "Source token position", { "text-anchor": "middle", class: "msar-axis" });
    chart.append(svg("rect", { x: left, y: bottom + 54, width: gridWidth, height: 9, fill: "url(#msar-gradient)" }));
    label(left, bottom + 80, "0");
    label(left + gridWidth / 2, bottom + 80, attention ? "0.5" : (limit / 4).toFixed(2), { "text-anchor": "middle" });
    label(left + gridWidth, bottom + 80, attention ? "1 (α)" : limit.toFixed(1), { "text-anchor": "end" });
    inspect();
  }

  function update() {
    const layer = Number(get("layer").value);
    const token = Number(get("token").value);
    const stream = Number(get("stream").value);
    result = model.retrieve(layer, token, stream);
    selectedSource = Math.min(selectedSource, layer - 1);
    populate("source", layer, selectedSource, (i) => i === 0 ? "0 · embedding" : String(i));
    get("layer-value").value = layer;
    get("token-value").value = token;
    const start = Math.max(0, token - result.kernel + 1);
    const padding = Math.max(0, result.kernel - token - 1);
    const alphaSum = result.sources.reduce((s, source) => s + source.alpha, 0);
    get("status").textContent = `${model.NAMES[stream]} reads tokens ${start}–${token} within each of ${layer} sources. Σᵢ αᵢ = ${alphaSum.toFixed(3)}.${padding ? ` ${padding} earlier kernel positions are zero-padded.` : ""}`;
    const attention = get("mode").value === "attention";
    get("mode-note").textContent = attention
      ? "Attention mode: one weight per source in the right-hand column. Dashed cells mark the token window only; there is no softmax over token positions."
      : "Contribution mode: each blue cell is ‖α (c ⊙ v)‖₂. These nonnegative magnitudes are not probabilities and need not sum to one.";
    get("scale-label").textContent = attention
      ? "Fixed color scale 0–1 applies only to the depth-weight column."
      : `Fixed square-root color scale 0–${limit.toFixed(1)} across all controls (synthetic units), to make small values visible. Hatched cells are masked.`;
    const totalMagnitude = result.sources.reduce((s, source) => s + source.cells.reduce((a, c) => a + c.magnitude, 0), 0);
    get("retrieved").textContent = `Retrieved stream z = [${result.z.map(number).join(", ")}]. ‖z‖₂ = ${number(model.norm(result.z))}; sum of cell magnitudes = ${number(totalMagnitude)}. Signed vector terms can cancel: their norms are not additive. Stream fusion is outside this demo.`;
    draw();
  }
  ["stream", "mode", "layer", "token"].forEach((id) => get(id).addEventListener("input", update));
  get("source").addEventListener("change", () => { selectedSource = Number(get("source").value); inspect(); });
  get("position").addEventListener("change", () => { selectedToken = Number(get("position").value); inspect(); });
  chart.addEventListener("click", (event) => {
    const point = chart.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(chart.getScreenCTM().inverse());
    const i = Math.floor((local.y - geometry.top) / geometry.rowHeight);
    const t = Math.floor((local.x - geometry.left) / geometry.cellWidth);
    if (i >= 0 && i < result.layer && t >= 0 && t < model.TOKENS) {
      selectedSource = i;
      selectedToken = t;
      inspect();
    }
  });
  update();
  new ResizeObserver(draw).observe(root);
})();
