-- Migration-history parity marker.
-- Production received this step while iterating the zero-API evidence extractor.
-- The repository's 20260902060415 migration already contains the consolidated
-- final raw-Arabic-token implementation, so repeating CREATE OR REPLACE here
-- would be redundant. Keep this version/name to match Supabase migration history.
select 1;
