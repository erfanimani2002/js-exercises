const state = {
  manifest: {},
  currentPerson: "helia",
  currentExercise: null,
  currentCode: "",
};

const els = {
  personBtns: document.querySelectorAll(".person-btn"),
  exerciseList: document.getElementById("exercise-list"),
  codeView: document.getElementById("code-view"),
  currentTitle: document.getElementById("current-exercise-title"),
  runBtn: document.getElementById("run-btn"),
  outputView: document.getElementById("output-view"),
  clearBtn: document.getElementById("clear-output-btn"),
};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function loadManifest() {
  try {
    const res = await fetch(`manifest.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("manifest.json پیدا نشد");
    state.manifest = await res.json();
  } catch (err) {
    state.manifest = {};
    els.exerciseList.innerHTML = `<p class="hint">خطا در بارگذاری فهرست تمرین‌ها.</p>`;
    console.error(err);
    return;
  }
  renderExerciseList();
}

function renderExerciseList() {
  const list = state.manifest[state.currentPerson] || [];
  els.exerciseList.innerHTML = "";

  if (list.length === 0) {
    els.exerciseList.innerHTML = `<p class="hint">هنوز تمرینی ثبت نشده.</p>`;
    return;
  }

  list.forEach((exId) => {
    const btn = document.createElement("button");
    btn.className = "exercise-item";
    btn.textContent = exId;
    btn.dataset.exId = exId;
    if (state.currentExercise === exId) btn.classList.add("selected");
    btn.addEventListener("click", () => selectExercise(exId));
    els.exerciseList.appendChild(btn);
  });
}

async function selectExercise(exId) {
  state.currentExercise = exId;
  renderExerciseList();

  els.currentTitle.textContent = `${state.currentPerson} / ${exId}`;
  els.codeView.textContent = "در حال بارگذاری کد...";
  els.runBtn.disabled = true;

  try {
    const path = `exercises/${state.currentPerson}/${exId}.js?t=${Date.now()}`;
    const res = await fetch(path);
    if (!res.ok) throw new Error("فایل تمرین پیدا نشد");
    const code = await res.text();
    state.currentCode = code;
    els.codeView.innerHTML = escapeHtml(code);
    els.runBtn.disabled = false;
  } catch (err) {
    els.codeView.textContent = "خطا در بارگذاری فایل تمرین.";
    console.error(err);
  }
}

function switchPerson(person) {
  state.currentPerson = person;
  state.currentExercise = null;
  els.personBtns.forEach((b) => {
    const active = b.dataset.person === person;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", String(active));
  });
  els.currentTitle.textContent = "تمرینی انتخاب نشده";
  els.codeView.textContent = "یک تمرین را از فهرست کناری انتخاب کنید.";
  els.runBtn.disabled = true;
  renderExerciseList();
}

function appendOutput(text, isError = false) {
  const placeholder = els.outputView.querySelector(".output-placeholder");
  if (placeholder) placeholder.remove();
  const line = document.createElement("div");
  line.className = "output-line" + (isError ? " error" : "");
  line.textContent = text;
  els.outputView.appendChild(line);
  els.outputView.scrollTop = els.outputView.scrollHeight;
}

function clearOutput() {
  els.outputView.innerHTML = `<p class="output-placeholder">خروجی console.log اینجا نمایش داده می‌شود.</p>`;
}

function formatArg(arg) {
  if (typeof arg === "string") return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function runCurrentCode() {
  if (!state.currentCode) return;
  clearOutput();

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  win.console.log = (...args) => appendOutput(args.map(formatArg).join(" "));
  win.console.error = (...args) => appendOutput(args.map(formatArg).join(" "), true);
  win.console.warn = (...args) => appendOutput("⚠ " + args.map(formatArg).join(" "));

  try {
    win.eval(state.currentCode);
  } catch (err) {
    appendOutput(String(err), true);
  } finally {
    document.body.removeChild(iframe);
  }
}

els.personBtns.forEach((btn) => {
  btn.addEventListener("click", () => switchPerson(btn.dataset.person));
});

els.runBtn.addEventListener("click", runCurrentCode);
els.clearBtn.addEventListener("click", clearOutput);

loadManifest();
