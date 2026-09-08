# Portfolio Master Architecture, Blueprint & Setup Specification

## 1. Project Overview & Architecture
- **Type**: High-Performance Framework-less Single-Page Application (SPA)
- **Build System**: Vite 6+ (Vanilla JavaScript ES6+ modules, minified CSS/JS bundles)
- **Cloud Database & Storage**: Supabase (PostgreSQL) with Row-Level Security (RLS) + instant browser `localStorage` fast-read cache
- **AI Engine**: Groq API running Meta's `llama-3.3-70b-versatile` (600+ tokens/sec inference) with client-side direct calling + Vercel Serverless proxy fallback
- **Visual Styling**: Glassmorphism & Cyber-Minimalist Dark/Light theme with CSS Custom Properties, smooth transitions, and responsive flex/grid layouts
- **Interactive 3D**: Custom WebGL/Canvas particle canvas background with responsive mouse-gravity physics
- **Print / Export Engine**: Built-in ATS-friendly printable Resume and CV generator with dedicated print stylesheets (`?print=resume`, `?print=cv`)
- **Deployment Platform**: Vercel with GitHub CI/CD and Serverless Edge Functions (`/api/`)

## 2. Directory Tree & File Inventory
```
ALL_ME/
├── api/
│   ├── gemini.js       # Universal Serverless AI Proxy (Groq Llama 3.3 70B with Gemini fallback)
│   └── status.js       # Serverless health-check endpoint for live AI keys
├── public/
│   ├── favicon.svg     # SVG Logo icon
│   ├── icons.svg       # SVG sprite sheet
│   ├── llms.txt        # LLM-readable summary for AI search engines & crawlers
│   ├── robots.txt      # Web crawler configuration
│   └── sitemap.xml     # SEO Sitemap
├── src/
│   ├── ai.js           # Groq AI client, system prompts, job-fit analyzer, and email drafter
│   ├── data.js         # Database layer, Supabase cloud sync, backup/restore & cache logic
│   ├── main.js         # Router, UI controllers, 3D particle canvas, and print router
│   ├── style.css       # Design tokens, glassmorphism, responsive grids, and print stylesheet
│   └── supabase.js     # Supabase JS client initializer
├── index.html          # Main SPA entrypoint containing all public views, modals, & admin console
├── package.json        # Vite + @supabase/supabase-js dependencies
├── PORTFOLIO_MASTER_GUIDE.md # This complete specification document
└── vercel.json         # Vercel deployment routing configuration
```

## 3. Database Schema (Supabase PostgreSQL SQL Script)

Execute the following SQL script inside the Supabase SQL Editor:

```sql
-- 1. Portfolio Settings & Profile Bio
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  ownerName TEXT DEFAULT 'Aditi',
  ownerBio TEXT DEFAULT '',
  email TEXT DEFAULT 'aditi@example.com',
  location TEXT DEFAULT 'India',
  linkedin TEXT DEFAULT 'https://www.linkedin.com/',
  github TEXT DEFAULT 'https://github.com/',
  codolio TEXT DEFAULT 'https://codolio.com/',
  medium TEXT DEFAULT 'https://medium.com/',
  groqKey TEXT DEFAULT '',
  geminiKey TEXT DEFAULT '',
  categories JSONB DEFAULT '["Frontend", "Backend", "Databases", "DevOps", "Version Control"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Technical Skills & Toolkit
CREATE TABLE IF NOT EXISTS portfolio_tech_stacks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  level INT DEFAULT 80,
  icon TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Featured Projects
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Development',
  description TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  githubUrl TEXT DEFAULT '',
  liveUrl TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Professional & Academic Journey (Timeline)
CREATE TABLE IF NOT EXISTS portfolio_timeline (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT DEFAULT 'Student',
  dateRange TEXT DEFAULT '',
  type TEXT DEFAULT 'education',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Certificates & Credentials
CREATE TABLE IF NOT EXISTS portfolio_certificates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT DEFAULT '',
  date TEXT DEFAULT '',
  credentialUrl TEXT DEFAULT '',
  skills TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Hackathons & Competitions
CREATE TABLE IF NOT EXISTS portfolio_hackathons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organizer TEXT DEFAULT '',
  date TEXT DEFAULT '',
  role TEXT DEFAULT '',
  projectName TEXT DEFAULT '',
  achievement TEXT DEFAULT '',
  description TEXT DEFAULT '',
  technologies TEXT DEFAULT '',
  projectUrl TEXT DEFAULT '',
  certificateUrl TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Blog Articles
CREATE TABLE IF NOT EXISTS portfolio_blog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  content TEXT DEFAULT '',
  date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Contact Inquiries & Inbox
CREATE TABLE IF NOT EXISTS portfolio_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  unread BOOLEAN DEFAULT TRUE
);

-- ENABLE ROW-LEVEL SECURITY & ANON POLICIES
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_tech_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_messages ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE 
  tbl TEXT;
BEGIN 
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'portfolio_%' 
  LOOP 
    EXECUTE format('DROP POLICY IF EXISTS "Public Read" ON %I;', tbl);
    EXECUTE format('CREATE POLICY "Public Read" ON %I FOR SELECT USING (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Anon Write" ON %I;', tbl);
    EXECUTE format('CREATE POLICY "Anon Write" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP; 
END $$;
```

## 4. Admin Authentication
- **Passcode**: `"aditi2408"` (Validated using SHA-256)
- **URL**: `#admin` or click lock icon in header navigation
