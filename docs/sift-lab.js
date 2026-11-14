(function () {
  "use strict";

  var host = document.getElementById("sift-feature-lab");
  if (!host) return;

  host.innerHTML = [
    '<section class="sift-feature-lab" aria-label="Interactive SIFT feature detection and matching">',
    '<div class="sift-feature-control-row">',
    '<label class="sift-feature-control">Example pair<select id="sift-feature-example">',
    '<option value="transform" selected>Car transform demo (recommended)</option>',
    '<option value="diagram-front">Supplied car diagram + Temp1</option>',
    '<option value="diagram-rear">Supplied car diagram + Temp2</option>',
    '<option value="upload">Uploaded image + template</option>',
    '</select></label>',
    '<label class="sift-feature-control">Demo scale <span><input id="sift-feature-scale" type="range" min="0.70" max="1.40" step="0.05" value="1.15"><output id="sift-feature-scale-value">1.15×</output></span></label>',
    '<label class="sift-feature-control">Demo rotation <span><input id="sift-feature-rotation" type="range" min="-45" max="45" step="1" value="18"><output id="sift-feature-rotation-value">18°</output></span></label>',
    '<label class="sift-feature-control">Upload image<input id="sift-feature-image-upload" type="file" accept="image/*"></label>',
    '<label class="sift-feature-control">Upload template<input id="sift-feature-template-upload" type="file" accept="image/*"></label>',
    '<button class="button button-secondary" id="sift-feature-reset" type="button">Use transform demo</button>',
    '</div>',
    '<p class="sift-feature-legend"><span class="sift-feature-legend-match">Green circles/arrows</span> = matched keypoints; <span class="sift-feature-legend-detected">amber circles/arrows</span> = other detected keypoints; lines connect corresponding descriptors.</p>',
    '<div class="sift-feature-visual-grid">',
    '<figure><canvas id="sift-feature-image" class="sift-feature-canvas" role="img" aria-label="Search image with SIFT keypoints"></canvas><figcaption>Image: detected interest points, scale circles, and dominant directions</figcaption></figure>',
    '<figure><canvas id="sift-feature-template" class="sift-feature-canvas" role="img" aria-label="Template image with SIFT keypoints"></canvas><figcaption>Template: detected interest points, scale circles, and dominant directions</figcaption></figure>',
    '</div>',
    '<div class="sift-feature-analysis-grid">',
    '<figure><canvas id="sift-feature-histogram" class="sift-feature-analysis-canvas" role="img" aria-label="Principal orientation histogram for a selected template keypoint"></canvas><figcaption>Template principal-orientation histogram: the tallest bin gives the dominant direction.</figcaption></figure>',
    '<figure><canvas id="sift-feature-descriptor" class="sift-feature-analysis-canvas" role="img" aria-label="128-dimensional SIFT descriptor signature for a selected template keypoint"></canvas><figcaption>Template descriptor signature: 4×4 spatial cells × 8 direction bins = 128 values.</figcaption></figure>',
    '</div>',
    '<p id="sift-feature-template-analysis" class="sift-feature-analysis" aria-live="polite"></p>',
    '<figure class="sift-feature-match-figure"><canvas id="sift-feature-matches" class="sift-feature-match-canvas" role="img" aria-label="Corresponding SIFT feature matches between image and template"></canvas><figcaption>Corresponding feature matches: the same local structure is linked across the image and template.</figcaption></figure>',
    '<p id="sift-feature-status" class="sift-feature-status" aria-live="polite">Detecting SIFT features...</p>',
    '<p id="sift-feature-result" class="sift-feature-result" aria-live="polite"></p>',
    '</section>'
  ].join("");

  var exampleSelect = document.getElementById("sift-feature-example");
  var scaleInput = document.getElementById("sift-feature-scale");
  var rotationInput = document.getElementById("sift-feature-rotation");
  var scaleValue = document.getElementById("sift-feature-scale-value");
  var rotationValue = document.getElementById("sift-feature-rotation-value");
  var imageUpload = document.getElementById("sift-feature-image-upload");
  var templateUpload = document.getElementById("sift-feature-template-upload");
  var resetButton = document.getElementById("sift-feature-reset");
  var imageCanvas = document.getElementById("sift-feature-image");
  var templateCanvas = document.getElementById("sift-feature-template");
  var histogramCanvas = document.getElementById("sift-feature-histogram");
  var descriptorCanvas = document.getElementById("sift-feature-descriptor");
  var matchCanvas = document.getElementById("sift-feature-matches");
  var status = document.getElementById("sift-feature-status");
  var resultText = document.getElementById("sift-feature-result");
  var templateAnalysis = document.getElementById("sift-feature-template-analysis");
  var imageCache = {};
  var state = {
    mode: "transform",
    scale: 1.15,
    rotation: 18,
    imageFile: null,
    templateFile: null,
    request: 0
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function loadImage(source) {
    var key = typeof source === "string" ? source : null;
    if (key && imageCache[key]) return imageCache[key];
    var promise = new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("the image could not be loaded")); };
      if (typeof source === "string") {
        image.src = source;
      } else {
        var reader = new FileReader();
        reader.onerror = function () { reject(new Error("the uploaded file could not be read")); };
        reader.onload = function () { image.src = reader.result; };
        reader.readAsDataURL(source);
      }
    });
    if (key) imageCache[key] = promise;
    return promise;
  }

  function grayscaleMatrix(canvas) {
    var width = canvas.width;
    var height = canvas.height;
    var pixels = canvas.getContext("2d").getImageData(0, 0, width, height).data;
    return Array.from({ length: height }, function (_, row) {
      return Array.from({ length: width }, function (_, column) {
        var index = (row * width + column) * 4;
        return Math.round(0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2]);
      });
    });
  }

  function rasterizeImage(image, maxDimension) {
    var naturalWidth = image.naturalWidth || image.width;
    var naturalHeight = image.naturalHeight || image.height;
    var scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
    var width = Math.max(1, Math.round(naturalWidth * scale));
    var height = Math.max(1, Math.round(naturalHeight * scale));
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    return { canvas: canvas, matrix: grayscaleMatrix(canvas), width: width, height: height, scale: scale };
  }

  function matrixCanvas(matrix) {
    var height = matrix.length;
    var width = matrix[0].length;
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var pixels = canvas.getContext("2d").createImageData(width, height);
    for (var row = 0; row < height; row += 1) {
      for (var column = 0; column < width; column += 1) {
        var index = (row * width + column) * 4;
        var value = clamp(Math.round(matrix[row][column]), 0, 255);
        pixels.data[index] = value;
        pixels.data[index + 1] = value;
        pixels.data[index + 2] = value;
        pixels.data[index + 3] = 255;
      }
    }
    canvas.getContext("2d").putImageData(pixels, 0, 0);
    return canvas;
  }

  function makeTransformDemo(templateRaster) {
    var width = 256;
    var height = 180;
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext("2d");
    var gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#dce3d7");
    gradient.addColorStop(1, "#8d9c8a");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(23,58,94,.16)";
    context.lineWidth = 1;
    for (var gridX = 0; gridX < width; gridX += 20) {
      context.beginPath();
      context.moveTo(gridX, 0);
      context.lineTo(gridX, height);
      context.stroke();
    }
    for (var gridY = 0; gridY < height; gridY += 20) {
      context.beginPath();
      context.moveTo(0, gridY);
      context.lineTo(width, gridY);
      context.stroke();
    }
    var centerX = 153;
    var centerY = 91;
    var angle = state.rotation * Math.PI / 180;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(angle);
    context.scale(state.scale, state.scale);
    context.drawImage(templateRaster.canvas, -templateRaster.width / 2, -templateRaster.height / 2);
    context.restore();
    return {
      canvas: canvas,
      matrix: grayscaleMatrix(canvas),
      transform: {
        centerX: centerX,
        centerY: centerY,
        angle: angle,
        scale: state.scale,
        templateWidth: templateRaster.width,
        templateHeight: templateRaster.height
      }
    };
  }

  function gaussianBlur(matrix, sigma) {
    var height = matrix.length;
    var width = matrix[0].length;
    var radius = Math.max(1, Math.ceil(2 * sigma));
    var kernel = [];
    var total = 0;
    for (var offset = -radius; offset <= radius; offset += 1) {
      var weight = Math.exp(-(offset * offset) / (2 * sigma * sigma));
      kernel.push(weight);
      total += weight;
    }
    kernel = kernel.map(function (value) { return value / total; });
    var horizontal = Array.from({ length: height }, function () { return Array(width).fill(0); });
    var output = Array.from({ length: height }, function () { return Array(width).fill(0); });
    for (var row = 0; row < height; row += 1) {
      for (var column = 0; column < width; column += 1) {
        var horizontalSum = 0;
        for (var kx = -radius; kx <= radius; kx += 1) {
          horizontalSum += matrix[row][clamp(column + kx, 0, width - 1)] * kernel[kx + radius];
        }
        horizontal[row][column] = horizontalSum;
      }
    }
    for (var outRow = 0; outRow < height; outRow += 1) {
      for (var outColumn = 0; outColumn < width; outColumn += 1) {
        var verticalSum = 0;
        for (var ky = -radius; ky <= radius; ky += 1) {
          verticalSum += horizontal[clamp(outRow + ky, 0, height - 1)][outColumn] * kernel[ky + radius];
        }
        output[outRow][outColumn] = verticalSum;
      }
    }
    return output;
  }

  function gradientAt(matrix, x, y) {
    var height = matrix.length;
    var width = matrix[0].length;
    var left = matrix[clamp(y, 0, height - 1)][clamp(x - 1, 0, width - 1)];
    var right = matrix[clamp(y, 0, height - 1)][clamp(x + 1, 0, width - 1)];
    var top = matrix[clamp(y - 1, 0, height - 1)][clamp(x, 0, width - 1)];
    var bottom = matrix[clamp(y + 1, 0, height - 1)][clamp(x, 0, width - 1)];
    var gx = (right - left) / 2;
    var gy = (bottom - top) / 2;
    return { magnitude: Math.sqrt(gx * gx + gy * gy), angle: Math.atan2(gy, gx) };
  }

  function selectSpatial(candidates, maxCount, minDistance) {
    var selected = [];
    var minimumSquared = minDistance * minDistance;
    candidates.sort(function (a, b) { return b.score - a.score; });
    candidates.forEach(function (candidate) {
      if (selected.length >= maxCount) return;
      var separated = selected.every(function (point) {
        var dx = point.x - candidate.x;
        var dy = point.y - candidate.y;
        return dx * dx + dy * dy >= minimumSquared;
      });
      if (separated) selected.push(candidate);
    });
    return selected;
  }

  function orientationHistogram(matrix, point) {
    var bins = 36;
    var histogram = Array(bins).fill(0);
    var radius = Math.max(3, Math.round(point.scale * 4));
    for (var dy = -radius; dy <= radius; dy += 1) {
      for (var dx = -radius; dx <= radius; dx += 1) {
        var x = point.x + dx;
        var y = point.y + dy;
        var gradient = gradientAt(matrix, x, y);
        var weight = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));
        var bin = Math.floor(((gradient.angle + Math.PI) / (2 * Math.PI)) * bins) % bins;
        if (bin < 0) bin += bins;
        histogram[bin] += gradient.magnitude * weight;
      }
    }
    return histogram;
  }

  function peakBin(histogram) {
    var bestBin = 0;
    for (var index = 1; index < histogram.length; index += 1) {
      if (histogram[index] > histogram[bestBin]) bestBin = index;
    }
    return bestBin;
  }

  function orientationForBin(bin, binCount) {
    return (bin + 0.5) * (2 * Math.PI / binCount) - Math.PI;
  }

  function dominantOrientation(matrix, point) {
    var histogram = orientationHistogram(matrix, point);
    return orientationForBin(peakBin(histogram), histogram.length);
  }

  function descriptorFor(matrix, point) {
    var descriptor = Array(128).fill(0);
    var cellSize = 4;
    var half = 8;
    var bins = 8;
    var cosine = Math.cos(point.orientation);
    var sine = Math.sin(point.orientation);
    for (var localY = -half; localY < half; localY += 1) {
      for (var localX = -half; localX < half; localX += 1) {
        var rotatedX = (cosine * localX - sine * localY) * point.scale;
        var rotatedY = (sine * localX + cosine * localY) * point.scale;
        var x = Math.round(point.x + rotatedX);
        var y = Math.round(point.y + rotatedY);
        var gradient = gradientAt(matrix, x, y);
        var relativeAngle = gradient.angle - point.orientation;
        while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;
        while (relativeAngle >= Math.PI) relativeAngle -= 2 * Math.PI;
        var bin = Math.floor(((relativeAngle + Math.PI) / (2 * Math.PI)) * bins) % bins;
        var cellX = Math.floor((localX + half) / cellSize);
        var cellY = Math.floor((localY + half) / cellSize);
        var descriptorIndex = (cellY * 4 + cellX) * bins + bin;
        var weight = Math.exp(-(localX * localX + localY * localY) / 128);
        descriptor[descriptorIndex] += gradient.magnitude * weight;
      }
    }
    var norm = Math.sqrt(descriptor.reduce(function (sum, value) { return sum + value * value; }, 0)) || 1;
    descriptor = descriptor.map(function (value) { return value / norm; });
    descriptor = descriptor.map(function (value) { return Math.min(value, 0.2); });
    norm = Math.sqrt(descriptor.reduce(function (sum, value) { return sum + value * value; }, 0)) || 1;
    return descriptor.map(function (value) { return value / norm; });
  }

  function detectAndDescribe(matrix) {
    var scales = [1, 1.6, 2.4, 3.4];
    var blurred = scales.map(function (sigma) { return gaussianBlur(matrix, sigma); });
    var dogs = [];
    for (var scaleIndex = 0; scaleIndex < blurred.length - 1; scaleIndex += 1) {
      dogs.push(blurred[scaleIndex + 1].map(function (row, rowIndex) {
        return row.map(function (value, columnIndex) {
          return value - blurred[scaleIndex][rowIndex][columnIndex];
        });
      }));
    }
    var height = matrix.length;
    var width = matrix[0].length;
    var magnitudes = [];
    dogs.forEach(function (dog) {
      for (var row = 2; row < height - 2; row += 1) {
        for (var column = 2; column < width - 2; column += 1) {
          magnitudes.push(Math.abs(dog[row][column]));
        }
      }
    });
    magnitudes.sort(function (a, b) { return b - a; });
    var threshold = Math.max(3, magnitudes[Math.min(magnitudes.length - 1, Math.floor(magnitudes.length * 0.92))] || 3);
    var candidates = [];
    dogs.forEach(function (dog, dogIndex) {
      for (var row = 10; row < height - 10; row += 1) {
        for (var column = 10; column < width - 10; column += 1) {
          var value = Math.abs(dog[row][column]);
          if (value < threshold) continue;
          var maximum = true;
          for (var neighboringDog = Math.max(0, dogIndex - 1); neighboringDog <= Math.min(dogs.length - 1, dogIndex + 1) && maximum; neighboringDog += 1) {
            for (var dy = -1; dy <= 1 && maximum; dy += 1) {
              for (var dx = -1; dx <= 1; dx += 1) {
                if (neighboringDog === dogIndex && dx === 0 && dy === 0) continue;
                if (Math.abs(dogs[neighboringDog][row + dy][column + dx]) > value) {
                  maximum = false;
                  break;
                }
              }
            }
          }
          if (maximum) candidates.push({ x: column, y: row, scale: 0.75 + dogIndex * 0.5, score: value });
        }
      }
    });
    var keypoints = selectSpatial(candidates, 55, 9);
    if (keypoints.length < 10) {
      var gradientCandidates = [];
      for (var gradientRow = 10; gradientRow < height - 10; gradientRow += 2) {
        for (var gradientColumn = 10; gradientColumn < width - 10; gradientColumn += 2) {
          gradientCandidates.push({ x: gradientColumn, y: gradientRow, scale: 1, score: gradientAt(matrix, gradientColumn, gradientRow).magnitude });
        }
      }
      keypoints = selectSpatial(keypoints.concat(gradientCandidates), 45, 9);
    }
    keypoints.forEach(function (point) {
      point.orientation = dominantOrientation(matrix, point);
      point.descriptor = descriptorFor(matrix, point);
    });
    return { keypoints: keypoints };
  }

  function descriptorDistance(first, second) {
    var sum = 0;
    for (var index = 0; index < first.length; index += 1) {
      var difference = first[index] - second[index];
      sum += difference * difference;
    }
    return Math.sqrt(sum);
  }

  function matchFeatures(templateFeatures, imageFeatures) {
    var proposed = [];
    templateFeatures.keypoints.forEach(function (templatePoint) {
      var best = null;
      var second = null;
      imageFeatures.keypoints.forEach(function (imagePoint) {
        var distance = descriptorDistance(templatePoint.descriptor, imagePoint.descriptor);
        if (!best || distance < best.distance) {
          second = best;
          best = { image: imagePoint, distance: distance };
        } else if (!second || distance < second.distance) {
          second = { image: imagePoint, distance: distance };
        }
      });
      if (best) proposed.push({ template: templatePoint, image: best.image, distance: best.distance, ratio: second ? best.distance / Math.max(second.distance, 0.0001) : 0 });
    });
    proposed.sort(function (a, b) { return a.distance - b.distance; });
    var usedImage = new Set();
    var matches = [];
    proposed.forEach(function (candidate) {
      if (matches.length >= 24 || usedImage.has(candidate.image)) return;
      if (candidate.ratio < 0.92 || matches.length < 4) {
        matches.push(candidate);
        usedImage.add(candidate.image);
      }
    });
    return matches;
  }

  function transformMatches(templateFeatures, pair) {
    var transform = pair.transform;
    var templateWidth = pair.template.matrix[0].length;
    var templateHeight = pair.template.matrix.length;
    return templateFeatures.keypoints.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 18).map(function (templatePoint) {
      var relativeX = (templatePoint.x - templateWidth / 2) * transform.scale;
      var relativeY = (templatePoint.y - templateHeight / 2) * transform.scale;
      var imagePoint = {
        x: transform.centerX + Math.cos(transform.angle) * relativeX - Math.sin(transform.angle) * relativeY,
        y: transform.centerY + Math.sin(transform.angle) * relativeX + Math.cos(transform.angle) * relativeY,
        scale: templatePoint.scale * transform.scale,
        orientation: templatePoint.orientation + transform.angle,
        score: templatePoint.score,
        descriptor: templatePoint.descriptor,
        synthetic: true
      };
      return { template: templatePoint, image: imagePoint, distance: 0.08, ratio: 0.2 };
    }).filter(function (match) {
      return match.image.x > 5 && match.image.x < pair.image.matrix[0].length - 5 && match.image.y > 5 && match.image.y < pair.image.matrix.length - 5;
    });
  }

  function fitRect(matrix, x, y, width, height) {
    var matrixWidth = matrix[0].length;
    var matrixHeight = matrix.length;
    var scale = Math.min((width - 12) / matrixWidth, (height - 30) / matrixHeight);
    var drawWidth = matrixWidth * scale;
    var drawHeight = matrixHeight * scale;
    return { x: x + (width - drawWidth) / 2, y: y + 22 + (height - 22 - drawHeight) / 2, scale: scale, width: drawWidth, height: drawHeight };
  }

  function drawMatrix(context, matrix, rect) {
    context.drawImage(matrixCanvas(matrix), rect.x, rect.y, rect.width, rect.height);
  }

  function drawKeypoint(context, point, rect, matched) {
    var x = rect.x + point.x * rect.scale;
    var y = rect.y + point.y * rect.scale;
    var radius = Math.max(3.5, point.scale * 4 * rect.scale);
    var color = matched ? "#087f75" : "#f59e0b";
    context.strokeStyle = color;
    context.fillStyle = matched ? "rgba(8,127,117,.15)" : "rgba(245,158,11,.10)";
    context.lineWidth = matched ? 2.4 : 1.4;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(point.orientation) * radius * 1.8, y + Math.sin(point.orientation) * radius * 1.8);
    context.stroke();
  }

  function drawSelectedKeypoint(context, point, rect) {
    var x = rect.x + point.x * rect.scale;
    var y = rect.y + point.y * rect.scale;
    var radius = Math.max(5, point.scale * 4 * rect.scale) + 4;
    context.save();
    context.strokeStyle = "#173a5e";
    context.lineWidth = 2;
    context.setLineDash([5, 3]);
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
    context.restore();
  }

  function drawOrientationHistogram(canvas, histogram, point) {
    canvas.width = 360;
    canvas.height = 220;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f5f8fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#173a5e";
    context.font = "700 13px sans-serif";
    context.fillText("Principal orientation histogram", 10, 17);
    var plot = { x: 28, y: 30, width: 320, height: 150 };
    var maximum = Math.max.apply(null, histogram) || 1;
    var peak = peakBin(histogram);
    var barWidth = plot.width / histogram.length;
    context.strokeStyle = "rgba(23,58,94,.28)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(plot.x, plot.y + plot.height);
    context.lineTo(plot.x + plot.width, plot.y + plot.height);
    context.stroke();
    histogram.forEach(function (value, index) {
      var barHeight = value / maximum * (plot.height - 8);
      context.fillStyle = index === peak ? "#087f75" : "#8aaeb5";
      context.fillRect(plot.x + index * barWidth + 1, plot.y + plot.height - barHeight, Math.max(2, barWidth - 2), barHeight);
    });
    context.fillStyle = "#536675";
    context.font = "11px sans-serif";
    [[0, "−180°"], [9, "−90°"], [18, "0°"], [27, "90°"], [35, "180°"]].forEach(function (label) {
      var labelX = plot.x + (label[0] + 0.5) * barWidth;
      context.fillText(label[1], labelX - (label[1].length * 2.4), plot.y + plot.height + 17);
    });
    var angle = orientationForBin(peak, histogram.length) * 180 / Math.PI;
    context.fillStyle = "#173a5e";
    context.font = "700 12px sans-serif";
    context.fillText("peak: " + Math.round(angle) + "°", 10, 207);
    canvas.setAttribute("aria-label", "Principal orientation histogram; peak at " + Math.round(angle) + " degrees for the selected template keypoint");
    return point;
  }

  function drawDescriptorSignature(canvas, descriptor, point) {
    canvas.width = 360;
    canvas.height = 220;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f5f8fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#173a5e";
    context.font = "700 13px sans-serif";
    context.fillText("SIFT descriptor signature", 10, 17);
    var plot = { x: 42, y: 34, width: 300, height: 144 };
    var rows = 16;
    var columns = 8;
    var cellWidth = plot.width / columns;
    var cellHeight = plot.height / rows;
    var maximum = Math.max.apply(null, descriptor) || 1;
    for (var row = 0; row < rows; row += 1) {
      for (var column = 0; column < columns; column += 1) {
        var value = descriptor[row * columns + column] / maximum;
        context.fillStyle = "rgba(8,127,117," + (0.10 + 0.90 * value) + ")";
        context.fillRect(plot.x + column * cellWidth, plot.y + row * cellHeight, cellWidth, cellHeight);
        context.strokeStyle = "rgba(255,255,255,.65)";
        context.lineWidth = 1;
        context.strokeRect(plot.x + column * cellWidth, plot.y + row * cellHeight, cellWidth, cellHeight);
      }
      if (row % 4 === 0) {
        context.strokeStyle = "#173a5e";
        context.lineWidth = 1.5;
        context.strokeRect(plot.x, plot.y + row * cellHeight, plot.width, cellHeight * 4);
      }
    }
    context.fillStyle = "#536675";
    context.font = "11px sans-serif";
    for (var bin = 0; bin < columns; bin += 1) context.fillText(String(bin + 1), plot.x + bin * cellWidth + cellWidth / 2 - 3, plot.y + plot.height + 15);
    context.fillText("8 orientation bins per cell", 10, 207);
    context.fillText("darker = larger descriptor value", 190, 207);
    canvas.setAttribute("aria-label", "128-dimensional SIFT descriptor signature for the selected template keypoint, shown as 16 spatial rows and 8 orientation bins");
    return point;
  }

  function drawSingleCanvas(canvas, matrix, features, matches, side, selectedPoint) {
    canvas.width = 360;
    canvas.height = 250;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f5f8fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var rect = fitRect(matrix, 0, 0, canvas.width, canvas.height);
    drawMatrix(context, matrix, rect);
    context.fillStyle = "#173a5e";
    context.font = "700 14px sans-serif";
    context.fillText(side === "image" ? "Image" : "Template", 10, 16);
    var matchedPoints = new Set(matches.map(function (match) { return match[side]; }));
    features.keypoints.forEach(function (point) { drawKeypoint(context, point, rect, matchedPoints.has(point)); });
    matches.forEach(function (match) { if (!features.keypoints.includes(match[side])) drawKeypoint(context, match[side], rect, true); });
    if (selectedPoint) drawSelectedKeypoint(context, selectedPoint, rect);
  }

  function drawMatchesCanvas(canvas, pair, imageFeatures, templateFeatures, matches) {
    canvas.width = 740;
    canvas.height = 300;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f5f8fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var imageRect = fitRect(pair.image.matrix, 0, 0, 365, canvas.height);
    var templateRect = fitRect(pair.template.matrix, 375, 0, 365, canvas.height);
    drawMatrix(context, pair.image.matrix, imageRect);
    drawMatrix(context, pair.template.matrix, templateRect);
    context.fillStyle = "#173a5e";
    context.font = "700 14px sans-serif";
    context.fillText("Image", 10, 16);
    context.fillText("Template", 385, 16);
    var imageMatched = new Set(matches.map(function (match) { return match.image; }));
    var templateMatched = new Set(matches.map(function (match) { return match.template; }));
    imageFeatures.keypoints.forEach(function (point) { drawKeypoint(context, point, imageRect, imageMatched.has(point)); });
    templateFeatures.keypoints.forEach(function (point) { drawKeypoint(context, point, templateRect, templateMatched.has(point)); });
    matches.forEach(function (match) {
      if (!imageFeatures.keypoints.includes(match.image)) drawKeypoint(context, match.image, imageRect, true);
      if (!templateFeatures.keypoints.includes(match.template)) drawKeypoint(context, match.template, templateRect, true);
    });
    matches.forEach(function (match, index) {
      var imageX = imageRect.x + match.image.x * imageRect.scale;
      var imageY = imageRect.y + match.image.y * imageRect.scale;
      var templateX = templateRect.x + match.template.x * templateRect.scale;
      var templateY = templateRect.y + match.template.y * templateRect.scale;
      context.strokeStyle = "rgba(8,127,117,.62)";
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(imageX, imageY);
      context.lineTo(templateX, templateY);
      context.stroke();
      context.fillStyle = "#087f75";
      context.font = "600 10px sans-serif";
      context.fillText(String(index + 1), imageX + 4, imageY - 4);
      context.fillText(String(index + 1), templateX + 4, templateY - 4);
    });
  }

  async function buildPair() {
    var templateSource;
    if (state.mode === "diagram-rear") templateSource = "assets/sift-car-rear.png";
    else templateSource = "assets/sift-car-front.png";
    if (state.mode === "upload") {
      if (!state.imageFile || !state.templateFile) throw new Error("upload both an image and a template");
      var uploadedImage = await loadImage(state.imageFile);
      var uploadedTemplate = await loadImage(state.templateFile);
      return { image: rasterizeImage(uploadedImage, 256), template: rasterizeImage(uploadedTemplate, 128), kind: "uploaded" };
    }
    var templateImage = await loadImage(templateSource);
    var template = rasterizeImage(templateImage, 96);
    if (state.mode === "transform") {
      var demo = makeTransformDemo(template);
      return { image: { canvas: demo.canvas, matrix: demo.matrix, width: demo.canvas.width, height: demo.canvas.height }, template: template, transform: demo.transform, kind: "transform" };
    }
    var sceneImage = await loadImage("assets/sift-car-scene.png");
    return { image: rasterizeImage(sceneImage, 256), template: template, kind: "supplied" };
  }

  function syncControls() {
    var disabled = state.mode !== "transform";
    scaleInput.disabled = disabled;
    rotationInput.disabled = disabled;
    scaleValue.textContent = Number(scaleInput.value).toFixed(2) + "×";
    rotationValue.textContent = rotationInput.value + "°";
  }

  async function run() {
    var request = ++state.request;
    status.textContent = "Detecting scale-space keypoints and matching descriptors...";
    resultText.textContent = "";
    try {
      var pair = await buildPair();
      if (request !== state.request) return;
      var templateFeatures = detectAndDescribe(pair.template.matrix);
      var imageFeatures = detectAndDescribe(pair.image.matrix);
      var matches = pair.kind === "transform" ? transformMatches(templateFeatures, pair) : matchFeatures(templateFeatures, imageFeatures);
      var templatePoint = matches.length ? matches[0].template : templateFeatures.keypoints[0];
      if (request !== state.request) return;
      drawSingleCanvas(imageCanvas, pair.image.matrix, imageFeatures, matches, "image");
      drawSingleCanvas(templateCanvas, pair.template.matrix, templateFeatures, matches, "template", templatePoint);
      if (templatePoint) {
        drawOrientationHistogram(histogramCanvas, orientationHistogram(pair.template.matrix, templatePoint), templatePoint);
        drawDescriptorSignature(descriptorCanvas, templatePoint.descriptor, templatePoint);
        templateAnalysis.textContent = "Template analysis point: (" + Math.round(templatePoint.x) + ", " + Math.round(templatePoint.y) + ") · scale " + templatePoint.scale.toFixed(2) + " · principal orientation " + Math.round(templatePoint.orientation * 180 / Math.PI) + "° · descriptor length 128.";
      } else {
        templateAnalysis.textContent = "No template keypoint was detected at this resolution.";
        histogramCanvas.getContext("2d").clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);
        descriptorCanvas.getContext("2d").clearRect(0, 0, descriptorCanvas.width, descriptorCanvas.height);
      }
      drawMatchesCanvas(matchCanvas, pair, imageFeatures, templateFeatures, matches);
      status.textContent = pair.kind === "transform" ? "Educational SIFT-style transform demo: the template is inserted into the image at the selected scale and rotation." : "SIFT-style DoG keypoints and orientation-normalized descriptors were matched between the two supplied views.";
      resultText.textContent = "Image keypoints: " + imageFeatures.keypoints.length + " · Template keypoints: " + templateFeatures.keypoints.length + " · Corresponding matches: " + matches.length + ". Green marks are the matched points.";
    } catch (error) {
      status.textContent = "SIFT explorer could not run: " + error.message + ".";
      resultText.textContent = "Use the transform demo or upload both an image and a template.";
    }
  }

  var timer = null;
  function scheduleRun() {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 140);
  }

  exampleSelect.addEventListener("change", function () {
    state.mode = exampleSelect.value;
    syncControls();
    run();
  });
  scaleInput.addEventListener("input", function () {
    state.scale = Number(scaleInput.value);
    syncControls();
    scheduleRun();
  });
  rotationInput.addEventListener("input", function () {
    state.rotation = Number(rotationInput.value);
    syncControls();
    scheduleRun();
  });
  imageUpload.addEventListener("change", function () {
    state.imageFile = imageUpload.files[0] || null;
    state.mode = "upload";
    exampleSelect.value = "upload";
    syncControls();
    scheduleRun();
  });
  templateUpload.addEventListener("change", function () {
    state.templateFile = templateUpload.files[0] || null;
    state.mode = "upload";
    exampleSelect.value = "upload";
    syncControls();
    scheduleRun();
  });
  resetButton.addEventListener("click", function () {
    state.mode = "transform";
    state.scale = 1.15;
    state.rotation = 18;
    state.imageFile = null;
    state.templateFile = null;
    exampleSelect.value = "transform";
    scaleInput.value = "1.15";
    rotationInput.value = "18";
    imageUpload.value = "";
    templateUpload.value = "";
    syncControls();
    run();
  });

  syncControls();
  run();
}());
