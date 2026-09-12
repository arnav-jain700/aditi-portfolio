import { supabase, isSupabaseConfigured } from './supabase.js';

const STORAGE_KEYS = {
  SETTINGS: 'portfolio_settings',
  TECH_STACKS: 'portfolio_tech_stacks',
  PROJECTS: 'portfolio_projects',
  TIMELINE: 'portfolio_timeline',
  CERTIFICATES: 'portfolio_certificates',
  HACKATHONS: 'portfolio_hackathons',
  BLOG: 'portfolio_blog',
  MESSAGES: 'portfolio_messages'
};

// Initial Rich Default Data
const DEFAULT_SETTINGS = {
  id: 'main_settings',
  ownerName: 'Aditi',
  ownerBio: 'Data Scientist & Data Systems Engineer passionate about building scalable data pipelines, predictive machine learning models, and high-performance analytics platforms.',
  email: 'aditi.tech@example.com',
  location: 'Bengaluru, Karnataka, India',
  linkedin: 'https://www.linkedin.com/in/aditi-codes',
  github: 'https://github.com/aditi-codes',
  codolio: '',
  medium: '',
  groqKey: '',
  geminiKey: '',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  categories: ['Frontend', 'Backend', 'Databases', 'DevOps', 'AI & ML', 'Version Control']
};

const DEFAULT_TECH_STACKS = [
  { id: 'tech-1', name: 'JavaScript / TypeScript', category: 'Frontend', level: 95, icon: 'code' },
  { id: 'tech-2', name: 'React / Next.js', category: 'Frontend', level: 92, icon: 'code' },
  { id: 'tech-3', name: 'HTML5 / CSS3 / Tailwind', category: 'Frontend', level: 95, icon: 'code' },
  { id: 'tech-4', name: 'Three.js / WebGL', category: 'Frontend', level: 85, icon: 'sparkles' },
  { id: 'tech-5', name: 'Node.js / Express', category: 'Backend', level: 90, icon: 'terminal' },
  { id: 'tech-6', name: 'Python / FastAPI', category: 'Backend', level: 88, icon: 'terminal' },
  { id: 'tech-7', name: 'PostgreSQL & Supabase', category: 'Databases', level: 86, icon: 'briefcase' },
  { id: 'tech-8', name: 'Redis / In-Memory Cache', category: 'Databases', level: 80, icon: 'briefcase' },
  { id: 'tech-9', name: 'Docker & Microservices', category: 'DevOps', level: 82, icon: 'award' },
  { id: 'tech-10', name: 'CI/CD & Cloud Deploy (Vercel/AWS)', category: 'DevOps', level: 85, icon: 'award' },
  { id: 'tech-11', name: 'LLM Orchestration & Groq API', category: 'AI & ML', level: 92, icon: 'bot' },
  { id: 'tech-12', name: 'Git & GitHub Workflows', category: 'Version Control', level: 94, icon: 'code' }
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'CogniFlow: Multi-Agent AI Workflow Studio',
    category: 'AI & Full-Stack',
    description: 'An open-source, visual multi-agent workflow builder combining Meta Llama 3 models with automated tool calling, dynamic memory graph retrieval, and low-latency streaming orchestration.',
    tags: ['Next.js', 'FastAPI', 'Groq API', 'TypeScript', 'Tailwind', 'PostgreSQL'],
    githubUrl: 'https://github.com/aditi-codes/cogniflow-studio',
    liveUrl: 'https://cogniflow.demo.app',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'proj-2',
    title: 'AuraSphere: 3D Data Universe',
    category: 'Creative WebGL',
    description: 'Interactive 3D particle constellation and WebGL data explorer designed for real-time visualization of millions of network nodes with spatial quad-tree audio-reactive physics.',
    tags: ['Three.js', 'WebGL', 'GLSL Shaders', 'Vite', 'Canvas API'],
    githubUrl: 'https://github.com/aditi-codes/aurasphere-3d',
    liveUrl: 'https://aurasphere.demo.app',
    image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'proj-3',
    title: 'PulseRelay: Distributed Event Streaming Engine',
    category: 'Systems & Backend',
    description: 'Ultra-low latency pub/sub message broker built with async event loops, zero-copy socket buffers, and built-in SQLite state snapshots ensuring at-least-once message delivery.',
    tags: ['Python', 'FastAPI', 'Redis', 'Docker', 'WebSockets', 'Prometheus'],
    githubUrl: 'https://github.com/aditi-codes/pulse-relay',
    liveUrl: 'https://pulserelay.demo.app',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'proj-4',
    title: 'DevResume ATS Optimizer & Parser',
    category: 'AI Tooling',
    description: 'Automated resume parser and applicant tracking system (ATS) job-fit evaluator using semantic cosine similarity, vector embeddings, and real-time gap analysis recommendations.',
    tags: ['JavaScript', 'Supabase', 'Groq Llama 3', 'NLP', 'CSS Print Spec'],
    githubUrl: 'https://github.com/aditi-codes/dev-resume-ats',
    liveUrl: 'https://devresume.demo.app',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80'
  }
];

