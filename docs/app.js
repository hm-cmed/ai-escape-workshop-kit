const storageKey = "ai-escape-workshop-progress-v1";
const cards = [...document.querySelectorAll(".mission-card")];
const checks = [...document.querySelectorAll(".mission-check")];
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
  catch { return {}; }
}

function updateProgress() {
  const state = {};
  cards.forEach((card, index) => { state[card.dataset.mission] = checks[index].checked; });
  localStorage.setItem(storageKey, JSON.stringify(state));
  const complete = checks.filter(check => check.checked).length;
  progressBar.style.width = `${complete / checks.length * 100}%`;
  progressText.textContent = `${complete} / ${checks.length} missions complete`;
  if (complete === checks.length) showToast("全ミッション完了！振り返りへ進みましょう");
}

const saved = loadProgress();
cards.forEach((card, index) => {
  checks[index].checked = Boolean(saved[card.dataset.mission]);
  card.querySelector(".mission-summary").addEventListener("click", event => {
    const button = event.currentTarget;
    const detail = card.querySelector(".mission-detail");
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(willOpen));
    detail.hidden = !willOpen;
  });
});
checks.forEach(check => check.addEventListener("change", updateProgress));
updateProgress();

document.querySelectorAll(".copy-button").forEach(button => {
  button.addEventListener("click", async () => {
    const text = document.querySelector(`#${button.dataset.copy}`).textContent;
    try { await navigator.clipboard.writeText(text); showToast("プロンプトをコピーしました"); }
    catch { showToast("コピーできませんでした。文章を選択してください"); }
  });
});

document.querySelector("#resetProgress").addEventListener("click", () => {
  if (!window.confirm("この端末に保存された完了チェックをリセットしますか？")) return;
  checks.forEach(check => { check.checked = false; });
  updateProgress();
  showToast("進捗をリセットしました");
});

document.querySelector("#presenterMode").addEventListener("click", () => {
  document.body.classList.toggle("presenter");
  showToast(document.body.classList.contains("presenter") ? "投影モードを開始しました" : "通常表示に戻りました");
});
document.querySelector("#printGuide").addEventListener("click", () => window.print());

const dialog = document.querySelector("#timerDialog");
const display = document.querySelector("#timerDisplay");
const status = document.querySelector("#timerStatus");
const startPause = document.querySelector("#startPauseTimer");
let duration = 900;
let remaining = duration;
let timerId = null;

function renderTimer() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  display.textContent = `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
  document.title = timerId ? `${display.textContent}｜AI Escape Workshop` : "AI Escape Workshop Kit｜医療教育×生成AI";
}
function stopTimer() { window.clearInterval(timerId); timerId = null; startPause.textContent = "再開"; renderTimer(); }
function startTimer() {
  if (remaining <= 0) remaining = duration;
  timerId = window.setInterval(() => {
    remaining -= 1; renderTimer();
    if (remaining <= 0) { stopTimer(); status.textContent = "時間です。成果物を保存し、振り返りへ進んでください。"; showToast("ミッション終了です"); }
  }, 1000);
  startPause.textContent = "一時停止";
  status.textContent = "残り時間";
}
document.querySelectorAll(".timer-button").forEach(button => button.addEventListener("click", () => {
  duration = Number(button.dataset.minutes) * 60; remaining = duration; stopTimer(); startPause.textContent = "開始"; status.textContent = "準備ができたら開始してください"; renderTimer(); dialog.showModal();
}));
startPause.addEventListener("click", () => timerId ? stopTimer() : startTimer());
document.querySelector("#restartTimer").addEventListener("click", () => { stopTimer(); remaining = duration; startPause.textContent = "開始"; status.textContent = "準備ができたら開始してください"; renderTimer(); });
document.querySelector("#closeTimer").addEventListener("click", () => { stopTimer(); dialog.close(); });
dialog.addEventListener("close", stopTimer);

const sampleVideos = [...document.querySelectorAll(".sample-video")];
document.querySelectorAll(".video-play-button").forEach(button => {
  const video = document.querySelector(`#${button.dataset.videoTarget}`);
  if (!video) return;
  const frame = button.closest(".video-frame");
  button.addEventListener("click", async () => {
    sampleVideos.forEach(other => { if (other !== video) other.pause(); });
    try { await video.play(); }
    catch { window.open(video.querySelector("source").src, "_blank", "noopener"); }
  });
  video.addEventListener("playing", () => frame.classList.add("is-playing"));
  video.addEventListener("pause", () => frame.classList.remove("is-playing"));
  video.addEventListener("ended", () => frame.classList.remove("is-playing"));
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

