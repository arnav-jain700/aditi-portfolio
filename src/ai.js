import {
  getSettings,
  getTechStacks,
  getProjects,
  getTimeline,
  getCertificates,
  getHackathons
} from './data.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.3-70b-versatile';

// Retrieve active Groq Key from settings or environment
export function getActiveApiKey() {
  const settings = getSettings();
  return (
    settings.groqKey ||
    import.meta.env.VITE_GROQ_API_KEY ||
    localStorage.getItem('groq_api_key') ||
    ''
  );
}

// Universal AI Caller (Direct Groq with Serverless fallback)
export async function callAI(messages, systemPrompt, temperature = 0.6) {
  const apiKey = getActiveApiKey();

  // 1. Direct Groq API Call
  if (apiKey && apiKey.startsWith('gsk_')) {
    try {
      const fullMessages = [];
      if (systemPrompt) {
        fullMessages.push({ role: 'system', content: systemPrompt });
      }
      fullMessages.push(...messages);

      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: fullMessages,
          temperature,
          max_tokens: 1500
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API Error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (directErr) {
      console.warn('Direct Groq call error, attempting proxy:', directErr);
    }
  }

  // 2. Serverless Proxy Fallback (/api/gemini)
  try {
    const proxyRes = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt, temperature })
    });

    if (proxyRes.ok) {
      const pData = await proxyRes.json();
      if (pData.reply) return pData.reply;
    }
  } catch (proxyErr) {
    console.warn('Proxy call unavailable:', proxyErr);
  }

  throw new Error('AI API unavailable or no API key configured. Utilizing local fallback.');
}

// Build live portfolio context string
function buildPortfolioContext() {
  const s = getSettings();
  const tech = getTechStacks();
  const projs = getProjects();
  const time = getTimeline();
  const certs = getCertificates();
  const hacks = getHackathons();

  return `
PORTFOLIO DEVELOPER INFORMATION:
- Name: ${s.ownerName}
- Bio: ${s.ownerBio}
- Email: ${s.email}
- Location: ${s.location}
- Socials: GitHub: ${s.github}, LinkedIn: ${s.linkedin}

TECHNICAL SKILLS:
${tech.map(t => `- ${t.name} (${t.category}, Proficiency: ${t.level}%)`).join('\n')}

FEATURED PROJECTS:
${projs.map(p => `- ${p.title} [Category: ${p.category}]: ${p.description} (Tech: ${p.tags.join(', ')}) Live: ${p.liveUrl}, Code: ${p.githubUrl}`).join('\n')}

EXPERIENCE & EDUCATION:
${time.map(t => `- [${t.type.toUpperCase()}] ${t.title} at ${t.company} (${t.dateRange}): ${t.description}`).join('\n')}

CERTIFICATIONS:
${certs.map(c => `- ${c.title} by ${c.issuer} (${c.date}) - Skills: ${c.skills}`).join('\n')}

HACKATHONS & HONORS:
${hacks.map(h => `- ${h.title} (${h.achievement}) - Project: ${h.projectName} (${h.technologies}): ${h.description}`).join('\n')}
`;
}

// Chatbot Persona Response Generator
export async function getChatbotResponse(chatHistory, userMessage) {
  const s = getSettings();
  const context = buildPortfolioContext();

  const systemPrompt = `
You are the dedicated AI Assistant and representative for ${s.ownerName}'s developer portfolio.
Your purpose is to welcome recruiters, engineers, founders, and visitors, and provide crisp, professional, and engaging answers regarding ${s.ownerName}'s technical background, projects, experience, skillsets, and availability.

Guidelines:
1. Always be polite, concise, and technically knowledgeable.
2. Use markdown formatting with bullet points, bold highlights, and code tags when mentioning technologies.
3. Only cite facts provided in the Developer Information below. If asked about something not in the profile, politely state you do not have that information and invite them to reach out via the Contact form or email (${s.email}).
4. Never hallucinate fake credentials or companies.
5. Keep answers to 2-3 short, impactful paragraphs.

CONTEXT:
${context}
`;

  const messages = [...chatHistory, { role: 'user', content: userMessage }];

  try {
    return await callAI(messages, systemPrompt, 0.6);
  } catch (err) {
    // Offline intelligent fallback engine
    return getOfflineChatbotResponse(userMessage, s);
  }
}

