const now = Date.now();
const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

export const sampleArticles = [
  {
    id: 'heart-health-basics',
    title: 'Heart Health Basics Every Adult Should Know',
    title_ar: 'أساسيات صحة القلب التي ينبغي لكل بالغ معرفتها',
    excerpt: 'A practical overview of blood pressure, cholesterol, activity, and warning signs worth discussing with a clinician.',
    excerpt_ar: 'نظرة عملية على ضغط الدم والكوليسترول والنشاط البدني والعلامات التحذيرية التي تستحق مناقشتها مع الطبيب.',
    content: `## Why heart health matters

Cardiovascular disease risk changes over time, so regular checkups and a clear prevention plan matter.

### Core habits

- Keep blood pressure and cholesterol monitored.
- Aim for consistent movement most days.
- Prioritize sleep, tobacco avoidance, and stress management.

Seek urgent care for chest pain, severe shortness of breath, fainting, or stroke-like symptoms.`,
    content_ar: `## لماذا تهم صحة القلب

يتغير خطر أمراض القلب والأوعية مع الوقت، لذلك تظل المتابعة الدورية وخطة الوقاية الواضحة أمرين مهمين.

### العادات الأساسية

- راقب ضغط الدم والكوليسترول بانتظام.
- احرص على الحركة المنتظمة في معظم أيام الأسبوع.
- أعطِ أولوية للنوم، والابتعاد عن التبغ، وتقليل التوتر.

اطلب رعاية عاجلة عند ألم الصدر أو ضيق النفس الشديد أو الإغماء أو أعراض تشبه السكتة الدماغية.`,
    category: 'cardiology',
    author_name: 'Dr. James Thompson',
    author_title: 'MD, FACC - Cardiology',
    read_time_minutes: 6,
    views_count: 1280,
    likes_count: 84,
    is_featured: true,
    is_peer_reviewed: true,
    cover_image: 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=1200',
    tags: ['prevention', 'blood pressure', 'cardiology'],
    created_date: daysAgo(2),
  },
  {
    id: 'stroke-warning-signs',
    title: 'Recognizing Stroke Warning Signs Quickly',
    title_ar: 'التعرف السريع على علامات السكتة الدماغية',
    excerpt: 'FAST symptoms, sudden neurologic changes, and why immediate evaluation can change outcomes.',
    excerpt_ar: 'أعراض FAST والتغيرات العصبية المفاجئة ولماذا قد يغير التقييم الفوري النتيجة.',
    content: `## Think FAST

Face drooping, arm weakness, speech difficulty, and time to call emergency services are key stroke warning signs.

Sudden vision loss, severe dizziness, confusion, or the worst headache of your life can also be urgent.

Do not wait to see if symptoms pass. Time-sensitive treatments depend on rapid evaluation.`,
    content_ar: `## تذكر قاعدة FAST

هبوط الوجه وضعف الذراع وصعوبة الكلام وضرورة الاتصال بالطوارئ بسرعة هي علامات أساسية للسكتة الدماغية.

كما أن فقدان النظر المفاجئ أو الدوخة الشديدة أو الارتباك أو أسوأ صداع مفاجئ في حياتك قد تكون حالات طارئة أيضًا.

لا تنتظر لترى إن كانت الأعراض ستزول. العلاجات الحساسة للوقت تعتمد على التقييم السريع.`,
    category: 'neurology',
    author_name: 'Dr. Aisha Rahman',
    author_title: 'MD, PhD - Neurology',
    read_time_minutes: 5,
    views_count: 940,
    likes_count: 51,
    is_peer_reviewed: true,
    cover_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200',
    tags: ['stroke', 'emergency', 'neurology'],
    created_date: daysAgo(5),
  },
  {
    id: 'skin-screening-guide',
    title: 'A Simple Guide to Skin Cancer Screening',
    title_ar: 'دليل مبسط لفحص سرطان الجلد',
    excerpt: 'How to check changing moles and when to schedule a dermatology visit.',
    excerpt_ar: 'كيف تراقب الشامات المتغيرة ومتى ينبغي حجز موعد مع طبيب الجلدية.',
    content: `## What to watch for

Use the ABCDE pattern: asymmetry, border changes, color variation, diameter, and evolution.

Any spot that changes, bleeds, itches persistently, or looks unlike the others should be reviewed.

Routine screening frequency depends on risk factors, family history, and prior skin findings.`,
    content_ar: `## ما الذي ينبغي مراقبته

استخدم نمط ABCDE: عدم التماثل، تغير الحدود، اختلاف اللون، القطر، والتطور مع الوقت.

أي بقعة تتغير أو تنزف أو تسبب حكة مستمرة أو تبدو مختلفة بوضوح عن غيرها تستحق التقييم.

يعتمد تكرار الفحص الدوري على عوامل الخطر والتاريخ العائلي ونتائج الجلد السابقة.`,
    category: 'dermatology',
    author_name: 'Dr. Elena Vasquez',
    author_title: 'MD - Dermatology',
    read_time_minutes: 4,
    views_count: 760,
    likes_count: 33,
    cover_image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200',
    tags: ['screening', 'dermatology'],
    created_date: daysAgo(8),
  },
  {
    id: 'childhood-vaccine-catchup',
    title: 'Understanding Childhood Vaccine Catch-Up Schedules',
    title_ar: 'فهم جداول استدراك لقاحات الأطفال',
    excerpt: 'What parents should know when immunizations are delayed or records are incomplete.',
    excerpt_ar: 'ما الذي يجب أن يعرفه الأهل عند تأخر اللقاحات أو نقص السجلات.',
    content: `## Catch-up schedules are common

Missed vaccine doses usually do not mean starting over. Pediatric teams use catch-up schedules to close gaps safely.

Bring all available records to the visit and ask which vaccines are due now, which can wait, and what side effects to expect.`,
    content_ar: `## جداول الاستدراك شائعة

فوات بعض جرعات اللقاح لا يعني عادة البدء من الصفر. تستخدم فرق طب الأطفال جداول استدراك لسد الفجوات بأمان.

أحضر جميع السجلات المتوفرة إلى الموعد واسأل عن اللقاحات المطلوبة الآن، وما يمكن تأجيله، وما الآثار الجانبية المتوقعة.`,
    category: 'pediatrics',
    author_name: 'Dr. Michael Chen',
    author_title: 'MD, FAAP - Pediatrics',
    read_time_minutes: 5,
    views_count: 680,
    likes_count: 47,
    is_peer_reviewed: true,
    cover_image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200',
    tags: ['vaccines', 'pediatrics'],
    created_date: daysAgo(11),
  },
  {
    id: 'immunotherapy-side-effects',
    title: 'Immunotherapy Side Effects: When to Call Your Oncology Team',
    title_ar: 'الآثار الجانبية للعلاج المناعي: متى تتواصل مع فريق الأورام؟',
    excerpt: 'A patient-friendly overview of immune-related side effects that should not be ignored.',
    excerpt_ar: 'شرح مبسط للمرضى عن الآثار الجانبية المناعية التي لا ينبغي تجاهلها.',
    content: `## Side effects can appear anywhere

Immunotherapy can affect skin, bowel, lungs, hormone glands, liver, and other organs.

Call your oncology team for persistent diarrhea, new cough, shortness of breath, severe fatigue, rash, fever, or yellowing skin.

Early treatment often prevents complications.`,
    content_ar: `## قد تظهر الأعراض في أكثر من عضو

يمكن أن يؤثر العلاج المناعي في الجلد والأمعاء والرئتين والغدد الهرمونية والكبد وأعضاء أخرى.

تواصل مع فريق الأورام عند وجود إسهال مستمر أو سعال جديد أو ضيق تنفس أو إرهاق شديد أو طفح جلدي أو حمى أو اصفرار الجلد.

العلاج المبكر يساعد غالبًا على منع المضاعفات.`,
    category: 'oncology',
    author_name: 'Dr. Sarah Mitchell',
    author_title: 'MD, PhD - Oncology',
    read_time_minutes: 7,
    views_count: 1110,
    likes_count: 72,
    cover_image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200',
    tags: ['oncology', 'immunotherapy'],
    created_date: daysAgo(14),
  },
  {
    id: 'depression-treatment-options',
    title: 'Modern Treatment Options for Depression',
    title_ar: 'الخيارات الحديثة لعلاج الاكتئاب',
    excerpt: 'Therapy, medication, lifestyle supports, and when advanced treatments may be considered.',
    excerpt_ar: 'العلاج النفسي والأدوية ودعم نمط الحياة ومتى قد تُبحث الخيارات المتقدمة.',
    content: `## Treatment is individualized

Depression care can include psychotherapy, medication, sleep and activity support, and treatment of related medical conditions.

People with severe symptoms, suicidal thoughts, psychosis, or inability to function need urgent professional support.

If one treatment has not worked, that does not mean nothing will help.`,
    content_ar: `## العلاج يُفصّل بحسب الحالة

قد يشمل علاج الاكتئاب العلاج النفسي أو الأدوية أو دعم النوم والنشاط البدني أو علاج الحالات الطبية المصاحبة.

الأشخاص الذين لديهم أعراض شديدة أو أفكار انتحارية أو ذهان أو عجز كبير عن الأداء يحتاجون إلى دعم مهني عاجل.

عدم نجاح علاج واحد لا يعني أن جميع الخيارات الأخرى لن تفيد.`,
    category: 'psychiatry',
    author_name: 'Dr. Robert Kim',
    author_title: 'MD, PhD - Psychiatry',
    read_time_minutes: 6,
    views_count: 820,
    likes_count: 65,
    cover_image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=1200',
    tags: ['mental health', 'depression'],
    created_date: daysAgo(17),
  },
];

