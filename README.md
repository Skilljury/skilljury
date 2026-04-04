# SkillJury

The public review and discovery layer for AI agent skills. SkillJury combines imported catalog data with structured user reviews, moderation, and trust signals so people can evaluate skills before installing them.

## Features

- **Skill catalog** - Browse and search AI agent skills imported from sources like skills.sh
- **Community reviews** - Structured reviews with ratings, pros/cons, and recommendations
- **Leaderboard** - All-time, trending, and hot skill rankings based on install signals and review data
- **Moderation system** - Review queue, audit logs, and report flows to maintain trust
- **Agent compatibility** - See which AI agents (Claude, Cursor, Windsurf, etc.) support each skill
- **Source provenance** - Direct links back to original repositories and source listings
- **Security audit signals** - Surface security-related metadata when available
- **SEO optimized** - Structured data, sitemaps, and metadata for discoverability

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Language**: TypeScript
- **Deployment**: [Vercel](https://vercel.com)
- **CAPTCHA**: Cloudflare Turnstile
- **Analytics**: Google Analytics

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for database and auth)
- npm, yarn, or pnpm

### Environment Variables

Copy the example below and fill in your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Turnstile (optional, test keys used in development)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# GitHub (optional, for repo metadata enrichment)
GITHUB_TOKEN=your-github-token

# Cron (for scheduled sync)
CRON_SECRET=your-cron-secret

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run sync:skills` | Run skills.sh catalog sync |
| `npm run sync:manual` | Manual sync trigger |

## Project Structure

```
app/                  # Next.js App Router pages and API routes
  api/                # REST API endpoints
  skills/             # Skill detail and review pages
  search/             # Search and browse
  auth/               # Authentication callback
components/           # React components
  auth/               # Auth forms and buttons
  home/               # Homepage components
  reviews/            # Review cards, forms, lists
  skills/             # Skill cards, hero, metadata
  ui/                 # Shared UI primitives
lib/                  # Server and shared utilities
  auth/               # Auth helpers and session management
  db/                 # Database query functions
  supabase/           # Supabase client configuration
  seo/                # Metadata and structured data
  moderation/         # Moderation queue and audit
scripts/              # CLI scripts for data sync
supabase/             # Supabase migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes and ensure `npm run lint` passes
4. Commit with clear, imperative messages
5. Open a pull request as a draft

## License

This project is proprietary. All rights reserved.
