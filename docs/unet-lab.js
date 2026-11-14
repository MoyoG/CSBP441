(function () {
  "use strict";

  var host = document.getElementById("unet-explorer-app");
  if (!host) return;

  var presets = [
    { key: "horse", label: "Horse riding", note: "Course example", src: "assets/yolo-sample-horse-riding.jpg" },
    { key: "cat", label: "Close-up cat", note: "Course example", src: "assets/yolo-sample-cat.png" },
    { key: "pump", label: "Gas pump", note: "Imagenette example", src: "assets/imagenette-gas-pump.png" }
  ];
  var stageInfo = [
    ["input", "Input image", "RGB image enters the network."],
    ["encoder", "Encoder detail", "Local contrast and edges are retained while the grid contracts."],
    ["bottleneck", "Bottleneck context", "The small grid represents broad, semantic context."],
    ["upconv", "Up-convolution", "Learned-style projection expands the low-resolution response."],
    ["fusion", "Skip + fusion", "Decoder context and encoder detail are combined."],
    ["output", "Pixel-level output", "A conceptual score map becomes a highlighted mask."]
  ];

  host.innerHTML =
    "<div class='unet-explorer-shell'>" +
      "<div class='unet-explorer-controls'>" +
        "<label class='unet-field'><span>Course example</span><select id='unet-preset'>" +
          presets.map(function (item) { return "<option value='" + item.key + "'>" + item.label + "</option>"; }).join("") +
        "</select></label>" +
        "<label class='unet-field unet-upload'><span>Upload an image</span><input id='unet-image-file' type='file' accept='image/*'><small>The image stays in this browser.</small></label>" +
        "<div class='unet-explorer-buttons'><button class='button button-primary' id='unet-run' type='button'>Run U-Net demonstration</button><button class='button button-secondary' id='unet-reset' type='button'>Reset example</button><span class='unet-lab-status' id='unet-status' aria-live='polite'>Loading the course example…</span></div>" +
      "</div>" +
      "<div class='unet-preset-picker'><div class='unet-preset-heading'><strong>Or choose a course image</strong><small>These compact presets use the same local browser pipeline as an upload.</small></div><div class='unet-preset-grid'>" +
        presets.map(function (item) { return "<button class='unet-preset-button' type='button' data-unet-preset='" + item.key + "'><img src='" + item.src + "' alt=''><span>" + item.label + "</span><small>" + item.note + "</small></button>"; }).join("") +
      "</div></div>" +
      "<div class='unet-input-and-ledger'>" +
        "<figure class='unet-input-figure'><p class='eyebrow'>Selected input</p><img id='unet-input-image' src='assets/yolo-sample-horse-riding.jpg' alt='Selected U-Net explorer input'><figcaption id='unet-input-caption'>Horse riding · course example</figcaption></figure>" +
        "<div class='unet-ledger-card'><p class='eyebrow'>Shape ledger</p><h3>What changes through the U?</h3><table class='unet-shape-ledger'><thead><tr><th>Stage</th><th>Example tensor</th><th>Role</th></tr></thead><tbody>" +
          "<tr><th>Input</th><td>256×192×3</td><td>RGB image</td></tr>" +
          "<tr><th>Encoder 1</th><td>128×96×64</td><td>detail + local features</td></tr>" +
          "<tr><th>Encoder 2</th><td>64×48×128</td><td>more context</td></tr>" +
          "<tr><th>Bottleneck</th><td>32×24×256</td><td>deep context</td></tr>" +
          "<tr><th>Decoder + skip</th><td>64×48×128</td><td>upsample + concatenate</td></tr>" +
          "<tr><th>Output</th><td>256×192×K</td><td>K class logits per pixel</td></tr>" +
        "</tbody></table><p class='unet-ledger-note'>The channel counts are a small teaching configuration. The important contract is that the decoder and skip map have the same height and width before concatenation.</p></div>" +
      "</div>" +
      "<div class='unet-step-controls'><label class='unet-field'><span>Highlight one stage</span><select id='unet-stage-select'><option value='all'>Show complete pipeline</option>" + stageInfo.map(function (stage) { return "<option value='" + stage[0] + "'>" + stage[1] + "</option>"; }).join("") + "</select></label><span class='unet-stage-status' id='unet-stage-status'>All stages are highlighted.</span></div>" +
      "<div class='unet-stage-grid'>" + stageInfo.map(function (stage) { return "<figure class='unet-stage-card' data-unet-stage='" + stage[0] + "'><div class='unet-stage-heading'><strong>" + stage[1] + "</strong><span>step " + (stageInfo.indexOf(stage) + 1) + "</span></div><canvas id='unet-stage-" + stage[0] + "' width='320' height='220' aria-label='" + stage[1] + " visualization'></canvas><figcaption>" + stage[2] + "</figcaption></figure>"; }).join("") + "</div>" +
      "<div class='unet-explanation-row'><div><strong>Encoder → bottleneck</strong><span>Pooling trades resolution for context.</span></div><div><strong>Up-conv → skip</strong><span>Upsampling restores a grid; concatenation restores detail.</span></div><div><strong>1×1 conv → softmax</strong><span>Each pixel receives a class score and probability distribution.</span></div></div>" +
      "<p class='unet-explorer-note'><strong>Teaching note:</strong> this is a deterministic browser visualization of the U-Net data flow, not a trained segmentation model. It makes the tensor shapes and operations visible; a real U-Net learns the filters and predicts the mask from training data.</p>" +
    "</div>";

  var presetSelect = host.querySelector("#unet-preset");
  var fileInput = host.querySelector("#unet-image-file");
  var runButton = host.querySelector("#unet-run");
  var resetButton = host.querySelector("#unet-reset");
  var status = host.querySelector("#unet-status");
  var inputImage = host.querySelector("#unet-input-image");
  var inputCaption = host.querySelector("#unet-input-caption");
  var stageSelect = host.querySelector("#unet-stage-select");
  var stageStatus = host.querySelector("#unet-stage-status");
  var state = { image: null, objectUrl: "", sourceName: "Horse riding", activePreset: "horse" };

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function drawCover(context, image, width, height) {
    var iw = image.naturalWidth || image.width;
    var ih = image.naturalHeight || image.height;
    var scale = Math.max(width / iw, height / ih);
    var dw = iw * scale;
    var dh = ih * scale;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);
  }

  function getSquareSource(image) {
    var canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 192;
    drawCover(canvas.getContext("2d"), image, canvas.width, canvas.height);
    return canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  }

  function grayscale(imageData) {
    var values = new Float32Array(imageData.width * imageData.height);
    for (var i = 0, p = 0; i < values.length; i++, p += 4) {
      values[i] = (0.299 * imageData.data[p] + 0.587 * imageData.data[p + 1] + 0.114 * imageData.data[p + 2]) / 255;
    }
    return values;
  }

  function saturation(imageData) {
    var values = new Float32Array(imageData.width * imageData.height);
    for (var i = 0, p = 0; i < values.length; i++, p += 4) {
      var high = Math.max(imageData.data[p], imageData.data[p + 1], imageData.data[p + 2]);
      var low = Math.min(imageData.data[p], imageData.data[p + 1], imageData.data[p + 2]);
      values[i] = (high - low) / 255;
    }
    return values;
  }

  function normalize(values) {
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < values.length; i++) {
      min = Math.min(min, values[i]);
      max = Math.max(max, values[i]);
    }
    var span = max - min || 1;
    return Float32Array.from(values, function (value) { return (value - min) / span; });
  }

  function blur(values, width, height) {
    var output = new Float32Array(values.length);
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var total = 0;
        var count = 0;
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            var yy = y + dy;
            var xx = x + dx;
            if (yy >= 0 && yy < height && xx >= 0 && xx < width) {
              total += values[yy * width + xx];
              count++;
            }
          }
        }
        output[y * width + x] = total / count;
      }
    }
    return output;
  }

  function sobel(values, width, height) {
    var output = new Float32Array(values.length);
    for (var y = 1; y < height - 1; y++) {
      for (var x = 1; x < width - 1; x++) {
        var a = values[(y - 1) * width + x - 1], b = values[(y - 1) * width + x], c = values[(y - 1) * width + x + 1];
        var d = values[y * width + x - 1], f = values[y * width + x + 1];
        var g = values[(y + 1) * width + x - 1], h = values[(y + 1) * width + x], j = values[(y + 1) * width + x + 1];
        var gx = -a + c - 2 * d + 2 * f - g + j;
        var gy = -a - 2 * b - c + g + 2 * h + j;
        output[y * width + x] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    return normalize(output);
  }

  function resizeAverage(values, sourceWidth, sourceHeight, targetWidth, targetHeight) {
    var output = new Float32Array(targetWidth * targetHeight);
    for (var y = 0; y < targetHeight; y++) {
      for (var x = 0; x < targetWidth; x++) {
        var x0 = Math.floor(x * sourceWidth / targetWidth);
        var x1 = Math.max(x0 + 1, Math.floor((x + 1) * sourceWidth / targetWidth));
        var y0 = Math.floor(y * sourceHeight / targetHeight);
        var y1 = Math.max(y0 + 1, Math.floor((y + 1) * sourceHeight / targetHeight));
        var total = 0;
        var count = 0;
        for (var yy = y0; yy < Math.min(sourceHeight, y1); yy++) {
          for (var xx = x0; xx < Math.min(sourceWidth, x1); xx++) {
            total += values[yy * sourceWidth + xx];
            count++;
          }
        }
        output[y * targetWidth + x] = total / Math.max(1, count);
      }
    }
    return output;
  }

  function resizeNearest(values, sourceWidth, sourceHeight, targetWidth, targetHeight) {
    var output = new Float32Array(targetWidth * targetHeight);
    for (var y = 0; y < targetHeight; y++) {
      var sourceY = Math.min(sourceHeight - 1, Math.floor(y * sourceHeight / targetHeight));
      for (var x = 0; x < targetWidth; x++) {
        var sourceX = Math.min(sourceWidth - 1, Math.floor(x * sourceWidth / targetWidth));
        output[y * targetWidth + x] = values[sourceY * sourceWidth + sourceX];
      }
    }
    return output;
  }

  function heatColor(value, mode) {
    var t = clamp(value, 0, 1);
    if (mode === "deep") return [Math.round(25 + 220 * t), Math.round(35 + 145 * (1 - t)), Math.round(215 - 85 * t)];
    if (mode === "up") return [Math.round(20 + 235 * t), Math.round(180 - 120 * t), Math.round(100 + 90 * (1 - t))];
    if (mode === "fusion") return [Math.round(25 + 215 * t), Math.round(90 + 110 * (1 - t)), Math.round(190 - 130 * t)];
    return [Math.round(20 + 235 * t), Math.round(230 * t), Math.round(255 - 210 * t)];
  }

  function drawHeatmap(canvas, values, width, height, mode) {
    var context = canvas.getContext("2d");
    var imageData = context.createImageData(canvas.width, canvas.height);
    for (var y = 0; y < canvas.height; y++) {
      var sourceY = Math.min(height - 1, Math.floor(y * height / canvas.height));
      for (var x = 0; x < canvas.width; x++) {
        var sourceX = Math.min(width - 1, Math.floor(x * width / canvas.width));
        var color = heatColor(values[sourceY * width + sourceX], mode);
        var p = (y * canvas.width + x) * 4;
        imageData.data[p] = color[0];
        imageData.data[p + 1] = color[1];
        imageData.data[p + 2] = color[2];
        imageData.data[p + 3] = 255;
      }
    }
    context.putImageData(imageData, 0, 0);
  }

  function drawMask(canvas, imageData, score, width, height) {
    var context = canvas.getContext("2d");
    var sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    sourceCanvas.getContext("2d").putImageData(imageData, 0, 0);
    drawCover(context, sourceCanvas, canvas.width, canvas.height);
    var overlay = context.createImageData(canvas.width, canvas.height);
    for (var y = 0; y < canvas.height; y++) {
      var sourceY = Math.min(height - 1, Math.floor(y * height / canvas.height));
      for (var x = 0; x < canvas.width; x++) {
        var sourceX = Math.min(width - 1, Math.floor(x * width / canvas.width));
        var value = score[sourceY * width + sourceX];
        var p = (y * canvas.width + x) * 4;
        if (value > 0.56) {
          overlay.data[p] = 25;
          overlay.data[p + 1] = 210;
          overlay.data[p + 2] = 150;
          overlay.data[p + 3] = 116;
        } else {
          overlay.data[p] = 7;
          overlay.data[p + 1] = 19;
          overlay.data[p + 2] = 35;
          overlay.data[p + 3] = 38;
        }
      }
    }
    context.putImageData(overlay, 0, 0);
  }

  function renderPipeline() {
    if (!state.image) return;
    var imageData = getSquareSource(state.image);
    var width = imageData.width;
    var height = imageData.height;
    var gray = grayscale(imageData);
    var edges = sobel(gray, width, height);
    var colors = saturation(imageData);
    var contextMap = normalize(resizeAverage(blur(gray, width, height), width, height, 32, 24));
    var upsampled = resizeNearest(contextMap, 32, 24, width, height);
    var fused = normalize(Float32Array.from(upsampled, function (value, i) { return 0.55 * value + 0.45 * edges[i]; }));
    var score = normalize(Float32Array.from(fused, function (value, i) { return 0.62 * value + 0.38 * colors[i]; }));
    var canvases = {
      input: host.querySelector("#unet-stage-input"),
      encoder: host.querySelector("#unet-stage-encoder"),
      bottleneck: host.querySelector("#unet-stage-bottleneck"),
      upconv: host.querySelector("#unet-stage-upconv"),
      fusion: host.querySelector("#unet-stage-fusion"),
      output: host.querySelector("#unet-stage-output")
    };
    drawCover(canvases.input.getContext("2d"), state.image, canvases.input.width, canvases.input.height);
    drawHeatmap(canvases.encoder, edges, width, height, "edge");
    drawHeatmap(canvases.bottleneck, contextMap, 32, 24, "deep");
    drawHeatmap(canvases.upconv, upsampled, width, height, "up");
    drawHeatmap(canvases.fusion, fused, width, height, "fusion");
    drawMask(canvases.output, imageData, score, width, height);
    status.textContent = "U-Net stages updated for “" + state.sourceName + "”. The final panel is a conceptual mask, not a trained prediction.";
  }

  function releaseObjectUrl() {
    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = "";
    }
  }

  function loadSource(source, caption, presetKey) {
    var image = new Image();
    image.onload = function () {
      state.image = image;
      state.sourceName = caption;
      state.activePreset = presetKey || "";
      inputImage.src = source;
      inputCaption.textContent = caption + (presetKey ? " · course example" : " · local upload");
      if (presetKey) presetSelect.value = presetKey;
      host.querySelectorAll(".unet-preset-button").forEach(function (button) {
        button.classList.toggle("selected", button.getAttribute("data-unet-preset") === state.activePreset);
      });
      renderPipeline();
    };
    image.onerror = function () {
      status.textContent = "The selected image could not be loaded.";
    };
    image.src = source;
  }

  function loadPreset(key) {
    var item = presets.find(function (preset) { return preset.key === key; }) || presets[0];
    releaseObjectUrl();
    loadSource(item.src, item.label, item.key);
    status.textContent = "Loading “" + item.label + "”…";
  }

  presetSelect.addEventListener("change", function () { loadPreset(presetSelect.value); });
  host.querySelectorAll(".unet-preset-button").forEach(function (button) {
    button.addEventListener("click", function () { loadPreset(button.getAttribute("data-unet-preset")); });
  });
  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    releaseObjectUrl();
    state.objectUrl = URL.createObjectURL(file);
    presetSelect.value = "";
    loadSource(state.objectUrl, file.name, "");
    status.textContent = "Loading the local upload…";
  });
  runButton.addEventListener("click", function () {
    if (!state.image) {
      status.textContent = "Choose or upload an image first.";
      return;
    }
    renderPipeline();
  });
  resetButton.addEventListener("click", function () {
    fileInput.value = "";
    loadPreset("horse");
  });
  stageSelect.addEventListener("change", function () {
    var selected = stageSelect.value;
    host.querySelectorAll(".unet-stage-card").forEach(function (card) {
      card.classList.toggle("active", selected === "all" || card.getAttribute("data-unet-stage") === selected);
    });
    stageStatus.textContent = selected === "all" ? "All stages are highlighted." : "Highlighted: " + (stageInfo.find(function (stage) { return stage[0] === selected; }) || ["", selected])[1] + ".";
  });
  window.addEventListener("pagehide", releaseObjectUrl);
  stageSelect.dispatchEvent(new Event("change"));
  loadPreset("horse");
})();