export const qaSessions = [
  { id: 'qa-heart-failure', title: 'Managing Heart Failure in 2026: New Approaches', title_ar: 'إدارة فشل القلب في 2026: مقاربات جديدة', description: 'A live discussion on medicines, device therapy, and remote monitoring.', description_ar: 'نقاش مباشر حول الأدوية والعلاج بالأجهزة والمراقبة عن بُعد.', expert_name: 'Dr. James Thompson', expert_title: 'MD, FACC - Cardiology', specialty: 'Cardiology', specialty_ar: 'أمراض القلب', status: 'upcoming', session_date: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(), questions_count: 42 },
  { id: 'qa-immunotherapy', title: 'Immunotherapy Side Effects: What Patients Need to Know', title_ar: 'الآثار الجانبية للعلاج المناعي: ما الذي يحتاج المرضى إلى معرفته؟', description: 'Common and rare immune-related adverse events and how teams manage them.', description_ar: 'الآثار الجانبية المناعية الشائعة والنادرة وكيف تديرها الفرق الطبية.', expert_name: 'Dr. Sarah Mitchell', expert_title: 'MD, PhD - Oncology', specialty: 'Oncology', specialty_ar: 'الأورام', status: 'upcoming', session_date: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(), questions_count: 28 },
  { id: 'qa-stroke-recovery', title: 'Stroke Recovery: Setting Realistic Expectations', title_ar: 'التعافي بعد السكتة الدماغية: وضع توقعات واقعية', description: 'Neuroplasticity, rehabilitation timelines, and recovery goals after stroke.', description_ar: 'مرونة الدماغ والجداول الزمنية للتأهيل وأهداف التعافي بعد السكتة.', expert_name: 'Dr. Aisha Rahman', expert_title: 'MD, PhD - Neurology', specialty: 'Neurology', specialty_ar: 'الأعصاب', status: 'completed', session_date: daysAgo(10), recording_url: '#', questions_count: 67 },
];

