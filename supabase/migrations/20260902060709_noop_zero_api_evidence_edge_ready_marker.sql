-- Migration-history parity marker.
-- Mirrors an already-applied no-op production migration created during
-- zero-API Edge readiness verification. It intentionally has no schema effect.
select 1;
