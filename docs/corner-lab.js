(function () {
  "use strict";

  if (!document.body || document.body.dataset.ln !== "11") return;
  var main = document.querySelector(".lecture-main");
  if (!main || document.getElementById("corner-detection-explorer")) return;

  var section = document.createElement("section");
  section.className = "lecture-section";
  section.id = "corner-explorer";
  section.innerHTML = [
    '<p class="eyebrow">Interactive explorer</p>',
    '<h2>Corner detection pipeline</h2>',
    '<p>Choose a clean template image and inspect the important stages separately: smoothing, gradients, the second-moment evidence, the Harris response, and the final non-maximal-suppression result.</p>',
    '<div id="corner-detection-explorer" class="corner-detection-lab" aria-label="Interactive corner detection explorer">',
    '<div class="corner-template-heading"><strong>Template images</strong><span>These synthetic patterns make the corner evidence easy to see.</span></div>',
    '<div id="corner-template-thumbs" class="corner-template-thumbs" role="group" aria-label="Corner detection template images"></div>',
    '<div class="corner-lab-controls">',
    '<label>Gaussian σ <span><input id="corner-sigma" type="range" min="0" max="2.5" step="0.1" value="0.8"><output id="corner-sigma-value">0.8</output></span></label>',
    '<label>Harris k <span><input id="corner-k" type="range" min="0.02" max="0.08" step="0.005" value="0.04"><output id="corner-k-value">0.040</output></span></label>',
    '<label>Response threshold <span><input id="corner-threshold" type="range" min="0.05" max="0.9" step="0.05" value="0.35"><output id="corner-threshold-value">35%</output></span></label>',
    '<label>NMS radius <span><input id="corner-nms" type="range" min="1" max="5" step="1" value="2"><output id="corner-nms-value">2 px</output></span></label>',
    '<button class="button button-secondary" id="corner-reset" type="button">Reset explorer</button>',
    '</div>',
    '<p id="corner-lab-status" class="corner-lab-status" aria-live="polite"></p>',
    '<div class="corner-pipeline-grid">',
    '<figure><canvas id="corner-input" class="corner-lab-canvas" role="img" aria-label="Selected template image"></canvas><figcaption>1. Template image</figcaption></figure>',
    '<figure><canvas id="corner-smooth" class="corner-lab-canvas" role="img" aria-label="Gaussian-smoothed template image"></canvas><figcaption>2. Gaussian smoothing</figcaption></figure>',
    '<figure><canvas id="corner-gradient" class="corner-lab-canvas" role="img" aria-label="Gradient magnitude and direction image"></canvas><figcaption>3. Gradient magnitude and direction</figcaption></figure>',
    '<figure><canvas id="corner-structure" class="corner-lab-canvas" role="img" aria-label="Second-moment two-direction energy image"></canvas><figcaption>4. Second-moment two-direction energy</figcaption></figure>',
    '<figure><canvas id="corner-response" class="corner-lab-canvas" role="img" aria-label="Harris corner response image"></canvas><figcaption>5. Harris response R</figcaption></figure>',
    '<figure><canvas id="corner-final" class="corner-lab-canvas" role="img" aria-label="Final corner detections over the template"></canvas><figcaption>6. Threshold + non-maximal suppression</figcaption></figure>',
    '</div>',
    '<p id="corner-lab-summary" class="corner-lab-summary" aria-live="polite"></p>',
    '</div>'
  ].join("");

  var problemLab = main.querySelector("#problem-lab");
  main.insertBefore(section, problemLab || null);
  var sideNav = document.querySelector(".lecture-sidebar nav");
  if (sideNav && !sideNav.querySelector('a[href="#corner-explorer"]')) {
    var link = document.createElement("a");
    link.href = "#corner-explorer";
    link.textContent = "Corner explorer";
    var problemLink = sideNav.querySelector('a[href="#problem-lab"]');
    sideNav.insertBefore(link, problemLink || null);
  }

  var host = section.querySelector("#corner-detection-explorer");
  var size = 64;
  var templateNames = {
    square: "Square / L-corners",
    checker: "Checkerboard",
    window: "Window grid",
    junctions: "L/T junctions"
  };
  var state = { template: "square", sigma: 0.8, k: 0.04, threshold: 0.35, nms: 2 };

  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
  function blank(value) { return Array.from({ length: size }, function () { return Array(size).fill(value); }); }
  function setPixel(matrix, x, y, value) {
    if (x >= 0 && x < size && y >= 0 && y < size) matrix[y][x] = value;
  }
  function fillRect(matrix, x0, y0, x1, y1, value) {
    for (var y = y0; y <= y1; y += 1) for (var x = x0; x <= x1; x += 1) setPixel(matrix, x, y, value);
  }
  function strokeRect(matrix, x0, y0, x1, y1, value, thickness) {
    var width = thickness || 1;
    for (var offset = 0; offset < width; offset += 1) {
      for (var x = x0 - offset; x <= x1 + offset; x += 1) {
        setPixel(matrix, x, y0 - offset, value);
        setPixel(matrix, x, y1 + offset, value);
      }
      for (var y = y0 - offset; y <= y1 + offset; y += 1) {
        setPixel(matrix, x0 - offset, y, value);
        setPixel(matrix, x1 + offset, y, value);
      }
    }
  }
  function drawLine(matrix, x0, y0, x1, y1, value, thickness) {
    var steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2;
    var width = thickness || 1;
    for (var step = 0; step <= steps; step += 1) {
      var t = steps ? step / steps : 0;
      var x = Math.round(x0 + (x1 - x0) * t);
      var y = Math.round(y0 + (y1 - y0) * t);
      for (var dy = -width + 1; dy < width; dy += 1) for (var dx = -width + 1; dx < width; dx += 1) setPixel(matrix, x + dx, y + dy, value);
    }
  }
  function makeTemplate(kind) {
    var matrix = blank(28);
    if (kind === "checker") {
      var cell = 8;
      for (var row = 0; row < 8; row += 1) for (var column = 0; column < 8; column += 1) fillRect(matrix, 0 + column * cell, 0 + row * cell, column * cell + cell - 1, row * cell + cell - 1, (row + column) % 2 ? 220 : 35);
      strokeRect(matrix, 0, 0, 63, 63, 250, 1);
    } else if (kind === "window") {
      fillRect(matrix, 8, 8, 55, 55, 75);
      strokeRect(matrix, 8, 8, 55, 55, 245, 3);
      drawLine(matrix, 31, 9, 31, 54, 235, 2);
      drawLine(matrix, 9, 31, 54, 31, 235, 2);
      fillRect(matrix, 18, 18, 25, 25, 45);
      fillRect(matrix, 37, 37, 44, 44, 45);
    } else if (kind === "junctions") {
      fillRect(matrix, 0, 0, 63, 63, 35);
      drawLine(matrix, 8, 48, 32, 20, 235, 3);
      drawLine(matrix, 32, 20, 55, 48, 235, 3);
      drawLine(matrix, 12, 12, 48, 12, 210, 3);
      drawLine(matrix, 20, 12, 20, 35, 210, 3);
      drawLine(matrix, 44, 12, 44, 35, 210, 3);
    } else {
      fillRect(matrix, 14, 14, 49, 49, 85);
      strokeRect(matrix, 14, 14, 49, 49, 245, 3);
      fillRect(matrix, 22, 22, 41, 41, 135);
      strokeRect(matrix, 22, 22, 41, 41, 205, 1);
      drawLine(matrix, 7, 55, 27, 55, 220, 2);
      drawLine(matrix, 7, 55, 7, 35, 220, 2);
    }
    return matrix;
  }

  function gaussianBlur(matrix, sigma) {
    if (sigma <= 0) return matrix.map(function (row) { return row.slice(); });
    var radius = Math.max(1, Math.ceil(2 * sigma));
    var kernel = [];
    var total = 0;
    for (var offset = -radius; offset <= radius; offset += 1) {
      var weight = Math.exp(-(offset * offset) / (2 * sigma * sigma));
      kernel.push(weight);
      total += weight;
    }
    kernel = kernel.map(function (value) { return value / total; });
    var horizontal = blank(0);
    var output = blank(0);
    for (var y = 0; y < size; y += 1) for (var x = 0; x < size; x += 1) {
      var horizontalSum = 0;
      for (var kx = -radius; kx <= radius; kx += 1) horizontalSum += matrix[y][clamp(x + kx, 0, size - 1)] * kernel[kx + radius];
      horizontal[y][x] = horizontalSum;
    }
    for (var row = 0; row < size; row += 1) for (var column = 0; column < size; column += 1) {
      var verticalSum = 0;
      for (var ky = -radius; ky <= radius; ky += 1) verticalSum += horizontal[clamp(row + ky, 0, size - 1)][column] * kernel[ky + radius];
      output[row][column] = verticalSum;
    }
    return output;
  }

  function gradientAt(matrix, x, y) {
    var left = matrix[clamp(y, 0, size - 1)][clamp(x - 1, 0, size - 1)];
    var right = matrix[clamp(y, 0, size - 1)][clamp(x + 1, 0, size - 1)];
    var top = matrix[clamp(y - 1, 0, size - 1)][clamp(x, 0, size - 1)];
    var bottom = matrix[clamp(y + 1, 0, size - 1)][clamp(x, 0, size - 1)];
    var gx = (right - left) / 2;
    var gy = (bottom - top) / 2;
    return { gx: gx, gy: gy, magnitude: Math.sqrt(gx * gx + gy * gy), angle: Math.atan2(gy, gx) };
  }

  function analyze(matrix) {
    var gx = blank(0), gy = blank(0), magnitude = blank(0), angle = blank(0);
    for (var y = 0; y < size; y += 1) for (var x = 0; x < size; x += 1) {
      var gradient = gradientAt(matrix, x, y);
      gx[y][x] = gradient.gx;
      gy[y][x] = gradient.gy;
      magnitude[y][x] = gradient.magnitude;
      angle[y][x] = gradient.angle;
    }
    var energy = blank(0), response = blank(0), maxPositive = 0;
    var windowRadius = 2;
    for (var row = 0; row < size; row += 1) for (var column = 0; column < size; column += 1) {
      var a = 0, b = 0, d = 0;
      for (var wy = -windowRadius; wy <= windowRadius; wy += 1) for (var wx = -windowRadius; wx <= windowRadius; wx += 1) {
        var sampleY = clamp(row + wy, 0, size - 1);
        var sampleX = clamp(column + wx, 0, size - 1);
        a += gx[sampleY][sampleX] * gx[sampleY][sampleX];
        b += gx[sampleY][sampleX] * gy[sampleY][sampleX];
        d += gy[sampleY][sampleX] * gy[sampleY][sampleX];
      }
      var trace = a + d;
      var determinant = a * d - b * b;
      var halfDifference = (a - d) / 2;
      var discriminant = Math.sqrt(Math.max(0, halfDifference * halfDifference + b * b));
      var lambda1 = trace / 2 + discriminant;
      var lambda2 = Math.max(0, trace / 2 - discriminant);
      energy[row][column] = Math.sqrt(Math.max(0, lambda1 * lambda2));
      response[row][column] = determinant - state.k * trace * trace;
      if (response[row][column] > maxPositive) maxPositive = response[row][column];
    }
    return { gx: gx, gy: gy, magnitude: magnitude, angle: angle, energy: energy, response: response, maxPositive: maxPositive };
  }

  function findCorners(response, maxPositive) {
    var threshold = maxPositive * state.threshold;
    var candidates = [];
    var radius = state.nms;
    for (var y = radius + 1; y < size - radius - 1; y += 1) for (var x = radius + 1; x < size - radius - 1; x += 1) {
      var value = response[y][x];
      if (value < threshold) continue;
      var maximum = true;
      for (var dy = -radius; dy <= radius && maximum; dy += 1) for (var dx = -radius; dx <= radius; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        if (response[y + dy][x + dx] > value) { maximum = false; break; }
      }
      if (maximum) candidates.push({ x: x, y: y, score: value });
    }
    candidates.sort(function (first, second) { return second.score - first.score; });
    var selected = [];
    var separation = Math.max(3, state.nms * 2);
    candidates.forEach(function (candidate) {
      if (selected.length >= 80) return;
      var separated = selected.every(function (point) {
        var dx = point.x - candidate.x;
        var dy = point.y - candidate.y;
        return dx * dx + dy * dy >= separation * separation;
      });
      if (separated) selected.push(candidate);
    });
    return selected;
  }

  function bounds(matrix) {
    var min = Infinity, max = -Infinity;
    matrix.forEach(function (row) { row.forEach(function (value) { min = Math.min(min, value); max = Math.max(max, value); }); });
    return { min: min, max: max };
  }
  function colorFor(value, limits, mode) {
    var span = limits.max - limits.min || 1;
    if (mode === "harris") {
      if (value >= 0) {
        var positive = limits.max > 0 ? value / limits.max : 0;
        return [245, Math.round(244 - 180 * positive), Math.round(220 - 180 * positive)];
      }
      var negative = limits.min < 0 ? value / limits.min : 0;
      return [Math.round(70 - 35 * negative), Math.round(135 - 55 * negative), Math.round(220 - 20 * negative)];
    }
    var t = clamp((value - limits.min) / span, 0, 1);
    if (mode === "energy") return [Math.round(25 + 225 * t), Math.round(55 + 170 * t), Math.round(120 - 80 * t)];
    var shade = Math.round(255 * t);
    return [shade, shade, shade];
  }
  function drawMatrix(canvas, matrix, mode) {
    canvas.width = 256;
    canvas.height = 256;
    var source = document.createElement("canvas");
    source.width = size;
    source.height = size;
    var sourceContext = source.getContext("2d");
    var pixels = sourceContext.createImageData(size, size);
    var limits = bounds(matrix);
    for (var y = 0; y < size; y += 1) for (var x = 0; x < size; x += 1) {
      var color = colorFor(matrix[y][x], limits, mode);
      var offset = (y * size + x) * 4;
      pixels.data[offset] = color[0];
      pixels.data[offset + 1] = color[1];
      pixels.data[offset + 2] = color[2];
      pixels.data[offset + 3] = 255;
    }
    sourceContext.putImageData(pixels, 0, 0);
    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
  }
  function drawGradient(canvas, result) {
    drawMatrix(canvas, result.magnitude, "gray");
    var context = canvas.getContext("2d");
    var scale = canvas.width / size;
    var maximum = bounds(result.magnitude).max || 1;
    context.strokeStyle = "rgba(8,127,117,.82)";
    context.fillStyle = "rgba(8,127,117,.82)";
    context.lineWidth = 1.2;
    for (var y = 5; y < size - 4; y += 7) for (var x = 5; x < size - 4; x += 7) {
      var strength = result.magnitude[y][x] / maximum;
      if (strength < 0.08) continue;
      var length = 3 + 5 * Math.min(1, strength);
      var angle = result.angle[y][x];
      var startX = (x + .5) * scale;
      var startY = (y + .5) * scale;
      var endX = startX + Math.cos(angle) * length;
      var endY = startY + Math.sin(angle) * length;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
      context.beginPath();
      context.moveTo(endX, endY);
      context.lineTo(endX - Math.cos(angle - .55) * 3, endY - Math.sin(angle - .55) * 3);
      context.lineTo(endX - Math.cos(angle + .55) * 3, endY - Math.sin(angle + .55) * 3);
      context.closePath();
      context.fill();
    }
  }
  function drawFinal(canvas, matrix, corners, maxPositive) {
    drawMatrix(canvas, matrix, "gray");
    var context = canvas.getContext("2d");
    var scale = canvas.width / size;
    corners.forEach(function (corner) {
      var x = (corner.x + .5) * scale;
      var y = (corner.y + .5) * scale;
      var radius = 3 + 5 * Math.min(1, corner.score / (maxPositive || 1));
      context.fillStyle = "rgba(212,72,91,.22)";
      context.strokeStyle = "#d4485b";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
      context.beginPath();
      context.moveTo(x - radius - 2, y);
      context.lineTo(x + radius + 2, y);
      context.moveTo(x, y - radius - 2);
      context.lineTo(x, y + radius + 2);
      context.stroke();
    });
  }

  var sigmaInput = host.querySelector("#corner-sigma");
  var kInput = host.querySelector("#corner-k");
  var thresholdInput = host.querySelector("#corner-threshold");
  var nmsInput = host.querySelector("#corner-nms");
  var sigmaOutput = host.querySelector("#corner-sigma-value");
  var kOutput = host.querySelector("#corner-k-value");
  var thresholdOutput = host.querySelector("#corner-threshold-value");
  var nmsOutput = host.querySelector("#corner-nms-value");
  var status = host.querySelector("#corner-lab-status");
  var summary = host.querySelector("#corner-lab-summary");
  var canvases = {
    input: host.querySelector("#corner-input"),
    smooth: host.querySelector("#corner-smooth"),
    gradient: host.querySelector("#corner-gradient"),
    structure: host.querySelector("#corner-structure"),
    response: host.querySelector("#corner-response"),
    final: host.querySelector("#corner-final")
  };

  function updateOutputs() {
    sigmaOutput.value = state.sigma.toFixed(1);
    kOutput.value = state.k.toFixed(3);
    thresholdOutput.value = Math.round(state.threshold * 100) + "%";
    nmsOutput.value = state.nms + " px";
  }
  function renderThumbnails() {
    var container = host.querySelector("#corner-template-thumbs");
    Object.keys(templateNames).forEach(function (key) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "corner-template-thumb";
      button.dataset.template = key;
      button.setAttribute("aria-pressed", key === state.template ? "true" : "false");
      var canvas = document.createElement("canvas");
      canvas.width = 88;
      canvas.height = 88;
      drawMatrix(canvas, makeTemplate(key), "gray");
      var label = document.createElement("span");
      label.textContent = templateNames[key];
      button.append(canvas, label);
      button.addEventListener("click", function () {
        state.template = key;
        container.querySelectorAll(".corner-template-thumb").forEach(function (item) { item.setAttribute("aria-pressed", item.dataset.template === state.template ? "true" : "false"); });
        render();
      });
      container.append(button);
    });
  }
  function render() {
    updateOutputs();
    var input = makeTemplate(state.template);
    var smooth = gaussianBlur(input, state.sigma);
    var result = analyze(smooth);
    var corners = findCorners(result.response, result.maxPositive);
    drawMatrix(canvases.input, input, "gray");
    drawMatrix(canvases.smooth, smooth, "gray");
    drawGradient(canvases.gradient, result);
    drawMatrix(canvases.structure, result.energy, "energy");
    drawMatrix(canvases.response, result.response, "harris");
    drawFinal(canvases.final, input, corners, result.maxPositive);
    var threshold = result.maxPositive * state.threshold;
    status.textContent = corners.length + " corner candidates remain after thresholding and non-maximal suppression.";
    summary.textContent = "Template: " + templateNames[state.template] + " · max Harris response: " + result.maxPositive.toFixed(1) + " · retained-response threshold: " + threshold.toFixed(1) + " · red markers show the final local maxima.";
  }

  sigmaInput.addEventListener("input", function () { state.sigma = Number(sigmaInput.value); render(); });
  kInput.addEventListener("input", function () { state.k = Number(kInput.value); render(); });
  thresholdInput.addEventListener("input", function () { state.threshold = Number(thresholdInput.value); render(); });
  nmsInput.addEventListener("input", function () { state.nms = Number(nmsInput.value); render(); });
  host.querySelector("#corner-reset").addEventListener("click", function () {
    state = { template: "square", sigma: 0.8, k: 0.04, threshold: 0.35, nms: 2 };
    sigmaInput.value = state.sigma;
    kInput.value = state.k;
    thresholdInput.value = state.threshold;
    nmsInput.value = state.nms;
    host.querySelectorAll(".corner-template-thumb").forEach(function (item) { item.setAttribute("aria-pressed", item.dataset.template === state.template ? "true" : "false"); });
    render();
  });

  renderThumbnails();
  render();
}());
