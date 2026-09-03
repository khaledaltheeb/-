#!/usr/bin/env python3
"""Fail closed when Rawafid Circle migration history drifts from production.

Canonical filenames and Git-blob SHA-1 values were reconciled against the
Supabase production migration ledger for project ghljwfwqsyfnthvlzxjy on
2026-09-03. The gate protects fresh-environment reproducibility.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS = ROOT / "supabase" / "migrations"

EXPECTED = {
    "20260830190428_rawafid_circle_network.sql": "ce791552a3a44ead074858fd21c3cf2b5d6db205",
    "20260830190525_rawafid_circle_reply_index.sql": "e88b4ff7e5f359e70c2522ae37d0c5f00352cccd",
    "20260830193441_rawafid_circle_permission_snapshot.sql": "addcd591aeed28450855af3a1f4439f9568bac0c",
    "20260830193857_rawafid_circle_answer_idempotency.sql": "ec06b514ee7e7de8a3fa73d6e96bb23dc86d2cba",
    "20260830195116_rawafid_circle_safety_location.sql": "9631695019855f28b9d3e525b12baa434e15cfd0",
    "20260830201720_rawafid_circle_push_devices.sql": "6bcaeb69c344777843e8a8b8f6beb6baab8c7044",
    "20260830201746_rawafid_circle_push_devices_deny_direct.sql": "5037ecd93b99a5d313b9dd618664d13d3ae56ca1",
    "20260830205718_rawafid_circle_push_dispatch.sql": "441a141c0db0d94d3d14fbc68aad27763bffd018",
    "20260830210044_rawafid_circle_push_retry.sql": "c08008b9e9a7a4f25572604c596be1bd38779c95",
    "20260830210255_rawafid_circle_pg_net_schema_hardening.sql": "94785be4fb10689677d72707e057df0fb9566c23",
    "20260830230004_rawafid_circle_safe_drive.sql": "b539eedbf7b73038da8c8c60934b914e79363a5c",
    "20260830230323_rawafid_circle_safe_drive_risk_alert.sql": "07ad046920e8b774caf77e11fde8bd4e94336b1c",
    "20260830231127_rawafid_circle_safe_drive_privacy_rate_limit.sql": "96f578c341f5eaaab1204d59a5effb8d71795b3c",
    "20260830231702_rawafid_circle_safe_drive_permission_constraint.sql": "0f40432b4f4123b51756715e17cc40f10cc92d95",
    "20260830233858_rawafid_circle_safe_drive_agreements.sql": "3e4222eabdbf2f37754d60e90f0b894e567fe758",
    "20260830234259_rawafid_circle_safe_drive_targeted_agreements.sql": "3179c6032cd00d360927e4ae5549ae32f6395e3e",
    "20260830234711_rawafid_circle_safe_drive_agreement_grantor_index.sql": "ace9a0b95bba81100a706570122f6d451cd842a8",
    "20260830235637_rawafid_circle_safe_drive_weekly_reports.sql": "82de2236536d0ef3f472bd40eab0a53b2193040c",
    "20260901021305_harden_private_circle_function_execute_privileges.sql": "957f7170d408adf3d31e8926b341d49111b3e8cf",
}

FORBIDDEN_LEGACY = {
    "20260831001500_rawafid_circle_safe_drive.sql",
    "20260831002000_rawafid_circle_safe_drive_risk_alert.sql",
    "20260831003000_rawafid_circle_safe_drive_privacy_rate_limit.sql",
    "20260831003500_rawafid_circle_safe_drive_permission_constraint.sql",
}


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


errors: list[str] = []
for name, expected_sha in EXPECTED.items():
    path = MIGRATIONS / name
    if not path.is_file():
        errors.append(f"missing canonical Circle migration: {name}")
        continue
    actual_sha = git_blob_sha(path.read_bytes())
    if actual_sha != expected_sha:
        errors.append(
            f"production migration drift: {name}: expected {expected_sha}, got {actual_sha}"
        )

for name in sorted(FORBIDDEN_LEGACY):
    if (MIGRATIONS / name).exists():
        errors.append(f"obsolete duplicate Circle migration must not return: {name}")

if errors:
    raise SystemExit("\n".join(f"ERROR: {error}" for error in errors))

print(f"Circle migration parity OK: {len(EXPECTED)} canonical production migrations verified")
