from pathlib import Path

p=Path('android-app/app/src/main/java/org/healthrenewal/rawafid/MainActivity.java')
text=p.read_text(encoding='utf-8')
old='''        int moodCount=prefs.getMoodHistory().size();\n        int followed=0; for(String token:prefs.getSectors().split(",")) if(!token.trim().isEmpty()) followed++;\n        String summary="الاسم المخصص: "+(prefs.getName().isEmpty()?"غير محفوظ":"محفوظ محليًا")+\n                "\\nبيانات دورة: "+(prefs.getLastPeriod()>0?"موجودة":"غير موجودة")+\n                "\\nتسجيلات مزاج محلية: "+moodCount+\n                "\\nمسارات متابعة محفوظة: "+followed+\n                "\\nرفع تلقائي لبيانات الدورة أو المزاج إلى الحساب: لا";'''
new='''        int moodCount=prefs.getMoodHistory().size();\n        int libraryCount=prefs.getLibraryItems().size();\n        int symptomCount=prefs.getSymptomEntries().size();\n        int emergencyCount=prefs.getEmergencyContacts().size();\n        int followed=0; for(String token:prefs.getSectors().split(",")) if(!token.trim().isEmpty()) followed++;\n        String summary="الاسم المخصص: "+(prefs.getName().isEmpty()?"غير محفوظ":"محفوظ محليًا")+\n                "\\nبيانات دورة: "+(prefs.getLastPeriod()>0?"موجودة":"غير موجودة")+\n                "\\nتسجيلات مزاج محلية: "+moodCount+\n                "\\nمواد محفوظة في مكتبتي: "+libraryCount+\n                "\\nتسجيلات دفتر الأعراض: "+symptomCount+\n                "\\nجهات طوارئ محفوظة: "+emergencyCount+\n                "\\nإرفاق الموقع في الطوارئ: "+(prefs.isEmergencyLocationEnabled()?"مفعّل عند الاستخدام وبإذن المستخدم":"غير مفعّل")+\n                "\\nمسارات متابعة محفوظة: "+followed+\n                "\\nرفع تلقائي لبيانات الطوارئ أو الموقع أو الأعراض أو المكتبة أو الدورة أو المزاج إلى الحساب: لا";'''
if old not in text:
    raise SystemExit('privacy summary anchor not found')
text=text.replace(old,new,1)
old2='''                .setMessage("سيؤدي ذلك إلى حذف الاسم، بيانات تقويم المرأة، سجل المزاج، جدول رفيقة روافد، القطاعات المتابعة وحالة التنبيهات المحلية من هذا الجهاز. لا يحذف هذا الإجراء بيانات حساب على الموقع إن كان لديك حساب.")'''
new2='''                .setMessage("سيؤدي ذلك إلى حذف الاسم، خطة الطوارئ وجهات الاتصال المحلية، بيانات تقويم المرأة، سجل المزاج، دفتر الأعراض، مكتبتي، جدول رفيقة روافد، القطاعات المتابعة وحالة التنبيهات المحلية من هذا الجهاز. لا يحذف هذا الإجراء بيانات حساب على الموقع إن كان لديك حساب.")'''
if old2 not in text:
    raise SystemExit('privacy deletion message anchor not found')
text=text.replace(old2,new2,1)
p.write_text(text,encoding='utf-8')