const DEFAULT_TIMELINE = [
  {
    id: 'time-1',
    title: 'Senior Software Engineer',
    company: 'HyperScale Cloud Innovations',
    role: 'Full-Stack & Systems Lead',
    dateRange: '2023 — Present',
    type: 'experience',
    description: 'Architecting high-throughput microservices and resilient SPA interfaces serving 500k+ active users. Driving adoption of serverless edge computing, automated CI/CD pipelines, and Groq-powered AI copilot features.'
  },
  {
    id: 'time-2',
    title: 'Software Development Engineer',
    company: 'Nexus Digital Labs',
    role: 'Frontend & API Engineer',
    dateRange: '2021 — 2023',
    type: 'experience',
    description: 'Engineered modular component libraries, responsive UI dashboards, and high-performance WebSockets communication layers. Reduced initial page load latency by 45% via code splitting and asset preloading.'
  },
  {
    id: 'time-3',
    title: 'B.Tech in Computer Science & Engineering',
    company: 'National Institute of Technology',
    role: 'Undergraduate Scholar',
    dateRange: '2017 — 2021',
    type: 'education',
    description: 'Graduated with First Class Honors (CGPA: 9.1/10). Specialization in Distributed Operating Systems, Algorithmic Problem Solving, Database Management, and Artificial Intelligence.'
  }
];

const DEFAULT_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    date: '2024',
    credentialUrl: 'https://aws.amazon.com/verification',
    skills: 'Cloud Architecture, S3, ECS, Lambda, IAM, VPC',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cert-2',
    title: 'Deep Learning Specialization',
    issuer: 'DeepLearning.AI & Andrew Ng',
    date: '2023',
    credentialUrl: 'https://coursera.org/verify/deeplearning',
    skills: 'Neural Networks, CNNs, Sequence Models, Transformers, PyTorch',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cert-3',
    title: 'Meta Front-End Developer Professional Certificate',
    issuer: 'Meta',
    date: '2022',
    credentialUrl: 'https://coursera.org/verify/meta-frontend',
    skills: 'Advanced React, JavaScript ES6+, UX/UI Principles, Accessibility',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
  }
];

const DEFAULT_HACKATHONS = [
  {
    id: 'hack-1',
    title: 'Global AI Agentic Hackathon 2024',
    organizer: 'TechInnovate Global',
    date: 'October 2024',
    role: 'Lead Architect',
    projectName: 'AutoCopilot CLI',
    achievement: '1st Place Winner (Grand Prize)',
    description: 'Created an autonomous terminal assistant capable of diagnosing runtime build failures, suggesting git rebase strategies, and synthesizing unit test suites using Groq Llama 3.',
    technologies: 'Node.js, Groq API, AST Parsing, Shell Scripting',
    projectUrl: 'https://github.com/aditi-codes/autocopilot-cli',
    certificateUrl: 'https://hackathon.example.com/awards/autocopilot',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hack-2',
    title: 'Open Cloud Web3 & WebGL Sprint',
    organizer: 'DevSphere Consortium',
    date: 'March 2024',
    role: 'Full-Stack Developer',
    projectName: 'EtherGraph 3D',
    achievement: 'Finalist & Best UX Award',
    description: 'Designed an interactive 3D blockchain transaction topology visualizer with real-time mempool telemetry, sub-second block propagation animations, and custom shaders.',
    technologies: 'Three.js, WebGL, WebSockets, TypeScript',
    projectUrl: 'https://github.com/aditi-codes/ethergraph-3d',
    certificateUrl: 'https://hackathon.example.com/awards/ethergraph',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
  }
];

