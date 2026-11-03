# Property title trigram rollout

These scripts are operational SQL, not an automatic Prisma migration. Do not run them on production without a production-like before/after benchmark and DBA approval.

1. Record endpoint p50/p95/p99, DB CPU, connections, write latency and replication lag.
2. Run `benchmark.sql` for common, rare, missing, short and multi-word terms before the index.
3. Run `property-title-trigram.up.sql` with autocommit enabled during a low-traffic window.
4. Monitor `pg_stat_progress_create_index`, locks, CPU, disk and replication lag.
5. Re-run `benchmark.sql` and confirm the planner uses `properties_title_trgm_idx` where beneficial.
6. Canary the backend and observe at least one normal traffic window.
7. Roll back with `property-title-trigram.down.sql` if the agreed budgets regress.

Do not add trigram indexes to `cities`, landing pages or property options without an independent benchmark showing a material p95 improvement.
