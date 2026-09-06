export type BilateralActivityKind = 'training-a' | 'training-b' | 'test';

export type BilateralMarker = {
  x: number;
  y: number;
  type: 'pause' | 'slow' | 'switch';
};

export type BilateralActivity = {
  slug: string;
  level: number;
  kind: BilateralActivityKind;
  label: string;
  title: string;
  age: string;
  duration: string;
  purpose: string;
  instruction: string;
  leftPath: string;
  rightPath: string;
  markers?: BilateralMarker[];
  mastery: string;
};

const common = {
  age: '4-8 سنوات',
  duration: '3-5 دقائق',
  purpose: 'تدريب التآزر الثنائي، التتبع البصري الحركي، الانتباه واستمرار الحركة المتزامنة بين اليدين.',
};

export const bilateralActivities: BilateralActivity[] = [
  {
    ...common,
    slug: 'level-1-training-a', level: 1, kind: 'training-a', label: 'تدريب أ', title: 'الموجة الهادئة',
    instruction: 'ضع إصبعًا من كل يد عند البداية، ثم حرّك اليدين معًا حتى النهاية دون رفعهما.',
    leftPath: 'M245 250 C165 330 330 400 225 490 S170 650 250 725 S325 850 245 930',
    rightPath: 'M549 250 C629 330 464 400 569 490 S624 650 544 725 S469 850 549 930',
    mastery: 'يكمل المسارين معًا مع فارق زمني بسيط بين اليدين ودون فقد المسار أكثر من مرتين.',
  },
  {
    ...common,
    slug: 'level-1-training-b', level: 1, kind: 'training-b', label: 'تدريب ب', title: 'الطريق الطويل',
    instruction: 'ابدأ ببطء، وحافظ على أن تتحرك اليدان في الوقت نفسه من أعلى الصفحة إلى أسفلها.',
    leftPath: 'M240 250 C330 325 150 395 250 475 C345 560 160 610 245 690 C330 775 175 845 245 930',
    rightPath: 'M554 250 C464 325 644 395 544 475 C449 560 634 610 549 690 C464 775 619 845 549 930',
    mastery: 'يحافظ على بداية متزامنة ونهاية متقاربة زمنيًا مع تتبع واضح للمسارين.',
  },
  {
    ...common,
    slug: 'level-1-test', level: 1, kind: 'test', label: 'اختبار المستوى 1', title: 'اختبار التزامن الأساسي',
    instruction: 'حرّك اليدين معًا من البداية إلى النهاية. لا توجد نقاط مساعدة؛ حاول المحافظة على التزامن.',
    leftPath: 'M250 250 C180 345 318 405 230 505 C165 580 330 660 240 745 C185 815 305 875 250 930',
    rightPath: 'M544 250 C614 345 476 405 564 505 C629 580 464 660 554 745 C609 815 489 875 544 930',
    mastery: 'الانتقال للمستوى 2 عند إكمال المسارين معًا دون توقف وبأقل من 3 خروجات واضحة عن الخط.',
  },
  {
    ...common,
    slug: 'level-2-training-a', level: 2, kind: 'training-a', label: 'تدريب أ', title: 'منحنيات وزوايا',
    instruction: 'تحرك باليدين معًا. انتبه لتغيّر المسار بين المنحنى والزاوية.',
    leftPath: 'M245 250 C165 300 325 355 220 425 L300 505 C175 565 330 640 225 705 L295 785 C175 845 315 890 245 930',
    rightPath: 'M549 250 C629 300 469 355 574 425 L494 505 C619 565 464 640 569 705 L499 785 C619 845 479 890 549 930',
    mastery: 'يحافظ على التزامن خلال الانتقال بين المنحنيات والزوايا دون توقف طويل.',
  },
  {
    ...common,
    slug: 'level-2-training-b', level: 2, kind: 'training-b', label: 'تدريب ب', title: 'مساران غير متطابقين',
    instruction: 'هذه المرة المساران مختلفان قليلًا. ركّز على كل يد مع الحفاظ على الحركة معًا.',
    leftPath: 'M245 250 C170 320 320 365 230 450 C175 520 320 560 245 640 L300 720 C180 785 330 850 245 930',
    rightPath: 'M549 250 L495 325 C640 390 475 455 565 525 C630 590 470 650 555 715 L500 790 C630 850 485 895 549 930',
    mastery: 'يستمر بكلتا اليدين رغم اختلاف شكل المسارين ويصحح نفسه عند فقد أحد المسارين.',
  },
  {
    ...common,
    slug: 'level-2-test', level: 2, kind: 'test', label: 'اختبار المستوى 2', title: 'اختبار التباين بين اليدين',
    instruction: 'ابدأ باليدين معًا وحافظ على كل يد داخل مسارها حتى النهاية بأقل عدد من الأخطاء.',
    leftPath: 'M245 250 C325 310 165 370 255 440 L205 510 C330 575 175 640 255 710 C320 780 170 845 245 930',
    rightPath: 'M549 250 C475 315 635 380 545 455 C485 515 625 585 535 650 L590 730 C470 795 620 860 549 930',
    mastery: 'الانتقال للمستوى 3 عند إكمال الاختبار دون توقف متكرر ومع بقاء اليدين نشطتين في الوقت نفسه.',
  },
  {
    ...common,
    slug: 'level-3-training-a', level: 3, kind: 'training-a', label: 'تدريب أ', title: 'توقف وواصل',
    instruction: 'تحرك باليدين معًا. عند النجمة توقف لحظة، وعند الدائرة تحرك ببطء ثم واصل.',
    leftPath: 'M245 250 C170 315 325 380 225 455 C170 520 320 575 245 645 C325 715 170 790 245 930',
    rightPath: 'M549 250 C624 315 469 380 569 455 C624 520 474 575 549 645 C469 715 624 790 549 930',
    markers: [{ x: 205, y: 455, type: 'pause' }, { x: 585, y: 455, type: 'pause' }, { x: 265, y: 650, type: 'slow' }, { x: 529, y: 650, type: 'slow' }],
    mastery: 'يتوقف ويبطئ عند الإشارة مع المحافظة على عمل اليدين معًا.',
  },
  {
    ...common,
    slug: 'level-3-training-b', level: 3, kind: 'training-b', label: 'تدريب ب', title: 'إشارات موزعة',
    instruction: 'حافظ على التزامن وانتبه للإشارات في أماكن مختلفة على المسارين.',
    leftPath: 'M245 250 L300 325 C170 385 325 455 225 530 L295 610 C170 685 325 760 245 930',
    rightPath: 'M549 250 C625 320 475 380 565 450 L500 535 C625 610 470 700 560 770 C620 825 490 875 549 930',
    markers: [{ x: 290, y: 330, type: 'pause' }, { x: 520, y: 540, type: 'slow' }, { x: 220, y: 700, type: 'pause' }, { x: 565, y: 780, type: 'slow' }],
    mastery: 'ينتبه للإشارات دون أن تتوقف اليد غير المرتبطة بالإشارة لفترة طويلة.',
  },
  {
    ...common,
    slug: 'level-3-test', level: 3, kind: 'test', label: 'اختبار المستوى 3', title: 'اختبار التوقف والتحكم',
    instruction: 'النجمة تعني توقفًا قصيرًا، والدائرة تعني ببطء. طبّق القاعدة حتى النهاية.',
    leftPath: 'M245 250 C325 315 170 380 250 455 C320 520 175 590 245 665 C180 735 325 805 245 930',
    rightPath: 'M549 250 C474 315 624 380 544 455 C474 520 619 590 549 665 C614 735 469 805 549 930',
    markers: [{ x: 280, y: 455, type: 'pause' }, { x: 514, y: 455, type: 'pause' }, { x: 205, y: 735, type: 'slow' }, { x: 589, y: 735, type: 'slow' }],
    mastery: 'الانتقال للمستوى 4 عند تطبيق قاعدتي التوقف والبطء بدقة مع استمرار التزامن العام.',
  },
  {
    ...common,
    slug: 'level-4-training-a', level: 4, kind: 'training-a', label: 'تدريب أ', title: 'إيقاعان مختلفان',
    instruction: 'المساران مختلفان. اجعل كل يد تتبع مسارها وحاول أن تصل اليدان إلى النهاية معًا.',
    leftPath: 'M245 250 C150 315 345 385 220 455 C340 520 160 590 260 655 L205 730 C335 790 160 860 245 930',
    rightPath: 'M549 250 L500 320 C635 380 475 445 575 515 C630 585 480 650 545 720 C465 790 630 855 549 930',
    mastery: 'ينظم سرعة كل يد بحسب طول المسار ويقترب من إنهاء المسارين في الوقت نفسه.',
  },
  {
    ...common,
    slug: 'level-4-training-b', level: 4, kind: 'training-b', label: 'تدريب ب', title: 'حلقة وزاوية',
    instruction: 'تتبع الحلقات والزوايا بكلتا اليدين دون نسخ حركة يد واحدة باليد الأخرى.',
    leftPath: 'M245 250 C325 315 175 370 245 435 C315 495 180 545 250 605 C315 665 175 720 245 785 C315 845 190 885 245 930',
    rightPath: 'M549 250 C625 315 470 370 550 435 L500 500 L590 565 C470 630 625 700 540 770 L590 835 C500 875 520 905 549 930',
    mastery: 'يحافظ على استقلال نسبي لحركة كل يد مع استمرار المهمة الثنائية.',
  },
  {
    ...common,
    slug: 'level-4-test', level: 4, kind: 'test', label: 'اختبار المستوى 4', title: 'اختبار المسارين غير المتناظرين',
    instruction: 'اتبع المسارين المختلفين معًا دون مساعدة أو نقاط إرشاد.',
    leftPath: 'M245 250 L300 325 C160 390 330 455 230 525 C175 590 325 650 245 720 L300 800 C170 855 320 895 245 930',
    rightPath: 'M549 250 C470 320 635 390 545 455 C475 520 620 585 550 650 C625 710 470 770 550 835 C610 875 510 905 549 930',
    mastery: 'الانتقال للمستوى 5 عند إتمام مسارين مختلفين دون فقد مستمر للتزامن أو الاعتماد على تلميح خارجي.',
  },
  {
    ...common,
    slug: 'level-5-training-a', level: 5, kind: 'training-a', label: 'تدريب أ', title: 'قواعد متغيرة',
    instruction: 'النجمة توقف، الدائرة ببطء، والمثلث يعني غيّر سرعتك قليلًا ثم استمر.',
    leftPath: 'M245 250 C160 320 330 380 225 450 L305 525 C165 590 335 650 235 720 C170 785 330 845 245 930',
    rightPath: 'M549 250 L495 330 C635 390 470 455 565 525 C630 590 470 655 555 725 L495 800 C630 855 480 900 549 930',
    markers: [{ x: 285, y: 450, type: 'pause' }, { x: 505, y: 330, type: 'switch' }, { x: 205, y: 720, type: 'slow' }, { x: 585, y: 725, type: 'pause' }],
    mastery: 'يطبق قواعد متعددة مع الحفاظ على استمرارية المهمة وعدم نسيان اليد الأخرى.',
  },
  {
    ...common,
    slug: 'level-5-training-b', level: 5, kind: 'training-b', label: 'تدريب ب', title: 'تحدي القائدين',
    instruction: 'كل يد لها طريق وإشارات مختلفة. نفذ القواعد بدون أن تتوقف اليد الأخرى إلا عند الحاجة.',
    leftPath: 'M245 250 L305 330 C160 395 335 465 225 535 C330 600 165 670 250 735 L205 815 C335 865 180 900 245 930',
    rightPath: 'M549 250 C625 315 470 380 555 445 L500 515 C625 580 475 650 560 715 C625 780 470 845 549 930',
    markers: [{ x: 300, y: 330, type: 'switch' }, { x: 525, y: 515, type: 'slow' }, { x: 230, y: 735, type: 'pause' }, { x: 575, y: 715, type: 'switch' }],
    mastery: 'ينتقل بين القواعد مع مراقبة اليدين وتصحيح الأداء ذاتيًا عند الخطأ.',
  },
  {
    ...common,
    slug: 'level-5-test', level: 5, kind: 'test', label: 'اختبار المستوى 5', title: 'اختبار الإتقان المتقدم',
    instruction: 'نفذ قواعد الإشارات والمسارين المختلفين من البداية حتى النهاية. هذا اختبار إتقان وليس تشخيصًا.',
    leftPath: 'M245 250 C325 315 165 385 250 455 L205 525 C335 590 170 655 255 720 C325 785 175 850 245 930',
    rightPath: 'M549 250 L500 320 C635 385 470 455 565 525 C625 590 475 655 550 720 L595 790 C470 850 625 895 549 930',
    markers: [{ x: 205, y: 525, type: 'pause' }, { x: 590, y: 320, type: 'switch' }, { x: 255, y: 720, type: 'slow' }, { x: 595, y: 790, type: 'pause' }],
    mastery: 'يُعد المستوى متقنًا عند تطبيق القواعد واستمرار حركة اليدين مع أخطاء محدودة وتصحيح ذاتي واضح.',
  },
];

export const bilateralLevels = [1, 2, 3, 4, 5].map((level) => ({
  level,
  activities: bilateralActivities.filter((activity) => activity.level === level),
}));

export function getBilateralActivity(slug: string) {
  return bilateralActivities.find((activity) => activity.slug === slug) ?? null;
}

if (bilateralActivities.length !== 15 || bilateralLevels.some((item) => item.activities.length !== 3)) {
  throw new Error('Bilateral tracks must contain 5 levels with two trainings and one test per level.');
}