// Intelligent Offline Fallback for Chatbot
function getOfflineChatbotResponse(query, settings) {
  const q = query.toLowerCase();
  const tech = getTechStacks();
  const projs = getProjects();
  const time = getTimeline();
  const certs = getCertificates();

  if (q.includes('skill') || q.includes('stack') || q.includes('technolog') || q.includes('language')) {
    const topSkills = tech.slice(0, 8).map(t => `**${t.name}** (${t.category})`).join(', ');
    return `**${settings.ownerName}** specializes in: \n\n${topSkills}, and more. You can explore the full interactive skill breakdown and proficiency meters in the **#skills** section!`;
  }

  if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('built')) {
    const pList = projs.slice(0, 3).map(p => `• **${p.title}**: ${p.description}`).join('\n\n');
    return `Here are some highlighted projects built by **${settings.ownerName}**:\n\n${pList}\n\nCheck out the full **#projects** hub for live demos, source code, and architecture deep-dives!`;
  }

  if (q.includes('experience') || q.includes('job') || q.includes('career') || q.includes('education') || q.includes('degree')) {
    const tList = time.slice(0, 2).map(t => `• **${t.title}** at *${t.company}* (${t.dateRange})`).join('\n');
    return `Here is a snapshot of **${settings.ownerName}**'s journey:\n\n${tList}\n\nHead over to the **#journey** timeline for complete academic and career milestones!`;
  }

  if (q.includes('certif') || q.includes('credential') || q.includes('award') || q.includes('hackathon')) {
    const cList = certs.slice(0, 2).map(c => `• **${c.title}** (${c.issuer})`).join('\n');
    return `**${settings.ownerName}** holds verified credentials including:\n\n${cList}\n\nVisit the **#certificates** and **#hackathons** sections to see verification links and award details.`;
  }

  if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('reach') || q.includes('message')) {
    return `You can connect with **${settings.ownerName}** directly at **${settings.email}** or send a message right here via the **#contact** form. You can also connect on [LinkedIn](${settings.linkedin}) or [GitHub](${settings.github})!`;
  }

  if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
    return `You can instantly download an ATS-friendly printable **[Resume](?print=resume)** or **[Curriculum Vitae](?print=cv)** directly from this site by clicking the download buttons in the hero section or using the print URL options!`;
  }

  return `Hello! I am ${settings.ownerName}'s AI representative. I can answer questions about projects, technical skills, career journey, certifications, or how to get in touch. Feel free to ask about any specific stack or project! *(Tip: Add your Groq API Key in Admin Settings for live 600+ token/s real-time AI conversations!)*`;
}

// Recruiter Job-Fit Analyzer
export async function analyzeJobFit(jobDescription) {
  const context = buildPortfolioContext();

  const systemPrompt = `
You are an expert technical recruiter and talent evaluator analyzing a candidate's portfolio against a target Job Description (JD).
Compare the candidate's skills, projects, and background to the requirements in the JD.

Output strictly valid JSON with no markdown backticks, matching this exact schema:
{
  "fitScore": <number between 0 and 100>,
  "strengths": [<string array of matching skills and capabilities>],
  "gaps": [<string array of missing competencies or unmentioned requirements>],
  "matchedProjects": [<string array of project titles from the portfolio that best prove competence for this role>],
  "summary": "<concise 2-3 sentence executive match summary>"
}

PORTFOLIO DETAILS:
${context}
`;

  try {
    const raw = await callAI([{ role: 'user', content: `JOB DESCRIPTION:\n${jobDescription}` }], systemPrompt, 0.2);
    // Parse JSON safely
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.warn('Groq AI job analyzer fallback triggered:', err);
    return computeOfflineJobFit(jobDescription);
  }
}

