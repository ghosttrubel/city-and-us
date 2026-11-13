-- READ ONLY. Save output privately; inspect before applying migrations.
select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' order by table_name,ordinal_position;
select tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='public';
select conrelid::regclass,pg_get_constraintdef(oid) from pg_constraint where connamespace='public'::regnamespace;
select pg_get_triggerdef(t.oid),pg_get_functiondef(t.tgfoid) from pg_trigger t where not t.tgisinternal and t.tgrelid in (select oid from pg_class where relnamespace='public'::regnamespace);
select routine_name,grantee,privilege_type from information_schema.routine_privileges where routine_schema='public';
select tablename from pg_publication_tables where pubname='supabase_realtime';
