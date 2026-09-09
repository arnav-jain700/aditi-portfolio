import './style.css';
import {
  getSettings,
  saveSettings,
  getTechStacks,
  saveTechStack,
  deleteTechStack,
  getProjects,
  saveProject,
  deleteProject,
  getTimeline,
  saveTimelineItem,
  deleteTimelineItem,
  getCertificates,
  saveCertificate,
  deleteCertificate,
  getHackathons,
  saveHackathon,
  deleteHackathon,
  getMessages,
  saveMessage,
  deleteMessage,
  toggleMessageRead,
  syncWithCloud,
  subscribeToCloudChanges,
  exportBackupJSON,
  restoreFromBackupJSON,
  clearLocalCache
} from './data.js';
import {
  getChatbotResponse,
  analyzeJobFit,
  suggestProjectDescription,
  draftEmailReply,
  getActiveApiKey
} from './ai.js';
import { isSupabaseConfigured } from './supabase.js';

/* ==========================================================================
   1. SHA-256 Hashing & Admin Passcode Verification
   ========================================================================== */
async function computeSHA256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// "aditi2408" SHA-256 hash
const PASSCODE_HASH = '90662305f39ca86a9d4dbb5532a14d25699b454cb6a917d343215e0b80a8136e';
let isAdminLoggedIn = false;

/* ==========================================================================
   2. Toast Notification Helper
   ========================================================================== */
export function showToast(message, duration = 3000) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ==========================================================================
   3. 3D WebGL / Canvas Particle Background
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const mouse = { x: null, y: null, radius: 150 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.9;
      this.vy = (Math.random() - 0.5) * 0.9;
      this.radius = Math.random() * 2 + 1;
      this.baseColor = Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(139, 92, 246, ';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      // Mouse repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= Math.cos(angle) * force * 3;
          this.y -= Math.sin(angle) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor + this.alpha + ')';
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 12000), 90);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function connect() {
    const maxDist = 130;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.25;
          ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  let animationFrameId;
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.update();
      p.draw();
    }
    connect();
    animationFrameId = requestAnimationFrame(animate);
  }

  resize();
  animate();
}

/* ==========================================================================
   4. Theme Management (Dark / Light)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('portfolio_theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  const iconUse = document.querySelector('#theme-toggle-btn use');
  if (iconUse) {
    iconUse.setAttribute('href', theme === 'dark' ? '#icon-sun' : '#icon-moon');
  }
}

/* ==========================================================================
   5. Hero Section & Persona Bio
   ========================================================================== */
function renderHero() {
  const settings = getSettings();
  const projects = getProjects();
  const tech = getTechStacks();
  const apiKey = getActiveApiKey();

  // Name & Bio
  const ownerNameEl = document.getElementById('hero-owner-name');
  if (ownerNameEl) ownerNameEl.textContent = settings.ownerName;

  const ownerBioEl = document.getElementById('hero-owner-bio');
  if (ownerBioEl) ownerBioEl.textContent = settings.ownerBio;

  // Live Stat Counters
  const countProjectsEl = document.getElementById('stat-projects-count');
  if (countProjectsEl) countProjectsEl.textContent = `${projects.length}`;

  const countSkillsEl = document.getElementById('stat-skills-count');
  if (countSkillsEl) countSkillsEl.textContent = `${tech.length}`;

  const certs = getCertificates();
  const countCertsEl = document.getElementById('stat-certs-count');
  if (countCertsEl) countCertsEl.textContent = `${certs.length}`;

  // Social Links
  const githubLink = document.getElementById('hero-github-link');
  if (githubLink) githubLink.href = settings.github;

  const linkedinLink = document.getElementById('hero-linkedin-link');
  if (linkedinLink) linkedinLink.href = settings.linkedin;

  // Contact Method Previews
  const contactEmailEl = document.getElementById('contact-email-text');
  if (contactEmailEl) {
    contactEmailEl.textContent = settings.email;
    contactEmailEl.href = `mailto:${settings.email}`;
  }
  const contactLocEl = document.getElementById('contact-location-text');
  if (contactLocEl) contactLocEl.textContent = settings.location;

  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  if (prevBtn) prevBtn.onclick = () => setCarouselSlide(carouselCurrentIndex - 1);
  if (nextBtn) nextBtn.onclick = () => setCarouselSlide(carouselCurrentIndex + 1);

  renderCarousel();
}

/* ==========================================================================
   6. 3D Featured Projects Carousel
   ========================================================================== */
let carouselCurrentIndex = 0;
let carouselTimer = null;

