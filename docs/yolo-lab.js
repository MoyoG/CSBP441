(function () {
  "use strict";

  if (Number(document.body.dataset.ln) !== 12) return;
  var host = document.getElementById("yolo-detector-lab");
  if (!host) return;

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
  var VOC_CLASSES = [
    "airplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow",
    "dining table", "dog", "horse", "motorcycle", "person", "potted plant", "sheep", "couch",
    "train", "tv"
  ];
  var YOLOV1_BASE = "https://raw.githubusercontent.com/hakanakgun/vision-evolution-lab/7562098306b2f14cd7553b87085cfc1d6b19a9f0/assets/models/yolov1/";
  var YOLOV1_PARTS = [
    {file: "part-00.bin", bytes: 95000000},
    {file: "part-01.bin", bytes: 95000000},
    {file: "part-02.bin", bytes: 95000000},
    {file: "part-03.bin", bytes: 95000000},
    {file: "part-04.bin", bytes: 95000000},
    {file: "part-05.bin", bytes: 66358513}
  ];
  var YOLOV1_BYTES = 541358513;
  var ORT_VERSION = "1.30.0";
  var ORT_DIST = "https://cdn.jsdelivr.net/npm/onnxruntime-web@" + ORT_VERSION + "/dist/";

  var MODELS = {
    yolox: {
      key: "yolox",
      label: "YOLOX-Nano · COCO80 · 3.6 MB",
      shortLabel: "YOLOX-Nano",
      url: "https://huggingface.co/LibreYOLO/libreyolo-web/resolve/main/yolox_n.onnx",
      family: "yolox",
      inputSize: 416,
      classes: COCO_CLASSES,
      description: "Recommended for the score/NMS walkthrough. It exposes objectness and 80 COCO class scores.",
      preprocessing: "416×416 top-left letterbox, BGR tensor, values kept in 0–255."
    },
    yolo9: {
      key: "yolo9",
      label: "YOLO9-Tiny · COCO80 · 8 MB",
      shortLabel: "YOLO9-Tiny",
      url: "https://huggingface.co/LibreYOLO/libreyolo-web/resolve/main/yolo9_t.onnx",
      family: "yolo9",
      inputSize: 640,
      classes: COCO_CLASSES,
      description: "A newer compact COCO comparison. This exported head has no separate objectness column.",
      preprocessing: "640×640 direct resize, RGB tensor, values divided by 255."
    },
    yolov1: {
      key: "yolov1",
      label: "Original YOLOv1 · VOC20 · 541 MB",
      shortLabel: "Original YOLOv1",
      family: "yolov1",
      inputSize: 448,
      classes: VOC_CLASSES,
      expectedBytes: YOLOV1_BYTES,
      description: "Historical full YOLOv1 architecture trained on Pascal VOC. It is intentionally opt-in because the browser download is large.",
      preprocessing: "448×448 direct stretch, RGB tensor, values divided by 255.",
      parts: YOLOV1_PARTS
    }
  };

  var state = {
    image: null,
    imageUrl: "",
    imageName: "",
    lastResult: null,
    ortPromise: null,
    activeAbort: null,
    modelCache: new Map()
  };

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"}[character];
    });
  }

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function formatScore(value) {
    return value === null || value === undefined || !Number.isFinite(value) ? "—" : Number(value).toFixed(3);
  }

  function setStatus(message, tone) {
    var status = host.querySelector("#yolo-lab-status");
    status.textContent = message;
    status.className = "yolo-lab-status" + (tone ? " " + tone : "");
  }

  function currentSpec() {
    return MODELS[host.querySelector("#yolo-model").value];
  }

  host.innerHTML = [
    "<div class='yolo-detector-shell'>",
      "<div class='yolo-detector-controls'>",
        "<label class='yolo-detector-field'><span>Detector model</span><select id='yolo-model'>",
          "<option value='yolox'>YOLOX-Nano · COCO80 · 3.6 MB</option>",
          "<option value='yolo9'>YOLO9-Tiny · COCO80 · 8 MB</option>",
          "<option value='yolov1'>Original YOLOv1 · VOC20 · 541 MB</option>",
        "</select><small>Choose the model before running inference.</small></label>",
        "<label class='yolo-detector-field'><span>Image to analyse</span><input id='yolo-image-file' type='file' accept='image/*'><small>The image stays in this browser; only model files are fetched.</small></label>",
        "<label class='yolo-detector-field yolo-number-field'><span>Confidence threshold</span><input id='yolo-confidence' type='number' min='0.01' max='0.99' step='0.01' value='0.25'><small>Remove candidates with score below this value.</small></label>",
        "<label class='yolo-detector-field yolo-number-field'><span>NMS IoU threshold</span><input id='yolo-iou' type='number' min='0.01' max='0.99' step='0.01' value='0.45'><small>Suppress same-class boxes when IoU is above this value.</small></label>",
        "<div class='yolo-detector-buttons'><button class='button button-primary' id='yolo-run' type='button' disabled>Run real detection</button><button class='button button-secondary' id='yolo-cancel' type='button' hidden>Cancel download</button><button class='button button-secondary' id='yolo-clear' type='button'>Clear result</button></div>",
      "</div>",
      "<div id='yolo-model-note' class='yolo-model-note'></div>",
      "<div id='yolo-lab-status' class='yolo-lab-status' role='status' aria-live='polite'>Choose an image, then run a detector.</div>",
      "<div class='yolo-input-row'><figure class='yolo-input-figure'><p class='eyebrow'>Uploaded image</p><img id='yolo-input-preview' alt='Uploaded image preview' hidden><figcaption id='yolo-input-caption'>No image selected yet.</figcaption></figure><div class='yolo-formula-card' id='yolo-formulas'></div></div>",
      "<div class='yolo-stage-grid'>",
        "<figure class='yolo-stage-card'><div class='yolo-stage-heading'><strong>1 · All decoded candidates</strong><span id='yolo-candidate-count'>Waiting</span></div><canvas id='yolo-stage-candidates' aria-label='All decoded candidate boxes'></canvas><figcaption>Every valid box emitted by the selected model is drawn. To keep the canvas readable, text labels identify the top 20 by score; the table below gives their exact values.</figcaption></figure>",
        "<figure class='yolo-stage-card'><div class='yolo-stage-heading'><strong>2 · After confidence filtering</strong><span id='yolo-filtered-count'>Waiting</span></div><canvas id='yolo-stage-filtered' aria-label='Candidate boxes after confidence filtering'></canvas><figcaption>Boxes with score &lt; the confidence threshold are removed before NMS.</figcaption></figure>",
        "<figure class='yolo-stage-card'><div class='yolo-stage-heading'><strong>3 · Final class-specific NMS</strong><span id='yolo-final-count'>Waiting</span></div><canvas id='yolo-stage-final' aria-label='Final detections after class-specific non-maximum suppression'></canvas><figcaption>Greedy NMS compares IoU only between boxes with the same predicted class, then keeps the higher-scoring box.</figcaption></figure>",
      "</div>",
      "<div id='yolo-result-summary' class='yolo-result-summary' aria-live='polite'>Run a detector to populate the three stages.</div>",
      "<div id='yolo-result-table' class='yolo-result-table'></div>",
    "</div>"
  ].join("");

  var modelSelect = host.querySelector("#yolo-model");
  var imageFile = host.querySelector("#yolo-image-file");
  var confidenceInput = host.querySelector("#yolo-confidence");
  var iouInput = host.querySelector("#yolo-iou");
  var runButton = host.querySelector("#yolo-run");
  var cancelButton = host.querySelector("#yolo-cancel");
  var clearButton = host.querySelector("#yolo-clear");
  var preview = host.querySelector("#yolo-input-preview");
  var previewCaption = host.querySelector("#yolo-input-caption");
  var modelNote = host.querySelector("#yolo-model-note");
  var formulaHost = host.querySelector("#yolo-formulas");
  var candidateCanvas = host.querySelector("#yolo-stage-candidates");
  var filteredCanvas = host.querySelector("#yolo-stage-filtered");
  var finalCanvas = host.querySelector("#yolo-stage-final");

  function modelNoteHTML(spec) {
    var large = spec.key === "yolov1"
      ? "<strong>Large download:</strong> the original YOLOv1 browser asset is about 541 MB. It is loaded only when you click Run and may require substantial memory."
      : "";
    return "<strong>" + escapeHTML(spec.shortLabel) + ":</strong> " + escapeHTML(spec.description) +
      "<br><span>Input contract: " + escapeHTML(spec.preprocessing) + "</span>" + (large ? "<br>" + large : "");
  }

  function formulaHTML(spec) {
    var scoreFormula;
    var scoreText;
    if (spec.key === "yolox") {
      scoreFormula = "detection score = objectness × highest class probability";
      scoreText = "YOLOX exposes an objectness value and one score for each COCO class. The displayed class is the class with the largest class score.";
    } else if (spec.key === "yolo9") {
      scoreFormula = "detection score = highest class probability";
      scoreText = "This YOLO9 export has no separate objectness output, so its highest class probability is the candidate confidence used for filtering.";
    } else {
      scoreFormula = "detection score = decoded VOC class-specific score";
      scoreText = "The browser export exposes 98 decoded boxes and 20 VOC class-specific scores. Its graph has already combined the original YOLOv1 box-confidence path, so no separate objectness column is available.";
    }
    return "<p class='eyebrow'>What the numbers mean</p>" +
      "<div class='yolo-formula-grid'>" +
        "<div><strong>Confidence / class score</strong><code>" + scoreFormula + "</code><small>" + scoreText + "</small></div>" +
        "<div><strong>Intersection over Union</strong><code>IoU = area(A ∩ B) ÷ area(A ∪ B)</code><small>For NMS, A and B are predicted boxes, not a ground-truth box.</small></div>" +
        "<div><strong>Class-specific NMS</strong><code>same class &amp;&amp; IoU &gt; threshold → suppress lower score</code><small>Different predicted classes do not suppress one another.</small></div>" +
      "</div>";
  }

  function updateModelExplanation() {
    var spec = currentSpec();
    modelNote.innerHTML = modelNoteHTML(spec);
    formulaHost.innerHTML = formulaHTML(spec);
  }

  function drawPlaceholder(canvas, message) {
    canvas.width = 640;
    canvas.height = 360;
    var context = canvas.getContext("2d");
    context.fillStyle = "#f5f8fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#536675";
    context.font = "600 18px Arial";
    context.textAlign = "center";
    context.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  function resetResult() {
    state.lastResult = null;
    drawPlaceholder(candidateCanvas, "Run a detector to show candidates");
    drawPlaceholder(filteredCanvas, "Confidence filtering will appear here");
    drawPlaceholder(finalCanvas, "Final NMS outputs will appear here");
    host.querySelector("#yolo-candidate-count").textContent = "Waiting";
    host.querySelector("#yolo-filtered-count").textContent = "Waiting";
    host.querySelector("#yolo-final-count").textContent = "Waiting";
    host.querySelector("#yolo-result-summary").textContent = "Run a detector to populate the three stages.";
    host.querySelector("#yolo-result-table").innerHTML = "";
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
    if (state.ortPromise) return state.ortPromise;
    state.ortPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = ORT_DIST + "ort.min.js";
      script.async = true;
      script.onload = function () {
        if (!window.ort) reject(new Error("ONNX Runtime Web loaded without its global API."));
        else resolve(configureOrt(window.ort));
      };
      script.onerror = function () {
        reject(new Error("Could not load ONNX Runtime Web from the CDN."));
      };
      document.head.appendChild(script);
    });
    return state.ortPromise;
  }

  async function fetchBytes(url, options) {
    var signal = options && options.signal;
    var expectedBytes = options && options.expectedBytes;
    var onProgress = options && options.onProgress;
    var response = await fetch(url, {mode: "cors", cache: "force-cache", signal: signal});
    if (!response.ok) throw new Error("Model request failed with HTTP " + response.status + ".");
    var total = Number(response.headers.get("content-length")) || Number(expectedBytes) || 0;
    if (!response.body || !response.body.getReader) {
      var simple = new Uint8Array(await response.arrayBuffer());
      if (expectedBytes && simple.byteLength !== expectedBytes) throw new Error("Model size mismatch.");
      onProgress && onProgress(simple.byteLength, total || simple.byteLength);
      return simple;
    }
    var reader = response.body.getReader();
    var chunks = [];
    var loaded = 0;
    try {
      while (true) {
        var next = await reader.read();
        if (next.done) break;
        if (next.value) {
          chunks.push(next.value);
          loaded += next.value.byteLength;
          onProgress && onProgress(loaded, total || loaded);
        }
      }
    } catch (error) {
      try { await reader.cancel(); } catch (_) {}
      throw error;
    }
    if (expectedBytes && loaded !== expectedBytes) throw new Error("Model size mismatch: expected " + expectedBytes + " bytes, received " + loaded + ".");
    var bytes = new Uint8Array(loaded);
    var offset = 0;
    chunks.forEach(function (chunk) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return bytes;
  }

  async function fetchPartInto(url, target, offset, expectedBytes, signal, onProgress, loadedBefore) {
    var response = await fetch(url, {mode: "cors", cache: "force-cache", signal: signal});
    if (!response.ok) throw new Error("YOLOv1 chunk request failed with HTTP " + response.status + ".");
    if (!response.body || !response.body.getReader) {
      var direct = new Uint8Array(await response.arrayBuffer());
      if (direct.byteLength !== expectedBytes) throw new Error("YOLOv1 chunk size mismatch.");
      target.set(direct, offset);
      onProgress(loadedBefore + expectedBytes, YOLOV1_BYTES);
      return expectedBytes;
    }
    var reader = response.body.getReader();
    var loaded = 0;
    try {
      while (true) {
        var next = await reader.read();
        if (next.done) break;
        if (loaded + next.value.byteLength > expectedBytes) throw new Error("YOLOv1 chunk exceeded its pinned size.");
        target.set(next.value, offset + loaded);
        loaded += next.value.byteLength;
        onProgress(loadedBefore + loaded, YOLOV1_BYTES);
      }
    } catch (error) {
      try { await reader.cancel(); } catch (_) {}
      throw error;
    }
    if (loaded !== expectedBytes) throw new Error("YOLOv1 chunk size mismatch: expected " + expectedBytes + " bytes, received " + loaded + ".");
    return loaded;
  }

  async function loadModelBytes(spec, signal) {
    if (spec.key !== "yolov1") {
      return fetchBytes(spec.url, {
        signal: signal,
        onProgress: function (loaded, total) {
          var percent = total ? Math.round(loaded / total * 100) : 0;
          setStatus("Downloading " + spec.shortLabel + " model… " + percent + "%");
        }
      });
    }
    var merged = new Uint8Array(YOLOV1_BYTES);
    var loadedTotal = 0;
    for (var index = 0; index < spec.parts.length; index += 1) {
      var part = spec.parts[index];
      setStatus("Downloading original YOLOv1… chunk " + (index + 1) + " of " + spec.parts.length + " (" + Math.round(loadedTotal / YOLOV1_BYTES * 100) + "%)");
      var loaded = await fetchPartInto(YOLOV1_BASE + part.file, merged, loadedTotal, part.bytes, signal, function (value) {
        setStatus("Downloading original YOLOv1… " + Math.round(value / YOLOV1_BYTES * 100) + "%");
      }, loadedTotal);
      loadedTotal += loaded;
    }
    if (loadedTotal !== YOLOV1_BYTES) throw new Error("YOLOv1 model size mismatch.");
    return merged;
  }

  async function getSession(spec, signal) {
    var cached = state.modelCache.get(spec.key);
    if (cached) return cached;
    var ortApi = await ensureOrt();
    var bytes = await loadModelBytes(spec, signal);
    setStatus("Initialising " + spec.shortLabel + " with ONNX Runtime Web…");
    var options = {
      executionProviders: ["wasm"],
      graphOptimizationLevel: spec.key === "yolov1" ? "basic" : "all"
    };
    if (spec.key === "yolov1") {
      options.enableCpuMemArena = false;
      options.enableMemPattern = false;
      options.executionMode = "sequential";
      options.extra = {session: {disable_prepacking: "1"}};
    }
    var session = await ortApi.InferenceSession.create(bytes, options);
    var loadedModel = {session: session, ort: ortApi};
    state.modelCache.set(spec.key, loadedModel);
    return loadedModel;
  }

  function makeInput(image, spec, ortApi) {
    var canvas = document.createElement("canvas");
    canvas.width = spec.inputSize;
    canvas.height = spec.inputSize;
    var context = canvas.getContext("2d", {willReadFrequently: true});
    var originalWidth = image.naturalWidth || image.width;
    var originalHeight = image.naturalHeight || image.height;
    var scale = 1;
    var offsetX = 0;
    var offsetY = 0;
    if (spec.key === "yolox") {
      scale = Math.min(spec.inputSize / originalWidth, spec.inputSize / originalHeight);
      var scaledWidth = originalWidth * scale;
      var scaledHeight = originalHeight * scale;
      context.fillStyle = "rgb(114,114,114)";
      context.fillRect(0, 0, spec.inputSize, spec.inputSize);
      context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    } else {
      context.drawImage(image, 0, 0, spec.inputSize, spec.inputSize);
    }
    var pixels = context.getImageData(0, 0, spec.inputSize, spec.inputSize).data;
    var plane = spec.inputSize * spec.inputSize;
    var tensorData = new Float32Array(3 * plane);
    var channelMap = spec.key === "yolox" ? [2, 1, 0] : [0, 1, 2];
    for (var channel = 0; channel < 3; channel += 1) {
      var sourceChannel = channelMap[channel];
      for (var y = 0; y < spec.inputSize; y += 1) {
        for (var x = 0; x < spec.inputSize; x += 1) {
          var pixelIndex = (y * spec.inputSize + x) * 4;
          var raw = pixels[pixelIndex + sourceChannel];
          tensorData[channel * plane + y * spec.inputSize + x] = spec.key === "yolox" ? raw : raw / 255;
        }
      }
    }
    return {
      tensor: new ortApi.Tensor("float32", tensorData, [1, 3, spec.inputSize, spec.inputSize]),
      meta: {
        originalWidth: originalWidth,
        originalHeight: originalHeight,
        scale: scale,
        offsetX: offsetX,
        offsetY: offsetY,
        inputSize: spec.inputSize
      }
    };
  }

  function rescaleBox(box, meta, spec) {
    var x1;
    var y1;
    var x2;
    var y2;
    if (spec.key === "yolox") {
      x1 = (box[0] - meta.offsetX) / meta.scale;
      y1 = (box[1] - meta.offsetY) / meta.scale;
      x2 = (box[2] - meta.offsetX) / meta.scale;
      y2 = (box[3] - meta.offsetY) / meta.scale;
    } else {
      x1 = box[0] * meta.originalWidth / meta.inputSize;
      y1 = box[1] * meta.originalHeight / meta.inputSize;
      x2 = box[2] * meta.originalWidth / meta.inputSize;
      y2 = box[3] * meta.originalHeight / meta.inputSize;
    }
    return [
      clamp(x1, 0, meta.originalWidth),
      clamp(y1, 0, meta.originalHeight),
      clamp(x2, 0, meta.originalWidth),
      clamp(y2, 0, meta.originalHeight)
    ];
  }

  function addCandidate(list, spec, id, box, classId, classProbability, objectness, meta) {
    if (![box[0], box[1], box[2], box[3], classProbability].every(Number.isFinite)) return;
    var scaled = rescaleBox(box, meta, spec);
    if (scaled[2] <= scaled[0] || scaled[3] <= scaled[1]) return;
    var score = objectness === null ? classProbability : objectness * classProbability;
    list.push({
      id: id,
      box: scaled,
      classId: classId,
      label: spec.classes[classId] || "class " + classId,
      objectness: objectness,
      classProbability: classProbability,
      score: score
    });
  }

  function decodeOutput(output, spec, meta) {
    var data = output.data;
    var dims = output.dims.map(Number);
    var candidates = [];
    if (spec.key === "yolov1") {
      if (dims.length !== 3 || dims[1] !== 24 || dims[2] !== 98) {
        throw new Error("YOLOv1 returned an unexpected output shape: [" + dims.join(", ") + "].");
      }
      var v1Count = dims[2];
      for (var v1 = 0; v1 < v1Count; v1 += 1) {
        var v1Class = -1;
        var v1Score = -Infinity;
        for (var v1c = 0; v1c < 20; v1c += 1) {
          var v1Value = Number(data[(4 + v1c) * v1Count + v1]);
          if (v1Value > v1Score) {
            v1Score = v1Value;
            v1Class = v1c;
          }
        }
        addCandidate(candidates, spec, v1 + 1, [
          Number(data[v1]),
          Number(data[v1Count + v1]),
          Number(data[2 * v1Count + v1]),
          Number(data[3 * v1Count + v1])
        ], v1Class, v1Score, null, meta);
      }
      return {candidates: candidates, rawCount: v1Count};
    }

    if (dims.length !== 3) throw new Error("The detector returned an unsupported output shape: [" + dims.join(", ") + "].");
    var transposed = spec.key === "yolo9" && dims[1] > dims[2];
    var candidateCount = spec.key === "yolox" ? dims[1] : (transposed ? dims[1] : dims[2]);
    var stride = spec.key === "yolox" ? dims[2] : (transposed ? dims[2] : dims[1]);
    var classCount = spec.key === "yolox" ? stride - 5 : stride - 4;
    function valueAt(row, column) {
      return spec.key === "yolox"
        ? Number(data[row * stride + column])
        : (transposed ? Number(data[row * stride + column]) : Number(data[column * candidateCount + row]));
    }
    for (var row = 0; row < candidateCount; row += 1) {
      var objectness = spec.key === "yolox" ? valueAt(row, 4) : null;
      var bestClass = -1;
      var bestProbability = -Infinity;
      var classOffset = spec.key === "yolox" ? 5 : 4;
      for (var classIndex = 0; classIndex < classCount; classIndex += 1) {
        var probability = valueAt(row, classOffset + classIndex);
        if (probability > bestProbability) {
          bestProbability = probability;
          bestClass = classIndex;
        }
      }
      var box;
      if (spec.key === "yolox") {
        var centerX = valueAt(row, 0);
        var centerY = valueAt(row, 1);
        var width = valueAt(row, 2);
        var height = valueAt(row, 3);
        box = [centerX - width / 2, centerY - height / 2, centerX + width / 2, centerY + height / 2];
      } else {
        box = [valueAt(row, 0), valueAt(row, 1), valueAt(row, 2), valueAt(row, 3)];
      }
      addCandidate(candidates, spec, row + 1, box, bestClass, bestProbability, objectness, meta);
    }
    return {candidates: candidates, rawCount: candidateCount};
  }

  function intersectionOverUnion(first, second) {
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

  function classSpecificNMS(filtered, threshold) {
    var ordered = filtered.slice().sort(function (first, second) { return second.score - first.score; });
    var pool = ordered.slice(0, 300);
    var kept = [];
    pool.forEach(function (candidate) {
      var sameClass = kept.filter(function (other) { return other.classId === candidate.classId; });
      var bestOverlap = null;
      sameClass.forEach(function (other) {
        var overlap = intersectionOverUnion(candidate.box, other.box);
        if (!bestOverlap || overlap > bestOverlap.iou) bestOverlap = {box: other, iou: overlap};
      });
      candidate.nmsCompared = sameClass.length > 0;
      candidate.nmsIoU = bestOverlap ? bestOverlap.iou : null;
      if (bestOverlap && bestOverlap.iou > threshold) {
        candidate.nmsDecision = "suppressed";
        candidate.suppressedBy = bestOverlap.box.id;
      } else {
        candidate.nmsDecision = "kept";
        kept.push(candidate);
      }
    });
    ordered.slice(300).forEach(function (candidate) {
      candidate.nmsCompared = false;
      candidate.nmsIoU = null;
      candidate.nmsDecision = "outside top-300 NMS pool";
    });
    return {ordered: ordered, pool: pool, kept: kept.slice(0, 100)};
  }

  function colorForClass(classId) {
    return "hsl(" + ((classId * 47) % 360) + " 76% 42%)";
  }

  function drawStage(canvas, image, boxes, stage) {
    var width = image.naturalWidth || image.width;
    var height = image.naturalHeight || image.height;
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    var alpha = stage === "candidates" ? 0.18 : (stage === "filtered" ? 0.48 : 0.88);
    context.lineWidth = Math.max(1, Math.min(4, width / 700));
    boxes.forEach(function (candidate) {
      var box = candidate.box;
      context.globalAlpha = alpha;
      context.strokeStyle = colorForClass(candidate.classId);
      context.strokeRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
    });
    context.globalAlpha = 1;
    var labels = boxes.slice().sort(function (first, second) { return second.score - first.score; }).slice(0, 20);
    var fontSize = Math.max(10, Math.min(16, width / 65));
    context.font = "700 " + fontSize + "px Arial";
    labels.forEach(function (candidate) {
      var box = candidate.box;
      var text = "#" + candidate.id + " " + candidate.label + " " + candidate.score.toFixed(2) + " · p " + candidate.classProbability.toFixed(2);
      var labelWidth = Math.min(width - 4, context.measureText(text).width + 8);
      var labelY = Math.max(fontSize + 2, box[1]);
      context.fillStyle = colorForClass(candidate.classId);
      context.fillRect(box[0], labelY - fontSize - 4, labelWidth, fontSize + 5);
      context.fillStyle = "#ffffff";
      context.fillText(text, box[0] + 4, labelY - 5);
    });
  }

  function decisionText(candidate) {
    if (!candidate.passed) return "filtered out";
    if (candidate.nmsDecision === "suppressed") return "suppressed by #" + candidate.suppressedBy;
    if (candidate.nmsDecision === "kept") return "kept";
    return candidate.nmsDecision || "not evaluated";
  }

  function boxText(box) {
    return "[" + box.map(function (value) { return Math.round(value); }).join(", ") + "]";
  }

  function resultTableHTML(result, spec) {
    var top = result.candidates.slice().sort(function (first, second) { return second.score - first.score; }).slice(0, 20);
    var topRows = top.map(function (candidate) {
      var confidence = candidate.objectness === null ? "—" : formatScore(candidate.objectness);
      var iou = candidate.nmsIoU === null || candidate.nmsIoU === undefined ? "—" : formatScore(candidate.nmsIoU);
      return "<tr><th>" + candidate.id + "</th><td>" + escapeHTML(candidate.label) + "</td><td>" + confidence + "</td><td>" + formatScore(candidate.classProbability) + "</td><td>" + formatScore(candidate.score) + "</td><td>" + (candidate.passed ? "kept" : "removed") + "</td><td>" + iou + "</td><td>" + escapeHTML(decisionText(candidate)) + "</td></tr>";
    }).join("");
    var finalRows = result.final.map(function (candidate) {
      var iou = candidate.nmsIoU === null || candidate.nmsIoU === undefined ? "—" : formatScore(candidate.nmsIoU);
      return "<tr><th>" + candidate.id + "</th><td>" + escapeHTML(candidate.label) + "</td><td>" + formatScore(candidate.score) + "</td><td>" + iou + "</td><td>" + boxText(candidate.box) + "</td></tr>";
    }).join("");
    var objectnessLabel = spec.key === "yolox" ? "Objectness" : "Separate objectness";
    return "<section class='yolo-table-card'><h3>Top 20 decoded candidates</h3><p>Rows are sorted by detection score before confidence filtering. For YOLO9 and YOLOv1, a separate objectness value is not exposed by the selected graph.</p><div class='yolo-table-scroll'><table class='yolo-detection-table'><thead><tr><th>#</th><th>Predicted class</th><th>" + objectnessLabel + "</th><th>Highest class p</th><th>Detection score</th><th>Confidence filter</th><th>Max same-class IoU</th><th>NMS result</th></tr></thead><tbody>" + topRows + "</tbody></table></div></section>" +
      "<section class='yolo-table-card'><h3>Final outputs (" + result.final.length + ")</h3><p>These are the boxes drawn in the third canvas after class-specific NMS.</p><div class='yolo-table-scroll'><table class='yolo-detection-table'><thead><tr><th>#</th><th>Label</th><th>Score</th><th>IoU used in NMS</th><th>Box [x₁, y₁, x₂, y₂]</th></tr></thead><tbody>" + (finalRows || "<tr><td colspan='5'>No boxes survived the current thresholds.</td></tr>") + "</tbody></table></div></section>";
  }

  function renderPipeline(candidates, spec, rawCount) {
    var confidenceThreshold = clamp(Number(confidenceInput.value) || 0.25, 0.01, 0.99);
    var iouThreshold = clamp(Number(iouInput.value) || 0.45, 0.01, 0.99);
    confidenceInput.value = confidenceThreshold.toFixed(2);
    iouInput.value = iouThreshold.toFixed(2);
    candidates.forEach(function (candidate) {
      candidate.passed = candidate.score >= confidenceThreshold;
      candidate.nmsCompared = false;
      candidate.nmsIoU = null;
      candidate.nmsDecision = candidate.passed ? "" : "filtered out";
      candidate.suppressedBy = null;
    });
    var filtered = candidates.filter(function (candidate) { return candidate.passed; });
    var nms = classSpecificNMS(filtered, iouThreshold);
    var result = {
      candidates: candidates,
      filtered: filtered,
      final: nms.kept,
      rawCount: rawCount,
      confidenceThreshold: confidenceThreshold,
      iouThreshold: iouThreshold
    };
    state.lastResult = result;
    if (state.image) {
      drawStage(candidateCanvas, state.image, candidates, "candidates");
      drawStage(filteredCanvas, state.image, filtered, "filtered");
      drawStage(finalCanvas, state.image, result.final, "final");
    }
    host.querySelector("#yolo-candidate-count").textContent = rawCount + " raw · " + candidates.length + " valid";
    host.querySelector("#yolo-filtered-count").textContent = filtered.length + " at ≥ " + confidenceThreshold.toFixed(2);
    host.querySelector("#yolo-final-count").textContent = result.final.length + " after IoU " + iouThreshold.toFixed(2);
    host.querySelector("#yolo-result-summary").innerHTML = "<strong>" + escapeHTML(spec.shortLabel) + " complete:</strong> " + rawCount + " model candidates → " + candidates.length + " valid boxes → " + filtered.length + " after confidence filtering → " + result.final.length + " final detections. The NMS pool is capped at the top 300 filtered boxes for responsive browser teaching.";
    host.querySelector("#yolo-result-table").innerHTML = resultTableHTML(result, spec);
  }

  async function runDetection() {
    if (!state.image) {
      setStatus("Choose an image first.", "error");
      return;
    }
    var spec = currentSpec();
    var controller = new AbortController();
    state.activeAbort = controller;
    runButton.disabled = true;
    cancelButton.hidden = false;
    cancelButton.disabled = false;
    try {
      setStatus("Loading ONNX Runtime Web…");
      var loaded = await getSession(spec, controller.signal);
      setStatus("Preparing the " + spec.shortLabel + " input…");
      var input = makeInput(state.image, spec, loaded.ort);
      setStatus("Running a real forward pass in the browser…");
      var inputName = loaded.session.inputNames[0] || "images";
      var outputNames = loaded.session.outputNames;
      var results = await loaded.session.run((function () {
        var values = {};
        values[inputName] = input.tensor;
        return values;
      })());
      var output = results[outputNames[0]];
      var decoded = decodeOutput(output, spec, input.meta);
      if (input.tensor && input.tensor.dispose) input.tensor.dispose();
      if (output && output.dispose) output.dispose();
      renderPipeline(decoded.candidates, spec, decoded.rawCount);
      setStatus("Done. The image was processed locally; inspect the three canvases and the top-20 table below.", "success");
    } catch (error) {
      if (error && error.name === "AbortError") setStatus("Model download cancelled. Choose Run again when ready.", "error");
      else setStatus("Detection failed: " + (error && error.message ? error.message : String(error)), "error");
    } finally {
      state.activeAbort = null;
      runButton.disabled = !state.image;
      cancelButton.hidden = true;
      cancelButton.disabled = true;
    }
  }

  imageFile.addEventListener("change", function () {
    var file = imageFile.files && imageFile.files[0];
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) {
      setStatus("Please choose an image file.", "error");
      imageFile.value = "";
      return;
    }
    if (state.imageUrl) window.URL.revokeObjectURL(state.imageUrl);
    state.imageUrl = window.URL.createObjectURL(file);
    state.imageName = file.name;
    var image = new Image();
    image.onload = function () {
      state.image = image;
      preview.src = state.imageUrl;
      preview.hidden = false;
      previewCaption.textContent = file.name + " · " + image.naturalWidth + "×" + image.naturalHeight + " · local browser input";
      runButton.disabled = false;
      resetResult();
      setStatus("Image ready. Choose thresholds and run the detector.", "success");
    };
    image.onerror = function () {
      setStatus("The image could not be decoded by this browser.", "error");
      runButton.disabled = true;
    };
    image.src = state.imageUrl;
  });

  modelSelect.addEventListener("change", function () {
    var spec = currentSpec();
    confidenceInput.value = "0.25";
    iouInput.value = "0.45";
    updateModelExplanation();
    resetResult();
    setStatus(spec.key === "yolov1" ? "Original YOLOv1 selected. Run only when you are ready for the large download." : spec.shortLabel + " selected. Choose Run to load it on demand.");
  });

  function rerenderIfAvailable() {
    if (state.lastResult) {
      var spec = currentSpec();
      renderPipeline(state.lastResult.candidates, spec, state.lastResult.rawCount);
    }
  }

  confidenceInput.addEventListener("input", rerenderIfAvailable);
  iouInput.addEventListener("input", rerenderIfAvailable);
  runButton.addEventListener("click", runDetection);
  cancelButton.addEventListener("click", function () {
    if (state.activeAbort) state.activeAbort.abort();
  });
  clearButton.addEventListener("click", function () {
    resetResult();
    if (state.image) setStatus("Result cleared. The selected image is still ready.", "success");
  });
  window.addEventListener("pagehide", function () {
    state.modelCache.forEach(function (loaded) {
      if (loaded.session && loaded.session.release) loaded.session.release().catch(function () {});
    });
  });

  updateModelExplanation();
  resetResult();
})();