const DEFAULT_MESSAGES = [
  {
    id: 'msg-seed-1',
    name: 'Sarah Lin',
    email: 'sarah.lin@techventures.io',
    subject: 'Senior Full-Stack & AI Opportunity',
    message: 'Hi Aditi, loved your work on CogniFlow and the WebGL data visualizers! Our team is looking for a technical lead for our generative workflows platform. Would love to connect for a quick intro chat.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    unread: true
  }
];

const DATA_VERSION_KEY = 'portfolio_app_version';
const CURRENT_DATA_VERSION = 'v2_aditi_clean';

// Migrate / sanitize cache if outdated or contains previous template name
(function checkAndSanitizeCache() {
  try {
    const version = localStorage.getItem(DATA_VERSION_KEY);
    const existingSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const isLegacy = !version || (existingSettings && (existingSettings.includes('Arnav') || existingSettings.includes('arnav')));
    if (isLegacy) {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    }
  } catch (e) {
    console.warn('Cache sanitization skipped:', e);
  }
})();

// Helper: load from localStorage with fallback
function getLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

// Helper: save to localStorage
function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Global Event Dispatcher
export function notifyDataChange(entity) {
  window.dispatchEvent(new CustomEvent('portfolio-data-updated', { detail: { entity } }));
}

// Core Read Methods (instant offline cache)
export function getSettings() {
  const s = getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  if (!s.ownerName || s.ownerName.includes('Arnav') || s.ownerName.includes('arnav')) {
    s.ownerName = 'Aditi';
    s.email = 'aditi.tech@example.com';
    s.github = 'https://github.com/aditi-codes';
    s.linkedin = 'https://www.linkedin.com/in/aditi-codes';
    setLocal(STORAGE_KEYS.SETTINGS, s);
  }
  return s;
}

export function getTechStacks() {
  return getLocal(STORAGE_KEYS.TECH_STACKS, DEFAULT_TECH_STACKS);
}

export function getProjects() {
  return getLocal(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
}

export function getTimeline() {
  return getLocal(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE);
}

export function getCertificates() {
  return getLocal(STORAGE_KEYS.CERTIFICATES, DEFAULT_CERTIFICATES);
}

export function getHackathons() {
  return getLocal(STORAGE_KEYS.HACKATHONS, DEFAULT_HACKATHONS);
}

export function getMessages() {
  return getLocal(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
}

// --- Supabase DB <-> Frontend Bidirectional Field Mappers ---
// PostgreSQL folds unquoted table columns into lowercase, so we map
// between frontend camelCase model properties and DB lowercase columns.

function toDbSettings(s) {
  return {
    id: s.id || 'main_settings',
    ownername: s.ownerName || s.ownername || 'Aditi',
    ownerbio: s.ownerBio || s.ownerbio || '',
    email: s.email || '',
    location: s.location || '',
    linkedin: s.linkedin || '',
    github: s.github || '',
    codolio: s.codolio || '',
    medium: s.medium || '',
    groqkey: s.groqKey || s.groqkey || '',
    geminikey: s.geminiKey || s.geminikey || '',
    categories: Array.isArray(s.categories) ? s.categories : ['Frontend', 'Backend', 'Databases', 'DevOps', 'AI & ML', 'Version Control']
  };
}

function fromDbSettings(row) {
  if (!row) return null;
  return {
    id: row.id || 'main_settings',
    ownerName: row.ownername ?? row.ownerName ?? 'Aditi',
    ownerBio: row.ownerbio ?? row.ownerBio ?? '',
    email: row.email ?? '',
    location: row.location ?? '',
    linkedin: row.linkedin ?? '',
    github: row.github ?? '',
    codolio: row.codolio ?? '',
    medium: row.medium ?? '',
    groqKey: row.groqkey ?? row.groqKey ?? '',
    geminiKey: row.geminikey ?? row.geminiKey ?? '',
    avatar: row.avatar || (typeof localStorage !== 'undefined' ? localStorage.getItem('portfolio_avatar') : '') || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    categories: Array.isArray(row.categories) ? row.categories : ['Frontend', 'Backend', 'Databases', 'DevOps', 'AI & ML', 'Version Control']
  };
}

function toDbTech(t) {
  return {
    id: t.id,
    name: t.name || '',
    category: t.category || '',
    level: Number(t.level) || 0,
    icon: t.icon || 'code'
  };
}

function fromDbTech(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name ?? '',
    category: row.category ?? '',
    level: Number(row.level) || 0,
    icon: row.icon || 'code'
  };
}

function toDbProject(p) {
  return {
    id: p.id,
    title: p.title || '',
    category: p.category || '',
    description: p.description || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    githuburl: p.githubUrl ?? p.githuburl ?? '',
    liveurl: p.liveUrl ?? p.liveurl ?? '',
    image: p.image ?? ''
  };
}

function fromDbProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    githubUrl: row.githuburl ?? row.githubUrl ?? '',
    liveUrl: row.liveurl ?? row.liveUrl ?? '',
    image: row.image ?? ''
  };
}