function renderCarousel() {
  const projects = getProjects();
  const viewport = document.getElementById('carousel-viewport');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!viewport || !dotsContainer) return;

  viewport.onmouseenter = () => {
    if (carouselTimer) clearInterval(carouselTimer);
  };
  viewport.onmouseleave = () => {
    startCarouselAutoRotate();
  };

  viewport.innerHTML = '';
  dotsContainer.innerHTML = '';

  if (projects.length === 0) {
    viewport.innerHTML = `<div class="carousel-card active"><p>No featured projects yet.</p></div>`;
    return;
  }

  projects.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = `carousel-card ${idx === carouselCurrentIndex ? 'active' : ''}`;
    card.dataset.index = idx;
    card.innerHTML = `
      <img src="${proj.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" class="carousel-img" alt="${proj.title}">
      <div>
        <span class="carousel-badge">${proj.category}</span>
        <h3 class="carousel-title">${proj.title}</h3>
        <p class="carousel-desc">${proj.description}</p>
      </div>
      <div class="carousel-footer">
        <div class="project-tags">
          ${proj.tags.slice(0, 3).map(t => `<span class="tag-badge">${t}</span>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm open-project-modal-btn" data-id="${proj.id}">Details</button>
      </div>
    `;
    viewport.appendChild(card);

    const dot = document.createElement('div');
    dot.className = `carousel-dot ${idx === carouselCurrentIndex ? 'active' : ''}`;
    dot.addEventListener('click', () => setCarouselSlide(idx));
    dotsContainer.appendChild(dot);
  });

  updateCarouselCards();
  startCarouselAutoRotate();
}

function updateCarouselCards() {
  const cards = document.querySelectorAll('.carousel-card');
  const dots = document.querySelectorAll('.carousel-dot');
  const total = cards.length;
  if (total === 0) return;

  cards.forEach((card, idx) => {
    card.classList.remove('active', 'prev', 'next');
    if (idx === carouselCurrentIndex) {
      card.classList.add('active');
    } else if (idx === (carouselCurrentIndex - 1 + total) % total) {
      card.classList.add('prev');
    } else if (idx === (carouselCurrentIndex + 1) % total) {
      card.classList.add('next');
    }
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === carouselCurrentIndex);
  });
}

function setCarouselSlide(index) {
  const projects = getProjects();
  if (projects.length === 0) return;
  carouselCurrentIndex = (index + projects.length) % projects.length;
  updateCarouselCards();
}

function startCarouselAutoRotate() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    setCarouselSlide(carouselCurrentIndex + 1);
  }, 5000);
}

/* ==========================================================================
   7. Timeline Journey Section (#journey)
   ========================================================================== */
function renderTimeline() {
  const timeline = getTimeline();
  const container = document.getElementById('timeline-items-container');
  if (!container) return;

  if (timeline.length === 0) {
    container.innerHTML = '<p class="text-muted">No timeline records found.</p>';
    return;
  }

  container.innerHTML = timeline.map(item => `
    <div class="timeline-item ${item.type}">
      <div class="timeline-node"></div>
      <div class="timeline-card">
        <div class="timeline-top">
          <span class="timeline-type ${item.type}">${item.type}</span>
          <span class="timeline-date">${item.dateRange}</span>
        </div>
        <h3 class="timeline-role">${item.title}</h3>
        <div class="timeline-company">${item.company}</div>
        <p class="timeline-desc">${item.description}</p>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   8. Technical Toolkit & Skills (#skills)
   ========================================================================== */
let activeSkillCategory = 'All';

function renderSkills() {
  const tech = getTechStacks();
  const settings = getSettings();
  const filterBar = document.getElementById('skills-filter-bar');
  const grid = document.getElementById('skills-grid');
  if (!filterBar || !grid) return;

  // Build category chips
  const categories = ['All', ...(settings.categories || ['Frontend', 'Backend', 'Databases', 'DevOps', 'AI & ML'])];
  filterBar.innerHTML = categories.map(cat => `
    <button class="filter-chip ${activeSkillCategory === cat ? 'active' : ''}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  filterBar.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSkillCategory = btn.dataset.cat;
      renderSkills();
    });
  });

  const filtered = activeSkillCategory === 'All'
    ? tech
    : tech.filter(t => t.category.toLowerCase() === activeSkillCategory.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-muted">No skills in this category.</p>';
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="skill-card">
      <div class="skill-header">
        <div class="skill-title-wrap">
          <svg class="icon"><use href="#icon-${item.icon || 'code'}"></use></svg>
          <span class="skill-name">${item.name}</span>
        </div>
        <span class="skill-percent">${item.level}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${item.level}%"></div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   9. Projects Hub Section (#projects)
   ========================================================================== */
let activeProjectFilter = 'All';

function renderProjectsHub() {
  const projects = getProjects();
  const filterBar = document.getElementById('projects-filter-bar');
  const grid = document.getElementById('projects-grid');
  if (!filterBar || !grid) return;

  // Collect unique tags
  const tagsSet = new Set(['All']);
  projects.forEach(p => (p.tags || []).forEach(t => tagsSet.add(t)));
  const tagList = Array.from(tagsSet).slice(0, 10);

  filterBar.innerHTML = tagList.map(tag => `
    <button class="filter-chip ${activeProjectFilter === tag ? 'active' : ''}" data-tag="${tag}">
      ${tag}
    </button>
  `).join('');

  filterBar.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeProjectFilter = btn.dataset.tag;
      renderProjectsHub();
    });
  });

  const filtered = activeProjectFilter === 'All'
    ? projects
    : projects.filter(p => (p.tags || []).includes(activeProjectFilter) || p.category === activeProjectFilter);

  grid.innerHTML = filtered.map(p => `
    <div class="project-card">
      <div class="project-thumb-wrap">
        <img src="${p.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" class="project-thumb" alt="${p.title}" loading="lazy">
        <span class="project-category-tag">${p.category}</span>
      </div>
      <div class="project-body">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tags">
          ${(p.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('')}
        </div>
        <div class="project-actions">
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm"><svg class="icon"><use href="#icon-external"></use></svg> Live Demo</a>` : ''}
          ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><svg class="icon"><use href="#icon-github"></use></svg> GitHub</a>` : ''}
          <button class="btn btn-secondary btn-sm open-project-modal-btn" data-id="${p.id}">Details</button>
        </div>
      </div>
    </div>
  `).join('');

  // Wire detail buttons
  document.querySelectorAll('.open-project-modal-btn').forEach(b => {
    b.addEventListener('click', () => openProjectModal(b.dataset.id));
  });
}

function openProjectModal(id) {
  const p = getProjects().find(proj => proj.id === id);
  if (!p) return;

  const modal = document.getElementById('project-detail-modal');
  const title = document.getElementById('modal-project-title');
  const img = document.getElementById('modal-project-img');
  const cat = document.getElementById('modal-project-cat');
  const desc = document.getElementById('modal-project-desc');
  const tags = document.getElementById('modal-project-tags');
  const live = document.getElementById('modal-project-live');
  const github = document.getElementById('modal-project-github');

  if (title) title.textContent = p.title;
  if (img) img.src = p.image || '';
  if (cat) cat.textContent = p.category;
  if (desc) desc.textContent = p.description;
  if (tags) tags.innerHTML = (p.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('');
  if (live) live.href = p.liveUrl || '#';
  if (github) github.href = p.githubUrl || '#';

  if (modal) modal.classList.add('active');
}

/* ==========================================================================
   10. Certificates & Credentials (#certificates)
   ========================================================================== */
function renderCertificates() {
  const certs = getCertificates();
  const grid = document.getElementById('certificates-grid');
  if (!grid) return;

  if (certs.length === 0) {
    grid.innerHTML = '<p class="text-muted">No certificates uploaded yet.</p>';
    return;
  }

  grid.innerHTML = certs.map(c => `
    <div class="cert-card">
      <div class="cert-issuer">${c.issuer} • ${c.date}</div>
      <h3 class="cert-title">${c.title}</h3>
      <div class="cert-skills"><strong>Covered:</strong> ${c.skills}</div>
      <div style="margin-top:auto;display:flex;gap:10px;">
        ${c.credentialUrl ? `<a href="${c.credentialUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><svg class="icon"><use href="#icon-award"></use></svg> Verify Credential</a>` : ''}
        ${c.image ? `<button class="btn btn-secondary btn-sm view-cert-image-btn" data-img="${c.image}"><svg class="icon"><use href="#icon-eye"></use></svg> View</button>` : ''}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.view-cert-image-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const imgUrl = btn.dataset.img;
      const lightbox = document.getElementById('image-lightbox-modal');
      const lbImg = document.getElementById('lightbox-img');
      if (lightbox && lbImg) {
        lbImg.src = imgUrl;
        lightbox.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   11. Hackathons & Competitions (#hackathons)
   ========================================================================== */
function renderHackathons() {
  const hacks = getHackathons();
  const grid = document.getElementById('hackathons-grid');
  if (!grid) return;

  if (hacks.length === 0) {
    grid.innerHTML = '<p class="text-muted">No hackathons recorded yet.</p>';
    return;
  }

  grid.innerHTML = hacks.map(h => `
    <div class="hack-card">
      <span class="hack-badge">
        <svg class="icon"><use href="#icon-trophy"></use></svg> ${h.achievement}
      </span>
      <h3 class="hack-title">${h.title}</h3>
      <div class="hack-organizer">${h.organizer} • ${h.date} (${h.role})</div>
      <div class="hack-project-name">Project: ${h.projectName}</div>
      <p class="hack-desc">${h.description}</p>
      <div class="project-tags" style="margin-bottom:14px;">
        <span class="tag-badge">${h.technologies}</span>
      </div>
      <div style="display:flex;gap:10px;margin-top:auto;">
        ${h.projectUrl ? `<a href="${h.projectUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><svg class="icon"><use href="#icon-github"></use></svg> Code / Demo</a>` : ''}
        ${h.certificateUrl ? `<a href="${h.certificateUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><svg class="icon"><use href="#icon-award"></use></svg> Certificate</a>` : ''}
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   12. AI Recruiter Job-Fit Analyzer (#job-scanner)
   ========================================================================== */
function initJobScanner() {
  const form = document.getElementById('job-scanner-form');
  const jdInput = document.getElementById('job-desc-input');
  const resultWrap = document.getElementById('scanner-result');
  const scoreVal = document.getElementById('scanner-score-val');
  const summaryEl = document.getElementById('scanner-summary');
  const strengthsList = document.getElementById('scanner-strengths-list');
  const gapsList = document.getElementById('scanner-gaps-list');
  const projectsList = document.getElementById('scanner-projects-list');
  const scanBtn = document.getElementById('job-scan-submit-btn');

  if (!form || !jdInput || !resultWrap) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const jdText = jdInput.value.trim();
    if (!jdText) {
      showToast('Please paste a Job Description first.');
      return;
    }

    scanBtn.disabled = true;
    scanBtn.innerHTML = `<svg class="icon" style="animation:spin 1s linear infinite;"><use href="#icon-sync"></use></svg> Evaluating Fit...`;

    try {
      const evaluation = await analyzeJobFit(jdText);

      scoreVal.textContent = `${evaluation.fitScore}%`;
      summaryEl.textContent = evaluation.summary;

      strengthsList.innerHTML = (evaluation.strengths || []).map(s => `<li>• ${s}</li>`).join('');
      gapsList.innerHTML = (evaluation.gaps || []).map(g => `<li>• ${g}</li>`).join('');

      if (projectsList) {
        projectsList.innerHTML = (evaluation.matchedProjects || []).map(p => `
          <span class="tag-badge" style="background:rgba(0,240,255,0.15);border-color:var(--accent-cyan);color:var(--text-primary);font-size:0.85rem;padding:6px 12px;">
            ${p}
          </span>
        `).join('');
      }

      resultWrap.style.display = 'block';
      resultWrap.scrollIntoView({ behavior: 'smooth' });
      showToast('Job-Fit evaluation complete!');
    } catch (err) {
      console.error('Job scanner failure:', err);
      showToast('Evaluation error. Please try again.');
    } finally {
      scanBtn.disabled = false;
      scanBtn.innerHTML = `<svg class="icon"><use href="#icon-sparkles"></use></svg> Run Job-Fit Analysis`;
    }
  });
}

/* ==========================================================================
   13. Floating AI Assistant Chatbot (Bottom-Right Widget)
   ========================================================================== */
let chatHistory = [];

function initChatbotWidget() {
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const drawer = document.getElementById('chatbot-drawer');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messagesBox = document.getElementById('chatbot-messages');
  const suggestionsBox = document.getElementById('chatbot-suggestions');

  if (!toggleBtn || !drawer || !closeBtn || !form || !input || !messagesBox) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) {
      input.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    drawer.classList.remove('open');
  });

  // Wire suggestion pills
  if (suggestionsBox) {
    suggestionsBox.querySelectorAll('.suggestion-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        input.value = pill.textContent.trim();
        form.dispatchEvent(new Event('submit'));
      });
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    // Append user message
    appendChatMessage('user', query);
    input.value = '';

    // Typing indicator
    const typingId = appendChatTyping();

    try {
      const reply = await getChatbotResponse(chatHistory, query);
      removeChatTyping(typingId);
      appendChatMessage('bot', reply);
      chatHistory.push({ role: 'user', content: query });
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeChatTyping(typingId);
      appendChatMessage('bot', "I'm having trouble processing your query right now. Please feel free to reach out directly via the Contact form!");
    }
  });
}

function appendChatMessage(role, text) {
  const box = document.getElementById('chatbot-messages');
  if (!box) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  // Basic markdown conversion
  bubble.innerHTML = formatMarkdown(text);
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function appendChatTyping() {
  const box = document.getElementById('chatbot-messages');
  if (!box) return null;
  const id = 'typing-' + Date.now();
  const bubble = document.createElement('div');
  bubble.id = id;
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = '<em>Typing...</em>';
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
  return id;
}

function removeChatTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function formatMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
  return html;
}

/* ==========================================================================
   14. Contact Form Handling
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const subject = document.getElementById('contact-subject')?.value.trim() || 'Portfolio Inquiry';
    const message = document.getElementById('contact-message')?.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill out all required fields.');
      return;
    }

    const newMsg = {
      id: 'msg-' + Date.now(),
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
      unread: true
    };

    await saveMessage(newMsg);
    form.reset();
    showToast('Your message has been sent successfully! Thank you.');
  });
}

/* ==========================================================================
   15. Admin Console & Authentication Controller
   ========================================================================== */
export function checkAdminRoute() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('admin') || window.location.hash === '#admin') {
    if (isAdminLoggedIn) {
      openAdminDashboard();
    } else {
      const authModal = document.getElementById('admin-auth-modal');
      if (authModal) {
        authModal.classList.add('active');
        const passInput = document.getElementById('admin-passcode-input');
        if (passInput) passInput.focus();
      }
    }
  }
}

function initAdminConsole() {
  const authModal = document.getElementById('admin-auth-modal');
  const authForm = document.getElementById('admin-auth-form');
  const passInput = document.getElementById('admin-passcode-input');
  const authCloseBtn = document.getElementById('admin-auth-close');
  const dashboardModal = document.getElementById('admin-dashboard-modal');
  const dashboardCloseBtn = document.getElementById('admin-dashboard-close');

  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', () => authModal.classList.remove('active'));
  }

  if (dashboardCloseBtn) {
    dashboardCloseBtn.addEventListener('click', () => dashboardModal.classList.remove('active'));
  }

  if (authForm) {
    authForm.addEventListener('submit', async e => {
      e.preventDefault();
      const entered = passInput.value.trim();
      const hashed = await computeSHA256(entered);

      // Verify either against hash or plaintext fallback for passcode "aditi2408"
      if (entered === 'aditi2408' || hashed === PASSCODE_HASH) {
        isAdminLoggedIn = true;
        authModal.classList.remove('active');
        passInput.value = '';
        showToast('Admin authenticated successfully');
        openAdminDashboard();
      } else {
        showToast('Invalid admin passcode. Access denied.');
        passInput.classList.add('error-shake');
        setTimeout(() => passInput.classList.remove('error-shake'), 500);
      }
    });
  }

  // Admin Navigation Tabs
  const adminTabs = document.querySelectorAll('.admin-tab');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const paneId = `admin-pane-${tab.dataset.pane}`;
      const pane = document.getElementById(paneId);
      if (pane) pane.classList.add('active');
    });
  });

  // Admin Pane Action Buttons
  setupAdminActionButtons();

  // Listen for ?admin URL route or changes
  window.addEventListener('popstate', checkAdminRoute);
  window.addEventListener('hashchange', checkAdminRoute);
  checkAdminRoute();
}

