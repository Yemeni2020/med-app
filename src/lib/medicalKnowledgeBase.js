const EVIDENCE_WEIGHTS = {
  guideline: 6,
  'clinical-reference': 5,
  review: 4,
  'public-health': 4,
  'medication-safety': 4,
  'patient-education': 3,
  reference: 2,
};

const EMBEDDING_DIMENSION = 384;

export const specialtyTopicPacks = {
  emergency: {
    label: 'Emergency and urgent care',
    keywords: ['emergency', 'urgent', 'red flag', 'danger sign', 'chest pain', 'stroke', 'bleeding'],
  },
  cardiology: {
    label: 'Cardiology',
    keywords: ['heart', 'cardiac', 'blood pressure', 'hypertension', 'palpitations', 'chest pain'],
  },
  respiratory: {
    label: 'Respiratory medicine',
    keywords: ['cough', 'breathing', 'asthma', 'wheeze', 'pneumonia', 'oxygen'],
  },
  sleepMedicine: {
    label: 'Sleep medicine',
    keywords: ['sleep', 'insomnia', 'can t sleep', 'cannot sleep', 'poor sleep', 'snoring', 'daytime sleepiness'],
  },
  neurology: {
    label: 'Neurology',
    keywords: ['stroke', 'weakness', 'headache', 'seizure', 'vision loss', 'numbness'],
  },
  endocrinology: {
    label: 'Endocrinology',
    keywords: ['diabetes', 'glucose', 'sugar', 'hypoglycemia', 'thyroid'],
  },
  gastroenterology: {
    label: 'Gastroenterology',
    keywords: ['abdominal pain', 'vomiting', 'diarrhea', 'dehydration', 'stool'],
  },
  pediatrics: {
    label: 'Pediatrics',
    keywords: ['child', 'infant', 'baby', 'fever in child', 'pediatric', 'dehydration'],
  },
  womensHealth: {
    label: 'Women’s health and pregnancy',
    keywords: ['pregnancy', 'pregnant', 'bleeding in pregnancy', 'fetal movement', 'postpartum'],
  },
  dermatology: {
    label: 'Dermatology',
    keywords: ['rash', 'skin', 'itching', 'hives', 'blister'],
  },
  mentalHealth: {
    label: 'Mental health crisis',
    keywords: ['suicidal', 'self harm', 'panic', 'psychosis', 'mental health emergency'],
  },
  medications: {
    label: 'Medication safety',
    keywords: ['medicine', 'medication', 'dose', 'drug', 'tablet', 'side effect', 'interaction'],
  },
};

const SPECIALTY_KEYWORDS = {
  emergency: [
    'emergency', 'urgent', 'red flag', 'danger sign', 'immediately', 'call ambulance',
    'طارئ', 'إسعاف', 'خطر', 'فوراً', 'فوري',
  ],
  cardiology: [
    'heart', 'cardiac', 'blood pressure', 'hypertension', 'palpitation', 'palpitations', 'chest pain',
    'pulse', 'arrhythmia', 'bp', 'pressure', 'قلب', 'ضغط', 'نبض', 'خفقان', 'ألم الصدر',
  ],
  respiratory: [
    'cough', 'breath', 'breathing', 'shortness of breath', 'asthma', 'wheeze', 'oxygen', 'phlegm',
    'chest infection', 'lung', 'سعال', 'تنفس', 'ضيق التنفس', 'صدر', 'بلغم', 'ربو',
  ],
  sleepMedicine: [
    'sleep', 'sleeping', 'insomnia', 'can t sleep', 'cannot sleep', 'poor sleep', 'sleep quality', 'snoring',
    'waking often', 'daytime sleepiness', 'sleep apnea', 'نوم', 'أرق', 'لا أستطيع النوم', 'ما اقدر انام',
    'مشاكل النوم', 'جودة النوم', 'شخير', 'نعاس', 'انقطاع النفس اثناء النوم',
  ],
  neurology: [
    'stroke', 'headache', 'migraine', 'weakness', 'numbness', 'seizure', 'dizziness', 'vision loss',
    'speech', 'face droop', 'جلطة', 'صداع', 'دوخة', 'ضعف', 'خدر', 'تشنج', 'رؤية',
  ],
  endocrinology: [
    'diabetes', 'glucose', 'sugar', 'hypoglycemia', 'hyperglycemia', 'insulin', 'thyroid',
    'سكري', 'سكر', 'جلوكوز', 'أنسولين', 'غدة', 'هبوط السكر', 'ارتفاع السكر',
  ],
  gastroenterology: [
    'abdominal', 'abdomen', 'stomach', 'vomiting', 'diarrhea', 'constipation', 'dehydration', 'nausea',
    'blood in stool', 'ألم البطن', 'قيء', 'استفراغ', 'إسهال', 'إمساك', 'جفاف', 'غثيان',
  ],
  pediatrics: [
    'child', 'children', 'infant', 'baby', 'newborn', 'kid', 'pediatric',
    'طفل', 'أطفال', 'رضيع', 'مولود', 'طفلة', 'طفلتي',
  ],
  womensHealth: [
    'pregnancy', 'pregnant', 'postpartum', 'breastfeeding', 'vaginal bleeding', 'fetal movement',
    'حامل', 'حمل', 'نفاس', 'رضاعة', 'نزيف مهبلي', 'حركة الجنين',
  ],
  dermatology: [
    'rash', 'skin', 'itch', 'itching', 'hives', 'blister', 'eczema', 'dermatitis',
    'طفح', 'جلد', 'حكة', 'حبوب', 'فقاعات',
  ],
  mentalHealth: [
    'suicidal', 'self harm', 'harm myself', 'panic attack', 'psychosis', 'hallucination',
    'انتحار', 'إيذاء نفسي', 'هلع', 'ذهان', 'هلاوس',
  ],
  medications: [
    'medicine', 'medication', 'dose', 'dosing', 'drug', 'tablet', 'capsule', 'antibiotic',
    'painkiller', 'interaction', 'side effect', 'prescription', 'دواء', 'جرعة', 'حبوب', 'مضاد حيوي', 'أثر جانبي',
  ],
};