export const newsItems = [
  { id: 'news-crispr', title: 'Gene Therapy Expands Treatment Options for Inherited Blood Disorders', title_ar: 'العلاج الجيني يوسع خيارات علاج اضطرابات الدم الوراثية', summary: 'New gene-editing therapies are changing how clinicians discuss long-term treatment plans for some inherited blood disorders.', summary_ar: 'علاجات جديدة لتحرير الجينات تغيّر طريقة مناقشة الأطباء لخطط العلاج طويلة الأمد لبعض اضطرابات الدم الوراثية.', source: 'Medical Review Desk', source_ar: 'هيئة المراجعة الطبية', category: 'breakthrough', is_breaking: true, cover_image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400', created_date: daysAgo(1) },
  { id: 'news-heart-failure', title: 'Heart Failure Care Increasingly Focuses on Earlier Intervention', title_ar: 'رعاية فشل القلب تركز بصورة أكبر على التدخل المبكر', summary: 'Updated care pathways emphasize earlier risk recognition, multidisciplinary follow-up, and medication optimization.', summary_ar: 'المسارات العلاجية المحدثة تركز على اكتشاف الخطر مبكرًا والمتابعة متعددة التخصصات وتحسين الأدوية.', source: 'Cardiology Update', source_ar: 'تحديثات أمراض القلب', category: 'treatment', cover_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', created_date: daysAgo(3) },
  { id: 'news-ai-alzheimers', title: 'AI Research Targets Earlier Detection of Cognitive Decline', title_ar: 'أبحاث الذكاء الاصطناعي تستهدف الكشف المبكر عن التراجع المعرفي', summary: 'Researchers are evaluating models that combine imaging, cognitive tests, and clinical data to flag risk earlier.', summary_ar: 'يقيم الباحثون نماذج تجمع بين التصوير والاختبارات المعرفية والبيانات السريرية لرصد الخطر مبكرًا.', source: 'Research Brief', source_ar: 'موجز الأبحاث', category: 'technology', cover_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', created_date: daysAgo(7) },
];

export const patientStories = [
  { id: 'story-lymphoma', title: 'From Diagnosis to Remission: My Lymphoma Journey', title_ar: 'من التشخيص إلى التعافي: رحلتي مع الليمفوما', condition: 'Hodgkin Lymphoma', condition_ar: 'ليمفوما هودجكين', story: "Six rounds of chemotherapy later, I rang the bell. The biggest lesson was to ask questions and lean on my care team.", story_ar: 'بعد ست جولات من العلاج الكيميائي، قرعت جرس التعافي. أهم درس تعلمته هو أن أطرح الأسئلة وأستند إلى فريق رعايتي.', is_anonymous: false, display_name: 'Maria G.' },
  { id: 'story-diabetes', title: 'Living and Thriving with Type 1 Diabetes', title_ar: 'التعايش والنجاح مع السكري من النوع الأول', condition: 'Type 1 Diabetes', condition_ar: 'السكري من النوع الأول', story: 'A CGM and insulin pump changed my life. I run, travel, and feel more confident managing daily decisions.', story_ar: 'غيّر جهاز المراقبة المستمرة ومضخة الأنسولين حياتي. أصبحت أمارس الجري وأسافر وأشعر بثقة أكبر في قراراتي اليومية.', is_anonymous: false, display_name: 'Daniel W.' },
  { id: 'story-stroke', title: 'How I Recovered from a Major Stroke at 45', title_ar: 'كيف تعافيت من سكتة دماغية كبيرة في سن 45', condition: 'Ischemic Stroke', condition_ar: 'سكتة دماغية إقفارية', story: 'Months of speech and physical therapy helped me return to teaching. Recovery was slow, but progress came.', story_ar: 'ساعدتني أشهر من علاج النطق والعلاج الطبيعي على العودة إلى التدريس. كان التعافي بطيئًا، لكنه تحقق خطوة خطوة.', is_anonymous: false, display_name: 'James R.' },
];

export function listArticles(limit = sampleArticles.length) {
  return sampleArticles.slice(0, limit);
}

export function getArticle(articleId) {
  return sampleArticles.find((article) => article.id === articleId);
}

export function listQASessions() {
  return qaSessions;
}

export function listNewsItems() {
  return newsItems;
}

export function listPatientStories() {
  return patientStories;
}

export function analyzeSymptoms(symptoms, lang = 'en') {
  const normalized = symptoms.map((symptom) => symptom.toLowerCase());
  const emergencySignals = ['chest pain', 'shortness of breath', 'difficulty breathing', 'stroke', 'fainting'];
  const urgentSignals = ['fever', 'vomiting', 'dizziness', 'abdominal pain'];
  const hasEmergency = normalized.some((symptom) => emergencySignals.some((signal) => symptom.includes(signal)));
  const hasUrgent = normalized.some((symptom) => urgentSignals.some((signal) => symptom.includes(signal)));
  const urgency = hasEmergency ? 'emergency' : hasUrgent ? 'urgent' : 'moderate';

  if (lang === 'ar') {
    return {
      urgency,
      summary: `تم تسجيل الأعراض التالية: ${symptoms.join('، ')}. لا تستطيع هذه الأداة تقديم تشخيص، لكنها تساعدك في تقدير مدى سرعة طلب الرعاية.`,
      possible_causes: [
        {
          name: 'حالة مرضية حادة شائعة',
          likelihood: 'possible',
          description: 'بعض العدوى القصيرة أو الحالات الالتهابية قد تسبب مجموعة متداخلة من الأعراض.',
        },
        {
          name: 'حالة تحتاج إلى تقييم سريري',
          likelihood: hasEmergency ? 'common' : 'possible',
          description: 'بعض مجموعات الأعراض تحتاج إلى فحص مباشر وقياس للعلامات الحيوية وربما تحاليل إضافية.',
        },
      ],
      recommendation: hasEmergency
        ? 'اطلب رعاية طارئة الآن أو اتصل بخدمات الطوارئ المحلية.'
        : hasUrgent
          ? 'تواصل مع طبيب أو مركز رعاية عاجلة قريبًا، خصوصًا إذا كانت الأعراض تزداد سوءًا.'
          : 'اطلب استشارة طبية إذا استمرت الأعراض أو ساءت أو سببت لك قلقًا.',
      red_flags: ['ألم الصدر', 'صعوبة التنفس', 'إغماء', 'ارتباك', 'ألم شديد أو متفاقم', 'علامات السكتة الدماغية'],
      disclaimer: 'هذه معلومات إرشادية فقط وليست تشخيصًا طبيًا. استشر مختصًا صحيًا مؤهلًا للحصول على المشورة الطبية.',
    };
  }

  return {
    urgency,
    summary: `You reported ${symptoms.join(', ')}. This tool cannot diagnose you, but it can help you decide how quickly to seek care.`,
    possible_causes: [
      {
        name: 'Common acute illness',
        likelihood: 'possible',
        description: 'Several short-term infections or inflammatory conditions can cause overlapping symptoms.',
      },
      {
        name: 'Condition requiring clinical evaluation',
        likelihood: hasEmergency ? 'common' : 'possible',
        description: 'Some symptom combinations need an in-person exam, vitals, and possibly tests.',
      },
    ],
    recommendation: hasEmergency
      ? 'Seek emergency care now or call local emergency services.'
      : hasUrgent
        ? 'Contact a clinician or urgent care soon, especially if symptoms are worsening.'
        : 'Schedule medical advice if symptoms persist, worsen, or concern you.',
    red_flags: ['Chest pain', 'Trouble breathing', 'Fainting', 'Confusion', 'Severe or worsening pain', 'Signs of stroke'],
    disclaimer: 'This is informational guidance only and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice.',
  };
}
