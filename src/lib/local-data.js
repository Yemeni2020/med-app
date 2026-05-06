const now = Date.now();
const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

export const sampleArticles = [
  {
    id: 'heart-health-basics',
    title: 'Heart Health Basics Every Adult Should Know',
    excerpt: 'A practical overview of blood pressure, cholesterol, activity, and warning signs worth discussing with a clinician.',
    content: `## Why heart health matters

Cardiovascular disease risk changes over time, so regular checkups and a clear prevention plan matter.

### Core habits

- Keep blood pressure and cholesterol monitored.
- Aim for consistent movement most days.
- Prioritize sleep, tobacco avoidance, and stress management.

Seek urgent care for chest pain, severe shortness of breath, fainting, or stroke-like symptoms.`,
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
    excerpt: 'FAST symptoms, sudden neurologic changes, and why immediate evaluation can change outcomes.',
    content: `## Think FAST

Face drooping, arm weakness, speech difficulty, and time to call emergency services are key stroke warning signs.

Sudden vision loss, severe dizziness, confusion, or the worst headache of your life can also be urgent.

Do not wait to see if symptoms pass. Time-sensitive treatments depend on rapid evaluation.`,
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
    excerpt: 'How to check changing moles and when to schedule a dermatology visit.',
    content: `## What to watch for

Use the ABCDE pattern: asymmetry, border changes, color variation, diameter, and evolution.

Any spot that changes, bleeds, itches persistently, or looks unlike the others should be reviewed.

Routine screening frequency depends on risk factors, family history, and prior skin findings.`,
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
    excerpt: 'What parents should know when immunizations are delayed or records are incomplete.',
    content: `## Catch-up schedules are common

Missed vaccine doses usually do not mean starting over. Pediatric teams use catch-up schedules to close gaps safely.

Bring all available records to the visit and ask which vaccines are due now, which can wait, and what side effects to expect.`,
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
    excerpt: 'A patient-friendly overview of immune-related side effects that should not be ignored.',
    content: `## Side effects can appear anywhere

Immunotherapy can affect skin, bowel, lungs, hormone glands, liver, and other organs.

Call your oncology team for persistent diarrhea, new cough, shortness of breath, severe fatigue, rash, fever, or yellowing skin.

Early treatment often prevents complications.`,
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
    excerpt: 'Therapy, medication, lifestyle supports, and when advanced treatments may be considered.',
    content: `## Treatment is individualized

Depression care can include psychotherapy, medication, sleep and activity support, and treatment of related medical conditions.

People with severe symptoms, suicidal thoughts, psychosis, or inability to function need urgent professional support.

If one treatment has not worked, that does not mean nothing will help.`,
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
  { id: 'qa-heart-failure', title: 'Managing Heart Failure in 2026: New Approaches', description: 'A live discussion on medicines, device therapy, and remote monitoring.', expert_name: 'Dr. James Thompson', expert_title: 'MD, FACC - Cardiology', specialty: 'Cardiology', status: 'upcoming', session_date: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(), questions_count: 42 },
  { id: 'qa-immunotherapy', title: 'Immunotherapy Side Effects: What Patients Need to Know', description: 'Common and rare immune-related adverse events and how teams manage them.', expert_name: 'Dr. Sarah Mitchell', expert_title: 'MD, PhD - Oncology', specialty: 'Oncology', status: 'upcoming', session_date: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(), questions_count: 28 },
  { id: 'qa-stroke-recovery', title: 'Stroke Recovery: Setting Realistic Expectations', description: 'Neuroplasticity, rehabilitation timelines, and recovery goals after stroke.', expert_name: 'Dr. Aisha Rahman', expert_title: 'MD, PhD - Neurology', specialty: 'Neurology', status: 'completed', session_date: daysAgo(10), recording_url: '#', questions_count: 67 },
];

export const newsItems = [
  { id: 'news-crispr', title: 'Gene Therapy Expands Treatment Options for Inherited Blood Disorders', summary: 'New gene-editing therapies are changing how clinicians discuss long-term treatment plans for some inherited blood disorders.', source: 'Medical Review Desk', category: 'breakthrough', is_breaking: true, cover_image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400', created_date: daysAgo(1) },
  { id: 'news-heart-failure', title: 'Heart Failure Care Increasingly Focuses on Earlier Intervention', summary: 'Updated care pathways emphasize earlier risk recognition, multidisciplinary follow-up, and medication optimization.', source: 'Cardiology Update', category: 'treatment', cover_image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', created_date: daysAgo(3) },
  { id: 'news-ai-alzheimers', title: 'AI Research Targets Earlier Detection of Cognitive Decline', summary: 'Researchers are evaluating models that combine imaging, cognitive tests, and clinical data to flag risk earlier.', source: 'Research Brief', category: 'technology', cover_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', created_date: daysAgo(7) },
];

export const patientStories = [
  { id: 'story-lymphoma', title: 'From Diagnosis to Remission: My Lymphoma Journey', condition: 'Hodgkin Lymphoma', story: "Six rounds of chemotherapy later, I rang the bell. The biggest lesson was to ask questions and lean on my care team.", is_anonymous: false, display_name: 'Maria G.' },
  { id: 'story-diabetes', title: 'Living and Thriving with Type 1 Diabetes', condition: 'Type 1 Diabetes', story: 'A CGM and insulin pump changed my life. I run, travel, and feel more confident managing daily decisions.', is_anonymous: false, display_name: 'Daniel W.' },
  { id: 'story-stroke', title: 'How I Recovered from a Major Stroke at 45', condition: 'Ischemic Stroke', story: 'Months of speech and physical therapy helped me return to teaching. Recovery was slow, but progress came.', is_anonymous: false, display_name: 'James R.' },
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