function openAdminDashboard() {
  const modal = document.getElementById('admin-dashboard-modal');
  if (modal) {
    modal.classList.add('active');
    refreshAdminPanes();
  }
}

function refreshAdminPanes() {
  renderAdminSkillsList();
  renderAdminProjectsList();
  renderAdminMessagesList();
  renderAdminSettings();
  renderAdminTimelineList();
  renderAdminCertsList();
  renderAdminHacksList();
}

function setupAdminActionButtons() {
  // Settings Save
  const settingsForm = document.getElementById('admin-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async e => {
      e.preventDefault();
      const updated = {
        ownerName: document.getElementById('admin-set-name').value.trim(),
        ownerBio: document.getElementById('admin-set-bio').value.trim(),
        email: document.getElementById('admin-set-email').value.trim(),
        location: document.getElementById('admin-set-loc').value.trim(),
        github: document.getElementById('admin-set-github').value.trim(),
        linkedin: document.getElementById('admin-set-linkedin').value.trim(),
        groqKey: document.getElementById('admin-set-groq').value.trim()
      };
      await saveSettings(updated);
      showToast('Settings saved & synced!');
      renderHero();
    });
  }

  // Cloud Sync & Backup Actions
  const syncCloudBtn = document.getElementById('admin-sync-cloud-btn');
  if (syncCloudBtn) {
    syncCloudBtn.addEventListener('click', async () => {
      syncCloudBtn.disabled = true;
      syncCloudBtn.textContent = 'Syncing...';
      const res = await syncWithCloud();
      syncCloudBtn.disabled = false;
      syncCloudBtn.textContent = 'Sync Local Data to Cloud Now';
      if (res.success) {
        showToast('Successfully synchronized with Supabase Cloud!');
      } else {
        showToast(res.reason || res.error || 'Cloud sync failed.');
      }
    });
  }

  const copyBackupBtn = document.getElementById('admin-copy-backup-btn');
  if (copyBackupBtn) {
    copyBackupBtn.addEventListener('click', () => {
      const json = exportBackupJSON();
      navigator.clipboard.writeText(json);
      showToast('Database backup JSON copied to clipboard!');
    });
  }

  const restoreBackupBtn = document.getElementById('admin-restore-backup-btn');
  if (restoreBackupBtn) {
    restoreBackupBtn.addEventListener('click', async () => {
      const json = prompt('Paste your database backup JSON here:');
      if (json) {
        const res = await restoreFromBackupJSON(json);
        if (res.success) {
          showToast('Database restored successfully!');
          refreshAdminPanes();
        } else {
          showToast('Invalid backup JSON.');
        }
      }
    });
  }

  const clearCacheBtn = document.getElementById('admin-clear-cache-btn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset local cache to defaults?')) {
        clearLocalCache();
        showToast('Cache purged and re-seeded with defaults.');
        refreshAdminPanes();
      }
    });
  }

  // Add Skill Form
  const addSkillForm = document.getElementById('admin-add-skill-form');
  if (addSkillForm) {
    addSkillForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('admin-skill-name').value.trim();
      const category = document.getElementById('admin-skill-cat').value.trim();
      const level = parseInt(document.getElementById('admin-skill-level').value) || 80;
      await saveTechStack({
        id: 'tech-' + Date.now(),
        name,
        category,
        level,
        icon: 'code'
      });
      addSkillForm.reset();
      renderAdminSkillsList();
      renderSkills();
      showToast(`Skill ${name} added!`);
    });
  }

  // Image File Pickers (Device Upload)
  let projCoverImageBase64 = '';
  const projFileInput = document.getElementById('admin-proj-image-file');
  const projImgPreview = document.getElementById('admin-proj-image-preview');
  const projPreviewWrap = document.getElementById('admin-proj-image-preview-wrap');
  if (projFileInput) {
    projFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          projCoverImageBase64 = ev.target.result;
          if (projImgPreview && projPreviewWrap) {
            projImgPreview.src = projCoverImageBase64;
            projPreviewWrap.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  let certCoverImageBase64 = '';
  const certFileInput = document.getElementById('admin-cert-image-file');
  const certImgPreview = document.getElementById('admin-cert-image-preview');
  const certPreviewWrap = document.getElementById('admin-cert-image-preview-wrap');
  if (certFileInput) {
    certFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          certCoverImageBase64 = ev.target.result;
          if (certImgPreview && certPreviewWrap) {
            certImgPreview.src = certCoverImageBase64;
            certPreviewWrap.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  let hackCoverImageBase64 = '';
  const hackFileInput = document.getElementById('admin-hack-image-file');
  const hackImgPreview = document.getElementById('admin-hack-image-preview');
  const hackPreviewWrap = document.getElementById('admin-hack-image-preview-wrap');
  if (hackFileInput) {
    hackFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          hackCoverImageBase64 = ev.target.result;
          if (hackImgPreview && hackPreviewWrap) {
            hackImgPreview.src = hackCoverImageBase64;
            hackPreviewWrap.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Add Project Form + AI Suggest Description
  const addProjectForm = document.getElementById('admin-add-project-form');
  const aiSuggestBtn = document.getElementById('admin-ai-suggest-proj-btn');
  if (aiSuggestBtn) {
    aiSuggestBtn.addEventListener('click', async () => {
      const title = document.getElementById('admin-proj-title').value.trim();
      const tagsStr = document.getElementById('admin-proj-tags').value.trim();
      if (!title) {
        showToast('Please enter a project title first.');
        return;
      }
      aiSuggestBtn.disabled = true;
      aiSuggestBtn.textContent = 'Generating...';
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      const desc = await suggestProjectDescription(title, tags);
      document.getElementById('admin-proj-desc').value = desc;
      aiSuggestBtn.disabled = false;
      aiSuggestBtn.textContent = 'AI Suggest Description';
      showToast('AI Description generated!');
    });
  }

  if (addProjectForm) {
    addProjectForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('admin-proj-title').value.trim();
      const category = document.getElementById('admin-proj-cat').value.trim() || 'Development';
      const desc = document.getElementById('admin-proj-desc').value.trim();
      const tags = document.getElementById('admin-proj-tags').value.split(',').map(t => t.trim()).filter(Boolean);
      const githubUrl = document.getElementById('admin-proj-github').value.trim();
      const liveUrl = document.getElementById('admin-proj-live').value.trim();
      const image = projCoverImageBase64 || document.getElementById('admin-proj-image').value.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';

      await saveProject({
        id: 'proj-' + Date.now(),
        title,
        category,
        description: desc,
        tags,
        githubUrl,
        liveUrl,
        image
      });

      addProjectForm.reset();
      projCoverImageBase64 = '';
      if (projPreviewWrap) projPreviewWrap.style.display = 'none';
      renderAdminProjectsList();
      renderProjectsHub();
      renderCarousel();
      renderHero();
      showToast(`Project "${title}" saved!`);
    });
  }

  // Add Timeline Milestone Form
  const addTimelineForm = document.getElementById('admin-add-timeline-form');
  if (addTimelineForm) {
    addTimelineForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('admin-timeline-title').value.trim();
      const company = document.getElementById('admin-timeline-company').value.trim();
      const dateRange = document.getElementById('admin-timeline-dates').value.trim();
      const type = document.getElementById('admin-timeline-type').value;
      const desc = document.getElementById('admin-timeline-desc').value.trim();

      await saveTimelineItem({
        id: 'time-' + Date.now(),
        title,
        company,
        role: title,
        dateRange,
        type,
        description: desc
      });

      addTimelineForm.reset();
      renderAdminTimelineList();
      renderTimeline();
      showToast(`Milestone "${title}" added!`);
    });
  }

  // Add Certificate Form
  const addCertForm = document.getElementById('admin-add-cert-form');
  if (addCertForm) {
    addCertForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('admin-cert-title').value.trim();
      const issuer = document.getElementById('admin-cert-issuer').value.trim();
      const date = document.getElementById('admin-cert-date').value.trim();
      const credentialUrl = document.getElementById('admin-cert-url').value.trim();
      const skills = document.getElementById('admin-cert-skills').value.trim();
      const image = certCoverImageBase64 || document.getElementById('admin-cert-image').value.trim();

      await saveCertificate({
        id: 'cert-' + Date.now(),
        title,
        issuer,
        date,
        credentialUrl,
        skills,
        image
      });

      addCertForm.reset();
      certCoverImageBase64 = '';
      if (certPreviewWrap) certPreviewWrap.style.display = 'none';
      renderAdminCertsList();
      renderCertificates();
      renderHero();
      showToast(`Certificate "${title}" added!`);
    });
  }

  // Add Hackathon Form
  const addHackForm = document.getElementById('admin-add-hack-form');
  if (addHackForm) {
    addHackForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('admin-hack-title').value.trim();
      const organizer = document.getElementById('admin-hack-organizer').value.trim();
      const date = document.getElementById('admin-hack-date').value.trim();
      const role = document.getElementById('admin-hack-role').value.trim();
      const projectName = document.getElementById('admin-hack-project').value.trim();
      const achievement = document.getElementById('admin-hack-achievement').value.trim();
      const technologies = document.getElementById('admin-hack-tech').value.trim();
      const desc = document.getElementById('admin-hack-desc').value.trim();
      const projectUrl = document.getElementById('admin-hack-project-url').value.trim();
      const certificateUrl = document.getElementById('admin-hack-cert-url').value.trim();
      const image = hackCoverImageBase64 || document.getElementById('admin-hack-image').value.trim();

      await saveHackathon({
        id: 'hack-' + Date.now(),
        title,
        organizer,
        date,
        role,
        projectName,
        achievement,
        technologies,
        description: desc,
        projectUrl,
        certificateUrl,
        image
      });

      addHackForm.reset();
      hackCoverImageBase64 = '';
      if (hackPreviewWrap) hackPreviewWrap.style.display = 'none';
      renderAdminHacksList();
      renderHackathons();
      showToast(`Hackathon "${title}" added!`);
    });
  }
}