const INTENT_KEYWORDS = {
  symptoms: [
    'symptom', 'symptoms', 'feel', 'pain', 'hurts', 'causes', 'why', 'what does it mean',
    'rash', 'fever', 'cough', 'sleep', 'insomnia', 'can t sleep', 'cannot sleep',
    'أعراض', 'ألم', 'سبب', 'ماذا يعني', 'أشعر', 'حمى', 'سعال', 'نوم', 'أرق', 'لا أستطيع النوم',
  ],
  medications: [
    'medicine', 'medication', 'drug', 'dose', 'dosing', 'tablet', 'pill', 'capsule',
    'side effect', 'interaction', 'safe with', 'during pregnancy', 'دواء', 'جرعة', 'حبوب', 'تداخل', 'آمن',
  ],
  triage: [
    'should i go', 'should i worry', 'is it dangerous', 'when should', 'emergency', 'urgent',
    'seek care', 'go to hospital', 'now or later', 'هل هو خطير', 'هل أذهب', 'متى أراجع', 'طوارئ', 'مستشفى', 'عاجل',
  ],
  prevention: [
    'prevent', 'avoid', 'reduce risk', 'lifestyle', 'monitor', 'screening', 'improve sleep', 'sleep hygiene',
    'وقاية', 'منع', 'تقليل الخطر', 'نمط الحياة', 'متابعة', 'تحسين النوم',
  ],
};

const VULNERABLE_GROUP_KEYWORDS = {
  pregnancy: ['pregnancy', 'pregnant', 'حامل', 'حمل'],
  children: ['child', 'children', 'infant', 'baby', 'طفل', 'رضيع'],
  olderAdult: ['older adult', 'elderly', 'frail', 'senior', 'كبير السن', 'مسن'],
};

