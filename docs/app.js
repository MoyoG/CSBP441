(function () {
  "use strict";

  const ln = Number(document.body.dataset.ln);
  const data = window.COURSE_DATA[ln];
  const app = document.getElementById("lecture-app");
  if (!data || !app) return;

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
      <nav class="top-nav" aria-label="Lecture navigation"><a href="ln${Math.max(1,ln-1)}.html">Previous LN</a><a href="index.html">Course home</a><a href="ln${Math.min(Object.keys(window.COURSE_DATA).length,ln+1)}.html">Next LN</a></nav>
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
          ${data.materials ? `<section class="lecture-section" id="materials"><p class="eyebrow">In-class lab</p><h2>Calculate the complete Canny pipeline</h2><div class="notebook-list">${data.materials.map(x=>`<div class="notebook-item"><div><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></div><div class="button-row"><a class="button button-primary" href="${esc(x[2])}" download>Download worksheet</a></div></div>`).join("")}</div></section>` : ""}
          <section class="lecture-section" id="notebooks"><p class="eyebrow">Colab</p><h2>Run the notebooks</h2><div class="notebook-list">${data.notebooks.map(x=>`<div class="notebook-item"><div><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></div><div class="button-row"><a class="button button-primary" target="_blank" rel="noopener" href="${notebookUrl(x[2])}">Open in Colab</a><a class="button button-secondary" href="notebooks/${encodeURIComponent(x[2])}">Download</a></div></div>`).join("")}</div></section>
          <section class="lecture-section" id="knowledge-check"><p class="eyebrow">Self-check</p><h2>Interactive MCQs</h2><p>Answer all ${data.mcqs.length} multiple-choice questions for this lecture note. Feedback explains the best answer after every question.</p><div id="quiz"></div></section>
          <section class="lecture-section" id="true-false"><p class="eyebrow">Concept check</p><h2>Interactive True or False</h2><p>Answer all ${(data.trueFalse || []).length} statements for this lecture note. Feedback explains why each statement is true or false.</p><div id="true-false-quiz"></div></section>
          <section class="lecture-section" id="problem-lab"><p class="eyebrow">Exam practice</p><h2>Parameterized problem generator</h2><p>A seed creates reproducible starting values. Edit the displayed inputs, then recalculate the worked solution.</p>${data.problemBankLink ? `<p><a class="button button-secondary" href="${esc(data.problemBankLink)}">Open the 20-question LN6 problem bank</a></p>` : ""}<div id="generator"></div></section>
          ${data.takeaways ? `<section class="lecture-section" id="takeaways"><p class="eyebrow">LN${ln} recap</p><h2>Summary and takeaways</h2><p class="takeaway-summary">${esc(data.recap || data.summary)}</p><ol class="takeaway-list">${data.takeaways.map(item=>`<li>${esc(item)}</li>`).join("")}</ol></section>` : ""}
        </div>
      </main>
    </div>
    <footer><span>CSBP441 Applied Computer Vision</span><span>LN${ln} ${esc(data.short)}</span></footer>`;

  initQuiz();
  initTrueFalse();
  initGenerator();

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
      if (problem.editor?.kind==="logic") bindLogicEditor(problem.editor);
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
    return `<div class="logic-editor manual-editor"><div class="manual-editor-heading"><div><h4>Forward-pass controls</h4><p>Choose a gate and input pair, then adjust the connection weights or biases.</p></div><span class="input-mode">Editable</span></div><div class="logic-selects"><label>Gate<select id="logic-gate"><option>AND</option><option>OR</option><option>XOR</option></select></label><label>Input pair<select id="logic-input"><option value="00">x₁=0, x₂=0</option><option value="01">x₁=0, x₂=1</option><option value="10">x₁=1, x₂=0</option><option value="11">x₁=1, x₂=1</option></select></label></div><div class="logic-parameter-groups"><fieldset><legend>Input weights</legend><div class="logic-grid"><span></span><strong>h1</strong><strong>h2</strong><strong>h3</strong><strong>h4</strong><span>x₁</span>${v.w1.map((x,i)=>`<input data-logic="w1${i}" type="number" step="0.1" value="${inputFmt(x)}">`).join('')}<span>x₂</span>${v.w2.map((x,i)=>`<input data-logic="w2${i}" type="number" step="0.1" value="${inputFmt(x)}">`).join('')}</div></fieldset><fieldset><legend>Biases and output weights</legend><div class="logic-grid"><span></span><strong>h1</strong><strong>h2</strong><strong>h3</strong><strong>h4</strong><span>Bias b</span>${v.b1.map((x,i)=>`<input data-logic="b1${i}" type="number" step="0.1" value="${inputFmt(x)}">`).join('')}<span>To output</span>${v.wo.map((x,i)=>`<input data-logic="wo${i}" type="number" step="0.1" value="${inputFmt(x)}">`).join('')}<span>Output bias</span><input data-logic="bo" type="number" step="0.1" value="${inputFmt(v.bo)}"><span></span><span></span><span></span><span></span></div></fieldset></div><div class="manual-actions"><button class="button button-primary" id="recalculate-logic">Recalculate forward pass</button><p id="logic-status" aria-live="polite">Preset weights are loaded. You can edit any value.</p></div></div>`;
  }
  function bindLogicEditor(editor){
    const setValue=(id)=>Number(host.querySelector(`[data-logic="${id}"]`).value);
    const loadPreset=(gate)=>{const p=editor.presets[gate]; p.w1.forEach((x,i)=>host.querySelector(`[data-logic="w1${i}"]`).value=x); p.w2.forEach((x,i)=>host.querySelector(`[data-logic="w2${i}"]`).value=x); p.b1.forEach((x,i)=>host.querySelector(`[data-logic="b1${i}"]`).value=x); p.wo.forEach((x,i)=>host.querySelector(`[data-logic="wo${i}"]`).value=x); host.querySelector('[data-logic="bo"]').value=p.bo;};
    const recalculate=()=>{const values={gate:host.querySelector('#logic-gate').value,input:host.querySelector('#logic-input').value,w1:[0,1,2,3].map(i=>setValue(`w1${i}`)),w2:[0,1,2,3].map(i=>setValue(`w2${i}`)),b1:[0,1,2,3].map(i=>setValue(`b1${i}`)),wo:[0,1,2,3].map(i=>setValue(`wo${i}`)),bo:setValue('bo')}; if(Object.values(values).some(v=>Array.isArray(v)?v.some(x=>!Number.isFinite(x)):typeof v==='number'&&!Number.isFinite(v))){host.querySelector('#logic-status').textContent='Enter a valid number in every field.';return;} const rendered=editor.solve(values); host.querySelector('.dynamic-question').innerHTML=rendered.question; host.querySelector('.solution').innerHTML=`<h4>Worked solution</h4>${rendered.solution}`; host.querySelector('.solution').hidden=false; host.querySelector('#toggle-solution').textContent='Hide solution'; host.querySelector('#logic-status').textContent='Forward pass recalculated from your inputs.';};
    host.querySelector('#recalculate-logic').addEventListener('click',recalculate);
    host.querySelector('#logic-gate').addEventListener('change',()=>{loadPreset(host.querySelector('#logic-gate').value); recalculate();});
    host.querySelector('#logic-input').addEventListener('change',recalculate);
    host.querySelectorAll('[data-logic]').forEach(x=>x.addEventListener('input',()=>{host.querySelector('#logic-status').textContent='Inputs changed. Recalculate to update the diagram.';}));
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
        const hiddenY=[70,155,240,325];
        const edge=(x1,y1,x2,y2,label,accent=false)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent?'#E07A3F':'#9AA9B5'}" stroke-width="2"/><text x="${(x1+x2)/2}" y="${(y1+y2)/2-5}" text-anchor="middle" font-size="12" fill="#17324D">${label}</text>`;
        let edges=''; hiddenY.forEach((y,i)=>{edges+=edge(115,145,320,y,fmt(v.w1[i]));edges+=edge(115,325,320,y,fmt(v.w2[i]));edges+=edge(390,y,610,195,fmt(v.wo[i]),true);});
        const chosen=selected||[0,0]; const hidden= v.w1.map((w,j)=>Math.max(0,chosen[0]*w+chosen[1]*v.w2[j]+v.b1[j])); const z=hidden.reduce((sum,h,j)=>sum+h*v.wo[j],v.bo); const p=1/(1+Math.exp(-z));
        return `<div class="network-diagram"><svg viewBox="0 0 720 400" role="img" aria-label="Two input neurons connected to four hidden ReLU neurons and one sigmoid output neuron"><text x="115" y="25" text-anchor="middle" font-size="16" font-weight="700" fill="#17324D">Inputs</text><text x="355" y="25" text-anchor="middle" font-size="16" font-weight="700" fill="#17324D">Hidden layer</text><text x="610" y="25" text-anchor="middle" font-size="16" font-weight="700" fill="#17324D">Output</text>${edges}<circle cx="115" cy="145" r="30" fill="#E4F4F0" stroke="#2A9D8F" stroke-width="3"/><text x="115" y="150" text-anchor="middle" font-size="15" font-weight="700" fill="#17324D">x₁=${chosen[0]}</text><circle cx="115" cy="325" r="30" fill="#E4F4F0" stroke="#2A9D8F" stroke-width="3"/><text x="115" y="330" text-anchor="middle" font-size="15" font-weight="700" fill="#17324D">x₂=${chosen[1]}</text>${hiddenY.map((y,i)=>`<circle cx="355" cy="${y}" r="35" fill="#E8F2FB" stroke="#2E75B6" stroke-width="3"/><text x="355" y="${y-7}" text-anchor="middle" font-size="14" font-weight="700" fill="#17324D">h${i+1}</text><text x="355" y="${y+7}" text-anchor="middle" font-size="11" fill="#17324D">ReLU</text><text x="355" y="${y+21}" text-anchor="middle" font-size="10" fill="#5B6770">b=${fmt(v.b1[i])}</text>`).join('')}<circle cx="645" cy="195" r="45" fill="#FFF0E8" stroke="#E07A3F" stroke-width="3"/><text x="645" y="184" text-anchor="middle" font-size="14" font-weight="700" fill="#17324D">ŷ=${fmt(p)}</text><text x="645" y="201" text-anchor="middle" font-size="11" fill="#17324D">sigmoid</text><text x="645" y="216" text-anchor="middle" font-size="10" fill="#5B6770">b=${fmt(v.bo)}</text><text x="645" y="382" text-anchor="middle" font-size="13" font-weight="700" fill="#E07A3F">output = ${p>=0.5?1:0}</text></svg></div>`;
      };
      const evaluate=(v)=>{
        const targetTruth={AND:[0,0,0,1],OR:[0,1,1,1],XOR:[0,1,1,0]}[v.gate];
        const rows=[[0,0],[0,1],[1,0],[1,1]].map((x,i)=>{
          const hidden=v.w1.map((w,j)=>Math.max(0,x[0]*w+x[1]*v.w2[j]+v.b1[j]));
          const z=hidden.reduce((sum,h,j)=>sum+h*v.wo[j],v.bo);
          const p=1/(1+Math.exp(-z));
          return {x,hidden,z,p,pred:p>=0.5?1:0,target:targetTruth[i]};
        });
        const table=rows.map(r=>`<tr><td>[${r.x.join(", ")}]</td><td>[${r.hidden.map(v=>fmt(v)).join(", ")}]</td><td>${fmt(r.z)}</td><td>${fmt(r.p)}</td><td>${r.pred}</td><td>${r.target}</td></tr>`).join("");
        const selected=String(v.input).split('').map(Number);
        return {question:`<p>Use a fixed network with 2 inputs, 4 hidden ReLU neurons, and 1 sigmoid output. The selected gate is <strong>${v.gate}</strong>. Choose one input combination and inspect its forward pass.</p>${networkSVG(v,selected)}<p>Classify the output as 1 when sigmoid(z) ≥ 0.5.</p>`,solution:`<table class="problem-table"><thead><tr><th>Input</th><th>Hidden activations</th><th>Output z</th><th>Sigmoid</th><th>Predicted</th><th>Target</th></tr></thead><tbody>${table}</tbody></table><p>The editable weights and biases produce ${rows.filter(r=>r.pred===r.target).length}/4 correct outputs. Change one weight or bias, recalculate, and observe which input combination changes first.</p>`};
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
})();