// Admin Sub-Lists Renderers
function renderAdminSkillsList() {
  const list = document.getElementById('admin-skills-table-body');
  if (!list) return;
  const items = getTechStacks();
  list.innerHTML = items.map(t => `
    <tr>
      <td><strong>${t.name}</strong></td>
      <td>${t.category}</td>
      <td>${t.level}%</td>
      <td>
        <button class="btn btn-secondary btn-sm delete-skill-btn" data-id="${t.id}">
          <svg class="icon"><use href="#icon-trash"></use></svg>
        </button>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.delete-skill-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteTechStack(btn.dataset.id);
      renderAdminSkillsList();
      renderSkills();
      showToast('Skill deleted.');
    });
  });
}

function renderAdminProjectsList() {
  const list = document.getElementById('admin-projects-table-body');
  if (!list) return;
  const items = getProjects();
  list.innerHTML = items.map(p => `
    <tr>
      <td><strong>${p.title}</strong></td>
      <td>${p.category}</td>
      <td>${(p.tags || []).join(', ')}</td>
      <td>
        <button class="btn btn-secondary btn-sm delete-proj-btn" data-id="${p.id}">
          <svg class="icon"><use href="#icon-trash"></use></svg>
        </button>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.delete-proj-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteProject(btn.dataset.id);
      renderAdminProjectsList();
      renderProjectsHub();
      renderCarousel();
      showToast('Project deleted.');
    });
  });
}