export const defaultMedicalSources = [
  {
    id: 'aasm-insomnia-basics',
    title: 'Insomnia Basics and Sleep Hygiene',
    organization: 'American Academy of Sleep Medicine',
    url: 'https://aasm.org',
    category: 'sleep-medicine',
    specialty: 'sleepMedicine',
    topicPack: 'sleepMedicine',
    evidenceLevel: 'clinical-reference',
    tags: ['sleep', 'insomnia', 'sleep hygiene', 'difficulty sleeping', 'sleep quality'],
    summary: 'Difficulty falling asleep or staying asleep is often related to stress, inconsistent sleep schedule, caffeine, naps, pain, anxiety, depression, or other medical conditions. Basic sleep hygiene can help, but persistent insomnia deserves clinical review.',
    content: 'Insomnia may include trouble falling asleep, waking often, or waking too early and not returning to sleep. Helpful measures include a regular sleep-wake schedule, limiting caffeine late in the day, reducing screen use near bedtime, and keeping the sleep environment dark and quiet. Medical review is appropriate when insomnia lasts for weeks, causes major daytime impairment, or occurs with loud snoring, breathing pauses, chest pain, severe anxiety, or depression.',
  },
  {
    id: 'nhlbi-sleep-deprivation-effects',
    title: 'Poor Sleep and Daytime Function',
    organization: 'National Heart, Lung, and Blood Institute',
    url: 'https://www.nhlbi.nih.gov',
    category: 'sleep-medicine',
    specialty: 'sleepMedicine',
    topicPack: 'sleepMedicine',
    evidenceLevel: 'patient-education',
    tags: ['sleep deprivation', 'sleep quality', 'fatigue', 'sleep schedule', 'daytime sleepiness'],
    summary: 'Poor sleep can affect concentration, mood, blood pressure, appetite, and daytime safety. Persistent poor sleep should not be dismissed when it affects normal function.',
    content: 'Short-term poor sleep may happen with stress or temporary schedule disruption, but persistent sleep problems can impair concentration, mood, work performance, and safety. Sleep problems deserve review when they are frequent, worsening, or linked with loud snoring, breathing pauses, leg discomfort, depression, or significant daytime sleepiness.',
  },
  {
    id: 'who-emergency-warning-signs',
    title: 'Emergency Warning Signs and When to Seek Immediate Care',
    organization: 'World Health Organization',
    url: 'https://www.who.int',
    category: 'emergency-care',
    specialty: 'emergency',
    topicPack: 'emergency',
    evidenceLevel: 'guideline',
    tags: ['emergency', 'chest pain', 'stroke', 'breathing', 'seizure', 'urgent care'],
    summary: 'Urgent evaluation is needed for chest pain, severe breathing difficulty, stroke symptoms, severe bleeding, seizures, sudden confusion, collapse, or anaphylaxis.',
    content: 'Immediate emergency assessment is recommended for chest pain, severe shortness of breath, signs of stroke such as face droop or one-sided weakness, severe bleeding, seizures, sudden confusion, collapse, or signs of anaphylaxis including throat swelling and breathing trouble.',
  },
  {
    id: 'aha-chest-pain-triage',
    title: 'Chest Pain Triage and High-Risk Features',
    organization: 'American Heart Association',
    url: 'https://www.heart.org',
    category: 'cardiovascular',
    specialty: 'cardiology',
    topicPack: 'cardiology',
    evidenceLevel: 'guideline',
    tags: ['chest pain', 'heart attack', 'cardiology', 'emergency', 'pressure', 'sweating'],
    summary: 'Chest pressure with shortness of breath, sweating, nausea, fainting, or pain spreading to the arm, back, or jaw needs urgent evaluation.',
    content: 'Chest discomfort may come from several causes, but pressure, heaviness, or squeezing associated with shortness of breath, sweating, nausea, collapse, or pain radiating to the arm, jaw, back, or shoulder should be treated as potentially cardiac until proven otherwise.',
  },
  {
    id: 'nhlbi-hypertension-basics',
    title: 'High Blood Pressure Basics and Follow-up',
    organization: 'National Heart, Lung, and Blood Institute',
    url: 'https://www.nhlbi.nih.gov',
    category: 'cardiovascular',
    specialty: 'cardiology',
    topicPack: 'cardiology',
    evidenceLevel: 'clinical-reference',
    tags: ['blood pressure', 'hypertension', 'heart', 'stroke prevention', 'monitoring'],
    summary: 'High blood pressure often has no symptoms and requires repeat measurement, lifestyle management, and clinician-guided treatment when persistent.',
    content: 'High blood pressure is commonly silent. Repeated elevated measurements should be confirmed using proper technique and clinician follow-up. Lifestyle measures such as lowering sodium intake, improving activity, weight management, sleep support, and medication when prescribed are core management strategies. Severe blood pressure elevation with neurologic symptoms, chest pain, or breathing difficulty needs urgent evaluation.',
  },
  {
    id: 'esc-heart-failure-worsening-signs',
    title: 'Heart Failure Worsening Signs',
    organization: 'European Society of Cardiology',
    url: 'https://www.escardio.org',
    category: 'cardiovascular',
    specialty: 'cardiology',
    topicPack: 'cardiology',
    evidenceLevel: 'clinical-reference',
    tags: ['heart failure', 'leg swelling', 'orthopnea', 'weight gain', 'shortness of breath'],
    summary: 'Rapid swelling, sudden weight gain, worsening breathlessness, or needing to sleep upright can suggest worsening heart failure.',
    content: 'Fluid retention, new or worsening leg swelling, sudden weight gain over a short period, waking breathless at night, or needing extra pillows to breathe more comfortably can indicate worsening heart failure and should prompt clinical review. Severe breathing difficulty is an emergency.',
  },
  {
    id: 'cdc-cough-respiratory-evaluation',
    title: 'Evaluation of Cough and Respiratory Symptoms',
    organization: 'Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov',
    category: 'respiratory',
    specialty: 'respiratory',
    topicPack: 'respiratory',
    evidenceLevel: 'public-health',
    tags: ['cough', 'fever', 'respiratory', 'shortness of breath', 'infection'],
    summary: 'Cough with fever, breathing difficulty, low oxygen symptoms, chest pain, or dehydration needs timely clinical review.',
    content: 'A short cough may be due to a viral illness, but cough with fever, worsening breathing trouble, chest pain, confusion, bluish lips, low fluid intake, or symptoms lasting longer than expected should be medically reviewed. Breathing difficulty and oxygen-related symptoms are higher priority than mild isolated cough.',
  },
  {
    id: 'ginasthma-exacerbation-red-flags',
    title: 'Asthma Exacerbation Warning Features',
    organization: 'Global Initiative for Asthma',
    url: 'https://ginasthma.org',
    category: 'respiratory',
    specialty: 'respiratory',
    topicPack: 'respiratory',
    evidenceLevel: 'guideline',
    tags: ['asthma', 'wheeze', 'inhaler', 'breathing', 'rescue inhaler'],
    summary: 'Frequent rescue inhaler use, worsening wheeze, difficulty speaking, or reduced response to usual inhaler treatment can mean a significant asthma flare.',
    content: 'Asthma symptoms that are escalating despite usual rescue treatment, trouble speaking full sentences, visible chest effort, exhaustion, or bluish lips require urgent evaluation. Repeated nocturnal symptoms or increased need for reliever medication suggest poor control and need follow-up.',
  },
  {
    id: 'idsa-pneumonia-clinical-review',
    title: 'Pneumonia Review Triggers',
    organization: 'Infectious Diseases Society of America',
    url: 'https://www.idsociety.org',
    category: 'respiratory',
    specialty: 'respiratory',
    topicPack: 'respiratory',
    evidenceLevel: 'review',
    tags: ['pneumonia', 'cough', 'fever', 'chills', 'shortness of breath'],
    summary: 'Fever, productive cough, breathing difficulty, fast breathing, or pleuritic chest pain can justify assessment for pneumonia, especially in older or vulnerable patients.',
    content: 'Pneumonia becomes more likely when cough is accompanied by fever, shaking chills, weakness, pleuritic chest pain, low oxygen symptoms, or increasing breathlessness. Older adults may present with confusion or reduced intake rather than classic symptoms.',
  },
  {
    id: 'cdc-stroke-fast',
    title: 'Stroke Warning Signs and FAST Response',
    organization: 'Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov/stroke',
    category: 'neurology',
    specialty: 'neurology',
    topicPack: 'neurology',
    evidenceLevel: 'public-health',
    tags: ['stroke', 'fast', 'neurology', 'weakness', 'speech'],
    summary: 'Face drooping, arm weakness, speech difficulty, sudden vision change, severe dizziness, or sudden severe headache need immediate emergency response.',
    content: 'Stroke warning signs include facial droop, one-sided weakness, speech difficulty, sudden numbness, sudden confusion, sudden vision loss, severe dizziness, loss of coordination, or a sudden severe headache. Emergency services should be contacted immediately rather than waiting for symptoms to improve.',
  },
  {
    id: 'aafp-headache-red-flags',
    title: 'Headache Red Flags Requiring Medical Review',
    organization: 'American Academy of Family Physicians',
    url: 'https://www.aafp.org',
    category: 'neurology',
    specialty: 'neurology',
    topicPack: 'neurology',
    evidenceLevel: 'review',
    tags: ['headache', 'migraine', 'neurology', 'meningitis', 'sudden headache'],
    summary: 'A thunderclap headache, headache with neurologic deficit, fever and neck stiffness, head injury, pregnancy, or new severe headache later in life needs prompt evaluation.',
    content: 'Most headaches are not emergencies, but sudden maximal-onset headache, weakness, confusion, vision change, seizure, fever with neck stiffness, recent head trauma, or a new severe headache in pregnancy or older age can reflect a dangerous cause and should be assessed urgently.',
  },
  {
    id: 'aha-transient-neurologic-symptoms',
    title: 'Transient Neurologic Symptoms and TIA Caution',
    organization: 'American Stroke Association',
    url: 'https://www.stroke.org',
    category: 'neurology',
    specialty: 'neurology',
    topicPack: 'neurology',
    evidenceLevel: 'clinical-reference',
    tags: ['tia', 'stroke', 'temporary weakness', 'speech problem', 'vision'],
    summary: 'Brief episodes of one-sided weakness, speech trouble, or transient vision loss should not be ignored, even if they resolved.',
    content: 'Temporary neurologic symptoms can represent a transient ischemic attack. Resolution does not make it safe to wait at home. Same-day urgent medical assessment is appropriate because early stroke risk may remain significant.',
  },
  {
    id: 'nih-diabetes-monitoring',
    title: 'Diabetes Monitoring and When to Escalate Care',
    organization: 'National Institutes of Health',
    url: 'https://www.nih.gov',
    category: 'endocrinology',
    specialty: 'endocrinology',
    topicPack: 'endocrinology',
    evidenceLevel: 'clinical-reference',
    tags: ['diabetes', 'glucose', 'hyperglycemia', 'hypoglycemia', 'monitoring'],
    summary: 'Glucose trends should be interpreted with symptoms, hydration, medication use, and risk of hypo- or hyperglycemia.',
    content: 'People monitoring blood glucose should look at patterns rather than a single number in isolation. Severe low glucose symptoms such as confusion, fainting, or seizure require urgent treatment. Very high glucose with vomiting, dehydration, abdominal pain, or altered mental status needs prompt medical evaluation. Medication adjustments should be individualized by a clinician.',
  },
  {
    id: 'ada-hypoglycemia-recognition',
    title: 'Recognition of Low Blood Sugar',
    organization: 'American Diabetes Association',
    url: 'https://diabetes.org',
    category: 'endocrinology',
    specialty: 'endocrinology',
    topicPack: 'endocrinology',
    evidenceLevel: 'guideline',
    tags: ['hypoglycemia', 'low sugar', 'sweating', 'confusion', 'shaking'],
    summary: 'Shaking, sweating, palpitations, confusion, unusual behavior, or fainting can be low blood sugar, especially in people using insulin or glucose-lowering medicines.',
    content: 'Low blood sugar may begin with tremor, sweating, hunger, palpitations, tingling, or anxiety and can progress to confusion, poor coordination, seizure, or loss of consciousness. Severe symptoms need urgent treatment and medical help if recovery is not prompt.',
  },
  {
    id: 'endocrine-society-thyroid-symptoms',
    title: 'Common Thyroid Symptom Patterns',
    organization: 'Endocrine Society',
    url: 'https://www.endocrine.org',
    category: 'endocrinology',
    specialty: 'endocrinology',
    topicPack: 'endocrinology',
    evidenceLevel: 'review',
    tags: ['thyroid', 'fatigue', 'weight change', 'palpitations', 'heat intolerance'],
    summary: 'Thyroid problems can cause fatigue, weight change, cold or heat intolerance, bowel changes, palpitations, and menstrual changes, but symptoms are not specific.',
    content: 'Thyroid-related symptoms often overlap with other conditions. Persistent unexplained weight change, new heat intolerance with palpitations, or cold intolerance with fatigue can justify clinician review and laboratory assessment rather than self-diagnosis.',
  },
  {
    id: 'nice-fatigue-initial-assessment',
    title: 'Persistent Fatigue Initial Assessment',
    organization: 'National Institute for Health and Care Excellence',
    url: 'https://www.nice.org.uk',
    category: 'general-medicine',
    specialty: 'general-medicine',
    topicPack: 'general-medicine',
    evidenceLevel: 'clinical-reference',
    tags: ['fatigue', 'tired', 'weakness', 'sleep', 'persistent symptoms'],
    summary: 'Persistent tiredness can reflect sleep problems, infection, anemia, thyroid disease, mood disorders, medication effects, or other medical conditions, especially when it is unexplained or prolonged.',
    content: 'Fatigue is a common symptom and often has non-dangerous explanations such as poor sleep, stress, or a recent viral illness, but persistent fatigue deserves review when it is new, worsening, unexplained, or accompanied by weight loss, fever, breathlessness, dizziness, or reduced daily function.',
  },
  {
    id: 'nih-anemia-symptom-overview',
    title: 'Anemia Symptom Overview',
    organization: 'National Institutes of Health',
    url: 'https://www.nih.gov',
    category: 'general-medicine',
    specialty: 'general-medicine',
    topicPack: 'general-medicine',
    evidenceLevel: 'clinical-reference',
    tags: ['anemia', 'tired', 'fatigue', 'cold intolerance', 'pale', 'dizziness'],
    summary: 'Anemia can cause tiredness, weakness, feeling cold, pale skin, dizziness, shortness of breath on exertion, or palpitations.',
    content: 'Low red blood cell levels or low hemoglobin can reduce oxygen delivery and lead to fatigue, weakness, cold intolerance, lightheadedness, pallor, palpitations, or shortness of breath with activity. Persistent symptoms should be medically evaluated rather than assumed to be simple tiredness.',
  },
  {
    id: 'cdc-viral-illness-chills-fever',
    title: 'Chills, Feeling Cold, and Viral Illness',
    organization: 'Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov',
    category: 'general-medicine',
    specialty: 'general-medicine',
    topicPack: 'general-medicine',
    evidenceLevel: 'public-health',
    tags: ['feeling cold', 'chills', 'viral illness', 'infection', 'fever'],
    summary: 'Feeling cold or having chills can happen with infection, especially when fever is developing, but ongoing symptoms should be judged alongside other signs such as fever, cough, pain, or weakness.',
    content: 'Chills or feeling cold may happen when body temperature is rising during an infection, but they can also occur in cool environments or with other medical conditions. Fever, worsening cough, breathing symptoms, confusion, dehydration, or significant weakness should raise concern for a more important illness.',
  },
  {
    id: 'who-hypothermia-warning-signs',
    title: 'Hypothermia Warning Signs',
    organization: 'World Health Organization',
    url: 'https://www.who.int',
    category: 'emergency-care',
    specialty: 'emergency',
    topicPack: 'emergency',
    evidenceLevel: 'guideline',
    tags: ['hypothermia', 'cold exposure', 'confusion', 'shivering', 'low body temperature'],
    summary: 'Cold exposure with confusion, drowsiness, slowed speech, clumsiness, or reduced shivering can indicate hypothermia and needs urgent care.',
    content: 'Feeling cold after environmental cold exposure becomes urgent when there is confusion, unusual sleepiness, slowed speech, poor coordination, blue skin, weak pulse, or low body temperature. These signs suggest hypothermia rather than ordinary cold discomfort and require prompt warming and urgent medical help.',
  },
  {
    id: 'nice-abdominal-pain-triage',
    title: 'Abdominal Pain Review Triggers',
    organization: 'National Institute for Health and Care Excellence',
    url: 'https://www.nice.org.uk',
    category: 'gastroenterology',
    specialty: 'gastroenterology',
    topicPack: 'gastroenterology',
    evidenceLevel: 'clinical-reference',
    tags: ['abdominal pain', 'belly pain', 'vomiting', 'appendicitis', 'blood in stool'],
    summary: 'Severe abdominal pain, a rigid abdomen, repeated vomiting, blood in stool or vomit, fainting, or significant dehydration needs urgent review.',
    content: 'Abdominal pain is common, but severe or worsening pain, localized pain with guarding, repeated vomiting, fainting, black or bloody stool, pregnancy, or inability to keep fluids down should prompt same-day or urgent medical assessment.',
  },
  {
    id: 'who-diarrhea-vomiting-dehydration',
    title: 'Vomiting, Diarrhea, and Dehydration Risk',
    organization: 'World Health Organization',
    url: 'https://www.who.int',
    category: 'gastroenterology',
    specialty: 'gastroenterology',
    topicPack: 'gastroenterology',
    evidenceLevel: 'public-health',
    tags: ['vomiting', 'diarrhea', 'dehydration', 'oral intake', 'urine output'],
    summary: 'Persistent vomiting or diarrhea can become dangerous when fluid intake falls, urine output drops, dizziness appears, or there is blood, fever, or lethargy.',
    content: 'Warning features of dehydration include marked thirst, dry mouth, dizziness, low urine output, lethargy, inability to keep fluids down, or signs of poor perfusion. Young children, older adults, and frail patients may deteriorate faster and need a lower threshold for review.',
  },
  {
    id: 'acg-upper-gi-bleeding-warning',
    title: 'Upper Gastrointestinal Bleeding Warning Features',
    organization: 'American College of Gastroenterology',
    url: 'https://gi.org',
    category: 'gastroenterology',
    specialty: 'gastroenterology',
    topicPack: 'gastroenterology',
    evidenceLevel: 'clinical-reference',
    tags: ['vomit blood', 'black stool', 'gi bleed', 'dizziness', 'fainting'],
    summary: 'Vomiting blood, black tarry stool, severe weakness, or collapse may indicate gastrointestinal bleeding and needs urgent care.',
    content: 'Blood in vomit or black tarry stool can represent gastrointestinal bleeding, especially when accompanied by dizziness, fainting, paleness, weakness, or fast heart rate. This should not be managed as routine indigestion.',
  },
  {
    id: 'who-fever-adult-child-red-flags',
    title: 'Fever Red Flags in Adults and Children',
    organization: 'World Health Organization',
    url: 'https://www.who.int',
    category: 'general-medicine',
    specialty: 'pediatrics',
    topicPack: 'pediatrics',
    evidenceLevel: 'guideline',
    tags: ['fever', 'infection', 'child', 'adult', 'dehydration'],
    summary: 'Fever alone may be mild, but fever with confusion, neck stiffness, rash, dehydration, breathing difficulty, or a very ill appearance needs clinical attention.',
    content: 'Fever can occur with common infections, but fever with lethargy, confusion, neck stiffness, severe headache, shortness of breath, dehydration, persistent vomiting, or rash can indicate a higher-risk illness. Infants, frail older adults, immunocompromised patients, and pregnant people may need a lower threshold for clinical review.',
  },
  {
    id: 'aap-infant-child-breathing-warning-signs',
    title: 'Breathing Warning Signs in Infants and Children',
    organization: 'American Academy of Pediatrics',
    url: 'https://www.aap.org',
    category: 'pediatrics',
    specialty: 'pediatrics',
    topicPack: 'pediatrics',
    evidenceLevel: 'clinical-reference',
    tags: ['child', 'infant', 'breathing', 'retractions', 'cyanosis', 'feeding'],
    summary: 'Fast breathing, chest retractions, bluish lips, poor feeding, lethargy, or pauses in breathing need urgent pediatric assessment.',
    content: 'Children may show respiratory distress through chest pulling, nostril flaring, grunting, poor feeding, unusual sleepiness, or bluish color rather than simply saying they are short of breath. Infants can deteriorate quickly and warrant a low threshold for urgent care.',
  },
  {
    id: 'aap-child-dehydration-signs',
    title: 'Dehydration Signs in Children',
    organization: 'American Academy of Pediatrics',
    url: 'https://www.aap.org',
    category: 'pediatrics',
    specialty: 'pediatrics',
    topicPack: 'pediatrics',
    evidenceLevel: 'patient-education',
    tags: ['child', 'dehydration', 'urine', 'tears', 'vomiting', 'diarrhea'],
    summary: 'Reduced urine, no tears, dry mouth, unusual drowsiness, or persistent vomiting can signal dehydration in a child.',
    content: 'A child with vomiting or diarrhea should be watched for falling intake, reduced wet diapers or urination, dry lips, no tears when crying, or increasing sleepiness. Persistent vomiting or a child who cannot drink needs prompt evaluation.',
  },
  {
    id: 'acog-pregnancy-warning-signs',
    title: 'Pregnancy Warning Signs Requiring Prompt Care',
    organization: 'American College of Obstetricians and Gynecologists',
    url: 'https://www.acog.org',
    category: 'womens-health',
    specialty: 'womensHealth',
    topicPack: 'womensHealth',
    evidenceLevel: 'guideline',
    tags: ['pregnancy', 'bleeding', 'severe headache', 'vision changes', 'swelling', 'reduced fetal movement'],
    summary: 'Heavy bleeding, severe abdominal pain, severe headache, vision changes, marked swelling, fluid leakage, or reduced fetal movement requires prompt obstetric review.',
    content: 'Pregnancy warning signs include significant vaginal bleeding, severe abdominal pain, persistent severe headache, visual disturbance, new severe swelling, chest pain, shortness of breath, fluid leakage, or noticeably reduced fetal movement. These should not be treated as routine symptoms.',
  },
  {
    id: 'who-postpartum-emergency-features',
    title: 'Postpartum Emergency Features',
    organization: 'World Health Organization',
    url: 'https://www.who.int',
    category: 'womens-health',
    specialty: 'womensHealth',
    topicPack: 'womensHealth',
    evidenceLevel: 'guideline',
    tags: ['postpartum', 'bleeding', 'fever', 'breathlessness', 'severe headache'],
    summary: 'Heavy postpartum bleeding, fever, chest pain, breathlessness, severe headache, or calf pain can indicate serious postpartum complications.',
    content: 'After delivery, heavy bleeding, foul-smelling discharge, fever, severe headache, visual symptoms, chest pain, shortness of breath, or unilateral leg pain and swelling should prompt urgent medical assessment. Postpartum complications can escalate quickly.',
  },
  {
    id: 'aad-rash-triage',
    title: 'Rash Features That Need Medical Review',
    organization: 'American Academy of Dermatology',
    url: 'https://www.aad.org',
    category: 'dermatology',
    specialty: 'dermatology',
    topicPack: 'dermatology',
    evidenceLevel: 'patient-education',
    tags: ['rash', 'skin', 'hives', 'blistering', 'swelling', 'mucosa'],
    summary: 'Rash with fever, facial swelling, mouth sores, blistering, breathing symptoms, or purple spots needs urgent review.',
    content: 'Many rashes are mild, but rash with fever, rapid spread, facial or tongue swelling, difficulty breathing, mucosal sores, blistering, skin pain, or non-blanching purple spots can signal a dangerous process and should be evaluated promptly.',
  },
  {
    id: 'eczema-basic-supportive-care',
    title: 'Basic Supportive Care for Eczema-Type Dry Itchy Rash',
    organization: 'National Eczema Association',
    url: 'https://nationaleczema.org',
    category: 'dermatology',
    specialty: 'dermatology',
    topicPack: 'dermatology',
    evidenceLevel: 'patient-education',
    tags: ['eczema', 'dry skin', 'itching', 'moisturizer', 'trigger'],
    summary: 'Dry itchy rash may improve with trigger reduction and regular emollients, but infection signs or widespread inflammation need review.',
    content: 'Dry itchy skin can reflect eczema or irritation, and supportive care often includes frequent moisturizer use, gentle cleansing, and avoiding known triggers. Crusting, pus, fever, or rapidly worsening inflammation can point to infection and deserves medical assessment.',
  },
  {
    id: 'fda-medication-safety-basics',
    title: 'Medication Safety Basics for Public Use',
    organization: 'U.S. Food and Drug Administration',
    url: 'https://www.fda.gov',
    category: 'medications',
    specialty: 'medications',
    topicPack: 'medications',
    evidenceLevel: 'medication-safety',
    tags: ['medication', 'dose', 'instructions', 'side effects', 'mixing medicines'],
    summary: 'Medication safety depends on the correct person, medicine, dose, timing, and awareness of allergies, interactions, pregnancy status, kidney disease, and children.',
    content: 'Public medication guidance should stay general. Dosing depends on age, weight, kidney and liver function, pregnancy, allergies, and interacting medicines. Label instructions, allergies, and duplicate ingredients should always be checked, and individualized dosing should come from a clinician or pharmacist.',
  },
  {
    id: 'who-antibiotic-stewardship-basics',
    title: 'Antibiotic Stewardship Basics',
    organization: 'World Health Organization',
    url: 'https://www.who.int',
    category: 'medications',
    specialty: 'medications',
    topicPack: 'medications',
    evidenceLevel: 'public-health',
    tags: ['antibiotics', 'viral infection', 'resistance', 'prescription', 'bacterial infection'],
    summary: 'Antibiotics do not treat most viral illnesses and should not be used without a clear indication.',
    content: 'Antibiotics are meant for bacterial infections and do not help most viral colds or flu-like illnesses. Unnecessary use increases side effects and antimicrobial resistance. Choice and dose should be individualized by a prescribing clinician.',
  },
  {
    id: 'nhs-pain-reliever-safety-overview',
    title: 'General Pain Reliever Safety Overview',
    organization: 'National Health Service',
    url: 'https://www.nhs.uk',
    category: 'medications',
    specialty: 'medications',
    topicPack: 'medications',
    evidenceLevel: 'patient-education',
    tags: ['pain reliever', 'ibuprofen', 'acetaminophen', 'paracetamol', 'liver', 'kidney'],
    summary: 'Common pain relievers have different risks, and choice depends on pregnancy, kidney disease, stomach ulcer history, liver disease, and other medicines.',
    content: 'Over-the-counter pain relievers are not interchangeable in every patient. Anti-inflammatory medicines may worsen ulcer risk, kidney issues, fluid retention, or some blood pressure problems. Acetaminophen or paracetamol also requires careful total daily dose awareness, especially with combination products and liver disease.',
  },
  {
    id: 'who-mental-health-crisis',
    title: 'Mental Health Crisis and Suicide Warning Signs',
    organization: 'World Health Organization',
    url: 'https://www.who.int',
    category: 'mental-health',
    specialty: 'mentalHealth',
    topicPack: 'mentalHealth',
    evidenceLevel: 'guideline',
    tags: ['suicidal', 'self harm', 'mental health crisis', 'psychosis', 'emergency'],
    summary: 'Suicidal thoughts, intent to self-harm, inability to stay safe, or severe agitation with loss of reality require immediate emergency or crisis support.',
    content: 'Mental health crisis care is urgent when a person expresses suicidal thoughts with intent or plan, cannot stay safe, is extremely agitated, psychotic, or unable to care for basic safety. Emergency or crisis services should be contacted immediately rather than relying on online advice.',
  },
  {
    id: 'idsa-urinary-symptom-escalation',
    title: 'Urinary Symptoms That Need Medical Review',
    organization: 'Infectious Diseases Society of America',
    url: 'https://www.idsociety.org',
    category: 'general-medicine',
    specialty: 'general-medicine',
    topicPack: 'general-medicine',
    evidenceLevel: 'clinical-reference',
    tags: ['urinary', 'burning urination', 'back pain', 'fever', 'pregnancy'],
    summary: 'Burning urination may be uncomplicated, but fever, flank pain, vomiting, pregnancy, male urinary infection, or weakness raises the need for medical review.',
    content: 'Urinary discomfort should be assessed more urgently when there is fever, side or back pain, vomiting, pregnancy, male sex, immunocompromise, or symptoms of systemic illness. These features can suggest a more serious urinary infection than simple bladder irritation.',
  },
];

