#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
JAVA = ROOT / "android" / "app" / "src" / "main" / "java" / "org" / "healthrenewal" / "rawafid"

shell = (JAVA / "AdaptiveShell.kt").read_text(encoding="utf-8")
account = (JAVA / "CircleAccountActivity.kt").read_text(encoding="utf-8")
features = (JAVA / "FeatureCatalog.kt").read_text(encoding="utf-8")

errors = []

required_shell = [
    'MORE("more", "حسابي", Icons.Default.AccountCircle)',
    'Text("حسابي ودائرتي"',
    '"إنشاء حساب / دخول"',
    'Text("رقمي وربط الجهات")',
    '"rawafid_account"',
    '"my_circle"',
    '"family")',
]
for token in required_shell:
    if token not in shell:
        errors.append(f"AdaptiveShell.kt missing discoverability contract: {token}")

if shell.count("AccountCircleGatewayCard(context = context, features = all)") < 2:
    errors.append("Account/Circle gateway must be visible both on Today and on the Account tab")

first_gateway = shell.find("AccountCircleGatewayCard(context = context, features = all)")
first_quick_actions = shell.find('SectionHeader("أحتاج الآن"')
if first_gateway < 0 or first_quick_actions < 0 or first_gateway > first_quick_actions:
    errors.append("Today screen must show account/Circle gateway before quick-action sections")

more_header = shell.find('PageHeader("حسابي والمزيد"')
knowledge = shell.find('Text("معرفة روافد"', more_header)
more_gateway = shell.find("AccountCircleGatewayCard(context = context, features = all)", more_header)
if more_header < 0 or more_gateway < 0 or knowledge < 0 or not (more_header < more_gateway < knowledge):
    errors.append("Account tab must show account/Circle gateway before knowledge/settings content")

required_account = [
    'Text("شروط كلمة المرور"',
    'CirclePasswordPolicy.isValid(password)',
    '"إنشاء الحساب والحصول على رقم RFD"',
    'Spam / Junk',
]
for token in required_account:
    if token not in account:
        errors.append(f"CircleAccountActivity.kt missing onboarding contract: {token}")

for token in ['id = "rawafid_account"', 'feature.id == "my_circle"']:
    if token not in features:
        errors.append(f"FeatureCatalog.kt missing account/Circle route: {token}")

if errors:
    print("ANDROID ACCOUNT DISCOVERY VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Android account/Circle discoverability OK: Today + Account tab + onboarding/password/Spam guidance verified")