function renderAdminMessagesList() {
  const list = document.getElementById('admin-messages-container');
  if (!list) return;
  const msgs = getMessages();

  if (msgs.length === 0) {
    list.innerHTML = '<p class="text-muted">No messages in inbox.</p>';
    return;
  }

  list.innerHTML = msgs.map(m => `
    <div class="timeline-card" style="margin-bottom:16px;border-left:4px solid ${m.unread ? 'var(--accent-cyan)' : 'var(--card-border)'};">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>${m.name} &lt;${m.email}&gt;</strong>
        <span class="timeline-date">${new Date(m.timestamp).toLocaleDateString()}</span>
      </div>
      <div style="font-weight:600;margin-bottom:6px;">${m.subject}</div>
      <p style="color:var(--text-secondary);font-size:0.92rem;margin-bottom:12px;">${m.message}</p>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-secondary btn-sm toggle-read-btn" data-id="${m.id}">
          ${m.unread ? 'Mark as Read' : 'Mark as Unread'}
        </button>
        <button class="btn btn-primary btn-sm draft-reply-btn" data-name="${m.name}" data-sub="${m.subject}" data-body="${m.message}">
          <svg class="icon"><use href="#icon-sparkles"></use></svg> Draft AI Reply
        </button>
        <button class="btn btn-secondary btn-sm delete-msg-btn" data-id="${m.id}">
          <svg class="icon"><use href="#icon-trash"></use></svg>
        </button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.toggle-read-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await toggleMessageRead(btn.dataset.id);
      renderAdminMessagesList();
    });
  });

  list.querySelectorAll('.delete-msg-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteMessage(btn.dataset.id);
      renderAdminMessagesList();
      showToast('Message deleted.');
    });
  });

  list.querySelectorAll('.draft-reply-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Drafting...';
      const draft = await draftEmailReply(btn.dataset.name, btn.dataset.sub, btn.dataset.body);
      btn.disabled = false;
      btn.innerHTML = `<svg class="icon"><use href="#icon-sparkles"></use></svg> Draft AI Reply`;
      prompt('AI Drafted Reply (Ctrl+C to copy):', draft);
    });
  });
}

function renderAdminSettings() {
  const s = getSettings();
  document.getElementById('admin-set-name').value = s.ownerName || '';
  document.getElementById('admin-set-bio').value = s.ownerBio || '';
  document.getElementById('admin-set-email').value = s.email || '';
  document.getElementById('admin-set-loc').value = s.location || '';
  document.getElementById('admin-set-github').value = s.github || '';
  document.getElementById('admin-set-linkedin').value = s.linkedin || '';
  document.getElementById('admin-set-groq').value = s.groqKey || '';
}

function renderAdminTimelineList() {
  const list = document.getElementById('admin-timeline-table-body');
  if (!list) return;
  const items = getTimeline();
  list.innerHTML = items.map(t => `
    <tr>
      <td><strong>${t.title}</strong></td>
      <td>${t.company}</td>
      <td>${t.dateRange}</td>
      <td>
        <button class="btn btn-secondary btn-sm delete-timeline-btn" data-id="${t.id}">
          <svg class="icon"><use href="#icon-trash"></use></svg>
        </button>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.delete-timeline-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteTimelineItem(btn.dataset.id);
      renderAdminTimelineList();
      renderTimeline();
      showToast('Timeline item deleted.');
    });
  });
}