export function slugifySourceId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export function normalizeSource(rawSource, isDefault = false) {
  if (!rawSource || typeof rawSource !== 'object') return null;

  const title = String(rawSource.title || '').trim();
  const organization = String(rawSource.organization || '').trim();
  const summary = String(rawSource.summary || '').trim();
  const content = String(rawSource.content || '').trim();

  if (!title || !organization || !summary || !content) {
    return null;
  }

  const tags = Array.isArray(rawSource.tags)
    ? rawSource.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(rawSource.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

  const reviewStatus = String(
    rawSource.reviewStatus || (isDefault ? 'approved' : 'draft'),
  ).trim().toLowerCase();
  const reviewedAt = String(rawSource.reviewedAt || '').trim();
  const reviewOwner = String(rawSource.reviewOwner || '').trim();
  const reviewNotes = String(rawSource.reviewNotes || '').trim();
  const expiresAt = String(rawSource.expiresAt || '').trim();
  const sourcePublishedAt = String(rawSource.sourcePublishedAt || '').trim();

  return {
    id: String(rawSource.id || slugifySourceId(`${organization}-${title}`)),
    title,
    organization,
    url: String(rawSource.url || '').trim(),
    category: String(rawSource.category || 'general-medicine').trim(),
    specialty: String(rawSource.specialty || rawSource.category || 'general-medicine').trim(),
    topicPack: String(rawSource.topicPack || rawSource.specialty || rawSource.category || 'general-medicine').trim(),
    evidenceLevel: String(rawSource.evidenceLevel || 'reference').trim(),
    tags,
    summary,
    content,
    reviewStatus,
    reviewedAt,
    reviewOwner,
    reviewNotes,
    expiresAt,
    sourcePublishedAt,
    isDefault,
  };
}

export function getSourceFreshness(source, now = new Date()) {
  const expiresAt = source?.expiresAt ? new Date(source.expiresAt) : null;
  const reviewedAt = source?.reviewedAt ? new Date(source.reviewedAt) : null;
  const compareDate = expiresAt && !Number.isNaN(expiresAt.getTime())
    ? expiresAt
    : reviewedAt && !Number.isNaN(reviewedAt.getTime())
      ? new Date(reviewedAt.getTime() + (180 * 24 * 60 * 60 * 1000))
      : null;

  if (!compareDate || Number.isNaN(compareDate.getTime())) {
    return {
      status: source?.isDefault ? 'current' : 'unknown',
      label: source?.isDefault ? 'Current' : 'Unknown review date',
      isStale: false,
    };
  }

  const daysUntil = Math.ceil((compareDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (daysUntil < 0) {
    return {
      status: 'stale',
      label: `Stale ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago`,
      isStale: true,
    };
  }

  if (daysUntil <= 30) {
    return {
      status: 'expiring',
      label: `Review soon (${daysUntil} day${daysUntil === 1 ? '' : 's'})`,
      isStale: false,
    };
  }

  return {
    status: 'current',
    label: `Current (${daysUntil} day${daysUntil === 1 ? '' : 's'} left)`,
    isStale: false,
  };
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2);
}

function buildBigrams(tokens) {
  const grams = [];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    grams.push(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return grams;
}

function countKeywordHits(text, keywords) {
  return keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
}

export function detectMedicalProfile(query) {
  const normalizedQuery = normalizeText(query);
  const tokens = tokenize(normalizedQuery);
  const bigrams = buildBigrams(tokens);

  const specialties = Object.entries(SPECIALTY_KEYWORDS)
    .map(([specialty, keywords]) => ({
      specialty,
      hits: countKeywordHits(normalizedQuery, keywords),
    }))
    .filter((entry) => entry.hits > 0)
    .sort((left, right) => right.hits - left.hits);

  const intents = Object.entries(INTENT_KEYWORDS)
    .map(([intent, keywords]) => ({
      intent,
      hits: countKeywordHits(normalizedQuery, keywords),
    }))
    .filter((entry) => entry.hits > 0)
    .sort((left, right) => right.hits - left.hits);

  const vulnerableGroups = Object.entries(VULNERABLE_GROUP_KEYWORDS)
    .filter(([, keywords]) => countKeywordHits(normalizedQuery, keywords) > 0)
    .map(([group]) => group);

  return {
    normalizedQuery,
    tokens,
    bigrams,
    specialties: specialties.map((entry) => entry.specialty),
    specialtyHits: specialties,
    intents: intents.map((entry) => entry.intent),
    intentHits: intents,
    vulnerableGroups,
    primarySpecialty: specialties[0]?.specialty || 'general-medicine',
    primaryIntent: intents[0]?.intent || 'general',
  };
}

export function scoreSourceForQuery(source, query, profile = detectMedicalProfile(query)) {
  const title = normalizeText(source.title);
  const summary = normalizeText(source.summary);
  const content = normalizeText(source.content);
  const category = normalizeText(source.category);
  const specialty = normalizeText(source.specialty);
  const topicPack = normalizeText(source.topicPack);
  const tags = (source.tags || []).map((tag) => normalizeText(tag));

  const evidenceWeight = EVIDENCE_WEIGHTS[source.evidenceLevel] || 0;
  let score = evidenceWeight;
  const freshness = getSourceFreshness(source);

  if (!source.isDefault && source.reviewStatus !== 'approved') {
    score -= 18;
  }
  if (freshness.status === 'stale') {
    score -= 12;
  } else if (freshness.status === 'expiring') {
    score -= 4;
  }

  for (const token of profile.tokens) {
    if (title.includes(token)) score += 10;
    if (tags.some((tag) => tag.includes(token))) score += 8;
    if (summary.includes(token)) score += 5;
    if (content.includes(token)) score += 3;
    if (category.includes(token)) score += 2;
    if (specialty.includes(token) || topicPack.includes(token)) score += 4;
  }

  for (const phrase of profile.bigrams) {
    if (title.includes(phrase)) score += 12;
    if (summary.includes(phrase)) score += 8;
    if (content.includes(phrase)) score += 5;
  }

  if (profile.specialties.includes(source.specialty)) score += 18;
  if (profile.specialties.includes(source.topicPack)) score += 14;
  if (profile.primarySpecialty === source.specialty) score += 12;

  if (profile.intents.includes('symptoms') && tags.some((tag) => tag.includes('symptom') || tag.includes('pain') || tag.includes('fever') || tag.includes('cough'))) {
    score += 8;
  }

  if (profile.intents.includes('medications') && (source.specialty === 'medications' || tags.some((tag) => tag.includes('medication') || tag.includes('dose') || tag.includes('drug')))) {
    score += 12;
  }

  if (profile.intents.includes('triage') && (source.specialty === 'emergency' || title.includes('warning') || title.includes('triage'))) {
    score += 10;
  }

  if (profile.vulnerableGroups.includes('pregnancy') && tags.some((tag) => tag.includes('pregnancy') || tag.includes('postpartum'))) {
    score += 10;
  }

  if (profile.vulnerableGroups.includes('children') && tags.some((tag) => tag.includes('child') || tag.includes('infant') || tag.includes('pediatric'))) {
    score += 10;
  }

  if (profile.vulnerableGroups.includes('olderAdult') && content.includes('older adult')) {
    score += 6;
  }

  return score;
}

export function selectGroundingSources(sources, query, limit = 5) {
  const profile = detectMedicalProfile(query);

  return sources
    .map((source) => ({
      source,
      score: scoreSourceForQuery(source, query, profile),
    }))
    .filter((entry) => entry.score > 6 && (entry.source.isDefault || entry.source.reviewStatus === 'approved'))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return (EVIDENCE_WEIGHTS[right.source.evidenceLevel] || 0) - (EVIDENCE_WEIGHTS[left.source.evidenceLevel] || 0);
    })
    .slice(0, limit);
}

export function mergeKnowledgeSources(customSources = []) {
  const normalizedDefaults = defaultMedicalSources
    .map((source) => normalizeSource(source, true))
    .filter(Boolean);
  const normalizedCustom = customSources
    .map((source) => normalizeSource(source, false))
    .filter(Boolean);

  const merged = [...normalizedDefaults];
  const seen = new Set(normalizedDefaults.map((source) => source.id));

  for (const source of normalizedCustom) {
    if (seen.has(source.id)) continue;
    merged.push(source);
    seen.add(source.id);
  }

  return merged;
}

function hashFeature(value, dimension = EMBEDDING_DIMENSION) {
  let hash = 2166136261;
  const input = String(value || '');

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0) % dimension;
}

