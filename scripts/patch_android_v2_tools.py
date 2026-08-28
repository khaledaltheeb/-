from pathlib import Path

p=Path('android-app/app/src/main/java/org/healthrenewal/rawafid/MainActivity.java')
text=p.read_text(encoding='utf-8')
anchor='''        sectionTitle("أدواتي الشخصية","ميزات اختيارية داخل روافد وليست هوية التطبيق الأساسية.");\n        card("رفيقة روافد 💗","مساحة اختيارية للعناية اليومية ورسائل الدعم العام باسم تختارينه.",rose,v->showCompanion());'''
replacement='''        sectionTitle("أدواتي الشخصية","ميزات اختيارية داخل روافد وليست هوية التطبيق الأساسية.");\n        card("مكتبتي 📚","احفظ مواد روافد واقرأها لاحقًا، وافتح محفوظاتك من مكان واحد.",Color.rgb(70,94,112),v->startActivity(new Intent(this,LibraryActivity.class)));\n        card("دفتر الأعراض 📝","سجل ملاحظاتك وشدة الأعراض والسياق وما ساعد، محليًا ومشفّرًا ودون تشخيص.",Color.rgb(73,108,77),v->startActivity(new Intent(this,SymptomJournalActivity.class)));\n        card("رفيقة روافد 💗","مساحة اختيارية للعناية اليومية ورسائل الدعم العام باسم تختارينه.",rose,v->showCompanion());'''
if anchor not in text:
    raise SystemExit('fallback tools anchor not found')
text=text.replace(anchor,replacement,1)

old='''        else if("privacy".equals(route)) showPrivacy();\n        else if(tool.webPath!=null&&!tool.webPath.isEmpty()&&tool.webPath.startsWith("/")&&!tool.webPath.startsWith("//")) openWeb(BASE+tool.webPath);'''
new='''        else if("privacy".equals(route)) showPrivacy();\n        else if("library".equals(route)) startActivity(new Intent(this,LibraryActivity.class));\n        else if("symptom_journal".equals(route)) startActivity(new Intent(this,SymptomJournalActivity.class));\n        else if(tool.webPath!=null&&!tool.webPath.isEmpty()&&tool.webPath.startsWith("/")&&!tool.webPath.startsWith("//")) openWeb(BASE+tool.webPath);'''
if old not in text:
    raise SystemExit('route anchor not found')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')
