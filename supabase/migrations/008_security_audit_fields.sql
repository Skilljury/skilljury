alter table public.skills
add column if not exists security_audits jsonb not null default '{}'::jsonb;

comment on column public.skills.security_audits is 'Security audit results scraped from skills.sh. Shape: { gen?: "pass"|"fail"|"warn"|"safe"|"high_risk"|"critical", socket?: "pass"|"warn"|"fail", snyk?: "pass"|"warn"|"fail", scraped_at?: string }.';