function buildFeatureWeights(text) {
  const tokens = tokenize(text);
  const bigrams = buildBigrams(tokens);
  const weights = new Map();

  for (const token of tokens) {
    const bucket = hashFeature(`t:${token}`);
    weights.set(bucket, (weights.get(bucket) || 0) + 1);
  }

  for (const bigram of bigrams) {
    const bucket = hashFeature(`b:${bigram}`);
    weights.set(bucket, (weights.get(bucket) || 0) + 1.6);
  }

  return weights;
}

export function createLocalEmbedding(text) {
  const weights = buildFeatureWeights(text);
  let norm = 0;

  for (const value of weights.values()) {
    norm += value * value;
  }

  norm = Math.sqrt(norm) || 1;

  return Array.from(weights.entries())
    .map(([index, value]) => [index, value / norm])
    .sort((left, right) => left[0] - right[0]);
}

export function cosineSimilaritySparse(leftEmbedding = [], rightEmbedding = []) {
  if (!leftEmbedding.length || !rightEmbedding.length) return 0;

  let leftIndex = 0;
  let rightIndex = 0;
  let score = 0;

  while (leftIndex < leftEmbedding.length && rightIndex < rightEmbedding.length) {
    const [leftBucket, leftValue] = leftEmbedding[leftIndex];
    const [rightBucket, rightValue] = rightEmbedding[rightIndex];

    if (leftBucket === rightBucket) {
      score += leftValue * rightValue;
      leftIndex += 1;
      rightIndex += 1;
    } else if (leftBucket < rightBucket) {
      leftIndex += 1;
    } else {
      rightIndex += 1;
    }
  }

  return score;
}

