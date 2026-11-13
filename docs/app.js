(function () {
  "use strict";

  const ln = Number(document.body.dataset.ln);
  const data = window.COURSE_DATA[ln];
  const app = document.getElementById("lecture-app");
  if (!data || !app) return;
  const lectureNumbers = Object.keys(window.COURSE_DATA).map(Number).sort((a,b)=>a-b);
  const lectureIndex = Math.max(0, lectureNumbers.indexOf(ln));
  const previousLecture = lectureNumbers[Math.max(0, lectureIndex-1)] || ln;
  const nextLecture = lectureNumbers[Math.min(lectureNumbers.length-1, lectureIndex+1)] || ln;
  data.mcqs = (data.mcqs || []).map(item => Array.isArray(item) ? {q:item[0], options:item[1], answer:item[2], why:item[3]} : item);
  data.trueFalse = (data.trueFalse || []).map(item => Array.isArray(item) ? {q:item[0], answer:item[1], why:item[2]} : item);

  const esc = (value) => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const fmt = value => Number.isInteger(value) ? String(value) : Number(value.toFixed(2)).toString();
  const inputFmt = value => Number.isInteger(value) ? String(value) : Number(value.toFixed(8)).toString();
  const filterTypes = [["mean","Mean"],["Gaussian","Gaussian"],["horizontal derivative","Horizontal derivative"]];
  const matrixHTML = matrix => `<div class="matrix" role="img" aria-label="Matrix with ${matrix.length} rows"><div style="--cols:${matrix[0].length}">${matrix.map(row => `<div class="matrix-row" style="--cols:${row.length}">${row.map(v => `<span>${fmt(v)}</span>`).join("")}</div>`).join("")}</div></div>`;

  function notebookUrl(file) {
    return `https://colab.research.google.com/github/MoyoG/CSBP441/blob/main/docs/notebooks/${encodeURIComponent(file).replace(/%2F/g, "/")}`;
  }

  app.innerHTML = `
    <header class="site-header">
      <a class="course-mark" href="index.html"><span class="course-code">CSBP441</span><span>Applied Computer Vision</span></a>
      <nav class="top-nav" aria-label="Lecture navigation"><a href="ln${previousLecture}.html">Previous LN</a><a href="index.html">Course home</a><a href="ln${nextLecture}.html">Next LN</a></nav>
    </header>
    <div class="lecture-shell">
      <aside class="lecture-sidebar">
        <a class="back-link" href="index.html">Back to course</a>
        <strong>LN${ln} ${esc(data.short)}</strong>
        <nav><a href="#overview">Overview</a><a href="#concepts">Key concepts</a><a href="#hands-on">Hands-on</a>${data.materials ? `<a href="#materials">In-class lab</a>` : ""}<a href="#notebooks">Colab notebooks</a><a href="#knowledge-check">Interactive MCQs</a><a href="#true-false">True or False</a><a href="#problem-lab">Problem generator</a>${data.takeaways ? `<a href="#takeaways">Summary and takeaways</a>` : ""}</nav>
      </aside>
      <main class="lecture-content">
        <section class="lecture-hero" id="overview">
          <div><p class="eyebrow">Lecture note ${ln}</p><h1>${esc(data.title)}</h1><p class="lede">${esc(data.summary)}</p></div>
          <img src="${esc(data.image)}" alt="Visual for ${esc(data.title)}">
        </section>
        <div class="lecture-main">
          <section class="lecture-section"><p class="eyebrow">Learning outcomes</p><h2>What you should be able to do</h2><ul class="objectives">${data.objectives.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>
          <section class="lecture-section" id="concepts"><p class="eyebrow">Theory</p><h2>Important concepts</h2><div class="concept-list">${data.concepts.map((x,i)=>`<details ${i===0?"open":""}><summary>${esc(x[0])}</summary><p>${esc(x[1])}</p></details>`).join("")}</div></section>
          <section class="lecture-section" id="hands-on"><p class="eyebrow">Hands-on material</p><h2>From theory to evidence</h2><div class="workflow">${data.handsOn.map((x,i)=>`<div><span>0${i+1}</span><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></div>`).join("")}</div></section>
          ${data.cnnFeatureExplorer ? `<section class="lecture-section" id="feature-hierarchy"><p class="eyebrow">Real CNN evidence</p><h2>From edges to objects</h2><p>Inspect activation maps from a CNN trained on real ImageNet-derived images, then sample intermediate layers from a pretrained ImageNet CNN in your browser.</p><div id="cnn-feature-explorer"></div></section>` : ""}
          ${data.interactiveXor ? `<section class="lecture-section" id="xor-trainer"><p class="eyebrow">Interactive laboratory</p><h2>2–2–1 XOR forward pass and backpropagation</h2><p>Edit the initial weights and biases, choose the number of full-batch epochs, and run the exact XOR training example from the worked document. The learning rate is η=1.</p><div id="xor-trainer-app"></div></section>` : ""}
          ${data.materials ? `<section class="lecture-section" id="materials"><p class="eyebrow">In-class lab</p><h2>${esc(data.materialsTitle || "Calculate the complete Canny pipeline")}</h2><div class="notebook-list">${data.materials.map(x=>`<div class="notebook-item"><div><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></div><div class="button-row"><a class="button button-primary" href="${esc(x[2])}" download>Download worksheet</a></div></div>`).join("")}</div></section>` : ""}
          <section class="lecture-section" id="notebooks"><p class="eyebrow">Colab</p><h2>Run the notebooks</h2><div class="notebook-list">${data.notebooks.map(x=>`<div class="notebook-item"><div><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></div><div class="button-row"><a class="button button-primary" target="_blank" rel="noopener" href="${notebookUrl(x[2])}">Open in Colab</a><a class="button button-secondary" href="notebooks/${encodeURIComponent(x[2])}">Download</a></div></div>`).join("")}</div></section>
          <section class="lecture-section" id="knowledge-check"><p class="eyebrow">Self-check</p><h2>Interactive MCQs</h2><p>Answer all ${data.mcqs.length} multiple-choice questions for this lecture note. Feedback explains the best answer after every question.</p><div id="quiz"></div></section>
          <section class="lecture-section" id="true-false"><p class="eyebrow">Concept check</p><h2>Interactive True or False</h2><p>Answer all ${(data.trueFalse || []).length} statements for this lecture note. Feedback explains why each statement is true or false.</p><div id="true-false-quiz"></div></section>
          <section class="lecture-section" id="problem-lab"><p class="eyebrow">Exam practice</p><h2>${data.problemQuestions ? "Interactive problem solving" : "Parameterized problem generator"}</h2><p>${data.problemQuestions ? esc(data.problemIntro || `Attempt each ${data.title} problem, then reveal the complete worked solution when you are ready.`) : "A seed creates reproducible starting values. Edit the displayed inputs, then recalculate the worked solution."}</p>${data.problemBankLink ? `<p><a class="button button-secondary" href="${esc(data.problemBankLink)}">Open the 20-question LN6 problem bank</a></p>` : ""}<div id="generator"></div><div id="problem-questions"></div></section>
          ${data.takeaways ? `<section class="lecture-section" id="takeaways"><p class="eyebrow">LN${ln} recap</p><h2>Summary and takeaways</h2><p class="takeaway-summary">${esc(data.recap || data.summary)}</p><ol class="takeaway-list">${data.takeaways.map(item=>`<li>${esc(item)}</li>`).join("")}</ol></section>` : ""}
        </div>
      </main>
    </div>
    <footer><span>CSBP441 Applied Computer Vision</span><span>LN${ln} ${esc(data.short)}</span></footer>`;

  if (data.interactiveXor) initXorTrainer();
  if (data.cnnFeatureExplorer) initCnnFeatureExplorer();
  initQuiz();
  initTrueFalse();
  if (data.problemQuestions) initProblemQuestions();
  else if ((data.problemTypes || []).length) initGenerator();

  function initProblemQuestions() {
    const host = document.getElementById("problem-questions");
    let variant = 0;
    function problemContent(index, seed) {
      const v = Math.max(0, Number(seed) || 0);
      if (data.problemDomain === "corners") {
        const s = v % 5;
        const cornerGradientTable = rows => `<table class="problem-table corner-gradient-table"><thead><tr><th>Sample</th><th>I<sub>x</sub></th><th>I<sub>y</sub></th></tr></thead><tbody>${rows.map((row,i)=>`<tr><th>${i+1}</th><td>${row[0]}</td><td>${row[1]}</td></tr>`).join("")}</tbody></table>`;
        const cornerEigenTable = rows => `<table class="problem-table corner-eigen-table"><thead><tr><th>Case</th><th>λ<sub>1</sub></th><th>λ<sub>2</sub></th><th>Classification</th></tr></thead><tbody>${rows.map(row=>`<tr><th>${row[0]}</th><td>${row[1]}</td><td>${row[2]}</td><td>${row[3] || "?"}</td></tr>`).join("")}</tbody></table>`;
        const responseWindowHTML = (name, matrix) => `<figure class="corner-window"><figcaption>${name}</figcaption><div class="response-window" role="img" aria-label="${name} 3 by 3 response window">${matrix.flatMap((row,r)=>row.map((value,c)=>`<span class="${r===1 && c===1 ? "center" : ""}">${value}</span>`)).join("")}</div></figure>`;
        switch (index) {
          case 0: {
            const flatA = (0.2 + 0.1*s).toFixed(1), flatB = (0.1 + 0.05*s).toFixed(2), edgeA = 120 + 10*s, edgeB = 1 + s, cornerA = 90 + 5*s, cornerB = 85 + 5*s;
            return {question:`Classify these eigenvalue pairs of the second-moment matrix as flat, edge-like, or corner-like.`, questionHTML:`<p>Classify each eigenvalue pair using this rule: two small values indicate a flat region, one large and one small value indicate an edge-like region, and two large values indicate a corner-like region.</p>${cornerEigenTable([["A",flatA,flatB],["B",edgeA,edgeB],["C",cornerA,cornerB],["D",0,0]])}<p class="input-note">The two columns are the eigenvalues of M. Enter a classification for every case.</p>`, solution:`A is flat because both eigenvalues are small. B is edge-like because one eigenvalue is large and the other is small. C is corner-like because both eigenvalues are large. D is flat because both eigenvalues are zero.`, solutionHTML:`<p>Compare the two eigenvalues in each row:</p>${cornerEigenTable([["A",flatA,flatB,"Flat"],["B",edgeA,edgeB,"Edge-like"],["C",cornerA,cornerB,"Corner-like"],["D",0,0,"Flat"]])}`};
          }
          case 1: {
            const a=9+s, b=3, d=4+s, trace=a+d, determinant=a*d-b*b, response=determinant-0.04*trace*trace;
            return {question:`For the given second-moment matrix and k=0.04, calculate trace(M), det(M), and the Harris response.`, questionHTML:`<p>Use the input matrix and Harris parameter below.</p><div class="corner-matrix-layout"><div><strong>Second-moment matrix M</strong>${matrixHTML([[a,b],[b,d]])}</div><div class="corner-parameter"><strong>Harris parameter</strong><span>k = 0.04</span></div></div><ol class="corner-task-list"><li>Compute <strong>trace(M)</strong>.</li><li>Compute <strong>det(M)</strong>.</li><li>Compute <strong>R = det(M) − k(trace(M))²</strong> and decide whether the region is a corner candidate.</li></ol>`, solution:`trace(M)=${a}+${d}=${trace}. det(M)=(${a}×${d})−(${b}×${b})=${determinant}. R=${determinant}−0.04×${trace}²=${response.toFixed(2)}. The response is positive and substantial, so this region is consistent with a corner candidate.`, solutionHTML:`<p><strong>Trace:</strong> trace(M) = ${a} + ${d} = <strong>${trace}</strong></p><p><strong>Determinant:</strong> det(M) = (${a} × ${d}) − (${b} × ${b}) = <strong>${determinant}</strong></p><p><strong>Harris response:</strong> R = ${determinant} − 0.04 × ${trace}<sup>2</sup> = <strong>${response.toFixed(2)}</strong></p><p>The positive, substantial response is consistent with a corner candidate.</p>`};
          }
          case 2: {
            const gx1=3+s, gx2=2+s, gy1=4, gy2=3+s, mxx=gx1*gx1+gx2*gx2, myy=gy1*gy1+gy2*gy2, eigenvalues=[mxx,myy].sort((x,y)=>x-y);
            const gradients=[[gx1,0],[gx2,0],[0,gy1],[0,gy2]];
            return {question:`Build the second-moment matrix from four local gradient samples, find its eigenvalues, and classify the region.`, questionHTML:`<p>Each gradient sample is written as <strong>(I<sub>x</sub>, I<sub>y</sub>)</strong>.</p>${cornerGradientTable(gradients)}<div class="formula-block"><strong>Build M with</strong><br>M = Σ<sub>i</sub> [[I<sub>x,i</sub><sup>2</sup>, I<sub>x,i</sub>I<sub>y,i</sub>], [I<sub>x,i</sub>I<sub>y,i</sub>, I<sub>y,i</sub><sup>2</sup>]]</div><ol class="corner-task-list"><li>Compute M.</li><li>Find its two eigenvalues.</li><li>Classify the region.</li></ol>`, solution:`The horizontal gradients contribute ${gx1}²+${gx2}²=${mxx} to M₁₁. The vertical gradients contribute ${gy1}²+${gy2}²=${myy} to M₂₂, and all cross-products are zero. Therefore M=[[${mxx},0],[0,${myy}]], with eigenvalues ${eigenvalues[0]} and ${eigenvalues[1]}. Both directions have substantial variation, so the region is corner-like.`, solutionHTML:`<p>The horizontal gradients contribute ${gx1}<sup>2</sup> + ${gx2}<sup>2</sup> = <strong>${mxx}</strong> to M<sub>11</sub>. The vertical gradients contribute ${gy1}<sup>2</sup> + ${gy2}<sup>2</sup> = <strong>${myy}</strong> to M<sub>22</sub>. All cross-products are zero.</p><p>Therefore:</p>${matrixHTML([[mxx,0],[0,myy]])}<p>The eigenvalues are <strong>${eigenvalues[0]}</strong> and <strong>${eigenvalues[1]}</strong>. Both directions have substantial variation, so the region is corner-like.</p>`};
          }
          case 3: {
            const peak=12+s, weaker=8+s, neighbor=11+s;
            const windowA=[[4,6,2],[5,peak,7],[1,8,3]], windowB=[[4,6,2],[5,weaker,neighbor],[1,8,3]];
            return {question:`Apply 3×3 non-maximal suppression to two response windows and decide whether each center is retained or suppressed.`, questionHTML:`<p>Compare the highlighted center of each window with all eight neighboring responses.</p><div class="corner-window-grid">${responseWindowHTML("Window A",windowA)}${responseWindowHTML("Window B",windowB)}</div><ol class="corner-task-list"><li>Decide whether the center of Window A is retained or suppressed.</li><li>Decide whether the center of Window B is retained or suppressed.</li></ol>`, solution:`In Window A, the center ${peak} is larger than every neighbor, so retain it. In Window B, the neighbor ${neighbor} is larger than the center ${weaker}, so suppress the center. Non-maximal suppression keeps local peaks and removes weaker nearby responses.`, solutionHTML:`<p><strong>Window A:</strong> the center value ${peak} is larger than every neighbor, so <strong>retain</strong> it.</p><p><strong>Window B:</strong> the neighbor value ${neighbor} is larger than the center value ${weaker}, so <strong>suppress</strong> the center.</p><p>Non-maximal suppression keeps local peaks and removes weaker nearby responses.</p>`};
          }
          case 4: {
            const a=5+s, b=2, trace=2*a, determinant=a*a-b*b, response=determinant-0.04*trace*trace;
            return {question:`Compare the Harris quantities before and after a coordinate rotation.`, questionHTML:`<p>Use the two matrices below with <strong>k = 0.04</strong>.</p><div class="corner-matrix-pair"><div><strong>Original M</strong>${matrixHTML([[a,b],[b,a]])}</div><div><strong>Rotated-coordinate M′</strong>${matrixHTML([[a,-b],[-b,a]])}</div></div><ol class="corner-task-list"><li>Compute trace and determinant for both matrices.</li><li>Compute the Harris response for both.</li><li>Explain what the comparison shows.</li></ol>`, solution:`For M, trace=${trace}, det=${determinant}, and R=${determinant}−0.04×${trace}²=${response.toFixed(2)}. M′ has the same trace=${trace}, determinant=${determinant}, and response R=${response.toFixed(2)}. The unchanged values show the rotational invariance used by the Harris detector.`, solutionHTML:`<table class="problem-table corner-comparison-table"><thead><tr><th>Matrix</th><th>Trace</th><th>Determinant</th><th>Harris R</th></tr></thead><tbody><tr><th>M</th><td>${trace}</td><td>${determinant}</td><td>${response.toFixed(2)}</td></tr><tr><th>M′</th><td>${trace}</td><td>${determinant}</td><td>${response.toFixed(2)}</td></tr></tbody></table><p>The values are identical, showing that trace, determinant, and the Harris response are invariant under this coordinate rotation.</p>`};
          }
          default: return {question:data.problemQuestions[index][1], solution:data.problemQuestions[index][2]};
        }
      }
      if (data.problemDomain === "yolo") {
        const yoloTable = (headers, rows, className="") => `<table class="problem-table ${className}"><thead><tr>${headers.map(header=>`<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>`${i===0 ? `<th>${cell}</th>` : `<td>${cell}</td>`}`).join("")}</tr>`).join("")}</tbody></table>`;
        const s = v % 4;
        switch (index) {
          case 5: {
            const objectnessShift=[0.00,0.03,-0.02,0.02][s], iouShift=[0.00,0.03,-0.03,0.02][s];
            const objectness=[0.80,0.75,0.70,0.85].map(value=>Math.min(0.95,Math.max(0.55,value+objectnessShift)));
            const iou=[0.65,0.75,0.55,0.80].map(value=>Math.min(0.90,Math.max(0.35,value+iouShift)));
            const probabilities=[[0.70,0.20,0.10],[0.15,0.70,0.15],[0.10,0.25,0.65],[0.45,0.40,0.15]], names=["Car","Person","Bicycle"];
            const rows=objectness.map((value,index)=>{const confidence=value*iou[index],scores=probabilities[index].map(probability=>confidence*probability),bestIndex=scores.indexOf(Math.max(...scores));return {box:index+1,objectness:value,iou:iou[index],confidence,scores,best:names[bestIndex]};});
            const strongest=rows.flatMap(row=>row.scores.map((score,index)=>({box:row.box,className:names[index],score}))).reduce((a,b)=>b.score>a.score?b:a);
            const inputs=rows.map(row=>[`Box ${row.box}`,row.objectness.toFixed(2),row.iou.toFixed(2),...probabilities[row.box-1].map(value=>value.toFixed(2))]);
            const outputs=rows.map(row=>[`Box ${row.box}`,row.confidence.toFixed(3),row.scores[0].toFixed(3),row.scores[1].toFixed(3),row.scores[2].toFixed(3),row.best]);
            return {question:`Calculate the object confidence and the class-specific score for each class for four YOLO candidate boxes. The IoU values have already been computed from the box coordinates.`, questionHTML:`<p>Use <strong>C<sub>j</sub> = Pr(Object) × IoU</strong>, then use <strong>S<sub>j,c</sub> = C<sub>j</sub> × Pr(c|Object)</strong>. The class probabilities are conditional on an object being present.</p>${yoloTable(["Box","Pr(Object)","IoU","Pr(Car|Object)","Pr(Person|Object)","Pr(Bicycle|Object)"],inputs,"yolo-class-score-input-table")}<p>Calculate all three class-specific scores for every box, select the best class per box, and identify the strongest detection overall. Do not apply NMS in this question.</p>`, solution:`Use C<sub>j</sub> = Pr(Object) × IoU, followed by S<sub>j,c</sub> = C<sub>j</sub> × Pr(c|Object).`, solutionHTML:`${yoloTable(["Box","C<sub>j</sub>","Car score","Person score","Bicycle score","Best class"],outputs,"yolo-class-score-output-table")}<p>The strongest class-specific detection is <strong>Box ${strongest.box}, ${strongest.className}</strong> with score <strong>${strongest.score.toFixed(3)}</strong>.</p><p>Object confidence uses objectness and IoU. The class-specific score multiplies that confidence by the conditional class probability.</p>`};
          }
          case 0: {
            const grid=[3,5,7,9][s], boxesPerCell=2, classes=20, cells=grid*grid, totalBoxes=cells*boxesPerCell, valuesPerCell=boxesPerCell*5+classes, output=cells*valuesPerCell;
            return {question:`For a YOLOv1 output with an S×S grid, B boxes per cell, and C classes, calculate the grid cells, total predicted boxes, predictions per cell, and total output values.`, questionHTML:`<p>Use the YOLOv1 configuration below.</p>${yoloTable(["Input","Value","Meaning"],[["Grid size",`${grid} × ${grid}`,"S × S cells"],["Boxes per cell",boxesPerCell,"B"],["Classes",classes,"C"],["Values per box",5,"x, y, w, h, confidence"]],"yolo-input-table")}<div class="formula-block"><strong>Output formula</strong><br>S × S × (B × 5 + C)</div><ol class="corner-task-list"><li>Count the grid cells.</li><li>Count all predicted boxes.</li><li>Calculate the output size.</li></ol>`, solution:`There are ${cells} grid cells. Total predicted boxes = ${cells}×${boxesPerCell}=${totalBoxes}. Each cell predicts ${boxesPerCell}×5+${classes}=${valuesPerCell} values. Total output size = ${grid}×${grid}×${valuesPerCell}=${output}.`, solutionHTML:`${yoloTable(["Quantity","Calculation","Result"],[["Grid cells",`${grid} × ${grid}`,cells],["Predicted boxes",`${cells} × ${boxesPerCell}`,totalBoxes],["Values per cell",`${boxesPerCell} × 5 + ${classes}`,valuesPerCell],["Total output",`${grid} × ${grid} × ${valuesPerCell}`,output]],"yolo-output-table")}<p>For the original YOLOv1 setting S=7, this becomes 7×7×(2×5+20)=1470 values.</p>`};
          }
          case 1: {
            const objectness=[0.80,0.85,0.90,0.95][s], iou=[0.58,0.62,0.70,0.65][s], score=objectness*iou, threshold=0.50, decision=score>=threshold?"kept":"removed";
            return {question:`Calculate the YOLO confidence score and decide whether the box passes a confidence threshold of ${threshold}.`, questionHTML:`<p>YOLO combines the model's objectness estimate with the intersection-over-union (IoU) between the predicted and ground-truth boxes.</p>${yoloTable(["Input","Value","Meaning"],[["Objectness",objectness.toFixed(2),"Pr(Object)"],["IoU",iou.toFixed(2),"Overlap with ground truth"],["Threshold",threshold.toFixed(2),"Keep if score ≥ threshold"]],"yolo-input-table")}<div class="formula-block"><strong>Confidence score</strong><br>Score = Pr(Object) × IoU</div><p>Compute the score and decide whether confidence filtering keeps the box.</p>`, solution:`Score = ${objectness.toFixed(2)}×${iou.toFixed(2)}=${score.toFixed(2)}. Since ${score.toFixed(2)} ${score>=threshold?"≥":"<"} ${threshold.toFixed(2)}, the box is ${decision} by confidence filtering.`, solutionHTML:`<p><strong>Score:</strong> ${objectness.toFixed(2)} × ${iou.toFixed(2)} = <strong>${score.toFixed(2)}</strong></p><p><strong>Decision:</strong> ${score.toFixed(2)} ${score>=threshold?"≥":"<"} ${threshold.toFixed(2)}, so the box is <strong>${decision}</strong>.</p>`};
          }
          case 2: {
            const boxIoU=0.40+0.05*s, thresholds=[0.30,0.50,0.70];
            return {question:`Apply standard non-maximum suppression to two boxes and determine whether Box B survives at each threshold.`, questionHTML:`<p>Box A has the higher score, so compare Box B with A using their IoU.</p>${yoloTable(["Box","Score","IoU with A"],[["A","0.88","1.00"],["B","0.80",boxIoU.toFixed(2)]],"yolo-input-table")}${yoloTable(["NMS threshold","Decision rule","Your decision"],thresholds.map(threshold=>[threshold.toFixed(2),`Suppress B if IoU > ${threshold.toFixed(2)}`,"?"]),"yolo-threshold-table")}<p>Complete the decision column for each threshold.</p>`, solution:`At threshold 0.30, ${boxIoU.toFixed(2)}>0.30, so suppress B. At threshold 0.50, ${boxIoU.toFixed(2)} ${boxIoU>0.50?">":"≤"} 0.50, so ${boxIoU>0.50?"suppress":"keep"} B. At threshold 0.70, ${boxIoU.toFixed(2)}≤0.70, so keep B. A lower threshold makes suppression more aggressive.`, solutionHTML:`${yoloTable(["NMS threshold","IoU comparison","Decision"],thresholds.map(threshold=>[threshold.toFixed(2),`${boxIoU.toFixed(2)} ${boxIoU>threshold?">":"≤"} ${threshold.toFixed(2)}`,boxIoU>threshold?"Suppress B":"Keep B"]),"yolo-threshold-table")}<p>Lower thresholds suppress more overlapping boxes. Higher thresholds allow more overlap to remain.</p>`};
          }
          case 3: {
            const grid=7, x=[0.18,0.31,0.63,0.82][s], y=[0.22,0.41,0.28,0.74][s], column=Math.floor(grid*x)+1, row=Math.floor(grid*y)+1;
            return {question:`Identify the YOLOv1 grid cell responsible for an object whose center has normalized coordinates (x,y)=(${x.toFixed(2)}, ${y.toFixed(2)}) in a ${grid}×${grid} grid.`, questionHTML:`<p>YOLO assigns an object to the grid cell containing its center. Use zero-based indexing for the calculation, then report the human-readable one-based row and column.</p>${yoloTable(["Input","Value","Meaning"],[["Grid",`${grid} × ${grid}`,grid*grid+" cells"],["Object center x",x.toFixed(2),"Normalized horizontal position"],["Object center y",y.toFixed(2),"Normalized vertical position"],["Boxes in responsible cell",2,"YOLOv1 B"]],"yolo-input-table")}<div class="formula-block"><strong>Cell rule</strong><br>column = floor(S × x) + 1<br>row = floor(S × y) + 1</div><p>Also explain why a large object does not need a separate large-object detector in YOLOv1.</p>`, solution:`column=floor(7×${x.toFixed(2)})+1=${column}; row=floor(7×${y.toFixed(2)})+1=${row}. The responsible cell is row ${row}, column ${column}. A large object is handled through large receptive fields, the 7×7 grid, and the box's predicted width and height.`, solutionHTML:`<p><strong>Column:</strong> floor(7 × ${x.toFixed(2)}) + 1 = <strong>${column}</strong></p><p><strong>Row:</strong> floor(7 × ${y.toFixed(2)}) + 1 = <strong>${row}</strong></p><p>The responsible cell is <strong>row ${row}, column ${column}</strong>. YOLOv1 handles a large object through large receptive fields, the grid, and its predicted width and height. It does not use a separate large-object detector.</p>`};
          }
          case 4: {
            const className=["car","bus","person","bicycle"][s];
            return {question:`For each cell below, identify which YOLO loss terms are active. Use coordinate loss, object-confidence loss, no-object loss, and class loss.`, questionHTML:`<p>Use the YOLOv1 loss rules from the lecture.</p>${yoloTable(["Cell","Object present?","Responsible box?","Target class"],[["A","Yes","Yes",className],["B","No","No","None"]],"yolo-loss-input-table")}<ol class="corner-task-list"><li>Mark coordinate loss, object-confidence loss, no-object loss, and class loss for Cell A.</li><li>Mark the same four terms for Cell B.</li></ol>`, solution:`Cell A activates coordinate, object-confidence, and class losses. Cell B activates no-object loss only. Coordinate and class losses require an object, while no-object loss applies when no object is present.`, solutionHTML:`${yoloTable(["Cell","Coordinate","Object confidence","No-object confidence","Class"],[["A","Active","Active","Inactive","Active"],["B","Inactive","Inactive","Active","Inactive"]],"yolo-loss-output-table")}<p>Coordinate loss applies only when an object exists and the box is responsible. Class loss applies to the object cell. No-object loss applies to the empty cell.</p>`};
          }
          default: return {question:data.problemQuestions[index][1], solution:data.problemQuestions[index][2]};
        }
      }
      switch (index) {
        case 0: { const n=64+8*v, f=5, s=2, filters=16+8*v, out=Math.floor((n-f)/s)+1; return {question:`A ${n}×${n}×3 input is processed by ${filters} filters of size ${f}×${f}, stride ${s}, with no padding. Find the output height, width, and channels.`, solution:`Output height = floor((${n}−${f})/${s})+1 = ${out}. Output width = ${out}. The number of output channels equals the number of filters, ${filters}. Final output = ${out}×${out}×${filters}.`}; }
        case 1: { const f=3, cin=16+4*v, cout=32+8*v, params=(f*f*cin+1)*cout; return {question:`A convolution layer has ${cout} filters of size ${f}×${f} and receives ${cin} input channels. Include one bias per filter. How many trainable parameters are there?`, solution:`Weights = ${f}×${f}×${cin}×${cout} = ${(f*f*cin*cout).toLocaleString()}. Biases = ${cout}. Total = ${f*f*cin}×${cout}+${cout} = ${params.toLocaleString()} trainable parameters.`}; }
        case 2: { const n=28+4*v, f=7, p=(f-1)/2; return {question:`Choose the symmetric padding P for a ${f}×${f} filter with stride 1 so that a ${n}×${n} input keeps the same spatial size. Verify with the output formula.`, solution:`Set P=(F−1)/2=(${f}−1)/2=${p}. Output = (${n}−${f}+2×${p})/1+1 = ${n}. Therefore the output is ${n}×${n}; symmetric padding is P=${p} on each side.`}; }
        case 3: { const n=32+6*v, f=5, filters=8+2*v, out1=Math.floor((n-f)/1)+1, out3=Math.floor((n-f)/3)+1, params=(f*f*3+1)*filters; return {question:`For a ${n}×${n}×3 input, ${f}×${f} filters, and ${filters} output filters, compute the output volume for stride 1 and stride 3, both with no padding. Explain what changes and what stays constant.`, solution:`Stride 1: floor((${n}−${f})/1)+1=${out1}, so the output is ${out1}×${out1}×${filters}. Stride 3: floor((${n}−${f})/3)+1=${out3}, so the output is ${out3}×${out3}×${filters}. The spatial size changes; channels stay ${filters}. Parameters stay ${params.toLocaleString()} because stride does not change the filter weights or biases.`}; }
        case 4: { const n=227+4*v, filters=96+16*v, out=(n-11)/4+1, params=(11*11*3+1)*filters; return {question:`Using an AlexNet-style input ${n}×${n}×3, ${filters} filters of 11×11, stride 4, and no padding, calculate the spatial output and the number of weights plus biases.`, solution:`Spatial output = (${n}−11)/4+1 = ${out}, so the output volume is ${out}×${out}×${filters}. Weights = 11×11×3×${filters} = ${(11*11*3*filters).toLocaleString()}. Biases = ${filters}. Total trainable parameters = ${params.toLocaleString()}.`}; }
        case 5: { const a=1+v,b=5+v,c=2+v,d=4+v,e=3+v,f=7+v,g=0+v,h=6+v,i=8+v,j=2+v,k=9+v,l=1+v,m=4+v,o=3+v,p=5+v,q=0+v; return {question:`Apply 2×2 max pooling with stride 2 to [[${a},${b},${c},${d}],[${e},${f},${g},${h}],[${i},${j},${k},${l}],[${m},${o},${p},${q}]]. Give the 2×2 output.`, solution:`Block maxima: max(${a},${b},${e},${f})=${Math.max(a,b,e,f)}; max(${c},${d},${g},${h})=${Math.max(c,d,g,h)}; max(${i},${j},${m},${o})=${Math.max(i,j,m,o)}; max(${k},${l},${p},${q})=${Math.max(k,l,p,q)}. Pooled output = [[${Math.max(a,b,e,f)},${Math.max(c,d,g,h)}],[${Math.max(i,j,m,o)},${Math.max(k,l,p,q)}]].`}; }
        case 6: { const f=3+2*v, rf=2*f-1; return {question:`Two convolution layers use ${f}×${f} filters, stride 1, and no pooling. What input-side receptive-field size does one second-layer activation see?`, solution:`The first layer covers ${f}×${f}. The second layer adds ${f}−1=${f-1} pixels on each spatial span: receptive field = 1+(${f}−1)+(${f}−1) = ${rf}. Therefore one second-layer activation sees a ${rf}×${rf} input region.`}; }
        case 7: { const x=1+v, response=x-4; return {question:`For image patch [[${x},2],[3,4]] and filter [[1,0],[0,−1]], compute the single valid cross-correlation response. Interpret its sign.`, solution:`Elementwise sum = (${x}×1)+(2×0)+(3×0)+(4×−1) = ${x}−4 = ${response}. The response is ${response<0?'negative':'non-negative'}, so the patch aligns more with the filter’s negative-diagonal pattern under this convention.`}; }
        case 8: { const h=285+5*v,w=350+5*v,c=3,input=h*w*c,k=32,kernel=3,conv=(kernel*kernel*c+1)*k; return {question:`Explain why replacing a fully connected first layer on a ${h}×${w}×${c} image with convolutional filters can dramatically reduce parameters. Include the role of local connectivity and weight sharing.`, solution:`The image contains ${h}×${w}×${c}=${input.toLocaleString()} input values. A dense layer with H neurons would require ${input}H+H parameters. A 3×3 convolution with ${k} filters requires (3×3×${c}+1)×${k}=${conv.toLocaleString()} parameters, independent of the image width and height. Local connectivity uses small neighborhoods, while weight sharing reuses each kernel at every location.`}; }
        case 9: { const n=32+4*v,out=n/2,c=3; return {question:`A ${n}×${n} feature map with ${c} channels must be reduced to ${out}×${out} while retaining the number of channels. Propose a pooling configuration and explain its effect on computation and spatial detail.`, solution:`Use ${2}×${2} pooling with stride ${2}. Each channel changes from ${n}×${n} to floor((${n}−2)/2)+1=${out}×${out}; the output volume is ${out}×${out}×${c}. Spatial cells fall from ${n*n} to ${out*out} per channel, a ${((n*n)/(out*out)).toFixed(0)}× reduction. This lowers computation and preserves channels, but discards within-window spatial detail.`}; }
        default: return {question:data.problemQuestions[index][1], solution:data.problemQuestions[index][2]};
      }
    }
    host.insertAdjacentHTML("beforebegin", '<div id="problem-variant-controls" class="problem-variant-controls"><label>Choose problem<select id="problem-picker">'+data.problemQuestions.map((item,i)=>'<option value="'+i+'">Problem '+(i+1)+': '+esc(item[0])+'</option>').join('')+'</select></label><label>Variant seed <input id="problem-seed" type="number" value="0" min="0"></label><button class="button button-secondary" id="new-problem-variant" type="button">Generate new problem variant</button></div>');
    if (data.cnnArchitectureBuilder) host.insertAdjacentHTML("afterend", '<div id="cnn-architecture-builder" class="cnn-builder"><p class="eyebrow">Interactive CNN architecture</p><h3>Configure a three-layer CNN</h3><p>Change the input size, kernels, kernel size, stride, padding, pooling, and batch normalization.</p><div class="cnn-controls"><label>Input height<input data-cnn="ih" type="number" value="32" min="1"></label><label>Input width<input data-cnn="iw" type="number" value="32" min="1"></label><label>Input channels<input data-cnn="ic" type="number" value="3" min="1"></label></div>' + [0,1,2].map(function(i){return '<fieldset><legend>Conv layer '+(i+1)+'</legend><div class="cnn-controls"><label>Kernels<input data-cnn="k'+i+'" type="number" value="'+[8,16,32][i]+'" min="1"></label><label>Kernel size<input data-cnn="s'+i+'" type="number" value="3" min="1"></label><label>Stride<input data-cnn="st'+i+'" type="number" value="1" min="1"></label><label>Padding<input data-cnn="p'+i+'" type="number" value="1" min="0"></label><label><input data-cnn="pool'+i+'" type="checkbox" '+(i>0?'checked':'')+'> Pooling</label><label>Pool size<input data-cnn="ps'+i+'" type="number" value="2" min="1"></label><label>Pool stride<input data-cnn="pst'+i+'" type="number" value="2" min="1"></label><label><input data-cnn="bn'+i+'" type="checkbox" '+(i===1?'checked':'')+'> Batch normalization</label></div></fieldset>';}).join('') + '<button class="button button-primary" id="calculate-cnn">Calculate architecture</button><div id="cnn-results" aria-live="polite"></div></div>');
    initCnnArchitectureBuilder();
    const controls=document.getElementById("problem-variant-controls");
    function renderProblems(){ const i=Number(controls.querySelector("#problem-picker").value||0), item=data.problemQuestions[i], content=problemContent(i,variant), questionMarkup=content.questionHTML || `<p>${esc(content.question)}</p>`, solutionMarkup=content.solutionHTML || `<p>${esc(content.solution)}</p>`; host.innerHTML = `<article class="problem-card"><p class="eyebrow">Problem ${i+1} of ${data.problemQuestions.length}</p><h3>${esc(item[0])}</h3><div class="problem-prompt">${questionMarkup}</div><button class="button button-secondary problem-solution-toggle" type="button">Show worked solution</button><div class="problem-solution" hidden><p><strong>Worked solution:</strong></p>${solutionMarkup}</div></article>`; host.querySelector(".problem-solution-toggle").addEventListener("click", () => { const solution=host.querySelector(".problem-solution"), hidden=solution.hidden; solution.hidden=!hidden; host.querySelector(".problem-solution-toggle").textContent=hidden?"Hide worked solution":"Show worked solution"; }); }
    renderProblems();
    controls.querySelector("#problem-picker").addEventListener("change",renderProblems);
    controls.querySelector("#new-problem-variant").addEventListener("click",()=>{variant=Number(controls.querySelector("#problem-seed").value||0)+1;controls.querySelector("#problem-seed").value=variant;renderProblems();});
  }

  function initCnnFeatureExplorer() {
    const host = document.getElementById("cnn-feature-explorer");
    if (!host) return;
    host.innerHTML =
      "<div class='cnn-hierarchy-strip' aria-label='Typical CNN feature progression'>" +
        "<div><span>1</span><strong>Edges and colors</strong><small>Local contrast, lines, and simple color changes</small></div>" +
        "<div><span>2</span><strong>Textures and patterns</strong><small>Repeated edges, curves, and surface structure</small></div>" +
        "<div><span>3</span><strong>Parts</strong><small>Combinations such as wheels, eyes, or handles</small></div>" +
        "<div><span>4</span><strong>Objects</strong><small>Evidence used by the final classifier</small></div>" +
      "</div>" +
      "<div class='cnn-feature-controls'>" +
        "<label class='cnn-feature-upload'>Choose an image<input id='cnn-feature-file' type='file' accept='image/*'></label>" +
        "<button class='button button-secondary' id='use-course-image' type='button'>Use course image</button>" +
        "<button class='button button-primary' id='load-cnn-features' type='button'>Run pretrained CNN on image</button>" +
        "<span class='cnn-feature-status' id='cnn-feature-status' aria-live='polite'>The course image and activation maps are ready below.</span>" +
      "</div>" +
      "<div class='cnn-feature-source'>" +
        "<figure class='cnn-feature-input'>" +
          "<p class='eyebrow'>Model input · local only</p>" +
          "<img id='cnn-feature-input-image' src='assets/imagenette-gas-pump.png' alt='Gas pump image from the Imagenette dataset'>" +
          "<figcaption id='cnn-feature-input-caption'>Gas pump image from the course Imagenette lab.</figcaption>" +
        "</figure>" +
        "<figure class='cnn-feature-static'>" +
          "<p class='eyebrow'>Real course CNN: first layer</p>" +
          "<img src='assets/imagenette-conv1-feature-maps.png' alt='Sixteen first-layer convolution activation maps for a gas pump image'>" +
          "<figcaption>Stored <code>conv1</code> activations from the course CNN trained on Imagenette. This fixed panel is a real numerical reference for the course gas-pump image.</figcaption>" +
        "</figure>" +
      "</div>" +
      "<p class='cnn-feature-note'>Choose any local image to update the live panels. The image stays in this browser; it is not sent to GitHub or a server. When loaded, the panels show raw intermediate activations from MobileNetV1 pretrained on ImageNet. “Edges → textures → parts → objects” is a useful teaching interpretation; individual channels and models do not all have the same semantics.</p>" +
      "<div class='cnn-feature-live' id='cnn-feature-live' hidden>" +
        "<p class='eyebrow'>Live pretrained CNN activations</p>" +
        "<p id='cnn-feature-prediction' class='cnn-feature-prediction' aria-live='polite'></p>" +
        "<div class='cnn-feature-live-grid'>" +
          "<section><h3>Early layer · edges and colors</h3><div class='cnn-feature-canvas-grid' id='cnn-feature-early'></div></section>" +
          "<section><h3>Middle layer · textures and patterns</h3><div class='cnn-feature-canvas-grid' id='cnn-feature-middle'></div></section>" +
          "<section><h3>Deep layer · parts and object evidence</h3><div class='cnn-feature-canvas-grid' id='cnn-feature-deep'></div></section>" +
        "</div>" +
        "<p class='cnn-feature-note'>Each canvas is a selected channel from the model’s actual activation tensor. Channels are selected by mean absolute activation so the panel stays compact.</p>" +
      "</div>";

    const button = host.querySelector("#load-cnn-features");
    const fileInput = host.querySelector("#cnn-feature-file");
    const courseImageButton = host.querySelector("#use-course-image");
    const status = host.querySelector("#cnn-feature-status");
    const image = host.querySelector("#cnn-feature-input-image");
    const imageCaption = host.querySelector("#cnn-feature-input-caption");
    const live = host.querySelector("#cnn-feature-live");
    const prediction = host.querySelector("#cnn-feature-prediction");
    let loading = false;
    let modelCache = null;
    let objectUrl = "";
    const courseImage = "assets/imagenette-gas-pump.png";

    function graphNodeNames(graph) {
      const store = graph && graph.executor && graph.executor.graph && graph.executor.graph.nodes;
      if (!store) return [];
      return typeof store.keys === "function" ? Array.from(store.keys()) : Object.keys(store);
    }

    function findNode(names, patternGroups) {
      return names.find(name => {
        const lower = String(name).toLowerCase();
        return patternGroups.some(group => group.every(token => lower.includes(token)));
      });
    }

    function disposeOutput(output) {
      if (Array.isArray(output)) {
        output.forEach(item => { if (item && typeof item.dispose === "function") item.dispose(); });
      } else if (output && typeof output.dispose === "function") {
        output.dispose();
      }
    }

    function clearLiveOutput() {
      live.hidden = true;
      prediction.textContent = "";
      ["early", "middle", "deep"].forEach(key => {
        const target = host.querySelector("#cnn-feature-" + key);
        if (target) target.replaceChildren();
      });
    }

    function releaseObjectUrl() {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
        objectUrl = "";
      }
    }

    courseImageButton.addEventListener("click", () => {
      releaseObjectUrl();
      fileInput.value = "";
      image.src = courseImage;
      image.alt = "Gas pump image from the Imagenette dataset";
      imageCaption.textContent = "Gas pump image from the course Imagenette lab.";
      clearLiveOutput();
      status.textContent = "Course image ready. Run the pretrained CNN when you want to calculate its outputs.";
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!file.type || !file.type.startsWith("image/")) {
        fileInput.value = "";
        status.textContent = "Please choose an image file.";
        return;
      }
      releaseObjectUrl();
      objectUrl = window.URL.createObjectURL(file);
      image.src = objectUrl;
      image.alt = "User-selected image";
      imageCaption.textContent = file.name + " selected locally; it stays in this browser.";
      clearLiveOutput();
      status.textContent = "Local image ready. Run the pretrained CNN to calculate predictions and activation maps.";
    });

    async function renderFeatureMaps(tensor, target, stageName) {
      const shape = tensor && tensor.shape ? tensor.shape : [];
      if (shape.length < 3) return 0;
      const rank = shape.length;
      const isNchw = rank === 4
        ? shape[0] === 1 && shape[2] === shape[3] && shape[1] !== shape[2]
        : rank === 3 && shape[1] === shape[2] && shape[0] !== shape[1];
      const height = isNchw ? shape[rank - 2] : shape[rank - 3];
      const width = isNchw ? shape[rank - 1] : shape[rank - 2];
      const channels = isNchw ? shape[rank - 3] : shape[rank - 1];
      if (!height || !width || !channels || height * width * channels > 30000000) return 0;
      const values = await tensor.data();
      const readValue = (y, x, channel) => isNchw
        ? Number(values[(channel * height + y) * width + x]) || 0
        : Number(values[(y * width + x) * channels + channel]) || 0;
      const scores = Array.from({length: channels}, (_, channel) => {
        let sum = 0;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            sum += Math.abs(readValue(y, x, channel));
          }
        }
        return {channel, score: sum / (height * width)};
      }).sort((a, b) => b.score - a.score).slice(0, 4);
      target.replaceChildren();
      scores.forEach(item => {
        const figure = document.createElement("figure");
        figure.className = "cnn-feature-map-card";
        const canvas = document.createElement("canvas");
        canvas.className = "cnn-feature-map";
        canvas.width = width;
        canvas.height = height;
        canvas.setAttribute("aria-label", stageName + " activation map, channel " + item.channel);
        const context = canvas.getContext("2d");
        const pixels = context.createImageData(width, height);
        let min = Infinity;
        let max = -Infinity;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const value = readValue(y, x, item.channel);
            min = Math.min(min, value);
            max = Math.max(max, value);
          }
        }
        const span = max - min || 1;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const value = readValue(y, x, item.channel);
            const t = Math.max(0, Math.min(1, (value - min) / span));
            const offset = (y * width + x) * 4;
            pixels.data[offset] = Math.round(24 + 225 * t);
            pixels.data[offset + 1] = Math.round(18 + 220 * Math.max(0, 1 - Math.abs(t - .58) * 1.9));
            pixels.data[offset + 2] = Math.round(90 + 165 * (1 - t));
            pixels.data[offset + 3] = 255;
          }
        }
        context.putImageData(pixels, 0, 0);
        const caption = document.createElement("figcaption");
        caption.textContent = "Channel " + item.channel + " · " + height + "×" + width + "×" + channels + " · mean |activation| " + item.score.toFixed(3) + " · " + (isNchw ? "NCHW" : "NHWC");
        figure.append(canvas, caption);
        target.append(figure);
      });
      return scores.length;
    }

    function makeModelCanvas() {
      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 224;
      const context = canvas.getContext("2d", {willReadFrequently: true});
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    }

    function makeInputTensor(source) {
      const pixels = tf.browser.fromPixels(source);
      const resized = tf.image.resizeBilinear(pixels, [224, 224], true);
      return resized.toFloat().div(127.5).sub(1).expandDims(0);
    }

    button.addEventListener("click", async () => {
      if (loading) return;
      loading = true;
      button.disabled = true;
      if (!image.complete || !image.naturalWidth) {
        status.textContent = "The selected image is still loading. Please try again when its preview appears.";
        button.disabled = false;
        loading = false;
        return;
      }
      if (!window.tf || !window.mobilenet) {
        status.textContent = "The optional TensorFlow.js model is unavailable; the real course maps above remain available.";
        button.disabled = false;
        loading = false;
        return;
      }
      status.textContent = modelCache ? "Running MobileNetV1 on the selected image…" : "Loading MobileNetV1 pretrained on ImageNet…";
      let phase = "initializing TensorFlow.js";
      try {
        await window.tf.ready();
        phase = "loading MobileNetV1";
        if (!modelCache) modelCache = await window.mobilenet.load({version: 1, alpha: 1.0});
        const model = modelCache;
        const modelCanvas = makeModelCanvas();
        phase = "classifying the selected image";
        let predictions = [];
        try {
          predictions = await model.classify(modelCanvas, 3);
          prediction.textContent = "Top-3 classifier output: " + predictions.map(item => item.className + " (" + (item.probability * 100).toFixed(1) + "%)").join(" · ");
        } catch (classificationError) {
          prediction.textContent = "The classifier could not label this image, but intermediate maps will still be attempted.";
        }
        live.hidden = false;
        const graph = model.model || model;
        const names = graphNodeNames(graph);
        const stages = [
          {key: "early", label: "early", patterns: [["conv2d_0", "relu6"], ["conv2d_0"]]},
          {key: "middle", label: "middle", patterns: [["conv2d_5_pointwise", "relu6"], ["conv2d_5_pointwise"], ["conv2d_6_pointwise", "relu6"], ["conv2d_6_pointwise"]]},
          {key: "deep", label: "deep", patterns: [["conv2d_13_pointwise", "relu6"], ["conv2d_13_pointwise"], ["conv2d_13", "relu6"], ["conv2d_13"]]}
        ];
        let input = null;
        let rendered = 0;
        try {
          if (!graph || typeof graph.execute !== "function") throw new Error("internal graph unavailable");
          phase = "calculating intermediate activation maps";
          input = makeInputTensor(modelCanvas);
          for (const stage of stages) {
            const nodeName = findNode(names, stage.patterns);
            const target = host.querySelector("#cnn-feature-" + stage.key);
            if (!nodeName || !target) continue;
            const output = graph.execute(input, nodeName);
            const tensor = Array.isArray(output) ? output[0] : output;
            if (tensor) rendered += await renderFeatureMaps(tensor, target, stage.label);
            disposeOutput(output);
          }
        } finally {
          if (input) input.dispose();
        }
        if (rendered) {
          status.textContent = "Loaded MobileNetV1. The live panels show actual intermediate activation tensors; the course conv1 maps remain above for comparison.";
        } else {
          status.textContent = "MobileNet loaded and classified the image, but its internal layer names were unavailable in this browser. The real course conv1 maps remain visible above.";
        }
      } catch (error) {
        live.hidden = false;
        const detail = error && error.message ? String(error.message).replace(/\s+/g, " ").slice(0, 180) : "unknown browser error";
        status.textContent = "The CNN stopped while " + phase + ": " + detail + ". The real course activation maps remain available above.";
        prediction.textContent = "Live model status: retry after checking the browser connection and image format.";
      } finally {
        button.disabled = false;
        loading = false;
      }
    });
  }

  function initCnnArchitectureBuilder() {
    const host=document.getElementById("cnn-architecture-builder"); if(!host)return;
    const v=k=>Number(host.querySelector('[data-cnn="'+k+'"]').value), c=k=>host.querySelector('[data-cnn="'+k+'"]').checked;
    function calculate(){let h=v("ih"),w=v("iw"),ch=v("ic"),total=0,rows=[];[0,1,2].forEach(i=>{const k=v("k"+i),s=v("s"+i),st=v("st"+i),p=v("p"+i),ins=h+'×'+w+'×'+ch,cp=s*s*ch*k+k;total+=cp+(c("bn"+i)?2*k:0);let oh=Math.floor((h-s+2*p)/st)+1,ow=Math.floor((w-s+2*p)/st)+1,desc='Conv '+s+'×'+s+', '+k+' kernels, stride '+st+', padding '+p+(c("bn"+i)?' + BN':'');if(c("pool"+i)){const ps=v("ps"+i),pst=v("pst"+i);oh=Math.floor((oh-ps)/pst)+1;ow=Math.floor((ow-ps)/pst)+1;desc+=' + pool '+ps+'×'+ps+', stride '+pst}rows.push('<tr><td>'+ (i+1)+'</td><td>'+ins+'</td><td>'+desc+'</td><td>'+oh+'×'+ow+'×'+k+'</td><td>'+cp.toLocaleString()+'</td></tr>');h=oh;w=ow;ch=k});host.querySelector('#cnn-results').innerHTML='<h3>Computed CNN architecture</h3><div class="table-scroll"><table class="results-table"><thead><tr><th>Layer</th><th>Input</th><th>Configuration</th><th>Output</th><th>Conv parameters</th></tr></thead><tbody>'+rows.join('')+'</tbody></table></div><p><strong>Final output volume:</strong> '+h+'×'+w+'×'+ch+'</p><p><strong>Total trainable parameters:</strong> '+total.toLocaleString()+' including biases and enabled BN scale/shift.</p>'}
    host.querySelector('#calculate-cnn').addEventListener('click',calculate);host.querySelectorAll('[data-cnn]').forEach(x=>x.addEventListener('change',calculate));calculate();
  }

  function initXorTrainer() {
    const host = document.getElementById("xor-trainer-app");
    const defaults = {w11:4,w12:4,b1:-2,w21:-4,w22:-4,b2:6,v1:4,v2:4,bo:-8.5,epochs:2};
    const examples = [[0,0,0],[0,1,1],[1,0,1],[1,1,0]];
    const fields = [["w11","w₁₁"],["w12","w₁₂"],["b1","b₁"],["w21","w₂₁"],["w22","w₂₂"],["b2","b₂"],["v1","v₁"],["v2","v₂"],["bo","bₒ"],["epochs","Epochs"]];
    host.innerHTML = `<div class="network-diagram" role="img" aria-label="Two inputs connect to two sigmoid hidden neurons, then to one sigmoid output and binary cross-entropy loss"><svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg"><defs><marker id="xor-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#7b8b99"/></marker></defs><g stroke="#9aa8b4" stroke-width="2" marker-end="url(#xor-arrow)"><line x1="120" y1="75" x2="315" y2="75"/><line x1="120" y1="155" x2="315" y2="155"/><line x1="375" y1="75" x2="560" y2="115"/><line x1="375" y1="155" x2="560" y2="115"/><line x1="620" y1="115" x2="760" y2="115"/></g><g fill="#e8f3f2" stroke="#087f75" stroke-width="2"><circle cx="90" cy="75" r="30"/><circle cx="90" cy="155" r="30"/></g><g fill="#eef2fa" stroke="#365a9b" stroke-width="2"><circle cx="345" cy="75" r="30"/><circle cx="345" cy="155" r="30"/></g><g fill="#fff1dc" stroke="#b66a12" stroke-width="2"><circle cx="590" cy="115" r="30"/></g><g fill="#f8e9eb" stroke="#a43a42" stroke-width="2"><rect x="760" y="82" width="130" height="66" rx="12"/></g><g fill="#17202a" text-anchor="middle" font-family="Arial, sans-serif"><text x="90" y="80" font-size="18">x₁</text><text x="90" y="160" font-size="18">x₂</text><text x="345" y="70" font-size="16">h₁</text><text x="345" y="88" font-size="12">σ(z₁)</text><text x="345" y="150" font-size="16">h₂</text><text x="345" y="168" font-size="12">σ(z₂)</text><text x="590" y="110" font-size="16">ŷ</text><text x="590" y="128" font-size="12">σ(zₒ)</text><text x="825" y="110" font-size="16">BCE</text><text x="825" y="130" font-size="12">L(y, ŷ)</text></g><g fill="#5b6673" font-family="Arial, sans-serif" font-size="12"><text x="205" y="68">w₁₁</text><text x="205" y="145">w₂₂</text><text x="205" y="92">w₁₂</text><text x="205" y="174">w₂₁</text><text x="440" y="82">v₁</text><text x="440" y="158">v₂</text></g></svg></div><div class="xor-controls"><div class="xor-parameter-grid">${fields.map(([key,label])=>`<label>${label}<input type="number" step="any" data-xor-param="${key}" value="${defaults[key]}"></label>`).join("")}</div><div class="button-row"><button class="button button-primary" id="run-xor">Run training</button><button class="button button-secondary" id="reset-xor">Reset defaults</button></div></div><div class="equation-list"><div><strong>Hidden neuron 1:</strong> z₁=w₁₁x₁+w₁₂x₂+b₁, &nbsp; h₁=σ(z₁)</div><div><strong>Hidden neuron 2:</strong> z₂=w₂₁x₁+w₂₂x₂+b₂, &nbsp; h₂=σ(z₂)</div><div><strong>Output:</strong> zₒ=v₁h₁+v₂h₂+bₒ, &nbsp; ŷ=σ(zₒ)</div><div><strong>Decision and loss:</strong> class=1 if ŷ≥0.5, otherwise 0; &nbsp; L=−[y ln(ŷ)+(1−y)ln(1−ŷ)]</div></div><div id="xor-results" aria-live="polite"></div>`;
    const connectionLines=host.querySelectorAll("svg line"); connectionLines[2].setAttribute("x2","560"); connectionLines[2].setAttribute("y2","102"); connectionLines[3].setAttribute("x2","560"); connectionLines[3].setAttribute("y2","128"); host.querySelector("svg g").insertAdjacentHTML("afterbegin","<line x1=\"120\" y1=\"75\" x2=\"315\" y2=\"128\"/><line x1=\"120\" y1=\"155\" x2=\"315\" y2=\"102\"/>");
    const readParams = () => Object.fromEntries(fields.map(([key])=>[key,Number(host.querySelector(`[data-xor-param="${key}"]`).value)]));
    const sigmoid = z => 1/(1+Math.exp(-z));
    function forward(p,x1,x2,y) {
      const z1=p.w11*x1+p.w12*x2+p.b1, h1=sigmoid(z1), z2=p.w21*x1+p.w22*x2+p.b2, h2=sigmoid(z2), zo=p.v1*h1+p.v2*h2+p.bo, yhat=sigmoid(zo);
      return {x1,x2,y,z1,h1,z2,h2,zo,yhat,class:yhat>=.5?1:0,loss:-(y*Math.log(yhat)+(1-y)*Math.log(1-yhat))};
    }
    function gradients(p) {
      const g={w11:0,w12:0,b1:0,w21:0,w22:0,b2:0,v1:0,v2:0,bo:0}, perExample=[];
      const rows=examples.map(([x1,x2,y])=>forward(p,x1,x2,y));
      rows.forEach(r=>{const d0=r.yhat-r.y,d1=d0*p.v1*r.h1*(1-r.h1),d2=d0*p.v2*r.h2*(1-r.h2),eg={w11:d1*r.x1,w12:d1*r.x2,b1:d1,w21:d2*r.x1,w22:d2*r.x2,b2:d2,v1:d0*r.h1,v2:d0*r.h2,bo:d0}; perExample.push(eg); Object.keys(g).forEach(k=>g[k]+=eg[k]);});
      Object.keys(g).forEach(k=>g[k]/=examples.length); return {g,rows,perExample};
    }
    function fmt(v){return Number(v).toFixed(4)}
    function render() {
      const p=readParams(), epochs=Math.max(0,Math.round(p.epochs)), initial={...p}, stages=[]; delete initial.epochs;
      stages.push({name:"Initial",p:{...initial},calc:gradients(initial)});
      let current={...initial};
      for(let e=1;e<=epochs;e++){const calc=gradients(current);Object.keys(calc.g).forEach(k=>current[k]-=calc.g[k]);stages.push({name:`After epoch ${e}`,p:{...current},calc:gradients(current)});}
      const final=stages[stages.length-1], rows=final.calc.rows;
      const keys=["w11","w12","b1","w21","w22","b2","v1","v2","bo"], labels={w11:"w₁₁",w12:"w₁₂",b1:"b₁",w21:"w₂₁",w22:"w₂₂",b2:"b₂",v1:"v₁",v2:"v₂",bo:"bₒ"};
      const gradientTable=stages.slice(0,-1).map((s,i)=>keys.map(k=>`<tr><td>${s.name} → ${stages[i+1].name}</td><td>${labels[k]}</td>${s.calc.perExample.map(g=>`<td>${fmt(g[k])}</td>`).join("")}<td>${fmt(s.calc.g[k])}</td><td>${fmt(stages[i+1].p[k])}</td></tr>`).join("")).join("");
      document.getElementById("xor-results").innerHTML=`<h3>Forward-pass results</h3><div class="table-scroll"><table class="results-table"><thead><tr><th>Input</th><th>Target</th><th>z₁</th><th>h₁</th><th>z₂</th><th>h₂</th><th>zₒ</th><th>ŷ</th><th>Class</th><th>BCE</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.x1}${r.x2}</td><td>${r.y}</td><td>${fmt(r.z1)}</td><td>${fmt(r.h1)}</td><td>${fmt(r.z2)}</td><td>${fmt(r.h2)}</td><td>${fmt(r.zo)}</td><td>${fmt(r.yhat)}</td><td>${r.class}</td><td>${fmt(r.loss)}</td></tr>`).join("")}</tbody></table></div><h3>Gradients and parameter updates</h3><div class="table-scroll"><table class="results-table"><thead><tr><th>Update</th><th>Parameter</th><th>g(00)</th><th>g(01)</th><th>g(10)</th><th>g(11)</th><th>Mean gradient</th><th>Updated value</th></tr></thead><tbody>${gradientTable}</tbody></table></div><h3>Full-batch training summary</h3><div class="table-scroll"><table class="results-table"><thead><tr><th>Stage</th><th>Prediction pattern 00 01 10 11</th><th>Mean BCE</th><th>w₁₁</th><th>w₁₂</th><th>b₁</th><th>w₂₁</th><th>w₂₂</th><th>b₂</th><th>v₁</th><th>v₂</th><th>bₒ</th></tr></thead><tbody>${stages.map(s=>{const rr=s.calc.rows;return `<tr><td>${s.name}</td><td>${rr.map(r=>r.class).join(" ")}</td><td>${fmt(rr.reduce((a,r)=>a+r.loss,0)/4)}</td><td>${fmt(s.p.w11)}</td><td>${fmt(s.p.w12)}</td><td>${fmt(s.p.b1)}</td><td>${fmt(s.p.w21)}</td><td>${fmt(s.p.w22)}</td><td>${fmt(s.p.b2)}</td><td>${fmt(s.p.v1)}</td><td>${fmt(s.p.v2)}</td><td>${fmt(s.p.bo)}</td></tr>`}).join("")}</tbody></table></div><details><summary>Final parameter values</summary><p>${Object.keys(final.p).map(k=>`${k}=${fmt(final.p[k])}`).join(" · ")}</p></details>`;
    }
    host.querySelector("#run-xor").addEventListener("click",render);
    host.querySelector("#reset-xor").addEventListener("click",()=>{fields.forEach(([key])=>host.querySelector(`[data-xor-param="${key}"]`).value=defaults[key]);render();});
    render();
  }

  function initQuiz() {
    const host = document.getElementById("quiz");
    let index = 0;
    let score = 0;
    let answered = false;

    function render() {
      const item = data.mcqs[index];
      host.innerHTML = `<div class="quiz-status"><span>Question ${index+1} of ${data.mcqs.length}</span><span>Score ${score}/${data.mcqs.length}</span></div><div class="quiz-question"><h3>${esc(item.q)}</h3><div class="quiz-options">${item.options.map((x,i)=>`<button class="quiz-option" data-option="${i}">${String.fromCharCode(65+i)}. ${esc(x)}</button>`).join("")}</div><p class="quiz-feedback" aria-live="polite"></p><div class="button-row"><button class="button button-secondary" id="quiz-next" ${answered?"":"disabled"}>${index===data.mcqs.length-1?"Restart quiz":"Next question"}</button></div></div>`;
      host.querySelectorAll(".quiz-option").forEach(button => button.addEventListener("click", () => answer(Number(button.dataset.option))));
      host.querySelector("#quiz-next").addEventListener("click", next);
    }

    function answer(choice) {
      if (answered) return;
      answered = true;
      const item = data.mcqs[index];
      if (choice === item.answer) score += 1;
      host.querySelectorAll(".quiz-option").forEach((button,i)=>{
        button.disabled = true;
        if (i === item.answer) button.classList.add("correct");
        else if (i === choice) button.classList.add("incorrect");
      });
      host.querySelector(".quiz-feedback").textContent = `${choice===item.answer?"Correct.":"Not quite."} ${item.why}`;
      host.querySelector("#quiz-next").disabled = false;
      host.querySelector(".quiz-status span:last-child").textContent = `Score ${score}/${data.mcqs.length}`;
    }

    function next() {
      if (index === data.mcqs.length-1) { index=0; score=0; } else index += 1;
      answered = false;
      render();
    }
    render();
  }

  function initTrueFalse() {
    const host = document.getElementById("true-false-quiz");
    const items = data.trueFalse || [];
    if (!host || !items.length) return;
    let index = 0;
    let score = 0;
    let answered = false;

    function render() {
      const item = items[index];
      host.innerHTML = `<div class="quiz-status"><span>Statement ${index+1} of ${items.length}</span><span>Score ${score}/${items.length}</span></div><div class="quiz-question true-false-question"><h3>${esc(item.q)}</h3><div class="true-false-options"><button class="quiz-option" data-answer="true">True</button><button class="quiz-option" data-answer="false">False</button></div><p class="quiz-feedback" aria-live="polite"></p><div class="button-row"><button class="button button-secondary" id="tf-next" disabled>${index===items.length-1?"Restart true or false":"Next statement"}</button></div></div>`;
      host.querySelectorAll(".quiz-option").forEach(button=>button.addEventListener("click",()=>answer(button.dataset.answer==="true")));
      host.querySelector("#tf-next").addEventListener("click",next);
    }

    function answer(choice) {
      if (answered) return;
      answered = true;
      const item = items[index];
      if (choice === item.answer) score += 1;
      host.querySelectorAll(".quiz-option").forEach(button=>{
        const value=button.dataset.answer==="true";
        button.disabled=true;
        if(value===item.answer)button.classList.add("correct");
        else if(value===choice)button.classList.add("incorrect");
      });
      host.querySelector(".quiz-feedback").textContent=`${choice===item.answer?"Correct.":"Not quite."} ${item.why}`;
      host.querySelector("#tf-next").disabled=false;
      host.querySelector(".quiz-status span:last-child").textContent=`Score ${score}/${items.length}`;
    }

    function next() {
      if(index===items.length-1){index=0;score=0;}else index+=1;
      answered=false;
      render();
    }
    render();
  }

  function hashSeed(text) {
    let h = 2166136261;
    for (let i=0;i<text.length;i++) { h ^= text.charCodeAt(i); h = Math.imul(h,16777619); }
    return h >>> 0;
  }
  function randomFactory(seed) {
    let a = hashSeed(seed);
    return function () { a += 0x6D2B79F5; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
  }
  function pick(rng, arr) { return arr[Math.floor(rng()*arr.length)]; }
  function int(rng,min,max) { return Math.floor(rng()*(max-min+1))+min; }

  function initGenerator() {
    const host = document.getElementById("generator");
    const params = new URLSearchParams(location.search);
    const startingSeed = params.get("seed") || String(Math.floor(Date.now()/1000)).slice(-7);
    const startingType = params.get("type") || data.problemTypes[0][0];
    host.innerHTML = `<div class="generator-controls"><label>Problem type<select id="problem-type">${data.problemTypes.map(x=>`<option value="${x[0]}" ${x[0]===startingType?"selected":""}>${esc(x[1])}</option>`).join("")}</select></label><label>Variant seed<input id="problem-seed" value="${esc(startingSeed)}" maxlength="30"></label><button class="button button-primary" id="generate">Generate variant</button></div><div class="problem-output"><div id="problem"></div><div class="button-row"><button class="button button-secondary" id="toggle-solution">Show solution</button><button class="button button-secondary" id="copy-link">Copy variant link</button><button class="button button-secondary" id="new-seed">New seed</button></div><p class="copy-note" id="copy-note" aria-live="polite"></p></div>`;
    host.querySelector("#generate").addEventListener("click", generate);
    host.querySelector("#problem-type").addEventListener("change", generate);
    host.querySelector("#problem-seed").addEventListener("change", generate);
    host.querySelector("#toggle-solution").addEventListener("click", toggleSolution);
    host.querySelector("#new-seed").addEventListener("click", ()=>{ host.querySelector("#problem-seed").value=String(Math.floor(Math.random()*9000000)+1000000); generate(); });
    host.querySelector("#copy-link").addEventListener("click", copyLink);
    generate();

    function generate() {
      const type = host.querySelector("#problem-type").value;
      const seed = host.querySelector("#problem-seed").value.trim() || "441";
      const currentParams = new URLSearchParams(location.search);
      const imageSize = Number(host.querySelector("#image-size")?.value || currentParams.get("imageSize") || 4);
      const kernelSize = Number(host.querySelector("#kernel-size")?.value || currentParams.get("kernelSize") || 3);
      const filterType = host.querySelector("#filter-type")?.value || currentParams.get("filterType") || "";
      const rng = randomFactory(`${ln}:${type}:${seed}`);
      const problem = generateProblem(ln,type,rng,{imageSize,kernelSize,filterType});
      const query = new URLSearchParams({type,seed});
      if (ln===5 && type==="filter") {
        query.set("imageSize",String(imageSize));
        query.set("kernelSize",String(kernelSize));
        query.set("filterType",problem.editor.filterType);
      }
      const sectionHash=location.hash || "#problem-lab";
      history.replaceState(null,"",`${location.pathname}?${query}${sectionHash}`);
      const bankEditor = problem.editor?.kind==="bank" ? bankEditorHTML(problem.editor) : problem.editor?.kind==="logic" ? logicEditorHTML(problem.editor) : "";
      host.querySelector("#problem").innerHTML = `<div class="problem-meta"><span>LN${ln}</span><span>Seed ${esc(seed)}</span><span>${esc(problem.level)}</span></div><h3>${esc(problem.title)}</h3><div class="problem-body"><div class="dynamic-question">${problem.question}</div>${bankEditor}</div><div class="solution" hidden><h4>Worked solution</h4>${problem.solution}</div>`;
      host.querySelector("#toggle-solution").textContent = "Show solution";
      host.querySelector("#copy-note").textContent = "";
      if (problem.editor?.kind==="filter") bindFilterEditor(problem.editor);
      if (problem.editor?.kind==="bank") bindBankEditor(problem.editor);
      if (problem.editor?.kind==="logic") bindLogicEditor(problem.editor, host);
    }
    function bindBankEditor(editor) {
      host.querySelector("#recalculate-bank").addEventListener("click",()=>{
        const values={};
        let valid=true;
        editor.fields.forEach(item=>{
          if(item.type==="matrix"){
            const inputs=[...host.querySelectorAll(`[data-bank-field="${item.id}"] input`)];
            const numbers=inputs.map(input=>input.value.trim()===""?NaN:Number(input.value));
            if(numbers.some(value=>!Number.isFinite(value)))valid=false;
            const columns=item.value[0].length;
            const rows=Array.from({length:item.value.length},(_,row)=>numbers.slice(row*columns,(row+1)*columns));
            values[item.id]=item.unwrap?rows[0]:rows;
          }else if(item.type==="select"){
            values[item.id]=host.querySelector(`[data-bank-field="${item.id}"] select`).value;
          }else{
            const value=Number(host.querySelector(`[data-bank-field="${item.id}"] input`).value);
            if(!Number.isFinite(value))valid=false;
            values[item.id]=value;
          }
        });
        if(!valid){host.querySelector("#manual-status").textContent="Enter a valid value in every input.";return;}
        const rendered=editor.solve(values);
        host.querySelector(".dynamic-question").innerHTML=rendered.question;
        const solution=host.querySelector(".solution");
        solution.innerHTML=`<h4>Worked solution</h4>${rendered.solution}`;
        solution.hidden=false;
        host.querySelector("#toggle-solution").textContent="Hide solution";
        host.querySelector("#manual-status").textContent="Question and solution recalculated from your manual inputs.";
      });
      host.querySelectorAll("[data-bank-field] input, [data-bank-field] select").forEach(input=>input.addEventListener("input",()=>{
        host.querySelector("#manual-status").textContent="Inputs changed. Recalculate to update the question and solution.";
      }));
    }
    function bindFilterEditor(editor) {
      host.querySelector("#image-size").addEventListener("change",generate);
      host.querySelector("#kernel-size").addEventListener("change",generate);
      host.querySelector("#filter-type").addEventListener("change",generate);
      host.querySelector("#recalculate-filter").addEventListener("click",()=>{
        const image = readEditableMatrix("image",editor.image.length);
        const kernel = readEditableMatrix("kernel",editor.kernel.length);
        if (!image || !kernel) {
          host.querySelector("#manual-status").textContent = "Enter a number in every image and kernel cell.";
          return;
        }
        const solution = host.querySelector(".solution");
        solution.innerHTML = `<h4>Worked solution</h4>${filterSolutionHTML(image,kernel)}`;
        solution.hidden = false;
        host.querySelector("#toggle-solution").textContent = "Hide solution";
        host.querySelector("#manual-status").textContent = "Solution recalculated from your manual inputs.";
      });
      host.querySelectorAll(".editable-matrix input").forEach(input=>input.addEventListener("input",()=>{
        host.querySelector("#manual-status").textContent = "Inputs changed. Recalculate to update the solution.";
      }));
    }
    function readEditableMatrix(kind,size) {
      const values = [...host.querySelectorAll(`[data-matrix="${kind}"] input`)].map(input=>input.value.trim()===""?NaN:Number(input.value));
      if (values.length!==size*size || values.some(value=>!Number.isFinite(value))) return null;
      return Array.from({length:size},(_,row)=>values.slice(row*size,(row+1)*size));
    }
    function toggleSolution() {
      const solution = host.querySelector(".solution");
      solution.hidden = !solution.hidden;
      host.querySelector("#toggle-solution").textContent = solution.hidden ? "Show solution" : "Hide solution";
    }
    async function copyLink() {
      try { await navigator.clipboard.writeText(location.href); host.querySelector("#copy-note").textContent="Variant link copied."; }
      catch { host.querySelector("#copy-note").textContent="Copy the current address from your browser."; }
    }
  }

  function generateProblem(lecture,type,rng,options={}) {
    const bankProblem=window.CSBP441_PROBLEM_BANK?.create(type,rng);
    if(bankProblem)return bankProblem;
    if (lecture===1) return generateLN1(type,rng);
    if (lecture===2) return generateLN2(type,rng);
    if (lecture===3) return generateLN3(type,rng);
    if (lecture===4) return generateLN4(type,rng);
    if (lecture===5) return generateLN5(type,rng,options);
    if (lecture===6) return generateLN6(type,rng);
    if (lecture===8) return generateLN8(type,rng);
    if (lecture===11) return generateLN11(type,rng);
    return generateLN7(type,rng);
  }

  function generateLN1(type,rng) {
    const systems=[
      ["campus parking gate","count vehicles that enter","vehicle detection and tracking"],
      ["library entrance","count people without identifying them","person detection and tracking"],
      ["drone crop survey","locate visibly stressed plants","semantic segmentation"],
      ["document scanner","produce a flat readable page","document localization and perspective rectification"]
    ];
    const s=pick(rng,systems);
    if(type==="challenge"){
      const changes=pick(rng,[["strong backlighting","illumination variation"],["the target is partly hidden","occlusion"],["the camera moves to a low angle","viewpoint variation"],["many similar objects surround the target","background clutter"]]);
      return {level:"Concept application",title:"Diagnose a likely failure",question:`<p>A ${esc(s[0])} system must ${esc(s[1])}. During testing, ${esc(changes[0])}.</p><p>Name the dominant vision challenge and propose one data or processing response.</p>`,solution:`<p><strong>Dominant challenge:</strong> ${esc(changes[1])}.</p><p>A valid response is to collect examples under this condition, augment training data to reproduce it, or introduce preprocessing/model logic targeted to the changed appearance. The response must preserve the required output: ${esc(s[1])}.</p>`};
    }
    return {level:"System reasoning",title:"Build a five-stage vision pipeline",question:`<p>Design a pipeline for a <strong>${esc(s[0])}</strong> that must <strong>${esc(s[1])}</strong>. Specify input, preprocessing, main algorithm, postprocessing, and final decision.</p>`,solution:`<ol><li><strong>Input:</strong> camera image or video.</li><li><strong>Preprocessing:</strong> resize and normalize brightness; optionally restrict the region of interest.</li><li><strong>Main algorithm:</strong> ${esc(s[2])}.</li><li><strong>Postprocessing:</strong> remove duplicate/noisy predictions and enforce application constraints.</li><li><strong>Decision:</strong> report or act on the result needed to ${esc(s[1])}.</li></ol>`};
  }

  function generateLN2(type,rng) {
    if(type==="threshold"){
      const T=pick(rng,[60,80,100,120]);
      const image=Array.from({length:4},()=>Array.from({length:4},()=>int(rng,1,15)*10));
      const binary=image.map(row=>row.map(v=>v>=T?1:0));
      const foreground=binary.flat().reduce((a,b)=>a+b,0);
      return {level:"Hand calculation",title:"Threshold a 4 × 4 image",question:`<p>For threshold <strong>T=${T}</strong>, form B using B=1 when I≥T and B=0 otherwise. Count foreground pixels.</p>${matrixHTML(image)}`,solution:`<p>Compare each value independently with ${T}.</p>${matrixHTML(binary)}<p>Foreground count = <strong>${foreground}</strong> of 16 pixels (${fmt(100*foreground/16)}%).</p>`};
    }
    const width=pick(rng,[320,640,800,1024]); const height=pick(rng,[240,480,600,768]); const channels=pick(rng,[1,3]); const bits=pick(rng,[8,16]);
    const bytes=width*height*channels*bits/8;
    return {level:"Numerical",title:"Calculate image storage",question:`<p>An image is ${width} × ${height}, has ${channels} channel${channels>1?"s":""}, and uses ${bits} bits per channel. Find the number of pixels, intensity levels per channel, total bytes, and MiB.</p>`,solution:`<ol><li>Pixels = ${width}×${height} = <strong>${(width*height).toLocaleString()}</strong>.</li><li>Levels/channel = 2<sup>${bits}</sup> = <strong>${(2**bits).toLocaleString()}</strong>.</li><li>Bytes = pixels × channels × bits/8 = <strong>${bytes.toLocaleString()}</strong>.</li><li>MiB = bytes/1,048,576 = <strong>${fmt(bytes/1048576)}</strong>.</li></ol>`};
  }

  function generateLN3(type,rng) {
    if(type==="matrix"){
      const A=Array.from({length:2},()=>Array.from({length:2},()=>int(rng,-4,6)));
      const B=Array.from({length:2},()=>Array.from({length:2},()=>int(rng,-4,6)));
      const C=[[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]];
      return {level:"Hand calculation",title:"Multiply two 2 × 2 matrices",question:`<p>Calculate AB. Show each row-by-column dot product.</p><div>${matrixHTML(A)} <span aria-hidden="true">×</span> ${matrixHTML(B)}</div>`,solution:`<p>Each output entry is one row of A dotted with one column of B.</p>${matrixHTML(C)}`};
    }
    if(type==="transform"){
      const x=int(rng,1,5),y=int(rng,1,5),sx=int(rng,2,4),sy=int(rng,2,4),tx=int(rng,1,6),ty=int(rng,-4,4);
      const tsp=[sx*x+tx,sy*y+ty], stp=[sx*(x+tx),sy*(y+ty)];
      return {level:"Transformation order",title:"Compare scale-then-translate with translate-then-scale",question:`<p>Let P=(${x},${y}), S=diag(${sx},${sy}), and translation t=(${tx},${ty}). Calculate TSP and STP.</p>`,solution:`<ol><li>Scale first: SP=(${sx*x},${sy*y}); then translate, so TSP=(<strong>${tsp.join(",")}</strong>).</li><li>Translate first: TP=(${x+tx},${y+ty}); then scale, so STP=(<strong>${stp.join(",")}</strong>).</li></ol><p>The results differ because scaling after translation also scales the translation displacement.</p>`};
    }
    let a=[int(rng,1,6),int(rng,1,6)], b=[int(rng,-5,6),int(rng,-5,6)]; if(b[0]===0&&b[1]===0)b[1]=1;
    const dot=a[0]*b[0]+a[1]*b[1], na=Math.hypot(...a), nb=Math.hypot(...b), angle=Math.acos(Math.max(-1,Math.min(1,dot/(na*nb))))*180/Math.PI;
    return {level:"Vectors",title:"Dot product and angle",question:`<p>For a=(${a}) and b=(${b}), calculate a·b, ||a||₂, ||b||₂, cos θ, and θ.</p>`,solution:`<ol><li>a·b = ${a[0]}(${b[0]})+${a[1]}(${b[1]}) = <strong>${dot}</strong>.</li><li>||a||₂=${fmt(na)} and ||b||₂=${fmt(nb)}.</li><li>cos θ = ${dot}/(${fmt(na)}×${fmt(nb)}) = <strong>${fmt(dot/(na*nb))}</strong>.</li><li>θ = <strong>${fmt(angle)}°</strong>.</li></ol>`};
  }

  function generateLN4(type,rng) {
    if(type==="intersection"){
      const x=int(rng,1,6), y=int(rng,1,6); const l1=[1,-1,y-x],l2=[1,1,-x-y]; const p=[-l1[2]*l2[1]+l1[1]*l2[2],l1[2]*l2[0]-l1[0]*l2[2],l1[0]*l2[1]-l1[1]*l2[0]];
      return {level:"Homogeneous geometry",title:"Intersect two image lines",question:`<p>Let l₁=(${l1})ᵀ and l₂=(${l2})ᵀ. Calculate p=l₁×l₂, normalize to w=1, and verify both incidence equations.</p>`,solution:`<p>l₁×l₂=(${p})ᵀ. Dividing by w=${p[2]} gives p=(<strong>${fmt(p[0]/p[2])},${fmt(p[1]/p[2])},1</strong>)ᵀ.</p><p>Checks: l₁ᵀp=${x}-${y}+${l1[2]}=0 and l₂ᵀp=${x}+${y}${l2[2]<0?l2[2]:`+${l2[2]}`}=0.</p>`};
    }
    if(type==="depth"){
      const f=pick(rng,[400,600,800]), W=pick(rng,[1,2,3]), z1=pick(rng,[3,4,5]), z2=z1*2;
      return {level:"Projection",title:"Depth and magnification",question:`<p>An object of width ${W} units is front-facing. With focal length f=${f} pixels, find its projected width at Z=${z1} and Z=${z2}. Give the ratio.</p>`,solution:`<p>w=fW/Z. Thus w₁=${f}×${W}/${z1}=<strong>${fmt(f*W/z1)} px</strong>, and w₂=${f}×${W}/${z2}=<strong>${fmt(f*W/z2)} px</strong>. The ratio is <strong>2:1</strong> because the second depth is twice the first.</p>`};
    }
    const f=pick(rng,[2,3,4,500,800]),Z=pick(rng,[2,4,5,8,10]),X=int(rng,1,6)*Z/2,Y=int(rng,1,5)*Z/2;
    return {level:"Pinhole model",title:"Project a 3D point",question:`<p>Using x=fX/Z and y=fY/Z, project P=(${fmt(X)},${fmt(Y)},${Z}) with f=${f}. Then state what happens if all coordinates of P are multiplied by 3.</p>`,solution:`<p>x=${f}×${fmt(X)}/${Z}=<strong>${fmt(f*X/Z)}</strong>, y=${f}×${fmt(Y)}/${Z}=<strong>${fmt(f*Y/Z)}</strong>.</p><p>Multiplying X, Y, and Z by 3 leaves X/Z and Y/Z unchanged, so the image point is unchanged.</p>`};
  }

  function sample(image,r,c,mode){
    const h=image.length,w=image[0].length;
    if(r>=0&&r<h&&c>=0&&c<w)return image[r][c];
    if(mode==="zero")return 0;
    if(mode==="circular")return image[(r%h+h)%h][(c%w+w)%w];
    const reflect=i=>i<0?-i-1:i>=h?2*h-i-1:i;
    const reflectC=i=>i<0?-i-1:i>=w?2*w-i-1:i;
    return image[reflect(r)][reflectC(c)];
  }
  function filterNeighborhood(image,kernel,mode,outputRow=0,outputCol=0){
    const anchor=Math.floor(kernel.length/2);
    const patch=kernel.map((row,r)=>row.map((_,c)=>sample(image,outputRow+r-anchor,outputCol+c-anchor,mode)));
    const response=patch.reduce((sum,row,r)=>sum+row.reduce((rowSum,value,c)=>rowSum+value*kernel[r][c],0),0);
    return {patch,response};
  }
  function filterOutput(image,kernel,mode){
    return image.map((row,r)=>row.map((_,c)=>filterNeighborhood(image,kernel,mode,r,c).response));
  }
  function filterSolutionHTML(image,kernel){
    const modes=["zero","symmetric","circular"];
    const results=modes.map(mode=>[mode,filterNeighborhood(image,kernel,mode),filterOutput(image,kernel,mode)]);
    return `<p>Cross-correlation uses the kernel without flipping it. For this ${kernel.length} × ${kernel.length} kernel, the anchor index is ${Math.floor(kernel.length/2)}. Each output has the same ${image.length} × ${image[0].length} size as the input.</p><div class="padding-results">${results.map(([mode,corner,output])=>`<section><h5>${mode[0].toUpperCase()+mode.slice(1)} padding</h5><div class="padding-case-content"><div><p>Top-left neighborhood:</p>${matrixHTML(corner.patch)}<p>Top-left response = <strong>${fmt(corner.response)}</strong> = output[0,0]</p></div><div class="full-filter-output"><p>Complete output image:</p>${matrixHTML(output)}</div></div></section>`).join("")}</div><p>Interior responses are independent of padding; boundary responses differ because each mode supplies different values outside the image.</p>`;
  }
  function binomialRow(size){
    const row=[1];
    for(let k=1;k<size;k++)row.push(row[k-1]*(size-k)/k);
    return row;
  }
  function makeFilterKernel(name,size){
    if(name==="mean")return Array.from({length:size},()=>Array(size).fill(1/(size*size)));
    if(name==="Gaussian"){
      const row=binomialRow(size),normalizer=row.reduce((sum,value)=>sum+value,0)**2;
      return row.map(y=>row.map(x=>x*y/normalizer));
    }
    const kernel=Array.from({length:size},()=>Array(size).fill(0)),anchor=Math.floor(size/2);
    kernel[anchor][Math.max(0,anchor-1)]=-1;
    kernel[anchor][Math.min(size-1,anchor+1)]=1;
    return kernel;
  }
  function editableMatrixHTML(matrix,kind,label){
    return `<div class="matrix-editor-scroll"><div class="editable-matrix" data-matrix="${kind}" style="--cols:${matrix.length}" role="group" aria-label="${esc(label)}">${matrix.flatMap((row,r)=>row.map((value,c)=>`<input type="number" step="any" value="${inputFmt(value)}" aria-label="${esc(label)} row ${r+1}, column ${c+1}">`)).join("")}</div></div>`;
  }
  function bankEditorHTML(editor){
    return `<div class="manual-editor bank-editor"><div class="manual-editor-heading"><div><h4>Manual problem inputs</h4><p>Edit any value, then recalculate the question and worked solution.</p></div><span class="input-mode">Editable</span></div><div class="bank-field-grid">${editor.fields.map(item=>{
      if(item.type==="matrix")return `<fieldset class="bank-matrix-field" data-bank-field="${esc(item.id)}"><legend>${esc(item.label)}</legend><div class="matrix-editor-scroll"><div class="editable-matrix" style="--cols:${item.value[0].length}">${item.value.flatMap((row,r)=>row.map((value,c)=>`<input type="number" step="any" value="${inputFmt(value)}" aria-label="${esc(item.label)} row ${r+1}, column ${c+1}">`)).join("")}</div></div></fieldset>`;
      if(item.type==="select")return `<label data-bank-field="${esc(item.id)}">${esc(item.label)}<select>${item.options.map(([value,label])=>`<option value="${esc(value)}" ${value===item.value?"selected":""}>${esc(label)}</option>`).join("")}</select></label>`;
      return `<label data-bank-field="${esc(item.id)}">${esc(item.label)}<input type="number" step="${esc(item.step||1)}" value="${inputFmt(item.value)}"></label>`;
    }).join("")}</div><div class="manual-actions"><button class="button button-primary" id="recalculate-bank">Recalculate question and solution</button><p id="manual-status" aria-live="polite">All displayed inputs can be changed manually.</p></div></div>`;
  }
  function filterEditorHTML(image,kernel,name){
    const imageSizes=Array.from({length:7},(_,index)=>index+4);
    const kernelSizes=[3,4,5];
    return `<div class="manual-editor"><div class="manual-editor-heading"><div><h4>Manual filter inputs</h4><p>The seed creates the starting image. Choose a filter or size to rebuild the kernel, or edit any cell directly.</p></div><span class="input-mode">Editable</span></div><div class="dimension-controls"><label>Filter type<select id="filter-type">${filterTypes.map(([value,label])=>`<option value="${value}" ${value===name?"selected":""}>${label}</option>`).join("")}</select></label><label>Image size<select id="image-size">${imageSizes.map(size=>`<option value="${size}" ${size===image.length?"selected":""}>${size} × ${size}</option>`).join("")}</select></label><label>Kernel size<select id="kernel-size">${kernelSizes.map(size=>`<option value="${size}" ${size===kernel.length?"selected":""}>${size} × ${size}</option>`).join("")}</select></label></div><div class="matrix-editor-layout"><fieldset><legend>Image values</legend>${editableMatrixHTML(image,"image","Image")}</fieldset><fieldset><legend>Kernel values</legend>${editableMatrixHTML(kernel,"kernel","Kernel")}</fieldset></div><div class="manual-actions"><button class="button button-primary" id="recalculate-filter">Recalculate solution</button><p id="manual-status" aria-live="polite">Manual edits stay in this browser; the variant link preserves the seed, filter, and dimensions.</p></div></div>`;
  }
  function generateLN5(type,rng,options={}) {
    if(type==="median"){
      const base=int(rng,8,20),outlier=pick(rng,[0,255]), vals=Array.from({length:9},()=>base+int(rng,-2,2));vals[4]=outlier;const sorted=[...vals].sort((a,b)=>a-b),median=sorted[4],mean=vals.reduce((a,b)=>a+b,0)/9;
      return {level:"Robust filtering",title:"Median versus mean with an outlier",question:`<p>Calculate the median and mean of this 3 × 3 neighborhood. Which result better represents the local background?</p>${matrixHTML([vals.slice(0,3),vals.slice(3,6),vals.slice(6,9)])}`,solution:`<p>Sorted values: ${sorted.join(", ")}.</p><p>Median = <strong>${median}</strong>. Mean = ${vals.reduce((a,b)=>a+b,0)}/9 = <strong>${fmt(mean)}</strong>. The median is more representative because the isolated ${outlier} has little effect on the ordered middle value.</p>`};
    }
    if(type==="gradient"){
      const left=int(rng,5,30),right=left+pick(rng,[20,30,40,50]),top=int(rng,5,30),bottom=top+pick(rng,[10,20,30]); const dx=right-left,dy=bottom-top,mag=Math.hypot(dx,dy),threshold=pick(rng,[25,40,50,60]);
      return {level:"Edge calculation",title:"Derivative and gradient magnitude",question:`<p>At one pixel, Dx sees [${left}, ${left}, ${right}] with kernel [−1,0,1]. Dy sees [${top}, ${top}, ${bottom}]ᵀ. Calculate Dx, Dy, and gradient magnitude. Is it an edge for threshold ${threshold}?</p>`,solution:`<p>Dx=−${left}+${right}=<strong>${dx}</strong>. Dy=−${top}+${bottom}=<strong>${dy}</strong>. Magnitude=√(${dx}²+${dy}²)=<strong>${fmt(mag)}</strong>. Therefore it ${mag>=threshold?"is":"is not"} an edge at threshold ${threshold}.</p>`};
    }
    const imageSize=Math.min(10,Math.max(4,Number(options.imageSize)||4));
    const kernelSize=[3,4,5].includes(Number(options.kernelSize))?Number(options.kernelSize):3;
    const image=Array.from({length:imageSize},()=>Array.from({length:imageSize},()=>int(rng,1,24)*10));
    const allowedFilters=filterTypes.map(([value])=>value);
    const name=allowedFilters.includes(options.filterType)?options.filterType:pick(rng,allowedFilters);
    const kernel=makeFilterKernel(name,kernelSize);
    return {level:"Boundary handling",title:`${name[0].toUpperCase()+name.slice(1)} filter with three padding modes`,question:`<p>Apply cross-correlation at the top-left pixel using zero, symmetric, and circular padding. Choose a filter, edit the values or dimensions, then compare the three neighborhoods and outputs.</p>${filterEditorHTML(image,kernel,name)}`,solution:filterSolutionHTML(image,kernel),editor:{kind:"filter",filterType:name,image,kernel}};
  }
  function logicEditorHTML(editor){
    const v=editor.initial;
    return `<div class="logic-editor manual-editor"><div class="manual-editor-heading"><div><h4>Forward-pass controls</h4><p>Choose a gate and input pair. The preset weights and biases are fixed for this exercise.</p></div><span class="input-mode">Fixed network</span></div><div class="logic-selects"><label>Gate<select id="logic-gate"><option ${v.gate==='AND'?'selected':''}>AND</option><option ${v.gate==='OR'?'selected':''}>OR</option><option ${v.gate==='XOR'?'selected':''}>XOR</option></select></label><label>Input pair<select id="logic-input"><option value="00">x₁=0, x₂=0</option><option value="01">x₁=0, x₂=1</option><option value="10">x₁=1, x₂=0</option><option value="11">x₁=1, x₂=1</option></select></label></div><div class="fixed-weights" id="fixed-weights"><strong>Fixed weights and biases for ${esc(v.gate)}</strong><span>Input 1 → hidden: [${v.w1.map(fmt).join(', ')}]</span><span>Input 2 → hidden: [${v.w2.map(fmt).join(', ')}]</span><span>Hidden biases: [${v.b1.map(fmt).join(', ')}]</span><span>Hidden → output: [${v.wo.map(fmt).join(', ')}]</span><span>Output bias: ${fmt(v.bo)}</span></div><div class="manual-actions"><p id="logic-status" aria-live="polite">Choose a gate or input pair to update the diagram.</p></div></div>`;
  }
  function bindLogicEditor(editor, host){
    const recalculate=()=>{const gate=host.querySelector('#logic-gate').value; const p=editor.presets[gate]; const values={gate,input:host.querySelector('#logic-input').value,w1:p.w1,w2:p.w2,b1:p.b1,wo:p.wo,bo:p.bo}; const rendered=editor.solve(values); host.querySelector('.dynamic-question').innerHTML=rendered.question; host.querySelector('.solution').innerHTML=`<h4>Worked solution</h4>${rendered.solution}`; host.querySelector('.solution').hidden=false; host.querySelector('#toggle-solution').textContent='Hide solution'; host.querySelector('#fixed-weights').innerHTML=`<strong>Fixed weights and biases for ${esc(gate)}</strong><span>Input 1 → hidden: [${p.w1.map(fmt).join(', ')}]</span><span>Input 2 → hidden: [${p.w2.map(fmt).join(', ')}]</span><span>Hidden biases: [${p.b1.map(fmt).join(', ')}]</span><span>Hidden → output: [${p.wo.map(fmt).join(', ')}]</span><span>Output bias: ${fmt(p.bo)}</span>`; host.querySelector('#logic-status').textContent='Diagram, weights, and output updated.';};
    host.querySelector('#logic-gate').addEventListener('change',recalculate);
    host.querySelector('#logic-gate').addEventListener('input',recalculate);
    host.querySelector('#logic-input').addEventListener('change',recalculate);
    host.querySelector('#logic-input').addEventListener('input',recalculate);
  }

  function generateLN6(type,rng) {
    if (type==="canny") {
      const low=pick(rng,[30,50,70]);
      const high=pick(rng,[120,150,180]);
      const value=pick(rng,[15,40,60,90,130,170,210]);
      const connected=value>=low && value<high ? pick(rng,[true,false]) : false;
      let classification, decision;
      if(value<low){classification="rejected";decision="It is below the low threshold, so it is rejected.";}
      else if(value>=high){classification="strong";decision="It meets the high threshold, so it starts or belongs to a strong-edge component.";}
      else {classification="weak";decision=connected?"It is weak but connected to a strong component, so hysteresis retains it.":"It is weak and disconnected from strong edges, so hysteresis rejects it.";}
      return {level:"Canny reasoning",title:"Classify a Canny gradient response",question:`<p>Use T<sub>low</sub>=${low} and T<sub>high</sub>=${high}. A non-maximum-suppressed pixel has magnitude ${value}.${classification==="weak"?` It ${connected?"is":"is not"} connected to a strong-edge component.`:""}</p><p>Classify the pixel as rejected, weak, or strong, then state whether it remains in the final Canny map.</p>`,solution:`<p>The pixel is <strong>${classification}</strong>. ${decision}</p>`};
    }
    const gx=pick(rng,[-60,-40,-30,30,40,60]);
    const gy=pick(rng,[-50,-30,20,40,50]);
    const magnitude=Math.hypot(gx,gy);
    const angle=Math.atan2(gy,gx)*180/Math.PI;
    return {level:"Gradient calculation",title:"Gradient magnitude and direction",question:`<p>At one image location, Gx=${gx} and Gy=${gy}. Calculate gradient magnitude and direction using M=sqrt(Gx²+Gy²) and θ=atan2(Gy,Gx). State whether the gradient points along or across the local edge.</p>`,solution:`<p>M=sqrt(${gx}²+${gy}²)=<strong>${fmt(magnitude)}</strong>.</p><p>θ=atan2(${gy},${gx})=<strong>${fmt(angle)} degrees</strong>.</p><p>The gradient points <strong>across</strong> the local edge, toward greatest intensity increase; the visible edge tangent is perpendicular to it.</p>`};
  }

  function generateLN7(type,rng) {
    if(type==="forwardpass") {
      const presets={
        AND:{w1:[1,1,0,0],w2:[1,1,0,0],b1:[-1.5,0,0,0],wo:[12,0,0,0],bo:-4},
        OR:{w1:[1,1,0,0],w2:[1,1,0,0],b1:[-0.5,0,0,0],wo:[12,0,0,0],bo:-4},
        XOR:{w1:[1,1,0,0],w2:[1,1,0,0],b1:[-0.5,-1.5,0,0],wo:[12,-36,0,0],bo:-4}
      };
      const gate=pick(rng,["AND","OR","XOR"]), preset=presets[gate];
      const truth={AND:[0,0,0,1],OR:[0,1,1,1],XOR:[0,1,1,0]}[gate];
      const networkSVG=(v,selected)=>{
        const hiddenY=[75,195,315,435];
        const edge=(x1,y1,x2,y2,label,accent=false,offset=0,dy=0)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent?'#E07A3F':'#9AA9B5'}" stroke-width="2"/><text x="${(x1+x2)/2+offset}" y="${(y1+y2)/2-5+dy}" text-anchor="middle" font-size="11" fill="#17324D">${label}</text>`;
        let edges=''; hiddenY.forEach((y,i)=>{edges+=edge(115,145,320,y,fmt(v.w1[i]),false,-18,[-18,-8,8,18][i]);edges+=edge(115,325,320,y,fmt(v.w2[i]),false,18,[18,8,-8,-18][i]);edges+=edge(390,y,610,235,fmt(v.wo[i]),true,(i-1.5)*14);});
        const chosen=selected||[0,0]; const hidden= v.w1.map((w,j)=>Math.max(0,chosen[0]*w+chosen[1]*v.w2[j]+v.b1[j])); const z=hidden.reduce((sum,h,j)=>sum+h*v.wo[j],v.bo); const p=1/(1+Math.exp(-z)); const activationLabels=hidden.map((value,i)=>`<text x="355" y="${hiddenY[i]+15}" text-anchor="middle" font-size="10" fill="#17324D">a=${fmt(value)}</text>`).join('');
        return `<div class="network-diagram"><svg viewBox="0 0 720 500" role="img" aria-label="Two input neurons connected to four hidden ReLU neurons and one sigmoid output neuron"><text x="115" y="25" text-anchor="middle" font-size="16" font-weight="700" fill="#17324D">Inputs</text><text x="355" y="25" text-anchor="middle" font-size="16" font-weight="700" fill="#17324D">Hidden layer</text><text x="610" y="25" text-anchor="middle" font-size="16" font-weight="700" fill="#17324D">Output</text>${edges}<circle cx="115" cy="145" r="30" fill="#E4F4F0" stroke="#2A9D8F" stroke-width="3"/><text x="115" y="150" text-anchor="middle" font-size="15" font-weight="700" fill="#17324D">x₁=${chosen[0]}</text><circle cx="115" cy="325" r="30" fill="#E4F4F0" stroke="#2A9D8F" stroke-width="3"/><text x="115" y="330" text-anchor="middle" font-size="15" font-weight="700" fill="#17324D">x₂=${chosen[1]}</text>${hiddenY.map((y,i)=>`<circle cx="355" cy="${y}" r="45" fill="#E8F2FB" stroke="#2E75B6" stroke-width="3"/><text x="355" y="${y-15}" text-anchor="middle" font-size="13" font-weight="700" fill="#17324D">h${i+1}</text><text x="355" y="${y-1}" text-anchor="middle" font-size="10" fill="#17324D">ReLU</text><text x="355" y="${y+14}" text-anchor="middle" font-size="10" fill="#17324D">a=${fmt(hidden[i])}</text><text x="355" y="${y+28}" text-anchor="middle" font-size="9" fill="#5B6770">b=${fmt(v.b1[i])}</text>`).join('')}<circle cx="645" cy="235" r="50" fill="#FFF0E8" stroke="#E07A3F" stroke-width="3"/><text x="645" y="218" text-anchor="middle" font-size="14" font-weight="700" fill="#17324D">ŷ=${fmt(p)}</text><text x="645" y="235" text-anchor="middle" font-size="11" fill="#17324D">sigmoid</text><text x="645" y="252" text-anchor="middle" font-size="10" fill="#5B6770">b=${fmt(v.bo)}</text><text x="645" y="305" text-anchor="middle" font-size="13" font-weight="700" fill="#E07A3F">output = ${p>=0.5?1:0}</text></svg></div>`;
      };
      const evaluate=(v)=>{
        const targetTruth={AND:[0,0,0,1],OR:[0,1,1,1],XOR:[0,1,1,0]}[v.gate];
        const rows=[[0,0],[0,1],[1,0],[1,1]].map((x,i)=>{
          const preactivation=v.w1.map((w,j)=>x[0]*w+x[1]*v.w2[j]+v.b1[j]);
          const hidden=preactivation.map(z=>Math.max(0,z));
          const z=hidden.reduce((sum,h,j)=>sum+h*v.wo[j],v.bo);
          const p=1/(1+Math.exp(-z));
          return {x,preactivation,hidden,z,p,pred:p>=0.5?1:0,target:targetTruth[i]};
        });
        const table=rows.map(r=>`<tr><td>[${r.x.join(", ")}]</td><td>[${r.preactivation.map(v=>fmt(v)).join(", ")}]</td><td>[${r.hidden.map(v=>fmt(v)).join(", ")}]</td><td>${fmt(r.z)}</td><td>${fmt(r.p)}</td><td>${r.pred}</td><td>${r.target}</td></tr>`).join("");
        const selected=String(v.input).split('').map(Number);
        return {question:`<p>Use a fixed network with 2 inputs, 4 hidden ReLU neurons, and 1 sigmoid output. The selected gate is <strong>${v.gate}</strong>. Choose one input combination and inspect its forward pass.</p>${networkSVG(v,selected)}<p>Classify the output as 1 when sigmoid(z) ≥ 0.5.</p>`,solution:`<table class="problem-table"><thead><tr><th>Input</th><th>Σ(xw)+b</th><th>Hidden activations</th><th>Output z</th><th>Sigmoid</th><th>Predicted</th><th>Target</th></tr></thead><tbody>${table}</tbody></table><p>The fixed weights and biases produce ${rows.filter(r=>r.pred===r.target).length}/4 correct outputs. The new column shows each hidden neuron's value before ReLU.</p>`};
      };
      const initial={gate,input:"00",w1:preset.w1,w2:preset.w2,b1:preset.b1,wo:preset.wo,bo:preset.bo};
      const fields=[{id:"gate",label:"Gate",type:"select",value:gate,options:[["AND","AND"],["OR","OR"],["XOR","XOR"]]},{id:"input",label:"Input pair",type:"select",value:"00",options:[["00","x₁=0, x₂=0"],["01","x₁=0, x₂=1"],["10","x₁=1, x₂=0"],["11","x₁=1, x₂=1"]]}];
      initial.w1.forEach((v,i)=>fields.push({id:`w1${i}`,label:`Input 1 weight to hidden ${i+1}`,value:v,step:0.1}));
      initial.w2.forEach((v,i)=>fields.push({id:`w2${i}`,label:`Input 2 weight to hidden ${i+1}`,value:v,step:0.1}));
      initial.b1.forEach((v,i)=>fields.push({id:`b1${i}`,label:`Hidden ${i+1} bias`,value:v,step:0.1}));
      initial.wo.forEach((v,i)=>fields.push({id:`wo${i}`,label:`Hidden ${i+1} output weight`,value:v,step:0.1}));
      fields.push({id:"bo",label:"Output bias",value:initial.bo,step:0.1});
      return {level:"Forward pass",title:"Logic-gate forward pass",question: evaluate(initial).question,solution:evaluate(initial).solution,editor:{kind:"logic",initial,presets,fields,solve:(values)=>{const v={gate:values.gate,input:values.input,w1:values.w1,w2:values.w2,b1:values.b1,wo:values.wo,bo:values.bo};return evaluate(v);}}};
    }
    if (type==="parameters") {
      const input=int(rng,16,784), hidden1=int(rng,8,128), hidden2=int(rng,0,96), output=int(rng,2,10);
      const layers=hidden2>0?[input,hidden1,hidden2,output]:[input,hidden1,output];
      const rows=[]; let total=0;
      for(let i=0;i<layers.length-1;i++) {
        const weights=layers[i]*layers[i+1], biases=layers[i+1], subtotal=weights+biases;
        rows.push(`<tr><td>${i+1}</td><td>${layers[i]}</td><td>${layers[i+1]}</td><td>${weights.toLocaleString()}</td><td>${biases.toLocaleString()}</td><td>${subtotal.toLocaleString()}</td></tr>`);
        total+=subtotal;
      }
      const render=(values)=>{
        const edited=[values.input,values.hidden1].concat(values.hidden2>0?[values.hidden2]:[]).concat([values.output]);
        const table=[]; let sum=0;
        for(let i=0;i<edited.length-1;i++){const weights=edited[i]*edited[i+1],biases=edited[i+1],subtotal=weights+biases;table.push(`<tr><td>${i+1}</td><td>${edited[i]}</td><td>${edited[i+1]}</td><td>${weights.toLocaleString()}</td><td>${biases.toLocaleString()}</td><td>${subtotal.toLocaleString()}</td></tr>`);sum+=subtotal;}
        return {question:`<p>For the dense network <strong>${edited.join(" → ")}</strong>, calculate the total number of trainable parameters. Include one bias for every output neuron.</p><p>Use <strong>parameters = inputs × neurons + neurons</strong> for each layer.</p>`,solution:`<p>Layer-by-layer calculation:</p><table class="problem-table"><thead><tr><th>Layer</th><th>Inputs</th><th>Neurons</th><th>Weights</th><th>Biases</th><th>Total</th></tr></thead><tbody>${table.join("")}</tbody></table><p><strong>Total trainable parameters = ${sum.toLocaleString()}</strong>.</p>`};
      };
      return {level:"Hand calculation",title:"Count the trainable parameters",question:`<p>For the dense network <strong>${layers.join(" → ")}</strong>, calculate the total number of trainable parameters. Include one bias for every output neuron.</p><p>Use <strong>parameters = inputs × neurons + neurons</strong> for each layer.</p>`,solution:`<p>Layer-by-layer calculation:</p><table class="problem-table"><thead><tr><th>Layer</th><th>Inputs</th><th>Neurons</th><th>Weights</th><th>Biases</th><th>Total</th></tr></thead><tbody>${rows.join("")}</tbody></table><p><strong>Total trainable parameters = ${total.toLocaleString()}</strong>.</p>`,editor:{kind:"bank",fields:[{id:"input",label:"Input values",value:input,step:1},{id:"hidden1",label:"Hidden layer 1 neurons",value:hidden1,step:1},{id:"hidden2",label:"Hidden layer 2 neurons (0 removes it)",value:hidden2,step:1},{id:"output",label:"Output neurons",value:output,step:1}],solve:render}};
    }
    if (type==="boundary") {
      const initial={w1:int(rng,-20,20)/10,w2:int(rng,-20,20)/10,b:int(rng,-10,10)/10};
      const render=(v)=>{const points=[[0,0],[0,1],[1,0],[1,1]]; const classified=points.map(([x1,x2])=>({x1,x2,z:x1*v.w1+x2*v.w2+v.b,y:x1*v.w1+x2*v.w2+v.b>=0?1:0})); const line=v.w2===0?`<line x1="${v.b>=0?35:195}" y1="25" x2="${v.b>=0?35:195}" y2="205"/>`:`<line x1="35" y1="${195+v.b/v.w2*90}" x2="195" y2="${195+(v.b+v.w1)/v.w2*90}"/>`; const dots=classified.map(p=>`<circle cx="${35+p.x1*160}" cy="${195-p.x2*160}" r="10" fill="${p.y?'#E07A3F':'#2A9D8F'}"/><text x="${35+p.x1*160}" y="${199-p.x2*160}" text-anchor="middle" font-size="9" fill="white">${p.y}</text>`).join(""); const table=classified.map(p=>`<tr><td>(${p.x1}, ${p.x2})</td><td>${fmt(p.z)}</td><td>${p.y}</td></tr>`).join(""); return {question:`<p>Adjust <strong>w₁</strong>, <strong>w₂</strong>, and <strong>b</strong>. The neuron predicts 1 when z=w₁x₁+w₂x₂+b ≥ 0.</p><div class="boundary-visual"><svg viewBox="0 0 230 230" role="img" aria-label="Decision boundary plot"><line x1="35" y1="195" x2="205" y2="195" stroke="#17324D"/><line x1="35" y1="205" x2="35" y2="20" stroke="#17324D"/>${line.replace('<line ','<line stroke="#E07A3F" stroke-width="3" ')}${dots}<text x="115" y="220" text-anchor="middle" font-size="11">x₁</text><text x="15" y="110" text-anchor="middle" font-size="11" transform="rotate(-90 15 110)">x₂</text></svg></div><p>Try to choose weights and bias that reproduce an AND, OR, or another separation.</p>`,solution:`<p>Decision boundary: <strong>${v.w1}x₁ + ${v.w2}x₂ + ${v.b} = 0</strong>.</p><table class="problem-table"><thead><tr><th>Input</th><th>z</th><th>Prediction</th></tr></thead><tbody>${table}</tbody></table>`};};
      return {level:"Visual reasoning",title:"Decision-boundary visualizer",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"w1",label:"Weight w₁",value:initial.w1,step:.1},{id:"w2",label:"Weight w₂",value:initial.w2,step:.1},{id:"b",label:"Bias b",value:initial.b,step:.1}],solve:render}};
    }
    if (type==="weightupdate") {
      const initial={w:int(rng,-10,10)/10,g:int(rng,-10,10)/10,lr:[.01,.1,.5][int(rng,0,2)]};
      const render=(v)=>{const change=v.lr*v.g, next=v.w-change; return {question:`<p>Use gradient descent to update one weight. The current weight is <strong>w=${v.w}</strong>, gradient is <strong>∂L/∂w=${v.g}</strong>, and learning rate is <strong>η=${v.lr}</strong>.</p><p>Formula: <strong>w′=w−η(∂L/∂w)</strong>.</p>`,solution:`<p>Update = η×gradient = ${v.lr}×${v.g}=<strong>${fmt(change)}</strong>.</p><p>New weight: w′=${v.w}−(${fmt(change)})=<strong>${fmt(next)}</strong>.</p><p>A larger learning rate makes a larger step in the direction that reduces the loss.</p>`};};
      return {level:"Optimization",title:"Weight update and learning rate",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"w",label:"Current weight",value:initial.w,step:.1},{id:"g",label:"Gradient",value:initial.g,step:.1},{id:"lr",label:"Learning rate",value:initial.lr,step:.01}],solve:render}};
    }
    if (type==="biaseffect") {
      const initial={w1:1,w2:1,b:-1.5,input:"11"};
      const render=(v)=>{const x=v.input.split("").map(Number),z=x[0]*v.w1+x[1]*v.w2+v.b,y=z>=0?1:0; return {question:`<p>For input <strong>x=[${x.join(", ")}]</strong>, calculate z=w₁x₁+w₂x₂+b. Change only the bias and observe how the prediction changes.</p><p>Prediction rule: 1 when z ≥ 0; otherwise 0.</p>`,solution:`<p>z=(${x[0]})(${v.w1})+(${x[1]})(${v.w2})+(${v.b})=<strong>${fmt(z)}</strong>.</p><p>Prediction = <strong>${y}</strong>. The bias shifts the decision boundary without changing the input weights.</p>`};};
      return {level:"Decision reasoning",title:"Bias-effect interactive problem",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"w1",label:"Weight w₁",value:initial.w1,step:.1},{id:"w2",label:"Weight w₂",value:initial.w2,step:.1},{id:"b",label:"Bias b",value:initial.b,step:.1},{id:"input",label:"Input pair",type:"select",value:initial.input,options:[["00","x₁=0, x₂=0"],["01","x₁=0, x₂=1"],["10","x₁=1, x₂=0"],["11","x₁=1, x₂=1"]]}],solve:render}};
    }
    if (type==="trace") {
      const initial={x1:int(rng,0,2),x2:int(rng,0,2),w1:int(rng,-10,10)/10,w2:int(rng,-10,10)/10,b:int(rng,-10,10)/10,activation:"ReLU"};
      const render=(v)=>{const z=v.x1*v.w1+v.x2*v.w2+v.b;const a={ReLU:Math.max(0,z),Sigmoid:1/(1+Math.exp(-z)),tanh:Math.tanh(z),Step:z>=0?1:0,"Leaky ReLU":z>=0?z:.01*z,Linear:z,Softplus:Math.log1p(Math.exp(z))}[v.activation];const equations={ReLU:"ReLU(z)=max(0,z)",Sigmoid:"σ(z)=1/(1+e^(−z))",tanh:"tanh(z)=(e^z−e^(−z))/(e^z+e^(−z))",Step:"step(z)=1 if z≥0, otherwise 0","Leaky ReLU":"LReLU(z)=max(0.01z,z)",Linear:"f(z)=z",Softplus:"softplus(z)=ln(1+e^z)"};return {question:`<p>Trace this neuron manually. First calculate <strong>z=x₁w₁+x₂w₂+b</strong>, then apply the selected activation.</p><p>x=[${v.x1}, ${v.x2}], w=[${v.w1}, ${v.w2}], b=${v.b}</p><p><strong>${v.activation}:</strong> ${equations[v.activation]}</p>`,solution:`<p>z=(${v.x1})(${v.w1})+(${v.x2})(${v.w2})+(${v.b})=<strong>${fmt(z)}</strong>.</p><p>${equations[v.activation]} gives <strong>${fmt(a)}</strong>.</p>`};};
      return {level:"Forward computation",title:"Trace one neuron manually",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"x1",label:"Input x₁",value:initial.x1,step:.1},{id:"x2",label:"Input x₂",value:initial.x2,step:.1},{id:"w1",label:"Weight w₁",value:initial.w1,step:.1},{id:"w2",label:"Weight w₂",value:initial.w2,step:.1},{id:"b",label:"Bias b",value:initial.b,step:.1},{id:"activation",label:"Activation",type:"select",value:initial.activation,options:[["ReLU","ReLU"],["Sigmoid","Sigmoid"],["tanh","tanh"],["Step","Step"],["Leaky ReLU","Leaky ReLU"],["Linear","Linear"],["Softplus","Softplus"]]}],solve:render}};
    }
    if (type==="confusion4") {
      const matrix=Array.from({length:4},()=>Array.from({length:4},()=>int(rng,0,12))); for(let i=0;i<4;i++)matrix[i][i]+=int(rng,8,20);
      const render=()=>{const total=matrix.flat().reduce((a,b)=>a+b,0);const rows=matrix.map((row,i)=>{const tp=row[i],actual=row.reduce((a,b)=>a+b,0),pred=matrix.reduce((a,r)=>a+r[i],0),precision=tp/pred,recall=tp/actual,f1=2*precision*recall/(precision+recall);return {tp,precision,recall,f1};});const accuracy=matrix.reduce((s,r,i)=>s+r[i],0)/total;const macro=k=>rows.reduce((s,r)=>s+r[k],0)/4;const table=matrix.map((r,i)=>`<tr><th>Class ${i}</th>${r.map(v=>`<td>${v}</td>`).join("")}</tr>`).join("");const metrics=rows.map((r,i)=>`<tr><td>${i}</td><td>${fmt(r.precision)}</td><td>${fmt(r.recall)}</td><td>${fmt(r.f1)}</td></tr>`).join("");return {question:`<p>Rows are true classes and columns are predicted classes. Use these equations:</p><p><strong>Accuracy=ΣTP/N</strong>; <strong>Precision<sub>c</sub>=TP<sub>c</sub>/(TP<sub>c</sub>+FP<sub>c</sub>)</strong>; <strong>Recall<sub>c</sub>=TP<sub>c</sub>/(TP<sub>c</sub>+FN<sub>c</sub>)</strong>; <strong>F1<sub>c</sub>=2PR/(P+R)</strong>.</p><table class="problem-table"><thead><tr><th>True\\Pred</th><th>0</th><th>1</th><th>2</th><th>3</th></tr></thead><tbody>${table}</tbody></table>`,solution:`<p>Accuracy = diagonal total / all samples = <strong>${fmt(accuracy)}</strong>.</p><p>For each class, use Precision=TP/(TP+FP), Recall=TP/(TP+FN), and F1=2×Precision×Recall/(Precision+Recall).</p><table class="problem-table"><thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead><tbody>${metrics}</tbody></table><p>Macro metric = (metric<sub>0</sub>+metric<sub>1</sub>+metric<sub>2</sub>+metric<sub>3</sub>)/4. Macro precision = <strong>${fmt(macro("precision"))}</strong>; macro recall = <strong>${fmt(macro("recall"))}</strong>; macro F1 = <strong>${fmt(macro("f1"))}</strong>.</p>`};};
      return {level:"Classifier evaluation",title:"4×4 confusion matrix metrics",question:render().question,solution:render().solution};
    }
    if (type==="overfit") {
      const train=int(rng,92,99),val=int(rng,62,78),trainLoss=fmt(int(rng,5,15)/100),valLoss=fmt(int(rng,70,140)/100); return {level:"Model diagnosis",title:"Overfitting diagnosis",question:`<p>After training, accuracy is <strong>${train}%</strong> on the training set and <strong>${val}%</strong> on validation. Training loss is <strong>${trainLoss}</strong>, while validation loss is <strong>${valLoss}</strong>.</p><p>Diagnose the model: underfitting, good generalization, or overfitting. Suggest one remedy.</p>`,solution:`<p>This is <strong>overfitting</strong>: training performance is much better than validation performance and validation loss is higher.</p><p>Possible remedies include data augmentation, dropout, L2 regularization, early stopping, or a smaller model.</p>`};
    }
    if (type==="softrank") {
      const scores=[int(rng,-2,5),int(rng,-2,5),int(rng,-2,5)],correct=int(rng,0,2),shift=scores.map(s=>s-Math.max(...scores)),ex=shift.map(Math.exp),sum=ex.reduce((a,b)=>a+b,0),p=ex.map(v=>v/sum),order=p.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).map(x=>x[1]); return {level:"Multiclass output",title:"Softmax ranking problem",question:`<p>Three classes have logits <strong>[${scores.join(", ")}]</strong>. The correct class is <strong>${correct}</strong>. Calculate softmax probabilities, rank the classes, and calculate cross-entropy loss.</p>`,solution:`<p>Softmax probabilities = <strong>[${p.map(fmt).join(", ")}]</strong>.</p><p>Ranking from most to least likely: <strong>${order.join(" > ")}</strong>.</p><p>Cross-entropy = −ln(p<sub>${correct}</sub>) = <strong>${fmt(-Math.log(p[correct]))}</strong>.</p>`};
    }
    if (type==="softmax") {
      const scores=[int(rng,-2,3),int(rng,-2,3),int(rng,-2,3)];
      const correct=int(rng,0,2);
      const shifted=scores.map(value=>value-Math.max(...scores));
      const exponentials=shifted.map(Math.exp);
      const total=exponentials.reduce((sum,value)=>sum+value,0);
      const probabilities=exponentials.map(value=>value/total);
      const loss=-Math.log(probabilities[correct]);
      return {level:"Multiclass output",title:"Softmax and cross-entropy",question:`<p>The logits are [${scores.join(", ")}], and the correct class is ${correct}. Calculate the softmax probabilities and cross-entropy loss.</p>`,solution:`<p>Subtract max=${Math.max(...scores)} to obtain [${shifted.join(", ")}]. The normalized probabilities are [${probabilities.map(fmt).join(", ")}].</p><p>Loss = −log(p<sub>correct</sub>) = −log(${fmt(probabilities[correct])}) = <strong>${fmt(loss)}</strong>.</p>`};
    }
    if (type==="metrics") {
      const tp=int(rng,50,90),fp=int(rng,5,25),fn=int(rng,5,25);
      const precision=tp/(tp+fp),recall=tp/(tp+fn),f1=2*precision*recall/(precision+recall);
      return {level:"Classifier evaluation",title:"Precision, recall, and F1",question:`<p>A binary classifier produces TP=${tp}, FP=${fp}, and FN=${fn}. Calculate precision, recall, and F1.</p>`,solution:`<p>Precision=${tp}/(${tp}+${fp})=<strong>${fmt(precision)}</strong>.</p><p>Recall=${tp}/(${tp}+${fn})=<strong>${fmt(recall)}</strong>.</p><p>F1=2PR/(P+R)=<strong>${fmt(f1)}</strong>.</p>`};
    }
    const x=[int(rng,1,9)/10,int(rng,1,9)/10,int(rng,1,9)/10];
    const w=[int(rng,-10,10)/10,int(rng,-10,10)/10,int(rng,-10,10)/10];
    const b=int(rng,-5,5)/10;
    const z=x.reduce((sum,value,index)=>sum+value*w[index],b);
    const activation=1/(1+Math.exp(-z));
    const biasTerm=b>=0?` + ${b}`:` − ${Math.abs(b)}`;
    return {level:"Neuron calculation",title:"Weighted sum and sigmoid activation",question:`<p>For x=[${x.join(", ")}], w=[${w.join(", ")}], and b=${b}, calculate z=x dot w+b and sigmoid(z).</p>`,solution:`<p>z=${x.map((value,index)=>`(${value})(${w[index]})`).join(" + ")}${biasTerm} = <strong>${fmt(z)}</strong>.</p><p>sigmoid(z)=1/(1+e<sup>−z</sup>)=<strong>${fmt(activation)}</strong>.</p>`};
  }

  function generateLN8(type,rng) {
    const sigmoid = z => 1 / (1 + Math.exp(-z));
    const bce = (y,yhat) => -(y * Math.log(Math.max(1e-12,yhat)) + (1-y) * Math.log(Math.max(1e-12,1-yhat)));

    if (type === "mlp-forward") {
      const initial = {
        x1:int(rng,0,1), x2:int(rng,0,1), y:0,
        w11:int(rng,-12,12)/10, w21:int(rng,-12,12)/10,
        w12:int(rng,-12,12)/10, w22:int(rng,-12,12)/10,
        b1:int(rng,-8,8)/10, b2:int(rng,-8,8)/10,
        v1:int(rng,-12,12)/10, v2:int(rng,-12,12)/10, bo:int(rng,-8,8)/10
      };
      initial.y = initial.x1 ^ initial.x2;
      const render = v => {
        const z1=v.x1*v.w11+v.x2*v.w21+v.b1;
        const z2=v.x1*v.w12+v.x2*v.w22+v.b2;
        const h1=sigmoid(z1), h2=sigmoid(z2);
        const zo=h1*v.v1+h2*v.v2+v.bo, yhat=sigmoid(zo), predicted=yhat>=.5?1:0;
        return {
          question:`<p>For this 2–2–1 sigmoid MLP, calculate <strong>z₁, h₁, z₂, h₂, zᵒ, ŷ, the predicted class, and binary cross-entropy loss</strong>.</p><p>Input x=[${v.x1}, ${v.x2}], target y=${v.y}.</p><table class="results-table"><thead><tr><th>Parameter</th><th>Value</th><th>Meaning</th></tr></thead><tbody><tr><td>w₁₁, w₂₁</td><td>${v.w11}, ${v.w21}</td><td>x₁, x₂ → h₁</td></tr><tr><td>w₁₂, w₂₂</td><td>${v.w12}, ${v.w22}</td><td>x₁, x₂ → h₂</td></tr><tr><td>b₁, b₂</td><td>${v.b1}, ${v.b2}</td><td>hidden biases</td></tr><tr><td>v₁, v₂, bᵒ</td><td>${v.v1}, ${v.v2}, ${v.bo}</td><td>hidden → output and output bias</td></tr></tbody></table><p>Use σ(z)=1/(1+e<sup>−z</sup>), predict class 1 when ŷ≥0.5, and L=−[y ln(ŷ)+(1−y)ln(1−ŷ)].</p>`,
          solution:`<ol><li>Hidden neuron 1: z₁=(${v.x1})(${v.w11})+(${v.x2})(${v.w21})+${v.b1}=<strong>${fmt(z1)}</strong>, so h₁=σ(z₁)=<strong>${fmt(h1)}</strong>.</li><li>Hidden neuron 2: z₂=(${v.x1})(${v.w12})+(${v.x2})(${v.w22})+${v.b2}=<strong>${fmt(z2)}</strong>, so h₂=σ(z₂)=<strong>${fmt(h2)}</strong>.</li><li>Output: zᵒ=(${fmt(h1)})(${v.v1})+(${fmt(h2)})(${v.v2})+${v.bo}=<strong>${fmt(zo)}</strong>; ŷ=σ(zᵒ)=<strong>${fmt(yhat)}</strong>.</li><li>Predicted class = <strong>${predicted}</strong>. BCE loss = −[${v.y} ln(${fmt(yhat)})+(1−${v.y})ln(1−${fmt(yhat)})] = <strong>${fmt(bce(v.y,yhat))}</strong>.</li></ol>`
        };
      };
      return {level:"Forward pass",title:"2–2–1 MLP forward pass",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[
        {id:"x1",label:"Input x₁",value:initial.x1,step:1},{id:"x2",label:"Input x₂",value:initial.x2,step:1},{id:"y",label:"Target y",value:initial.y,step:1},
        {id:"w11",label:"Weight w₁₁",value:initial.w11,step:.1},{id:"w21",label:"Weight w₂₁",value:initial.w21,step:.1},{id:"b1",label:"Hidden bias b₁",value:initial.b1,step:.1},
        {id:"w12",label:"Weight w₁₂",value:initial.w12,step:.1},{id:"w22",label:"Weight w₂₂",value:initial.w22,step:.1},{id:"b2",label:"Hidden bias b₂",value:initial.b2,step:.1},
        {id:"v1",label:"Output weight v₁",value:initial.v1,step:.1},{id:"v2",label:"Output weight v₂",value:initial.v2,step:.1},{id:"bo",label:"Output bias bᵒ",value:initial.bo,step:.1}
      ],solve:render}};
    }

    if (type === "mlp-backprop") {
      const initial = {
        x1:int(rng,0,1), x2:0, y:int(rng,0,1), h1:(2+int(rng,0,6))/10, h2:(2+int(rng,0,6))/10, yhat:(2+int(rng,0,6))/10,
        w11:int(rng,-10,10)/10, w21:int(rng,-10,10)/10, b1:int(rng,-8,8)/10,
        w12:int(rng,-10,10)/10, w22:int(rng,-10,10)/10, b2:int(rng,-8,8)/10,
        v1:int(rng,-10,10)/10, v2:int(rng,-10,10)/10, bo:int(rng,-8,8)/10, eta:pick(rng,[.1,.2,.5])
      };
      initial.x2 = 1 - initial.x1;
      const render = v => {
        const deltaO=v.yhat-v.y;
        const delta1=deltaO*v.v1*v.h1*(1-v.h1), delta2=deltaO*v.v2*v.h2*(1-v.h2);
        const gradients=[
          ["v₁",v.v1,deltaO*v.h1], ["v₂",v.v2,deltaO*v.h2], ["bᵒ",v.bo,deltaO],
          ["w₁₁",v.w11,delta1*v.x1], ["w₂₁",v.w21,delta1*v.x2], ["b₁",v.b1,delta1],
          ["w₁₂",v.w12,delta2*v.x1], ["w₂₂",v.w22,delta2*v.x2], ["b₂",v.b2,delta2]
        ];
        const rows=gradients.map(([name,old,grad])=>`<tr><td>${name}</td><td>${fmt(old)}</td><td>${fmt(grad)}</td><td>${fmt(old-v.eta*grad)}</td></tr>`).join("");
        return {
          question:`<p>Use sigmoid hidden activations h₁=${v.h1}, h₂=${v.h2}, output ŷ=${v.yhat}, target y=${v.y}, and learning rate η=${v.eta}. Calculate the output error, both hidden errors, every parameter gradient, and one gradient-descent update.</p><p>Inputs are x₁=${v.x1}, x₂=${v.x2}. Output weights are v₁=${v.v1}, v₂=${v.v2}; hidden weights and biases are w₁₁=${v.w11}, w₂₁=${v.w21}, b₁=${v.b1}, w₁₂=${v.w12}, w₂₂=${v.w22}, b₂=${v.b2}; output bias bᵒ=${v.bo}.</p><p>Use δᵒ=ŷ−y, δ₁=δᵒv₁h₁(1−h₁), δ₂=δᵒv₂h₂(1−h₂), and θ′=θ−η∂L/∂θ.</p>`,
          solution:`<p>Output error: δᵒ=${fmt(v.yhat)}−${v.y}=<strong>${fmt(deltaO)}</strong>.</p><p>Hidden errors: δ₁=(${fmt(deltaO)})(${v.v1})(${v.h1})(1−${v.h1})=<strong>${fmt(delta1)}</strong>; δ₂=(${fmt(deltaO)})(${v.v2})(${v.h2})(1−${v.h2})=<strong>${fmt(delta2)}</strong>.</p><table class="results-table"><thead><tr><th>Parameter θ</th><th>Old θ</th><th>Gradient ∂L/∂θ</th><th>Updated θ′</th></tr></thead><tbody>${rows}</tbody></table><p>For example, ∂L/∂v₁=δᵒh₁ and ∂L/∂w₁₁=δ₁x₁. A bias gradient equals the corresponding neuron error because the bias input is 1.</p>`
        };
      };
      return {level:"Backpropagation",title:"Backpropagate through a 2–2–1 MLP",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[
        {id:"x1",label:"Input x₁",value:initial.x1,step:1},{id:"x2",label:"Input x₂",value:initial.x2,step:1},{id:"y",label:"Target y",value:initial.y,step:1},
        {id:"h1",label:"Hidden activation h₁",value:initial.h1,step:.1},{id:"h2",label:"Hidden activation h₂",value:initial.h2,step:.1},{id:"yhat",label:"Output ŷ",value:initial.yhat,step:.1},
        {id:"v1",label:"Output weight v₁",value:initial.v1,step:.1},{id:"v2",label:"Output weight v₂",value:initial.v2,step:.1},{id:"bo",label:"Output bias bᵒ",value:initial.bo,step:.1},
        {id:"w11",label:"Weight w₁₁",value:initial.w11,step:.1},{id:"w21",label:"Weight w₂₁",value:initial.w21,step:.1},{id:"b1",label:"Hidden bias b₁",value:initial.b1,step:.1},
        {id:"w12",label:"Weight w₁₂",value:initial.w12,step:.1},{id:"w22",label:"Weight w₂₂",value:initial.w22,step:.1},{id:"b2",label:"Hidden bias b₂",value:initial.b2,step:.1},{id:"eta",label:"Learning rate η",value:initial.eta,step:.1}
      ],solve:render}};
    }

    if (type === "mlp-parameters") {
      const initial={input:int(rng,2,6),hidden1:int(rng,2,6),hidden2:int(rng,0,4),output:int(rng,1,3)};
      const render=v=>{
        const layers=v.hidden2>0?[v.input,v.hidden1,v.hidden2,v.output]:[v.input,v.hidden1,v.output];
        let total=0; const rows=layers.slice(0,-1).map((from,i)=>{const to=layers[i+1],weights=from*to,biases=to,subtotal=weights+biases;total+=subtotal;return `<tr><td>${i+1}</td><td>${from}</td><td>${to}</td><td>${weights}</td><td>${biases}</td><td>${subtotal}</td></tr>`;}).join("");
        return {question:`<p>Count the trainable parameters in the dense MLP architecture <strong>${layers.join(" → ")}</strong>. Include one bias for every neuron in a layer.</p><p>Use parameters per layer = (number of inputs × number of neurons) + number of neurons.</p>`,solution:`<table class="results-table"><thead><tr><th>Layer</th><th>Inputs</th><th>Neurons</th><th>Weights</th><th>Biases</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table><p><strong>Total trainable parameters = ${total}</strong>.</p>`};
      };
      return {level:"Parameter counting",title:"Count parameters in an MLP",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"input",label:"Input neurons",value:initial.input,step:1},{id:"hidden1",label:"Hidden layer 1 neurons",value:initial.hidden1,step:1},{id:"hidden2",label:"Hidden layer 2 neurons (0 removes it)",value:initial.hidden2,step:1},{id:"output",label:"Output neurons",value:initial.output,step:1}],solve:render}};
    }

    if (type === "mlp-xor") {
      const initial={k:pick(rng,[6,8,10]),vOr:10,vAnd:-20,bo:-5};
      const render=v=>{
        const rows=[[0,0],[0,1],[1,0],[1,1]].map(([x1,x2])=>{
          const sum=x1+x2, zOr=v.k*(sum-.5), zAnd=v.k*(sum-1.5), hOr=sigmoid(zOr), hAnd=sigmoid(zAnd), zo=v.vOr*hOr+v.vAnd*hAnd+v.bo, yhat=sigmoid(zo), target=x1^x2;
          return {x1,x2,zOr,zAnd,hOr,hAnd,zo,yhat,target,pred:yhat>=.5?1:0,loss:bce(target,yhat)};
        });
        const table=rows.map(r=>`<tr><td>(${r.x1},${r.x2})</td><td>${fmt(r.zOr)}</td><td>${fmt(r.hOr)}</td><td>${fmt(r.zAnd)}</td><td>${fmt(r.hAnd)}</td><td>${fmt(r.zo)}</td><td>${fmt(r.yhat)}</td><td>${r.pred}</td><td>${r.target}</td></tr>`).join("");
        const andTerm=v.vAnd<0?` − ${Math.abs(v.vAnd)}`:` + ${v.vAnd}`;
        const biasTerm=v.bo<0?` − ${Math.abs(v.bo)}`:` + ${v.bo}`;
        return {question:`<p>This 2–2–1 sigmoid MLP uses one hidden neuron that behaves like OR and one that behaves like AND:</p><p>z<sub>OR</sub>=k(x₁+x₂−0.5), z<sub>AND</sub>=k(x₁+x₂−1.5), h=σ(z), and zᵒ=${v.vOr}h<sub>OR</sub>${andTerm}h<sub>AND</sub>${biasTerm}.</p><p>With k=${v.k}, calculate all four outputs, classify with threshold 0.5, and compare with XOR targets.</p>`,solution:`<table class="results-table"><thead><tr><th>Input</th><th>z<sub>OR</sub></th><th>h<sub>OR</sub></th><th>z<sub>AND</sub></th><th>h<sub>AND</sub></th><th>zᵒ</th><th>ŷ</th><th>Pred.</th><th>XOR target</th></tr></thead><tbody>${table}</tbody></table><p>The network predicts <strong>${rows.filter(r=>r.pred===r.target).length}/4</strong> XOR cases correctly for this variant. The hidden layer makes the non-linearly separable XOR pattern representable.</p>`};
      };
      return {level:"XOR representation",title:"Use a hidden layer to represent XOR",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"k",label:"Hidden scale k",value:initial.k,step:1},{id:"vOr",label:"OR output weight",value:initial.vOr,step:1},{id:"vAnd",label:"AND output weight",value:initial.vAnd,step:1},{id:"bo",label:"Output bias",value:initial.bo,step:1}],solve:render}};
    }

    const initial={w1:int(rng,-10,10)/10,w2:int(rng,-10,10)/10,b:int(rng,-10,10)/10,eta:pick(rng,[.1,.2,.5]),g1w1:int(rng,-8,8)/10,g1w2:int(rng,-8,8)/10,g1b:int(rng,-8,8)/10,g2w1:int(rng,-8,8)/10,g2w2:int(rng,-8,8)/10,g2b:int(rng,-8,8)/10,g3w1:int(rng,-8,8)/10,g3w2:int(rng,-8,8)/10,g3b:int(rng,-8,8)/10};
    const render=v=>{
      const gradients=[[v.g1w1,v.g1w2,v.g1b],[v.g2w1,v.g2w2,v.g2b],[v.g3w1,v.g3w2,v.g3b]];
      const mean=gradients[0].map((_,i)=>gradients.reduce((sum,row)=>sum+row[i],0)/gradients.length);
      const updated=[v.w1- v.eta*mean[0],v.w2- v.eta*mean[1],v.b- v.eta*mean[2]];
      const rows=gradients.map((g,i)=>`<tr><td>${i+1}</td><td>${fmt(g[0])}</td><td>${fmt(g[1])}</td><td>${fmt(g[2])}</td></tr>`).join("");
      return {question:`<p>Three training examples produce gradients for parameters w₁, w₂, and b. Using full-batch gradient descent, calculate the mean gradient and update all three parameters.</p><p>Current θ=[w₁,w₂,b]=[${v.w1}, ${v.w2}, ${v.b}], learning rate η=${v.eta}, and θ′=θ−ηḡ.</p><table class="results-table"><thead><tr><th>Example</th><th>∂L/∂w₁</th><th>∂L/∂w₂</th><th>∂L/∂b</th></tr></thead><tbody>${rows}</tbody></table>`,solution:`<p>Mean gradient ḡ=[(${v.g1w1}+${v.g2w1}+${v.g3w1})/3, (${v.g1w2}+${v.g2w2}+${v.g3w2})/3, (${v.g1b}+${v.g2b}+${v.g3b})/3] = <strong>[${mean.map(fmt).join(", ")}]</strong>.</p><p>θ′=[${v.w1}, ${v.w2}, ${v.b}]−${v.eta}[${mean.map(fmt).join(", ")}] = <strong>[${updated.map(fmt).join(", ")}]</strong>.</p><p>Full-batch training averages the example gradients before taking one shared update.</p>`};
    };
    return {level:"Gradient descent",title:"Average a full-batch gradient",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[
      {id:"w1",label:"Current w₁",value:initial.w1,step:.1},{id:"w2",label:"Current w₂",value:initial.w2,step:.1},{id:"b",label:"Current bias b",value:initial.b,step:.1},{id:"eta",label:"Learning rate η",value:initial.eta,step:.1},
      {id:"g1w1",label:"Example 1 gradient w₁",value:initial.g1w1,step:.1},{id:"g1w2",label:"Example 1 gradient w₂",value:initial.g1w2,step:.1},{id:"g1b",label:"Example 1 gradient b",value:initial.g1b,step:.1},
      {id:"g2w1",label:"Example 2 gradient w₁",value:initial.g2w1,step:.1},{id:"g2w2",label:"Example 2 gradient w₂",value:initial.g2w2,step:.1},{id:"g2b",label:"Example 2 gradient b",value:initial.g2b,step:.1},
      {id:"g3w1",label:"Example 3 gradient w₁",value:initial.g3w1,step:.1},{id:"g3w2",label:"Example 3 gradient w₂",value:initial.g3w2,step:.1},{id:"g3b",label:"Example 3 gradient b",value:initial.g3b,step:.1}
    ],solve:render}};
  }

  function generateLN11(type,rng) {
    const clamp = (value,min=0,max=9) => Math.max(min,Math.min(max,value));
    const matrixSSD = (a,b) => a.reduce((sum,row,r)=>sum+row.reduce((rowSum,value,c)=>rowSum+(value-b[r][c])**2,0),0);
    const matrixDot = (a,b) => a.reduce((sum,row,r)=>sum+row.reduce((rowSum,value,c)=>rowSum+value*b[r][c],0),0);
    const matrixEnergy = a => a.reduce((sum,row)=>sum+row.reduce((rowSum,value)=>rowSum+value*value,0),0);

    if (type === "sift-template") {
      const template=Array.from({length:2},()=>Array.from({length:2},()=>int(rng,1,8)));
      const patchA=template.map(row=>row.map(value=>clamp(value+int(rng,-2,2))));
      const patchB=Array.from({length:2},()=>Array.from({length:2},()=>int(rng,0,9)));
      const patchC=template.map(row=>row.map(value=>clamp(9-value+int(rng,-1,1))));
      const render=v=>{
        const candidates=[["A",v.patchA],["B",v.patchB],["C",v.patchC]];
        const scores=candidates.map(([name,patch])=>({name,score:matrixSSD(v.template,patch)}));
        const best=scores.reduce((a,b)=>b.score<a.score?b:a);
        const table=scores.map(item=>`<tr><td>${item.name}</td><td>${item.score}</td><td>${item.name===best.name?"Best match":""}</td></tr>`).join("");
        return {question:`<p>Use sum of squared differences, <strong>SSD=Σ(t−f)²</strong>, to compare the 2×2 template with each candidate patch. Which candidate is the best match?</p><p><strong>Template</strong>${matrixHTML(v.template)}</p><div><strong>Candidate A</strong>${matrixHTML(v.patchA)} <strong>Candidate B</strong>${matrixHTML(v.patchB)} <strong>Candidate C</strong>${matrixHTML(v.patchC)}</div><p>Template matching selects the candidate with the <strong>smallest</strong> SSD.</p>`,solution:`<table class="results-table"><thead><tr><th>Candidate</th><th>SSD</th><th>Decision</th></tr></thead><tbody>${table}</tbody></table><p>Therefore candidate <strong>${best.name}</strong> is selected because its squared difference is smallest.</p>`};
      };
      return {level:"Template matching",title:"Choose a template match with SSD",question:render({template,patchA,patchB,patchC}).question,solution:render({template,patchA,patchB,patchC}).solution,editor:{kind:"bank",fields:[{id:"template",label:"Template",type:"matrix",value:template},{id:"patchA",label:"Candidate A",type:"matrix",value:patchA},{id:"patchB",label:"Candidate B",type:"matrix",value:patchB},{id:"patchC",label:"Candidate C",type:"matrix",value:patchC}],solve:render}};
    }

    if (type === "sift-ncc") {
      const template=[[int(rng,1,8),int(rng,1,8),int(rng,1,8),int(rng,1,8)]];
      const patchA=[template[0].map(value=>clamp(value*pick(rng,[1,1,2])+int(rng,-1,1),0,12))];
      const patchB=[[int(rng,0,9),int(rng,0,9),int(rng,0,9),int(rng,0,9)]];
      const patchC=[[...template[0]].reverse().map(value=>clamp(value+int(rng,-2,2),0,12))];
      const render=v=>{
        const candidates=[["A",v.patchA],["B",v.patchB],["C",v.patchC]];
        const scores=candidates.map(([name,patch])=>{const dot=matrixDot(v.template,patch), denom=Math.sqrt(matrixEnergy(v.template)*matrixEnergy(patch));return {name,dot,denom,ncc:denom?dot/denom:0};});
        const best=scores.reduce((a,b)=>b.ncc>a.ncc?b:a);
        const table=scores.map(item=>`<tr><td>${item.name}</td><td>${item.dot}</td><td>${fmt(item.denom)}</td><td>${fmt(item.ncc)}</td><td>${item.name===best.name?"Best match":""}</td></tr>`).join("");
        return {question:`<p>Use the energy-normalized cross-correlation from the lecture: <strong>NCC=Σ(ft)/√(Σf²Σt²)</strong>. Calculate NCC for each 1×4 candidate and select the largest value.</p><p><strong>Template</strong>${matrixHTML(v.template)} <strong>A</strong>${matrixHTML(v.patchA)} <strong>B</strong>${matrixHTML(v.patchB)} <strong>C</strong>${matrixHTML(v.patchC)}</p><p>This normalization reduces the effect of overall intensity or energy differences.</p>`,solution:`<table class="results-table"><thead><tr><th>Candidate</th><th>Σft</th><th>√(Σf²Σt²)</th><th>NCC</th><th>Decision</th></tr></thead><tbody>${table}</tbody></table><p>Candidate <strong>${best.name}</strong> has the highest normalized correlation.</p>`};
      };
      return {level:"Normalized matching",title:"Rank candidates with NCC",question:render({template,patchA,patchB,patchC}).question,solution:render({template,patchA,patchB,patchC}).solution,editor:{kind:"bank",fields:[{id:"template",label:"Template",type:"matrix",value:template},{id:"patchA",label:"Candidate A",type:"matrix",value:patchA},{id:"patchB",label:"Candidate B",type:"matrix",value:patchB},{id:"patchC",label:"Candidate C",type:"matrix",value:patchC}],solve:render}};
    }

    if (type === "sift-scale") {
      const sigmaBase=pick(rng,[1,2]), sigmas=[sigmaBase,2*sigmaBase,4*sigmaBase], threshold=pick(rng,[5,6,7]), peak=int(rng,threshold+1,12);
      const neighborhood=()=>Array.from({length:3},()=>Array.from({length:3},()=>int(rng,0,Math.max(1,peak-1))));
      const previous=neighborhood(), current=neighborhood(), next=neighborhood(); current[1][1]=peak;
      const render=v=>{
        const center=v.current[1][1];
        const neighbors=[v.previous,v.current,v.next].flatMap((matrix,scale)=>matrix.flatMap((row,r)=>row.map((value,c)=>({value,scale,r,c})))).filter(item=>!(item.scale===1&&item.r===1&&item.c===1));
        const largestNeighbor=Math.max(...neighbors.map(item=>item.value));
        const detected=center>largestNeighbor && center>v.threshold;
        const scaleTable=[v.previous,v.current,v.next].map((matrix,i)=>`<tr><td>σ=${v.sigmas[i]}</td><td>${matrix[1][1]}</td><td>${matrix.flat().join(", ")}</td></tr>`).join("");
        return {question:`<p>These are absolute normalized Laplacian-of-Gaussian responses at three scales. A blob is detected when the center is greater than all 26 neighbors in the 3×3×3 scale-space neighborhood and greater than threshold T=${v.threshold}.</p><table class="results-table"><thead><tr><th>Scale</th><th>Center response</th><th>3×3 responses, row-major</th></tr></thead><tbody>${scaleTable}</tbody></table><p>Determine whether the center is a blob, and if so report its characteristic scale.</p>`,solution:`<p>The center response is <strong>${center}</strong>; the largest of the other 26 responses is <strong>${largestNeighbor}</strong>. Since ${center}>${largestNeighbor} and ${center}>${v.threshold}, the center ${detected?"is":"is not"} a local scale-space maximum.</p><p>${detected?`Blob detected at σ=<strong>${v.sigmas[1]}</strong>, the scale of the center slice.`:"No blob is detected at the center."}</p>`};
      };
      const initial={previous,current,next,sigmas,threshold};
      return {level:"Scale-space extrema",title:"Detect a blob across scale and space",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"previous",label:"Previous scale responses",type:"matrix",value:previous},{id:"current",label:"Current scale responses",type:"matrix",value:current},{id:"next",label:"Next scale responses",type:"matrix",value:next},{id:"threshold",label:"Detection threshold T",value:threshold,step:1}],solve:v=>render({...v,sigmas})}};
    }

    if (type === "sift-orientation") {
      const base=pick(rng,[0,45,90,135,180,225,270,315]);
      const angles=Array.from({length:12},(_,i)=>((base+int(rng,-18,18)+(i>8?pick(rng,[90,180,270]):0))+3600)%360);
      const render=v=>{
        const bins=Array(8).fill(0), assignments=[];
        v.angles.forEach(raw=>{
          const angle=((Number(raw)%360)+360)%360, position=angle/45, lower=Math.floor(position)%8, fraction=position-Math.floor(position);
          if(Math.abs(fraction-.5)<1e-9){bins[lower]+=.5;bins[(lower+1)%8]+=.5;assignments.push(`${fmt(angle)}° → ${lower*45}°/${((lower+1)%8)*45}° (0.5 each)`);}
          else {const bin=fraction<.5?lower:(lower+1)%8;bins[bin]+=1;assignments.push(`${fmt(angle)}° → ${bin*45}°`);}
        });
        const max=Math.max(...bins), principal=bins.map((value,i)=>value===max?i*45:null).filter(value=>value!==null);
        const table=bins.map((value,i)=>`<tr><td>${i*45}°</td><td>${fmt(value)}</td></tr>`).join("");
        return {question:`<p>Use the simplified SIFT orientation rule: assign each gradient angle to the nearest 45° orientation bin. If an angle is exactly halfway, split its contribution equally. Angles: <strong>${v.angles.join("°, ")}°</strong>.</p><p>Draw the eight-bin histogram and identify the principal orientation.</p>`,solution:`<table class="results-table"><thead><tr><th>Orientation bin</th><th>Count</th></tr></thead><tbody>${table}</tbody></table><p>Assignments: ${assignments.join("; ")}.</p><p>The highest histogram bin is <strong>${principal.join("° and ")}°</strong>, so this is the principal orientation used to normalize the keypoint.</p>`};
      };
      const initial={angles};
      return {level:"Orientation assignment",title:"Find the principal SIFT orientation",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:angles.map((value,i)=>({id:`angle${i}`,label:`Gradient angle ${i+1}`,value,step:.5})),solve:v=>render({angles:Array.from({length:12},(_,i)=>v[`angle${i}`])})}};
    }

    const reference=[int(rng,1,8),int(rng,1,8),int(rng,1,8),int(rng,1,8)].map(value=>value/10);
    const candidateA=[...reference].map(value=>clamp(value+int(rng,-2,2)/10,0,1));
    const candidateB=Array.from({length:4},()=>int(rng,0,10)/10);
    const candidateC=[...reference].reverse().map(value=>clamp(value+int(rng,-2,2)/10,0,1));
    const ratioThreshold=pick(rng,[.7,.75,.8]);
    const render=v=>{
      const ref=v.reference[0], candidates=[["A",v.candidateA[0]],["B",v.candidateB[0]],["C",v.candidateC[0]]];
      const distances=candidates.map(([name,vector])=>({name,vector,distance:Math.sqrt(vector.reduce((sum,value,i)=>sum+(value-ref[i])**2,0))})).sort((a,b)=>a.distance-b.distance);
      const best=distances[0], second=distances[1], ratio=second.distance?best.distance/second.distance:0, accepted=ratio<v.ratioThreshold;
      const table=distances.map(item=>`<tr><td>${item.name}</td><td>[${item.vector.map(value=>fmt(value)).join(", ")}]</td><td>${fmt(item.distance)}</td><td>${item===best?"Nearest":""}</td></tr>`).join("");
      return {question:`<p>Use this simplified four-dimensional SIFT descriptor to stand in for a full descriptor. Compute the Euclidean distance from the reference descriptor to candidates A, B, and C. Then apply the ratio test: accept the best match when <strong>d₁/d₂ &lt; ${v.ratioThreshold}</strong>.</p><p><strong>Reference</strong>${matrixHTML(v.reference)} <strong>A</strong>${matrixHTML(v.candidateA)} <strong>B</strong>${matrixHTML(v.candidateB)} <strong>C</strong>${matrixHTML(v.candidateC)}</p>`,solution:`<table class="results-table"><thead><tr><th>Candidate</th><th>Descriptor</th><th>Euclidean distance</th><th>Rank</th></tr></thead><tbody>${table}</tbody></table><p>Best distance d₁=<strong>${fmt(best.distance)}</strong>; second-best distance d₂=<strong>${fmt(second.distance)}</strong>. Ratio = d₁/d₂ = <strong>${fmt(ratio)}</strong>. The match is <strong>${accepted?"accepted":"rejected"}</strong> because ${fmt(ratio)} ${accepted?"<":"≥"} ${v.ratioThreshold}.</p>`};
    };
    const initial={reference:[reference],candidateA:[candidateA],candidateB:[candidateB],candidateC:[candidateC],ratioThreshold};
    return {level:"Descriptor matching",title:"Match simplified SIFT descriptors",question:render(initial).question,solution:render(initial).solution,editor:{kind:"bank",fields:[{id:"reference",label:"Reference descriptor",type:"matrix",value:initial.reference},{id:"candidateA",label:"Candidate A",type:"matrix",value:initial.candidateA},{id:"candidateB",label:"Candidate B",type:"matrix",value:initial.candidateB},{id:"candidateC",label:"Candidate C",type:"matrix",value:initial.candidateC},{id:"ratioThreshold",label:"Ratio threshold",value:initial.ratioThreshold,step:.05}],solve:render}};
  }
})();