function toDbTimeline(t) {
  return {
    id: t.id,
    title: t.title || '',
    company: t.company || '',
    role: t.role || '',
    daterange: t.dateRange ?? t.daterange ?? '',
    type: t.type || 'experience',
    description: t.description || ''
  };
}

function fromDbTimeline(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title ?? '',
    company: row.company ?? '',
    role: row.role ?? '',
    dateRange: row.daterange ?? row.dateRange ?? '',
    type: row.type ?? 'experience',
    description: row.description ?? ''
  };
}

function toDbCertificate(c) {
  return {
    id: c.id,
    title: c.title || '',
    issuer: c.issuer || '',
    date: c.date || '',
    credentialurl: c.credentialUrl ?? c.credentialurl ?? '',
    skills: c.skills || '',
    image: c.image ?? ''
  };
}

function fromDbCertificate(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title ?? '',
    issuer: row.issuer ?? '',
    date: row.date ?? '',
    credentialUrl: row.credentialurl ?? row.credentialUrl ?? '',
    skills: row.skills ?? '',
    image: row.image ?? ''
  };
}

function toDbHackathon(h) {
  return {
    id: h.id,
    title: h.title || '',
    organizer: h.organizer || '',
    date: h.date || '',
    role: h.role || '',
    projectname: h.projectName ?? h.projectname ?? '',
    achievement: h.achievement || '',
    description: h.description || '',
    technologies: h.technologies || '',
    projecturl: h.projectUrl ?? h.projecturl ?? '',
    certificateurl: h.certificateUrl ?? h.certificateurl ?? '',
    image: h.image ?? ''
  };
}

function fromDbHackathon(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title ?? '',
    organizer: row.organizer ?? '',
    date: row.date ?? '',
    role: row.role ?? '',
    projectName: row.projectname ?? row.projectName ?? '',
    achievement: row.achievement ?? '',
    description: row.description ?? '',
    technologies: row.technologies ?? '',
    projectUrl: row.projecturl ?? row.projectUrl ?? '',
    certificateUrl: row.certificateurl ?? row.certificateUrl ?? '',
    image: row.image ?? ''
  };
}

function toDbMessage(m) {
  return {
    id: m.id,
    name: m.name || '',
    email: m.email || '',
    subject: m.subject || '',
    message: m.message || '',
    timestamp: m.timestamp || new Date().toISOString(),
    unread: typeof m.unread === 'boolean' ? m.unread : true
  };
}

function fromDbMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    subject: row.subject ?? '',
    message: row.message ?? '',
    timestamp: row.timestamp ?? '',
    unread: typeof row.unread === 'boolean' ? row.unread : true
  };
}

// Direct Async Save & Delete Methods with Cloud Sync
export async function saveSettings(newSettings) {
  const current = getSettings();
  const merged = { ...current, ...newSettings };
  setLocal(STORAGE_KEYS.SETTINGS, merged);
  notifyDataChange('settings');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_settings').upsert([toDbSettings(merged)]);
      if (error) console.warn('Supabase settings upsert error:', error);
    } catch (err) {
      console.warn('Supabase settings upsert failed:', err);
    }
  }
  return merged;
}

export async function saveTechStack(item) {
  const items = getTechStacks();
  const index = items.findIndex(t => t.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  setLocal(STORAGE_KEYS.TECH_STACKS, items);
  notifyDataChange('tech_stacks');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_tech_stacks').upsert([toDbTech(item)]);
      if (error) console.warn('Supabase tech stack upsert error:', error);
    } catch (err) {
      console.warn('Supabase tech stack upsert failed:', err);
    }
  }
  return item;
}

export async function deleteTechStack(id) {
  let items = getTechStacks();
  items = items.filter(t => t.id !== id);
  setLocal(STORAGE_KEYS.TECH_STACKS, items);
  notifyDataChange('tech_stacks');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_tech_stacks').delete().eq('id', id);
      if (error) console.warn('Supabase tech stack delete error:', error);
    } catch (err) {
      console.warn('Supabase tech stack delete failed:', err);
    }
  }
}

export async function saveProject(item) {
  const items = getProjects();
  const index = items.findIndex(p => p.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  setLocal(STORAGE_KEYS.PROJECTS, items);
  notifyDataChange('projects');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_projects').upsert([toDbProject(item)]);
      if (error) console.warn('Supabase project upsert error:', error);
    } catch (err) {
      console.warn('Supabase project upsert failed:', err);
    }
  }
  return item;
}

export async function deleteProject(id) {
  let items = getProjects();
  items = items.filter(p => p.id !== id);
  setLocal(STORAGE_KEYS.PROJECTS, items);
  notifyDataChange('projects');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) console.warn('Supabase project delete error:', error);
    } catch (err) {
      console.warn('Supabase project delete failed:', err);
    }
  }
}

export async function saveTimelineItem(item) {
  const items = getTimeline();
  const index = items.findIndex(t => t.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  setLocal(STORAGE_KEYS.TIMELINE, items);
  notifyDataChange('timeline');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_timeline').upsert([toDbTimeline(item)]);
      if (error) console.warn('Supabase timeline upsert error:', error);
    } catch (err) {
      console.warn('Supabase timeline upsert failed:', err);
    }
  }
  return item;
}

export async function deleteTimelineItem(id) {
  let items = getTimeline();
  items = items.filter(t => t.id !== id);
  setLocal(STORAGE_KEYS.TIMELINE, items);
  notifyDataChange('timeline');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_timeline').delete().eq('id', id);
      if (error) console.warn('Supabase timeline delete error:', error);
    } catch (err) {
      console.warn('Supabase timeline delete failed:', err);
    }
  }
}

export async function saveCertificate(item) {
  const items = getCertificates();
  const index = items.findIndex(c => c.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  setLocal(STORAGE_KEYS.CERTIFICATES, items);
  notifyDataChange('certificates');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_certificates').upsert([toDbCertificate(item)]);
      if (error) console.warn('Supabase certificate upsert error:', error);
    } catch (err) {
      console.warn('Supabase certificate upsert failed:', err);
    }
  }
  return item;
}

export async function deleteCertificate(id) {
  let items = getCertificates();
  items = items.filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.CERTIFICATES, items);
  notifyDataChange('certificates');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_certificates').delete().eq('id', id);
      if (error) console.warn('Supabase certificate delete error:', error);
    } catch (err) {
      console.warn('Supabase certificate delete failed:', err);
    }
  }
}

