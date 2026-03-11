create extension if not exists pg_trgm;
create index if not exists sources_slug_idx
  on public.sources (slug);
create index if not exists repositories_source_id_idx
  on public.repositories (source_id);
create index if not exists repositories_owner_name_repository_name_idx
  on public.repositories (owner_name, repository_name);
create index if not exists skills_source_id_idx
  on public.skills (source_id);
create index if not exists skills_repository_id_idx
  on public.skills (repository_id);
create index if not exists skills_status_weekly_installs_idx
  on public.skills (status, weekly_installs desc);
create index if not exists skills_first_seen_at_idx
  on public.skills (first_seen_at desc nulls last);
create index if not exists skills_name_trgm_idx
  on public.skills using gin (name gin_trgm_ops);
create index if not exists skills_search_document_idx
  on public.skills
  using gin (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' ||
      coalesce(short_summary, '') || ' ' ||
      coalesce(long_description, '')
    )
  );
create index if not exists agents_slug_idx
  on public.agents (slug);
create index if not exists skill_agent_compatibility_agent_id_idx
  on public.skill_agent_compatibility (agent_id);
create index if not exists skill_agent_compatibility_install_count_idx
  on public.skill_agent_compatibility (install_count desc);
create index if not exists categories_slug_idx
  on public.categories (slug);
create index if not exists tags_slug_idx
  on public.tags (slug);
create index if not exists skill_categories_category_id_idx
  on public.skill_categories (category_id);
create index if not exists skill_tags_tag_id_idx
  on public.skill_tags (tag_id);
create index if not exists sync_runs_status_started_at_idx
  on public.sync_runs (status, started_at desc);
