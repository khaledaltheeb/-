-- Migration-history parity marker.
-- Production received this step while hardening zero-API evidence RPC privileges.
-- The repository's 20260902060625 migration already contains the consolidated
-- revoke/grant boundary for the evidence RPCs, so no DDL is repeated here.
select 1;