function splitIntoChunks(text, maxLength = 900) {
  const normalized = String(text || '').replace(/\r/g, '').trim();
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const chunks = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxLength) {
      chunks.push(paragraph);
      continue;
    }

    const sentences = paragraph
      .split(/(?<=[.!?؟])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    let current = '';

    for (const sentence of sentences) {
      if (!current) {
        current = sentence;
        continue;
      }

      if (`${current} ${sentence}`.length <= maxLength) {
        current = `${current} ${sentence}`;
      } else {
        chunks.push(current);
        current = sentence;
      }
    }

    if (current) {
      chunks.push(current);
    }
  }

  return chunks;
}

export function buildSourceChunks(source) {
  const normalized = normalizeSource(source, Boolean(source?.isDefault));
  if (!normalized) return [];

  const chunkTexts = [];
  const seen = new Set();
  const pushChunkText = (value) => {
    const text = String(value || '').trim();
    if (!text) return;
    const key = normalizeText(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    chunkTexts.push(text);
  };

  pushChunkText(normalized.summary);
  splitIntoChunks(normalized.content).forEach(pushChunkText);

  return chunkTexts.map((text, index) => {
    const fullText = `${normalized.title}\n${normalized.summary}\n${text}`.trim();

    return {
      id: `${normalized.id}::chunk-${index + 1}`,
      sourceId: normalized.id,
      title: normalized.title,
      organization: normalized.organization,
      category: normalized.category,
      specialty: normalized.specialty,
      topicPack: normalized.topicPack,
      evidenceLevel: normalized.evidenceLevel,
      tags: normalized.tags,
      url: normalized.url,
      text,
      embedding: createLocalEmbedding(fullText),
      searchableText: normalizeText(`${normalized.title} ${normalized.organization} ${normalized.summary} ${text} ${normalized.tags.join(' ')}`),
    };
  });
}

export function buildKnowledgeChunks(sources = []) {
  return sources.flatMap((source) => buildSourceChunks(source));
}

function scoreChunkForQuery(chunk, query, profile, queryEmbedding) {
  const sourceScore = scoreSourceForQuery(chunk, query, profile);
  const similarity = cosineSimilaritySparse(queryEmbedding, chunk.embedding);
  const text = chunk.searchableText || '';
  let lexicalBoost = 0;

  for (const token of profile.tokens) {
    if (text.includes(token)) lexicalBoost += 1.8;
  }

  for (const phrase of profile.bigrams) {
    if (text.includes(phrase)) lexicalBoost += 2.4;
  }

  if (profile.primarySpecialty === chunk.specialty) lexicalBoost += 6;
  if (profile.specialties.includes(chunk.topicPack)) lexicalBoost += 4;
  if (profile.intents.includes('triage') && chunk.specialty === 'emergency') lexicalBoost += 5;
  if (profile.intents.includes('medications') && chunk.specialty === 'medications') lexicalBoost += 5;

  return sourceScore + lexicalBoost + (similarity * 42);
}

function countChunkLexicalMatches(chunk, profile) {
  const text = chunk.searchableText || '';
  let matches = 0;

  for (const token of profile.tokens) {
    if (text.includes(token)) matches += 1;
  }

  for (const phrase of profile.bigrams) {
    if (text.includes(phrase)) matches += 2;
  }

  return matches;
}

export function selectGroundingContextFromChunks(sources, chunks, query, options = {}) {
  const {
    sourceLimit = 4,
    chunkLimit = 8,
    maxChunksPerSource = 2,
  } = options;

  const profile = detectMedicalProfile(query);
  const queryEmbedding = createLocalEmbedding(query);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const allowedSourceIds = new Set(
    sources
      .filter((source) => source.isDefault || source.reviewStatus === 'approved')
      .map((source) => source.id),
  );

  const scoredChunks = chunks
    .filter((chunk) => allowedSourceIds.has(chunk.sourceId))
    .map((chunk) => ({
      chunk,
      score: scoreChunkForQuery(chunk, query, profile, queryEmbedding),
      lexicalMatches: countChunkLexicalMatches(chunk, profile),
      specialtyAligned: profile.specialties.includes(chunk.specialty) || profile.specialties.includes(chunk.topicPack),
    }))
    .filter((entry) => entry.score > 8 && (entry.lexicalMatches > 0 || entry.specialtyAligned))
    .sort((left, right) => right.score - left.score);

  const selectedChunks = [];
  const sourceUseCount = new Map();

  for (const entry of scoredChunks) {
    if (selectedChunks.length >= chunkLimit) break;
    const currentCount = sourceUseCount.get(entry.chunk.sourceId) || 0;
    if (currentCount >= maxChunksPerSource) continue;
    selectedChunks.push(entry);
    sourceUseCount.set(entry.chunk.sourceId, currentCount + 1);
  }

  const selectedSources = [];
  const seenSources = new Set();

  for (const entry of selectedChunks) {
    if (selectedSources.length >= sourceLimit) break;
    if (seenSources.has(entry.chunk.sourceId)) continue;
    const source = sourceById.get(entry.chunk.sourceId);
    if (!source) continue;
    selectedSources.push({
      source,
      score: entry.score,
      matchedChunks: selectedChunks.filter((chunkEntry) => chunkEntry.chunk.sourceId === entry.chunk.sourceId),
    });
    seenSources.add(entry.chunk.sourceId);
  }

  return {
    profile,
    selectedChunks,
    selectedSources,
  };
}

export function selectGroundingContext(sources, query, options = {}) {
  const chunks = buildKnowledgeChunks(sources);
  return selectGroundingContextFromChunks(sources, chunks, query, options);
}
