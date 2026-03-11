/* ============================================
   GIÁO TRÌNH SKETCHUP - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initReadingProgress();
  initAnimations();
  initNotes();
});

/* ── Sidebar Toggle ── */
function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
}

/* ── Reading Progress Bar ── */
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  });
}

/* ── Scroll Animations ── */
function initAnimations() {
  const elements = document.querySelectorAll('.animate-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

/* ── Notes Feature ── */
function initNotes() {
  const chapterContent = document.querySelector('.chapter-content');
  if (!chapterContent) return;

  // Derive a unique storage key from the page filename
  const pageKey = 'notes_' + location.pathname.split('/').pop().replace('.html', '');

  // Build section HTML
  const section = document.createElement('div');
  section.className = 'notes-section';
  section.innerHTML = `
    <div class="notes-section__header">
      <div class="notes-section__icon">📝</div>
      <div class="notes-section__title">Ghi chú</div>
      <div class="notes-section__count" id="notes-count"></div>
    </div>
    <div class="notes-form">
      <textarea class="notes-form__textarea" id="note-input"
        placeholder="Viết ghi chú của bạn tại đây..." rows="2"></textarea>
      <button class="notes-form__btn" id="note-add-btn">+ Thêm</button>
    </div>
    <div class="notes-list" id="notes-list"></div>
  `;

  // Insert after chapter-content (before chapter-nav)
  chapterContent.after(section);

  const input = document.getElementById('note-input');
  const addBtn = document.getElementById('note-add-btn');
  const listEl = document.getElementById('notes-list');
  const countEl = document.getElementById('notes-count');

  function getNotes() {
    try {
      return JSON.parse(localStorage.getItem(pageKey)) || [];
    } catch { return []; }
  }

  function saveNotes(notes) {
    localStorage.setItem(pageKey, JSON.stringify(notes));
  }

  function formatTime(iso) {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function renderNotes() {
    const notes = getNotes();
    countEl.textContent = notes.length ? notes.length + ' ghi chú' : '';

    if (!notes.length) {
      listEl.innerHTML = '<div class="notes-empty">Chưa có ghi chú nào. Hãy thêm ghi chú đầu tiên!</div>';
      return;
    }

    listEl.innerHTML = notes.map((n, i) => `
      <div class="note-card">
        <div class="note-card__time">🕐 ${formatTime(n.time)}</div>
        <div class="note-card__text">${escapeHtml(n.text)}</div>
        <button class="note-card__delete" data-index="${i}" title="Xóa ghi chú">✕</button>
      </div>
    `).reverse().join('');

    // Attach delete handlers
    listEl.querySelectorAll('.note-card__delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        if (confirm('Xóa ghi chú này?')) {
          const notes = getNotes();
          notes.splice(idx, 1);
          saveNotes(notes);
          renderNotes();
        }
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function addNote() {
    const text = input.value.trim();
    if (!text) return;

    const notes = getNotes();
    notes.push({ text, time: new Date().toISOString() });
    saveNotes(notes);
    input.value = '';
    input.style.height = 'auto';
    renderNotes();
  }

  addBtn.addEventListener('click', addNote);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 180) + 'px';
  });

  // Initial render
  renderNotes();
}