function renderAdminCertsList() {
  const list = document.getElementById('admin-certs-table-body');
  if (!list) return;
  const items = getCertificates();
  list.innerHTML = items.map(c => `
    <tr>
      <td><strong>${c.title}</strong></td>
      <td>${c.issuer}</td>
      <td>${c.date}</td>
      <td>
        <button class="btn btn-secondary btn-sm delete-cert-btn" data-id="${c.id}">
          <svg class="icon"><use href="#icon-trash"></use></svg>
        </button>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.delete-cert-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteCertificate(btn.dataset.id);
      renderAdminCertsList();
      renderCertificates();
      showToast('Certificate deleted.');
    });
  });
}

function renderAdminHacksList() {
  const list = document.getElementById('admin-hacks-table-body');
  if (!list) return;
  const items = getHackathons();
  list.innerHTML = items.map(h => `
    <tr>
      <td><strong>${h.title}</strong></td>
      <td>${h.achievement}</td>
      <td>${h.projectName}</td>
      <td>
        <button class="btn btn-secondary btn-sm delete-hack-btn" data-id="${h.id}">
          <svg class="icon"><use href="#icon-trash"></use></svg>
        </button>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.delete-hack-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await deleteHackathon(btn.dataset.id);
      renderAdminHacksList();
      renderHackathons();
      showToast('Hackathon item deleted.');
    });
  });
}