// Offline Semantic Token Overlap Matcher
export function computeOfflineJobFit(jdText) {
  const jdLower = jdText.toLowerCase();
  const tech = getTechStacks();
  const projs = getProjects();

  const matchedSkills = [];
  const missingCommon = ['Kubernetes', 'GraphQL', 'AWS Lambda', 'Terraform', 'Kafka', 'System Design', 'C++', 'Rust'];
  const potentialGaps = [];

  tech.forEach(t => {
    const nameLower = t.name.toLowerCase();
    const parts = nameLower.split(/[\s/&,]+/);
    const hasMatch = parts.some(p => p.length > 2 && jdLower.includes(p));
    if (hasMatch) {
      matchedSkills.push(t.name);
    }
  });

  missingCommon.forEach(item => {
    if (jdLower.includes(item.toLowerCase()) && !tech.some(t => t.name.toLowerCase().includes(item.toLowerCase()))) {
      potentialGaps.push(item);
    }
  });

  // Highlight relevant projects
  const relevantProjects = [];
  projs.forEach(p => {
    let score = 0;
    p.tags.forEach(tag => {
      if (jdLower.includes(tag.toLowerCase())) score++;
    });
    if (jdLower.includes(p.category.toLowerCase())) score += 2;
    if (score > 0) {
      relevantProjects.push(p.title);
    }
  });

  if (relevantProjects.length === 0 && projs.length > 0) {
    relevantProjects.push(projs[0].title);
  }

  // Calculate realistic score based on matches
  let fitScore = 65;
  if (matchedSkills.length > 0) {
    fitScore += Math.min(matchedSkills.length * 6, 28);
  }
  if (potentialGaps.length > 2) {
    fitScore -= Math.min(potentialGaps.length * 4, 15);
  }
  fitScore = Math.max(45, Math.min(96, fitScore));

  const strengths = matchedSkills.length > 0
    ? matchedSkills.slice(0, 6).map(s => `Demonstrated proficiency in ${s}`)
    : ['Full-stack JavaScript/TypeScript modern ecosystem', 'RESTful API architecture & cloud deployment', 'High-performance UI & reactive state management'];

  const gaps = potentialGaps.length > 0
    ? potentialGaps.slice(0, 4).map(g => `Explicit experience with ${g}`)
    : ['Role-specific proprietary domain knowledge', 'Advanced large-scale multi-region telemetry'];

  const s = getSettings();
  const summary = `Candidate ${s.ownerName} demonstrates strong alignment (${fitScore}%) with the core tech requirements specified in the job description. Portfolio projects like ${relevantProjects[0] || 'featured works'} highlight hands-on execution and modern production-grade architecture.`;

  return {
    fitScore,
    strengths,
    gaps,
    matchedProjects: relevantProjects.slice(0, 3),
    summary
  };
}

// AI Suggest Project Description (for Admin Console)
export async function suggestProjectDescription(title, tags) {
  const prompt = `Generate a compelling, high-impact 2-sentence developer portfolio description for a project titled "${title}" built with technologies: ${tags.join(', ')}. Focus on technical architecture, performance, and real-world value.`;
  try {
    return await callAI([{ role: 'user', content: prompt }], 'You are a senior software engineering career coach. Output only the description text.', 0.7);
  } catch (e) {
    return `An enterprise-grade, responsive application built with ${tags.join(', ')}. Features real-time state management, modular architecture, and optimized performance benchmarks.`;
  }
}

// AI Draft Reply to Message (for Admin Messages Inbox)
export async function draftEmailReply(senderName, subject, messageBody) {
  const s = getSettings();
  const prompt = `Draft a polite, professional, and enthusiastic email response from ${s.ownerName} to ${senderName}, who sent the following inquiry:\nSubject: "${subject}"\nMessage: "${messageBody}".\nExpress appreciation and indicate readiness to discuss next steps.`;
  try {
    return await callAI([{ role: 'user', content: prompt }], 'You are a professional executive communications assistant. Output only the email body text without email headers.', 0.6);
  } catch (e) {
    return `Hi ${senderName},\n\nThank you for reaching out regarding "${subject}". I really appreciate your interest in my work. I would be delighted to discuss this further and explore potential collaboration. Let me know when would be a convenient time for a brief call!\n\nBest regards,\n${s.ownerName}`;
  }
}
