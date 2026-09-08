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
  ownerBio: 'Full-Stack Software Engineer & AI Systems Architect passionate about building high-performance web applications, intelligent developer tooling, and interactive 3D digital experiences.',
  email: 'aditi.tech@example.com',
  location: 'Bengaluru, Karnataka, India',
  linkedin: 'https://www.linkedin.com/in/aditi-codes',
  github: 'https://github.com/aditi-codes',
  codolio: 'https://codolio.com/profile/aditi',
  medium: 'https://medium.com/@aditi_codes',
  groqKey: '',
  geminiKey: '',
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

// Direct Async Save & Delete Methods with Cloud Sync
export async function saveSettings(newSettings) {
  const current = getSettings();
  const merged = { ...current, ...newSettings };
  setLocal(STORAGE_KEYS.SETTINGS, merged);
  notifyDataChange('settings');

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('portfolio_settings').upsert([merged]);
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
      await supabase.from('portfolio_tech_stacks').upsert([item]);
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
      await supabase.from('portfolio_tech_stacks').delete().eq('id', id);
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
      await supabase.from('portfolio_projects').upsert([item]);
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
      await supabase.from('portfolio_projects').delete().eq('id', id);
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
      await supabase.from('portfolio_timeline').upsert([item]);
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
      await supabase.from('portfolio_timeline').delete().eq('id', id);
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
      await supabase.from('portfolio_certificates').upsert([item]);
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
      await supabase.from('portfolio_certificates').delete().eq('id', id);
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
      await supabase.from('portfolio_hackathons').upsert([item]);
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
      await supabase.from('portfolio_hackathons').delete().eq('id', id);
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
      await supabase.from('portfolio_messages').upsert([msg]);
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
      await supabase.from('portfolio_messages').delete().eq('id', id);
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
        await supabase.from('portfolio_messages').update({ unread: msg.unread }).eq('id', id);
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
      setLocal(STORAGE_KEYS.SETTINGS, cloudSettings[0]);
    } else if (!sErr) {
      // Empty in cloud: upload local
      const localS = getSettings();
      await supabase.from('portfolio_settings').upsert([localS]);
    }

    // 2. Tech Stacks
    const { data: cloudTech, error: tErr } = await supabase.from('portfolio_tech_stacks').select('*');
    if (!tErr && cloudTech && cloudTech.length > 0) {
      setLocal(STORAGE_KEYS.TECH_STACKS, cloudTech);
    } else if (!tErr) {
      const localT = getTechStacks();
      if (localT.length > 0) await supabase.from('portfolio_tech_stacks').upsert(localT);
    }

    // 3. Projects
    const { data: cloudProjects, error: pErr } = await supabase.from('portfolio_projects').select('*');
    if (!pErr && cloudProjects && cloudProjects.length > 0) {
      setLocal(STORAGE_KEYS.PROJECTS, cloudProjects);
    } else if (!pErr) {
      const localP = getProjects();
      if (localP.length > 0) await supabase.from('portfolio_projects').upsert(localP);
    }

    // 4. Timeline
    const { data: cloudTimeline, error: tlErr } = await supabase.from('portfolio_timeline').select('*');
    if (!tlErr && cloudTimeline && cloudTimeline.length > 0) {
      setLocal(STORAGE_KEYS.TIMELINE, cloudTimeline);
    } else if (!tlErr) {
      const localTl = getTimeline();
      if (localTl.length > 0) await supabase.from('portfolio_timeline').upsert(localTl);
    }

    // 5. Certificates
    const { data: cloudCerts, error: cErr } = await supabase.from('portfolio_certificates').select('*');
    if (!cErr && cloudCerts && cloudCerts.length > 0) {
      setLocal(STORAGE_KEYS.CERTIFICATES, cloudCerts);
    } else if (!cErr) {
      const localC = getCertificates();
      if (localC.length > 0) await supabase.from('portfolio_certificates').upsert(localC);
    }

    // 6. Hackathons
    const { data: cloudHacks, error: hErr } = await supabase.from('portfolio_hackathons').select('*');
    if (!hErr && cloudHacks && cloudHacks.length > 0) {
      setLocal(STORAGE_KEYS.HACKATHONS, cloudHacks);
    } else if (!hErr) {
      const localH = getHackathons();
      if (localH.length > 0) await supabase.from('portfolio_hackathons').upsert(localH);
    }

    // 7. Messages
    const { data: cloudMsgs, error: mErr } = await supabase.from('portfolio_messages').select('*');
    if (!mErr && cloudMsgs && cloudMsgs.length > 0) {
      setLocal(STORAGE_KEYS.MESSAGES, cloudMsgs);
    }

    notifyDataChange('all');
    return { success: true };
  } catch (err) {
    console.error('Cloud synchronization error:', err);
    return { success: false, error: err.message };
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
