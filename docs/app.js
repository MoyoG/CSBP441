(function () {
  "use strict";

  const ln = Number(document.body.dataset.ln);
  const data = window.COURSE_DATA[ln];
  const app = document.getElementById("lecture-app");
  if (!data || !app) return;

  const esc = (value) => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const fmt = value => Number.isInteger(value) ? String(value) : Number(value.toFixed(2)).toString();
  const matrixHTML = matrix => `<div class="matrix" role="img" aria-label="Matrix with ${matrix.length} rows"><div style="--cols:${matrix[0].length}">${matrix.map(row => `<div class="matrix-row" style="--cols:${row.length}">${row.map(v => `<span>${fmt(v)}</span>`).join("")}</div>`).join("")}</div></div>`;

  function notebookUrl(file) {
    return `https://colab.research.google.com/github/MoyoG/CSBP441/blob/main/docs/notebooks/${encodeURIComponent(file).replace(/%2F/g, "/")}`;
  }

  app.innerHTML = `
    <header class="site-header">
      <a class="course-mark" href="index.html"><span class="course-code">CSBP441</span><span>Applied Computer Vision</span></a>
      <nav class="top-nav" aria-label="Lecture navigation"><a href="ln${Math.max(1,ln-1)}.html">Previous LN</a><a href="index.html">Course home</a><a href="ln${Math.min(5,ln+1)}.html">Next LN</a></nav>
    </header>
    <div class="lecture-shell">
      <aside class="lecture-sidebar">
        <a class="back-link" href="index.html">Back to course</a>
        <strong>LN${ln} ${esc(data.short)}</strong>
        <nav><a href="#overview">Overview</a><a href="#concepts">Key concepts</a><a href="#hands-on">Hands-on</a><a href="#notebooks">Colab notebooks</a><a href="#knowledge-check">Interactive MCQs</a><a href="#problem-lab">Problem generator</a></nav>
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
          <section class="lecture-section" id="notebooks"><p class="eyebrow">Colab</p><h2>Run the notebooks</h2><div class="notebook-list">${data.notebooks.map(x=>`<div class="notebook-item"><div><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></div><div class="button-row"><a class="button button-primary" target="_blank" rel="noopener" href="${notebookUrl(x[2])}">Open in Colab</a><a class="button button-secondary" href="notebooks/${encodeURIComponent(x[2])}">Download</a></div></div>`).join("")}</div></section>
          <section class="lecture-section" id="knowledge-check"><p class="eyebrow">Self-check</p><h2>Interactive MCQs</h2><div id="quiz"></div></section>
          <section class="lecture-section" id="problem-lab"><p class="eyebrow">Exam practice</p><h2>Parameterized problem generator</h2><p>Use the same seed to reproduce a question. Change the seed for a new numerical variant.</p><div id="generator"></div></section>
        </div>
      </main>
    </div>
    <footer><span>CSBP441 Applied Computer Vision</span><span>LN${ln} ${esc(data.short)}</span></footer>`;

  initQuiz();
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
      const rng = randomFactory(`${ln}:${type}:${seed}`);
      const problem = generateProblem(ln,type,rng);
      const query = new URLSearchParams({type,seed});
      history.replaceState(null,"",`${location.pathname}?${query}#problem-lab`);
      host.querySelector("#problem").innerHTML = `<div class="problem-meta"><span>LN${ln}</span><span>Seed ${esc(seed)}</span><span>${esc(problem.level)}</span></div><h3>${esc(problem.title)}</h3><div class="problem-body">${problem.question}</div><div class="solution" hidden><h4>Worked solution</h4>${problem.solution}</div>`;
      host.querySelector("#toggle-solution").textContent = "Show solution";
      host.querySelector("#copy-note").textContent = "";
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

  function generateProblem(lecture,type,rng) {
    if (lecture===1) return generateLN1(type,rng);
    if (lecture===2) return generateLN2(type,rng);
    if (lecture===3) return generateLN3(type,rng);
    if (lecture===4) return generateLN4(type,rng);
    return generateLN5(type,rng);
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
  function cornerResponse(image,kernel,mode){let sum=0;for(let r=0;r<3;r++)for(let c=0;c<3;c++)sum+=sample(image,r-1,c-1,mode)*kernel[r][c];return sum;}
  function generateLN5(type,rng) {
    if(type==="median"){
      const base=int(rng,8,20),outlier=pick(rng,[0,255]), vals=Array.from({length:9},()=>base+int(rng,-2,2));vals[4]=outlier;const sorted=[...vals].sort((a,b)=>a-b),median=sorted[4],mean=vals.reduce((a,b)=>a+b,0)/9;
      return {level:"Robust filtering",title:"Median versus mean with an outlier",question:`<p>Calculate the median and mean of this 3 × 3 neighborhood. Which result better represents the local background?</p>${matrixHTML([vals.slice(0,3),vals.slice(3,6),vals.slice(6,9)])}`,solution:`<p>Sorted values: ${sorted.join(", ")}.</p><p>Median = <strong>${median}</strong>. Mean = ${vals.reduce((a,b)=>a+b,0)}/9 = <strong>${fmt(mean)}</strong>. The median is more representative because the isolated ${outlier} has little effect on the ordered middle value.</p>`};
    }
    if(type==="gradient"){
      const left=int(rng,5,30),right=left+pick(rng,[20,30,40,50]),top=int(rng,5,30),bottom=top+pick(rng,[10,20,30]); const dx=right-left,dy=bottom-top,mag=Math.hypot(dx,dy),threshold=pick(rng,[25,40,50,60]);
      return {level:"Edge calculation",title:"Derivative and gradient magnitude",question:`<p>At one pixel, Dx sees [${left}, ${left}, ${right}] with kernel [−1,0,1]. Dy sees [${top}, ${top}, ${bottom}]ᵀ. Calculate Dx, Dy, and gradient magnitude. Is it an edge for threshold ${threshold}?</p>`,solution:`<p>Dx=−${left}+${right}=<strong>${dx}</strong>. Dy=−${top}+${bottom}=<strong>${dy}</strong>. Magnitude=√(${dx}²+${dy}²)=<strong>${fmt(mag)}</strong>. Therefore it ${mag>=threshold?"is":"is not"} an edge at threshold ${threshold}.</p>`};
    }
    const start=int(rng,1,5)*10; const image=Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>start+10*(4*r+c)));
    const filters=[
      ["mean",Array.from({length:3},()=>Array(3).fill(1/9))],
      ["Gaussian",[[1/16,2/16,1/16],[2/16,4/16,2/16],[1/16,2/16,1/16]]],
      ["horizontal derivative",[[0,0,0],[-1,0,1],[0,0,0]]]
    ];
    const [name,kernel]=pick(rng,filters); const modes=["zero","symmetric","circular"]; const values=modes.map(m=>cornerResponse(image,kernel,m));
    return {level:"Boundary handling",title:`${name[0].toUpperCase()+name.slice(1)} filter with three padding modes`,question:`<p>Apply the kernel to the top-left pixel using zero, symmetric, and circular padding. Show the three neighborhoods and compare the outputs.</p><p>Image:</p>${matrixHTML(image)}<p>Kernel:</p>${matrixHTML(kernel)}`,solution:`<ol>${modes.map((m,i)=>`<li><strong>${m} padding:</strong> output = ${fmt(values[i])}</li>`).join("")}</ol><p>The values differ because each mode supplies different samples outside the image. Interior pixels use only real image values and therefore do not depend on padding.</p>`};
  }
})();
