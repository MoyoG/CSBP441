(function () {
  "use strict";

  var host = document.getElementById("unet-explorer-app");
  if (!host) return;

  var presets = [
    { key: "horse", label: "Horse riding", note: "Course example", src: "assets/yolo-sample-horse-riding.jpg" },
    { key: "cat", label: "Close-up cat", note: "Course example", src: "assets/yolo-sample-cat.png" },
    { key: "pump", label: "Gas pump", note: "Imagenette example", src: "assets/imagenette-gas-pump.png" }
  ];
  var COCO_CLASSES = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
    "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
    "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
    "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
    "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
    "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
    "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
    "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
  ];
  var ORT_VERSION = "1.30.0";
  var ORT_DIST = "https://cdn.jsdelivr.net/npm/onnxruntime-web@" + ORT_VERSION + "/dist/";
  var SEGMENT_MODEL = {
    label: "YOLO11n-seg · COCO80 · ONNX",
    shortLabel: "YOLO11n-seg",
    url: "https://huggingface.co/unileon-robotics/YOLO11-ONNX/resolve/main/dynamic/yolo11n-seg.onnx",
    inputSize: 640
  };
  var SEGMENT_RESOLUTIONS = [
    { value: 416, label: "416×416 · Fast" },
    { value: 640, label: "640×640 · Balanced" },
    { value: 960, label: "960×960 · Higher detail" }
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
      "<section class='unet-final-results'><div class='unet-final-heading'><div><p class='eyebrow'>Final U-Net result</p><h3>From per-pixel scores to a segmentation mask</h3><p>The final 1×1 convolution produces class scores at every pixel. This panel turns the foreground score into a binary teaching mask and overlays it on the selected image.</p></div><span class='unet-result-badge'>256×192×2 output</span></div><div class='unet-final-grid'><figure><canvas id='unet-final-mask' width='320' height='220' aria-label='Final conceptual segmentation mask'></canvas><figcaption><strong>Predicted mask</strong><br>Dark blue = background; green = foreground region selected by the conceptual score threshold.</figcaption></figure><figure><canvas id='unet-final-overlay' width='320' height='220' aria-label='Final conceptual segmentation overlay'></canvas><figcaption><strong>Segmentation overlay</strong><br>The same mask is drawn on top of the original image so the spatial result is easy to inspect.</figcaption></figure></div><p class='unet-result-summary' id='unet-result-summary' aria-live='polite'>The final result will update when an image is selected.</p></section>" +
      "<section class='unet-real-results'><div class='unet-final-heading'><div><p class='eyebrow'>Real COCO instance segmentation</p><h3>Run a trained segmentation model in the browser</h3><p><strong>" + SEGMENT_MODEL.label + "</strong> predicts boxes, labels, confidence scores, and one mask per detected object. The weights are downloaded only when you click Run; your image stays in this browser.</p></div><span class='unet-result-badge'>80 COCO classes</span></div><div class='unet-real-controls'><label class='unet-field'><span>Confidence threshold</span><input id='unet-real-confidence' type='number' min='0.05' max='0.95' step='0.05' value='0.25'></label><label class='unet-field'><span>Mask/NMS IoU threshold</span><input id='unet-real-iou' type='number' min='0.05' max='0.95' step='0.05' value='0.45'></label><div class='unet-real-buttons'><button class='button button-primary' id='unet-run-coco' type='button'>Run YOLO11n-seg on this image</button><button class='button button-secondary' id='unet-cancel-coco' type='button' hidden>Cancel download</button><span class='unet-real-status' id='unet-real-status' aria-live='polite'>Choose an image, then run the real COCO model.</span></div></div><div class='unet-real-grid'><figure><canvas id='unet-real-mask' width='320' height='220' aria-label='Real COCO instance segmentation masks'></canvas><figcaption><strong>Instance masks</strong><br>Each color corresponds to one detected object instance.</figcaption></figure><figure><canvas id='unet-real-overlay' width='320' height='220' aria-label='Real COCO segmentation overlay'></canvas><figcaption><strong>Final boxes, labels, and masks</strong><br>Only detections that pass confidence filtering and class-specific NMS are shown.</figcaption></figure></div><p class='unet-real-summary' id='unet-real-summary' aria-live='polite'>The real model has not been run yet.</p><div class='unet-real-table-wrap' id='unet-real-table'></div><p class='unet-real-note'><strong>Model note:</strong> this is instance segmentation, not semantic segmentation. Two objects of the same COCO class receive separate masks. The model is pretrained on COCO and is not a U-Net architecture; it is included as a real segmentation comparison.</p></section>" +
      "<div class='unet-explanation-row'><div><strong>Encoder → bottleneck</strong><span>Pooling trades resolution for context.</span></div><div><strong>Up-conv → skip</strong><span>Upsampling restores a grid; concatenation restores detail.</span></div><div><strong>1×1 conv → softmax</strong><span>Each pixel receives a class score and probability distribution.</span></div></div>" +
      "<p class='unet-explorer-note'><strong>Teaching note:</strong> this is a deterministic browser visualization of the U-Net data flow, not a trained segmentation model. It makes the tensor shapes and operations visible; a real U-Net learns the filters and predicts the mask from training data.</p>" +
    "</div>";

  var realControls = host.querySelector(".unet-real-controls");
  var resolutionField = document.createElement("label");
  resolutionField.className = "unet-field";
  resolutionField.innerHTML = "<span>Inference resolution</span><select id='unet-real-resolution'>" + SEGMENT_RESOLUTIONS.map(function (option) { return "<option value='" + option.value + "'" + (option.value === SEGMENT_MODEL.inputSize ? " selected" : "") + ">" + option.label + "</option>"; }).join("") + "</select><small>Higher resolution can help small objects but uses more time and memory.</small>";
  realControls.insertBefore(resolutionField, realControls.firstElementChild);

  var presetSelect = host.querySelector("#unet-preset");
  var fileInput = host.querySelector("#unet-image-file");
  var runButton = host.querySelector("#unet-run");
  var resetButton = host.querySelector("#unet-reset");
  var status = host.querySelector("#unet-status");
  var inputImage = host.querySelector("#unet-input-image");
  var inputCaption = host.querySelector("#unet-input-caption");
  var stageSelect = host.querySelector("#unet-stage-select");
  var stageStatus = host.querySelector("#unet-stage-status");
  var finalMask = host.querySelector("#unet-final-mask");
  var finalOverlay = host.querySelector("#unet-final-overlay");
  var resultSummary = host.querySelector("#unet-result-summary");
  var realRunButton = host.querySelector("#unet-run-coco");
  var realCancelButton = host.querySelector("#unet-cancel-coco");
  var realResolutionInput = host.querySelector("#unet-real-resolution");
  var realConfidenceInput = host.querySelector("#unet-real-confidence");
  var realIouInput = host.querySelector("#unet-real-iou");
  var realStatus = host.querySelector("#unet-real-status");
  var realSummary = host.querySelector("#unet-real-summary");
  var realTable = host.querySelector("#unet-real-table");
  var realMask = host.querySelector("#unet-real-mask");
  var realOverlay = host.querySelector("#unet-real-overlay");
  var realState = { ortPromise: null, session: null, modelBytes: null, activeAbort: null };
  realRunButton.disabled = true;
  realCancelButton.hidden = true;
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

  function percentile(values, fraction) {
    var sorted = Array.from(values).sort(function (a, b) { return a - b; });
    return sorted[Math.max(0, Math.min(sorted.length - 1, Math.floor(fraction * (sorted.length - 1))))];
  }

  function makeForegroundMask(score, width, height) {
    var threshold = percentile(score, 0.65);
    var mask = new Uint8Array(score.length);
    for (var i = 0; i < score.length; i++) mask[i] = score[i] >= threshold ? 1 : 0;
    return { mask: mask, threshold: threshold };
  }

  function drawFinalMask(canvas, mask, width, height) {
    var context = canvas.getContext("2d");
    var imageData = context.createImageData(canvas.width, canvas.height);
    for (var y = 0; y < canvas.height; y++) {
      var sourceY = Math.min(height - 1, Math.floor(y * height / canvas.height));
      for (var x = 0; x < canvas.width; x++) {
        var sourceX = Math.min(width - 1, Math.floor(x * width / canvas.width));
        var foreground = mask[sourceY * width + sourceX] === 1;
        var p = (y * canvas.width + x) * 4;
        imageData.data[p] = foreground ? 37 : 16;
        imageData.data[p + 1] = foreground ? 205 : 44;
        imageData.data[p + 2] = foreground ? 146 : 73;
        imageData.data[p + 3] = 255;
      }
    }
    context.putImageData(imageData, 0, 0);
  }

  function drawFinalOverlay(canvas, imageData, mask, edges, width, height) {
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
        var index = sourceY * width + sourceX;
        var p = (y * canvas.width + x) * 4;
        var boundary = edges[index] > 0.78;
        if (boundary) {
          overlay.data[p] = 236;
          overlay.data[p + 1] = 72;
          overlay.data[p + 2] = 153;
          overlay.data[p + 3] = 190;
        } else if (mask[index] === 1) {
          overlay.data[p] = 33;
          overlay.data[p + 1] = 205;
          overlay.data[p + 2] = 143;
          overlay.data[p + 3] = 112;
        } else {
          overlay.data[p] = 10;
          overlay.data[p + 1] = 35;
          overlay.data[p + 2] = 59;
          overlay.data[p + 3] = 30;
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
    var score = normalize(blur(Float32Array.from(fused, function (value, i) { return 0.62 * value + 0.38 * colors[i]; }), width, height));
    var finalResult = makeForegroundMask(score, width, height);
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
    drawFinalMask(finalMask, finalResult.mask, width, height);
    drawFinalOverlay(finalOverlay, imageData, finalResult.mask, edges, width, height);
    var foregroundPixels = finalResult.mask.reduce(function (sum, value) { return sum + value; }, 0);
    resultSummary.innerHTML = "<strong>Conceptual output:</strong> " + foregroundPixels.toLocaleString() + " of " + finalResult.mask.length.toLocaleString() + " pixels are assigned to the foreground class (" + (100 * foregroundPixels / finalResult.mask.length).toFixed(1) + "%). The illustrative threshold is " + finalResult.threshold.toFixed(2) + ". A trained U-Net would learn this score map from labeled masks.";
    status.textContent = "U-Net stages and final result updated for “" + state.sourceName + "”. This is a conceptual mask, not a trained prediction.";
  }

  function configureOrt(ortApi) {
    if (ortApi && ortApi.env && ortApi.env.wasm) {
      ortApi.env.wasm.wasmPaths = ORT_DIST;
      ortApi.env.wasm.numThreads = 1;
      ortApi.env.wasm.proxy = false;
      ortApi.env.wasm.simd = true;
    }
    if (ortApi) ortApi.env.logLevel = "error";
    return ortApi;
  }

  function ensureOrt() {
    if (window.ort) return Promise.resolve(configureOrt(window.ort));
    if (realState.ortPromise) return realState.ortPromise;
    realState.ortPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = ORT_DIST + "ort.min.js";
      script.async = true;
      script.onload = function () {
        if (!window.ort) reject(new Error("ONNX Runtime Web loaded without its global API."));
        else resolve(configureOrt(window.ort));
      };
      script.onerror = function () { reject(new Error("Could not load ONNX Runtime Web from the CDN.")); };
      document.head.appendChild(script);
    });
    return realState.ortPromise;
  }

  async function fetchModelBytes(signal) {
    var response = await fetch(SEGMENT_MODEL.url, { mode: "cors", cache: "force-cache", signal: signal });
    if (!response.ok) throw new Error("Model request failed with HTTP " + response.status + ".");
    var total = Number(response.headers.get("content-length")) || 0;
    if (!response.body || !response.body.getReader) return new Uint8Array(await response.arrayBuffer());
    var reader = response.body.getReader();
    var chunks = [];
    var loaded = 0;
    while (true) {
      var next = await reader.read();
      if (next.done) break;
      if (next.value) {
        chunks.push(next.value);
        loaded += next.value.byteLength;
        realStatus.textContent = "Downloading " + SEGMENT_MODEL.shortLabel + "… " + (total ? Math.round(100 * loaded / total) + "%" : Math.round(loaded / 1048576) + " MB");
      }
    }
    var bytes = new Uint8Array(loaded);
    var offset = 0;
    chunks.forEach(function (chunk) { bytes.set(chunk, offset); offset += chunk.byteLength; });
    return bytes;
  }

  async function getSegmentationSession(signal) {
    if (realState.session) return realState.session;
    var ortApi = await ensureOrt();
    var bytes = await fetchModelBytes(signal);
    realStatus.textContent = "Initialising " + SEGMENT_MODEL.shortLabel + " with ONNX Runtime Web…";
    var session = await ortApi.InferenceSession.create(bytes, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
    realState.session = { session: session, ort: ortApi };
    return realState.session;
  }

  function makeSegmentationInput(image, ortApi, inputSize) {
    var size = inputSize || SEGMENT_MODEL.inputSize;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var context = canvas.getContext("2d", { willReadFrequently: true });
    var originalWidth = image.naturalWidth || image.width;
    var originalHeight = image.naturalHeight || image.height;
    var scale = Math.min(size / originalWidth, size / originalHeight);
    var resizedWidth = originalWidth * scale;
    var resizedHeight = originalHeight * scale;
    var padX = (size - resizedWidth) / 2;
    var padY = (size - resizedHeight) / 2;
    context.fillStyle = "rgb(114,114,114)";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, padX, padY, resizedWidth, resizedHeight);
    var pixels = context.getImageData(0, 0, size, size).data;
    var plane = size * size;
    var tensorData = new Float32Array(3 * plane);
    for (var channel = 0; channel < 3; channel++) {
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          var pixel = (y * size + x) * 4;
          tensorData[channel * plane + y * size + x] = pixels[pixel + channel] / 255;
        }
      }
    }
    return {
      tensor: new ortApi.Tensor("float32", tensorData, [1, 3, size, size]),
      meta: { originalWidth: originalWidth, originalHeight: originalHeight, scale: scale, padX: padX, padY: padY, inputSize: size }
    };
  }

  function sigmoid(value) {
    return 1 / (1 + Math.exp(-value));
  }

  function probability(value) {
    return value >= 0 && value <= 1 ? value : sigmoid(value);
  }

  function clampBox(box, meta) {
    return [
      Math.max(0, Math.min(meta.originalWidth, box[0])),
      Math.max(0, Math.min(meta.originalHeight, box[1])),
      Math.max(0, Math.min(meta.originalWidth, box[2])),
      Math.max(0, Math.min(meta.originalHeight, box[3]))
    ];
  }

  function decodeSegmentation(outputs, meta, confidenceThreshold) {
    var tensors = Object.keys(outputs).map(function (name) { return outputs[name]; });
    var detectionTensor = tensors.find(function (tensor) { return tensor && tensor.dims && tensor.dims.length === 3; });
    var prototypeTensor = tensors.find(function (tensor) { return tensor && tensor.dims && tensor.dims.length === 4; });
    if (!detectionTensor || !prototypeTensor) throw new Error("The segmentation model returned an unexpected pair of outputs.");
    var dims = detectionTensor.dims.map(Number);
    var channelsFirst = dims[1] < dims[2];
    var channels = channelsFirst ? dims[1] : dims[2];
    var candidateCount = channelsFirst ? dims[2] : dims[1];
    var classCount = COCO_CLASSES.length;
    var maskCount = channels - 4 - classCount;
    if (maskCount <= 0) throw new Error("The segmentation output does not contain mask coefficients.");
    var data = detectionTensor.data;
    function valueAt(row, column) {
      return channelsFirst ? Number(data[column * candidateCount + row]) : Number(data[row * channels + column]);
    }
    var candidates = [];
    for (var row = 0; row < candidateCount; row++) {
      var bestClass = -1;
      var bestScore = -Infinity;
      for (var classIndex = 0; classIndex < classCount; classIndex++) {
        var score = probability(valueAt(row, 4 + classIndex));
        if (score > bestScore) {
          bestScore = score;
          bestClass = classIndex;
        }
      }
      if (bestScore < confidenceThreshold) continue;
      var rawBox = [valueAt(row, 0), valueAt(row, 1), valueAt(row, 2), valueAt(row, 3)];
      var maxCoordinate = Math.max.apply(Math, rawBox.map(Math.abs));
      if (maxCoordinate <= 2.5) rawBox = rawBox.map(function (value) { return value * meta.inputSize; });
      var box = clampBox([
        (rawBox[0] - rawBox[2] / 2 - meta.padX) / meta.scale,
        (rawBox[1] - rawBox[3] / 2 - meta.padY) / meta.scale,
        (rawBox[0] + rawBox[2] / 2 - meta.padX) / meta.scale,
        (rawBox[1] + rawBox[3] / 2 - meta.padY) / meta.scale
      ], meta);
      if (box[2] <= box[0] || box[3] <= box[1]) continue;
      var coefficients = [];
      for (var maskIndex = 0; maskIndex < maskCount; maskIndex++) coefficients.push(valueAt(row, 4 + classCount + maskIndex));
      candidates.push({ id: row + 1, box: box, classId: bestClass, label: COCO_CLASSES[bestClass], score: bestScore, coefficients: coefficients });
    }
    return { candidates: candidates.sort(function (a, b) { return b.score - a.score; }), rawCount: candidateCount, prototypeTensor: prototypeTensor };
  }

  function boxIoU(first, second) {
    var left = Math.max(first[0], second[0]);
    var top = Math.max(first[1], second[1]);
    var right = Math.min(first[2], second[2]);
    var bottom = Math.min(first[3], second[3]);
    var intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
    var areaFirst = Math.max(0, first[2] - first[0]) * Math.max(0, first[3] - first[1]);
    var areaSecond = Math.max(0, second[2] - second[0]) * Math.max(0, second[3] - second[1]);
    var union = areaFirst + areaSecond - intersection;
    return union > 0 ? intersection / union : 0;
  }

  function segmentNms(candidates, threshold) {
    var kept = [];
    candidates.slice(0, 300).forEach(function (candidate) {
      var sameClass = kept.filter(function (other) { return other.classId === candidate.classId; });
      var bestOverlap = sameClass.reduce(function (best, other) {
        var overlap = boxIoU(candidate.box, other.box);
        return !best || overlap > best.iou ? { iou: overlap, by: other } : best;
      }, null);
      candidate.nmsIoU = bestOverlap ? bestOverlap.iou : null;
      candidate.nmsDecision = bestOverlap && bestOverlap.iou > threshold ? "suppressed" : "kept";
      if (candidate.nmsDecision === "kept") kept.push(candidate);
    });
    return kept;
  }

  function hslToRgb(hue) {
    var h = (hue % 360) / 360;
    var s = .78;
    var l = .5;
    var q = l < .5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function hueToRgb(t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [Math.round(hueToRgb(h + 1 / 3) * 255), Math.round(hueToRgb(h) * 255), Math.round(hueToRgb(h - 1 / 3) * 255)];
  }

  function renderInstanceMasks(image, detections, prototypeTensor, meta) {
    var protoDims = prototypeTensor.dims.map(Number);
    var maskCount = protoDims[1];
    var protoHeight = protoDims[2];
    var protoWidth = protoDims[3];
    var protoData = prototypeTensor.data;
    var displayLimit = Math.max(640, meta.inputSize);
    var displayScale = Math.min(displayLimit / meta.originalWidth, displayLimit / meta.originalHeight, 1);
    var width = Math.max(1, Math.round(meta.originalWidth * displayScale));
    var height = Math.max(1, Math.round(meta.originalHeight * displayScale));
    var shown = detections.slice(0, 12);
    var masks = shown.map(function (detection) {
      var mask = new Uint8Array(width * height);
      var left = Math.max(0, Math.floor(detection.box[0] * displayScale));
      var right = Math.min(width, Math.ceil(detection.box[2] * displayScale));
      var top = Math.max(0, Math.floor(detection.box[1] * displayScale));
      var bottom = Math.min(height, Math.ceil(detection.box[3] * displayScale));
      for (var y = top; y < bottom; y++) {
        var originalY = y / displayScale;
        var inputY = originalY * meta.scale + meta.padY;
        var protoY = Math.max(0, Math.min(protoHeight - 1, Math.floor(inputY / meta.inputSize * protoHeight)));
        for (var x = left; x < right; x++) {
          var originalX = x / displayScale;
          var inputX = originalX * meta.scale + meta.padX;
          var protoX = Math.max(0, Math.min(protoWidth - 1, Math.floor(inputX / meta.inputSize * protoWidth)));
          var total = 0;
          for (var channel = 0; channel < maskCount; channel++) total += detection.coefficients[channel] * Number(protoData[channel * protoHeight * protoWidth + protoY * protoWidth + protoX]);
          if (sigmoid(total) >= .5) mask[y * width + x] = 1;
        }
      }
      return { detection: detection, mask: mask, color: hslToRgb(detection.classId * 47) };
    });
    var maskImage = new ImageData(width, height);
    var overlayImage = new ImageData(width, height);
    var sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    var sourceContext = sourceCanvas.getContext("2d");
    sourceContext.drawImage(image, 0, 0, width, height);
    var originalPixels = sourceContext.getImageData(0, 0, width, height);
    for (var p = 0; p < width * height; p++) {
      var selected = null;
      for (var m = masks.length - 1; m >= 0; m--) if (masks[m].mask[p]) { selected = masks[m]; break; }
      var pixel = p * 4;
      if (selected) {
        maskImage.data[pixel] = selected.color[0]; maskImage.data[pixel + 1] = selected.color[1]; maskImage.data[pixel + 2] = selected.color[2]; maskImage.data[pixel + 3] = 255;
        var alpha = .46;
        overlayImage.data[pixel] = Math.round(originalPixels.data[pixel] * (1 - alpha) + selected.color[0] * alpha);
        overlayImage.data[pixel + 1] = Math.round(originalPixels.data[pixel + 1] * (1 - alpha) + selected.color[1] * alpha);
        overlayImage.data[pixel + 2] = Math.round(originalPixels.data[pixel + 2] * (1 - alpha) + selected.color[2] * alpha);
      } else {
        maskImage.data[pixel] = 16; maskImage.data[pixel + 1] = 44; maskImage.data[pixel + 2] = 73; maskImage.data[pixel + 3] = 255;
        overlayImage.data[pixel] = originalPixels.data[pixel]; overlayImage.data[pixel + 1] = originalPixels.data[pixel + 1]; overlayImage.data[pixel + 2] = originalPixels.data[pixel + 2];
      }
      overlayImage.data[pixel + 3] = 255;
    }
    return { masks: masks, width: width, height: height, maskImage: maskImage, overlayImage: overlayImage };
  }

  function drawRealResult(image, rendered, detections) {
    realMask.width = rendered.width; realMask.height = rendered.height;
    realOverlay.width = rendered.width; realOverlay.height = rendered.height;
    realMask.getContext("2d").putImageData(rendered.maskImage, 0, 0);
    var overlayContext = realOverlay.getContext("2d");
    overlayContext.putImageData(rendered.overlayImage, 0, 0);
    var scale = rendered.width / (image.naturalWidth || image.width);
    detections.slice(0, 12).forEach(function (detection) {
      var color = "hsl(" + ((detection.classId * 47) % 360) + " 78% 45%)";
      var x = detection.box[0] * scale, y = detection.box[1] * scale, w = (detection.box[2] - detection.box[0]) * scale, h = (detection.box[3] - detection.box[1]) * scale;
      overlayContext.strokeStyle = color;
      overlayContext.lineWidth = 2;
      overlayContext.strokeRect(x, y, w, h);
      var label = detection.label + " " + detection.score.toFixed(2);
      overlayContext.font = "bold 12px Arial";
      var labelWidth = overlayContext.measureText(label).width + 8;
      overlayContext.fillStyle = color;
      overlayContext.fillRect(x, Math.max(0, y - 16), labelWidth, 16);
      overlayContext.fillStyle = "#fff";
      overlayContext.fillText(label, x + 4, Math.max(12, y - 4));
    });
  }

  function realTableHTML(detections) {
    if (!detections.length) return "<p class='unet-real-empty'>No objects survived the current confidence and class-specific NMS thresholds.</p>";
    var rows = detections.slice(0, 20).map(function (detection, index) {
      var box = detection.box.map(function (value) { return Math.round(value); }).join(", ");
      var area = detection.maskArea ? detection.maskArea.toLocaleString() : "—";
      return "<tr><th>" + (index + 1) + "</th><td>" + detection.label + "</td><td>" + detection.score.toFixed(3) + "</td><td>[" + box + "]</td><td>" + area + " px</td></tr>";
    }).join("");
    return "<table class='unet-real-table'><thead><tr><th>#</th><th>COCO class</th><th>Score</th><th>Box [x₁,y₁,x₂,y₂]</th><th>Mask area</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function clearRealResult(message) {
    realMask.width = 320; realMask.height = 220;
    realOverlay.width = 320; realOverlay.height = 220;
    [realMask, realOverlay].forEach(function (canvas) {
      var context = canvas.getContext("2d");
      context.fillStyle = "#11283b";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#dce7ee";
      context.font = "bold 14px Arial";
      context.fillText("Run the COCO model to see results", 18, 110);
    });
    realSummary.textContent = message || "The real model has not been run yet.";
    realTable.innerHTML = "";
  }

  async function runRealSegmentation() {
    if (!state.image) {
      realStatus.textContent = "Choose an image first.";
      return;
    }
    var controller = new AbortController();
    realState.activeAbort = controller;
    realRunButton.disabled = true;
    realCancelButton.hidden = false;
    try {
      realStatus.textContent = "Loading ONNX Runtime Web…";
      var loaded = await getSegmentationSession(controller.signal);
      var requestedResolution = Number(realResolutionInput.value) || SEGMENT_MODEL.inputSize;
      var allowedResolution = SEGMENT_RESOLUTIONS.some(function (option) { return option.value === requestedResolution; }) ? requestedResolution : SEGMENT_MODEL.inputSize;
      var input = makeSegmentationInput(state.image, loaded.ort, allowedResolution);
      realStatus.textContent = "Preparing the " + input.meta.inputSize + "×" + input.meta.inputSize + " input…";
      realStatus.textContent = "Running a real COCO forward pass in the browser…";
      var inputName = loaded.session.inputNames[0] || "images";
      var outputs = await loaded.session.run((function () { var values = {}; values[inputName] = input.tensor; return values; })());
      var decoded = decodeSegmentation(outputs, input.meta, Math.max(0.05, Math.min(0.95, Number(realConfidenceInput.value) || .25)));
      var nms = segmentNms(decoded.candidates, Math.max(0.05, Math.min(0.95, Number(realIouInput.value) || .45)));
      var proto = decoded.prototypeTensor;
      var rendered = renderInstanceMasks(state.image, nms, proto, input.meta);
      rendered.masks.forEach(function (item) { item.detection.maskArea = item.mask.reduce(function (sum, value) { return sum + value; }, 0); });
      drawRealResult(state.image, rendered, nms);
      realSummary.innerHTML = "<strong>Real model complete at " + input.meta.inputSize + "×" + input.meta.inputSize + ":</strong> " + decoded.rawCount.toLocaleString() + " raw candidates → " + decoded.candidates.length + " above confidence threshold → " + nms.length + " final instance masks after class-specific NMS. The table shows the top 20 results.";
      realTable.innerHTML = realTableHTML(nms);
      realStatus.textContent = "Done. YOLO11n-seg processed the image locally with COCO classes.";
      if (input.tensor && input.tensor.dispose) input.tensor.dispose();
      Object.keys(outputs).forEach(function (name) { if (outputs[name] && outputs[name].dispose) outputs[name].dispose(); });
    } catch (error) {
      if (error && error.name === "AbortError") realStatus.textContent = "Model download cancelled. Run again when ready.";
      else realStatus.textContent = "Segmentation failed: " + (error && error.message ? error.message : String(error));
    } finally {
      realState.activeAbort = null;
      realRunButton.disabled = !state.image;
      realCancelButton.hidden = true;
    }
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
      realRunButton.disabled = false;
      realStatus.textContent = "Ready. Run the real COCO model when you want to compare it with the conceptual U-Net stages.";
      clearRealResult("Image changed. Run the real COCO model to update the final result.");
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
  realRunButton.addEventListener("click", runRealSegmentation);
  realCancelButton.addEventListener("click", function () {
    if (realState.activeAbort) realState.activeAbort.abort();
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
  clearRealResult();
  loadPreset("horse");
})();