export async function saveHackathon(item) {
  const items = getHackathons();
  const index = items.findIndex(h => h.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  setLocal(STORAGE_KEYS.HACKATHONS, items);
  notifyDataChange('hackathons');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_hackathons').upsert([toDbHackathon(item)]);
      if (error) console.warn('Supabase hackathon upsert error:', error);
    } catch (err) {
      console.warn('Supabase hackathon upsert failed:', err);
    }
  }
  return item;
}

export async function deleteHackathon(id) {
  let items = getHackathons();
  items = items.filter(h => h.id !== id);
  setLocal(STORAGE_KEYS.HACKATHONS, items);
  notifyDataChange('hackathons');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_hackathons').delete().eq('id', id);
      if (error) console.warn('Supabase hackathon delete error:', error);
    } catch (err) {
      console.warn('Supabase hackathon delete failed:', err);
    }
  }
}

export async function saveMessage(msg) {
  const items = getMessages();
  items.unshift(msg);
  setLocal(STORAGE_KEYS.MESSAGES, items);
  notifyDataChange('messages');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_messages').upsert([toDbMessage(msg)]);
      if (error) console.warn('Supabase message upsert error:', error);
    } catch (err) {
      console.warn('Supabase message upsert failed:', err);
    }
  }
  return msg;
}

export async function deleteMessage(id) {
  let items = getMessages();
  items = items.filter(m => m.id !== id);
  setLocal(STORAGE_KEYS.MESSAGES, items);
  notifyDataChange('messages');

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('portfolio_messages').delete().eq('id', id);
      if (error) console.warn('Supabase message delete error:', error);
    } catch (err) {
      console.warn('Supabase message delete failed:', err);
    }
  }
}

export async function toggleMessageRead(id) {
  const items = getMessages();
  const msg = items.find(m => m.id === id);
  if (msg) {
    msg.unread = !msg.unread;
    setLocal(STORAGE_KEYS.MESSAGES, items);
    notifyDataChange('messages');

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('portfolio_messages').update({ unread: msg.unread }).eq('id', id);
        if (error) console.warn('Supabase update unread error:', error);
      } catch (err) {
        console.warn('Supabase update unread failed:', err);
      }
    }
  }
}

// Global Cloud Sync Engine
export async function syncWithCloud() {
  if (!isSupabaseConfigured()) {
    return { success: false, reason: 'Supabase credentials not configured yet.' };
  }

  try {
    // 1. Settings
    const { data: cloudSettings, error: sErr } = await supabase.from('portfolio_settings').select('*').limit(1);
    if (!sErr && cloudSettings && cloudSettings.length > 0) {
      setLocal(STORAGE_KEYS.SETTINGS, fromDbSettings(cloudSettings[0]));
    } else if (!sErr) {
      const localS = getSettings();
      await supabase.from('portfolio_settings').upsert([toDbSettings(localS)]);
    }

    // 2. Tech Stacks
    const { data: cloudTech, error: tErr } = await supabase.from('portfolio_tech_stacks').select('*').order('created_at', { ascending: true });
    if (!tErr && cloudTech && cloudTech.length > 0) {
      setLocal(STORAGE_KEYS.TECH_STACKS, cloudTech.map(fromDbTech));
    } else if (!tErr) {
      const localT = getTechStacks();
      if (localT.length > 0) await supabase.from('portfolio_tech_stacks').upsert(localT.map(toDbTech));
    }

    // 3. Projects
    const { data: cloudProjects, error: pErr } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: true });
    if (!pErr && cloudProjects && cloudProjects.length > 0) {
      setLocal(STORAGE_KEYS.PROJECTS, cloudProjects.map(fromDbProject));
    } else if (!pErr) {
      const localP = getProjects();
      if (localP.length > 0) await supabase.from('portfolio_projects').upsert(localP.map(toDbProject));
    }

    // 4. Timeline
    const { data: cloudTimeline, error: tlErr } = await supabase.from('portfolio_timeline').select('*').order('created_at', { ascending: true });
    if (!tlErr && cloudTimeline && cloudTimeline.length > 0) {
      setLocal(STORAGE_KEYS.TIMELINE, cloudTimeline.map(fromDbTimeline));
    } else if (!tlErr) {
      const localTl = getTimeline();
      if (localTl.length > 0) await supabase.from('portfolio_timeline').upsert(localTl.map(toDbTimeline));
    }

    // 5. Certificates
    const { data: cloudCerts, error: cErr } = await supabase.from('portfolio_certificates').select('*').order('created_at', { ascending: true });
    if (!cErr && cloudCerts && cloudCerts.length > 0) {
      setLocal(STORAGE_KEYS.CERTIFICATES, cloudCerts.map(fromDbCertificate));
    } else if (!cErr) {
      const localC = getCertificates();
      if (localC.length > 0) await supabase.from('portfolio_certificates').upsert(localC.map(toDbCertificate));
    }

    // 6. Hackathons
    const { data: cloudHacks, error: hErr } = await supabase.from('portfolio_hackathons').select('*').order('created_at', { ascending: true });
    if (!hErr && cloudHacks && cloudHacks.length > 0) {
      setLocal(STORAGE_KEYS.HACKATHONS, cloudHacks.map(fromDbHackathon));
    } else if (!hErr) {
      const localH = getHackathons();
      if (localH.length > 0) await supabase.from('portfolio_hackathons').upsert(localH.map(toDbHackathon));
    }

    // 7. Messages
    const { data: cloudMsgs, error: mErr } = await supabase.from('portfolio_messages').select('*').order('timestamp', { ascending: false });
    if (!mErr && cloudMsgs && cloudMsgs.length > 0) {
      setLocal(STORAGE_KEYS.MESSAGES, cloudMsgs.map(fromDbMessage));
    }

    notifyDataChange('all');
    return { success: true };
  } catch (err) {
    console.error('Cloud synchronization error:', err);
    return { success: false, error: err.message };
  }
}

