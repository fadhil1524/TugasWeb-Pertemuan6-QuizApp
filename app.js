// ---------- Data soal (minimal 5, pilihan ganda) ----------
const questions = [
  { text: 'Keyword mana yang membuat variabel tidak bisa di-reassign?', options: ['var', 'let', 'const', 'static'], answer: 2 },
  { text: 'Apa hasil dari [1, 2, 3].map(n => n * 2)?', options: ['[1, 2, 3]', '[2, 4, 6]', '6', '[2, 3, 4]'], answer: 1 },
  { text: 'Method mana yang menyaring item array berdasarkan kondisi?', options: ['map()', 'reduce()', 'filter()', 'find()'], answer: 2 },
  { text: 'Fungsi apa yang aman untuk menyisipkan teks user ke DOM (anti-XSS)?', options: ['innerHTML', 'textContent', 'outerHTML', 'document.write'], answer: 1 },
  { text: 'Pattern apa yang memasang 1 listener di parent untuk banyak child?', options: ['Event bubbling off', 'Event delegation', 'Event capturing only', 'Event emitter'], answer: 1 },
  { text: 'Method apa untuk menyimpan data di LocalStorage?', options: ['localStorage.setItem()', 'localStorage.push()', 'localStorage.add()', 'localStorage.save()'], answer: 0 },
];

const HIGH_SCORE_KEY = 'quiz-high-score';
const app = document.querySelector('#app');
const state = { index: 0, score: 0, answered: false };

// ---------- Helper ----------
const el = (tag, { className, text, attrs = {} } = {}) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // textContent = XSS safe
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
};

const getHighScore = () => {
  try { return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0; } catch { return 0; }
};
const saveHighScore = (score) => {
  try { localStorage.setItem(HIGH_SCORE_KEY, String(score)); } catch { /* storage tidak tersedia */ }
};

const render = (...nodes) => app.replaceChildren(...nodes); // navigasi tanpa reload (SPA)

// ---------- Layar: mulai ----------
function showStart() {
  const start = el('button', { className: 'btn', text: 'Mulai quiz', attrs: { 'data-action': 'start' } });
  render(
    el('h1', { text: 'Quiz JavaScript' }),
    el('p', { text: `${questions.length} pertanyaan pilihan ganda. Skor tertinggi kamu: ${getHighScore()}/${questions.length}` }),
    start
  );
}

// ---------- Layar: soal ----------
function showQuestion() {
  const q = questions[state.index];
  state.answered = false;

  const bar = el('div', { className: 'progress-bar' });
  bar.style.width = `${(state.index / questions.length) * 100}%`;
  const progress = el('div', { className: 'progress' });
  progress.append(bar);

  const meta = el('div', { className: 'meta' });
  meta.append(
    el('span', { text: `Soal ${state.index + 1} dari ${questions.length}` }),
    el('span', { text: `Skor: ${state.score}` })
  );

  const list = el('ul', { className: 'options', attrs: { id: 'options' } });
  q.options.forEach((opt, i) => {
    const li = el('li');
    li.append(el('button', { className: 'option', text: opt, attrs: { 'data-index': i, type: 'button' } }));
    list.append(li);
  });

  render(meta, progress, el('h2', { text: q.text }), list);
}

// ---------- Layar: hasil ----------
function showResult() {
  const prev = getHighScore();
  const isNew = state.score > prev;
  if (isNew) saveHighScore(state.score);

  const restart = el('button', { className: 'btn', text: 'Ulangi quiz', attrs: { 'data-action': 'restart' } });
  const nodes = [
    el('h1', { text: 'Quiz selesai' }),
    el('div', { className: 'score', text: `${state.score}/${questions.length}` }),
    el('p', { text: `Skor tertinggi: ${Math.max(prev, state.score)}/${questions.length}` }),
  ];
  if (isNew) nodes.push(el('span', { className: 'badge', text: 'Rekor baru!' }));
  nodes.push(el('div'), restart);
  render(...nodes);
}

// ---------- Event delegation: 1 listener untuk semua tombol ----------
app.addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]');
  if (action) {
    if (action.dataset.action === 'start' || action.dataset.action === 'restart') {
      Object.assign(state, { index: 0, score: 0 });
      showQuestion();
    } else if (action.dataset.action === 'next') {
      state.index += 1;
      state.index < questions.length ? showQuestion() : showResult();
    }
    return;
  }

  const option = e.target.closest('.option');
  if (!option || state.answered) return;
  state.answered = true;

  const chosen = Number(option.dataset.index);
  const { answer } = questions[state.index];
  const buttons = app.querySelectorAll('.option');

  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === answer) b.classList.add('correct');                 // benar = hijau
    else if (i === chosen) b.classList.add('wrong');              // salah = merah
  });
  if (chosen === answer) state.score += 1;

  const isLast = state.index === questions.length - 1;
  app.append(el('button', {
    className: 'btn', text: isLast ? 'Lihat hasil' : 'Soal berikutnya', attrs: { 'data-action': 'next' },
  }));
});

showStart();