/* ==========================================================================
   16. Printable Resume & CV Router (?print=resume & ?print=cv)
   ========================================================================== */
function checkPrintRoute() {
  const params = new URLSearchParams(window.location.search);
  const printType = params.get('print');
  if (printType === 'resume' || printType === 'cv') {
    renderPrintableView(printType);
  }
}

function renderPrintableView(type) {
  document.body.classList.add('print-mode');
  const printRoot = document.getElementById('print-root');
  if (!printRoot) return;

  const s = getSettings();
  const tech = getTechStacks();
  const projs = getProjects();
  const time = getTimeline();
  const certs = getCertificates();
  const hacks = getHackathons();

  const isCV = type === 'cv';

  printRoot.innerHTML = `
    <div style="border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px;">
      <h1 style="font-size: 28px; text-transform: uppercase; margin-bottom: 4px; color: #111;">${s.ownerName}</h1>
      <p style="font-size: 14px; color: #333; margin-bottom: 8px;">
        ${s.email} | ${s.location} | <a href="${s.linkedin}">LinkedIn</a> | <a href="${s.github}">GitHub</a>
      </p>
      <p style="font-size: 13px; color: #444; line-height: 1.5;">${s.ownerBio}</p>
    </div>

    <!-- Technical Skills -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase;">Technical Skills</h2>
      <p style="font-size: 13px; line-height: 1.6;">
        ${tech.map(t => `<strong>${t.name}</strong> (${t.category})`).join(' • ')}
      </p>
    </div>

    <!-- Experience & Education -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase;">Experience & Education</h2>
      ${time.map(t => `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
            <span>${t.title} — ${t.company}</span>
            <span>${t.dateRange}</span>
          </div>
          <p style="font-size: 13px; color: #444; margin-top: 4px; line-height: 1.5;">${t.description}</p>
        </div>
      `).join('')}
    </div>

    <!-- Projects -->
    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase;">Featured Projects</h2>
      ${projs.map(p => `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
            <span>${p.title}</span>
            <span style="font-size: 12px; color: #555;">[${p.tags.join(', ')}]</span>
          </div>
          <p style="font-size: 13px; color: #444; margin-top: 4px; line-height: 1.5;">${p.description}</p>
        </div>
      `).join('')}
    </div>

    ${isCV ? `
      <!-- Certificates -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase;">Certifications</h2>
        ${certs.map(c => `
          <div style="margin-bottom: 8px; font-size: 13px;">
            <strong>${c.title}</strong> — ${c.issuer} (${c.date})
          </div>
        `).join('')}
      </div>

      <!-- Hackathons -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase;">Hackathons & Competitions</h2>
        ${hacks.map(h => `
          <div style="margin-bottom: 8px; font-size: 13px;">
            <strong>${h.title}</strong>: ${h.achievement} — ${h.projectName} (${h.technologies})
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // Automatically trigger print once fonts and layout settle
  setTimeout(() => {
    window.print();
  }, 400);
}

/* ==========================================================================
   17. General SPA Router & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a, .drawer-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });

  // Mobile Drawer
  const toggle = document.getElementById('mobile-drawer-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const drawerClose = document.getElementById('drawer-close-btn');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
  }

  if (toggle) toggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-links a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  // Check for admin route (?admin or #admin)
  checkAdminRoute();

  // Handle data-updated events
  window.addEventListener('portfolio-data-updated', () => {
    renderHero();
    renderSkills();
    renderTimeline();
    renderProjectsHub();
    renderCertificates();
    renderHackathons();
  });
}

/* ==========================================================================
   18. Lightbox & Modals Close Handlers
   ========================================================================== */
function initModalClosers() {
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}

/* ==========================================================================
   19. Initialization Orchestrator
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initTheme();
  renderHero();
  renderSkills();
  renderTimeline();
  renderProjectsHub();
  renderCertificates();
  renderHackathons();
  initJobScanner();
  initChatbotWidget();
  initContactForm();
  initAdminConsole();
  initNavigation();
  initModalClosers();
  checkPrintRoute();

  // Try background sync with cloud and listen for realtime updates
  if (isSupabaseConfigured()) {
    syncWithCloud().then(res => {
      if (res.success) {
        console.log('Synchronized with Supabase Cloud');
      }
    });
    subscribeToCloudChanges();
  }
});