// Live Realtime Subscription Engine
export function subscribeToCloudChanges(callback) {
  if (!isSupabaseConfigured() || !supabase.channel) return null;

  try {
    const channel = supabase.channel('portfolio_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, async (payload) => {
        console.log('[Supabase Realtime] Table change detected:', payload.table, payload.eventType);
        await syncWithCloud();
        if (typeof callback === 'function') callback(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase] Live realtime sync channel connected.');
        }
      });
    return channel;
  } catch (err) {
    console.warn('[Supabase] Realtime subscription could not be established:', err);
    return null;
  }
}

// Backup & Restore Utilities
export function exportBackupJSON() {
  const fullBackup = {
    settings: getSettings(),
    tech_stacks: getTechStacks(),
    projects: getProjects(),
    timeline: getTimeline(),
    certificates: getCertificates(),
    hackathons: getHackathons(),
    messages: getMessages(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(fullBackup, null, 2);
}

export async function restoreFromBackupJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.settings) setLocal(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.tech_stacks) setLocal(STORAGE_KEYS.TECH_STACKS, data.tech_stacks);
    if (data.projects) setLocal(STORAGE_KEYS.PROJECTS, data.projects);
    if (data.timeline) setLocal(STORAGE_KEYS.TIMELINE, data.timeline);
    if (data.certificates) setLocal(STORAGE_KEYS.CERTIFICATES, data.certificates);
    if (data.hackathons) setLocal(STORAGE_KEYS.HACKATHONS, data.hackathons);
    if (data.messages) setLocal(STORAGE_KEYS.MESSAGES, data.messages);

    notifyDataChange('all');

    if (isSupabaseConfigured()) {
      await syncWithCloud();
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to parse or restore backup:', err);
    return { success: false, error: err.message };
  }
}

export function clearLocalCache() {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  // Re-seed defaults
  getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  getLocal(STORAGE_KEYS.TECH_STACKS, DEFAULT_TECH_STACKS);
  getLocal(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
  getLocal(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE);
  getLocal(STORAGE_KEYS.CERTIFICATES, DEFAULT_CERTIFICATES);
  getLocal(STORAGE_KEYS.HACKATHONS, DEFAULT_HACKATHONS);
  getLocal(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
  notifyDataChange('all');
}
