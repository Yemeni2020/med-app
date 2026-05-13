export const TOUR_ROLE_ORDER = ['guest', 'patient', 'doctor', 'admin'];

const commonButtons = {
  en: {
    next: 'Next',
    previous: 'Back',
    done: 'Done',
    skip: 'Skip',
    start: 'Start Tour',
  },
  ar: {
    next: 'التالي',
    previous: 'السابق',
    done: 'إنهاء',
    skip: 'تخطي',
    start: 'ابدأ الجولة',
  },
};

function step(id, route, element, title, description, options = {}) {
  return {
    id,
    route,
    element,
    title,
    description,
    side: options.side || 'bottom',
    align: options.align || 'center',
  };
}

export const TOUR_COPY = {
  buttons: commonButtons,
  labels: {
    en: {
      progress: (current, total) => `Step ${current} of ${total}`,
      restart: 'Start Tour',
      guest: 'Guest tour',
      patient: 'Patient tour',
      doctor: 'Doctor tour',
      admin: 'Admin tour',
    },
    ar: {
      progress: (current, total) => `الخطوة ${current} من ${total}`,
      restart: 'ابدأ الجولة',
      guest: 'جولة الزائر',
      patient: 'جولة المريض',
      doctor: 'جولة الطبيب',
      admin: 'جولة الإدارة',
    },
  },
};

export const TOUR_STEPS = {
  guest: [
    step(
      'guest-home',
      '/',
      '[data-tour="navbar-logo"]',
      { en: 'Welcome to the Medical Platform', ar: 'مرحبًا بك في المنصة الطبية' },
      {
        en: 'This is your starting point for trusted articles, doctors, and health tools.',
        ar: 'هذه هي نقطة البداية للوصول إلى المقالات الموثوقة والأطباء والأدوات الصحية.',
      },
      { side: 'bottom', align: 'start' }
    ),
    step(
      'guest-language',
      '/',
      '[data-tour="language-switcher"]',
      { en: 'Switch language any time', ar: 'بدّل اللغة في أي وقت' },
      {
        en: 'Use Arabic or English across the entire platform, with RTL support when Arabic is active.',
        ar: 'استخدم العربية أو الإنجليزية في كامل المنصة مع دعم كامل للاتجاه من اليمين لليسار.',
      }
    ),
    step(
      'guest-articles',
      '/articles',
      '[data-tour="article-search"]',
      { en: 'Browse trusted medical articles', ar: 'تصفح المقالات الطبية الموثوقة' },
      {
        en: 'Search by topic or specialty to quickly find evidence-based reading.',
        ar: 'ابحث حسب الموضوع أو التخصص للوصول سريعًا إلى المحتوى الطبي المبني على الأدلة.',
      }
    ),
    step(
      'guest-doctors',
      '/doctors',
      '[data-tour="doctors-section"]',
      { en: 'Find doctors and specialties', ar: 'ابحث عن الأطباء والتخصصات' },
      {
        en: 'Explore doctor profiles, specialties, and published content.',
        ar: 'استعرض ملفات الأطباء والتخصصات والمحتوى المنشور لكل طبيب.',
      }
    ),
    step(
      'guest-symptom-checker',
      '/symptom-checker',
      '[data-tour="symptom-checker-entry"]',
      { en: 'Use the symptom checker carefully', ar: 'استخدم فاحص الأعراض بحذر' },
      {
        en: 'It gives general triage guidance and red flags, but it is not a diagnosis.',
        ar: 'يقدّم إرشادًا عامًا وفرزًا أوليًا وعلامات خطر، لكنه ليس تشخيصًا طبيًا.',
      }
    ),
    step(
      'guest-login',
      '/',
      '[data-tour="login-register-action"]',
      { en: 'Create an account when you are ready', ar: 'أنشئ حسابًا عندما تكون جاهزًا' },
      {
        en: 'Register to save content, track your health, and continue personalized tools.',
        ar: 'أنشئ حسابًا لحفظ المحتوى وتتبع صحتك ومتابعة الأدوات المخصصة لك.',
      },
      { side: 'bottom', align: 'end' }
    ),
  ],
  patient: [
    step(
      'patient-dashboard',
      '/dashboard',
      '[data-tour="health-dashboard"]',
      { en: 'Welcome to your health dashboard', ar: 'مرحبًا بك في لوحة صحتك' },
      {
        en: 'This area summarizes your tracked metrics, saved reading, and quick actions.',
        ar: 'تعرض هذه المنطقة ملخص مؤشراتك الصحية والمحتوى المحفوظ والإجراءات السريعة.',
      }
    ),
    step(
      'patient-saved',
      '/saved',
      '[data-tour="saved-items"]',
      { en: 'Save useful articles', ar: 'احفظ المقالات المفيدة' },
      {
        en: 'Keep trusted articles and stories in one place for future reading.',
        ar: 'احتفظ بالمقالات والقصص الموثوقة في مكان واحد للرجوع إليها لاحقًا.',
      }
    ),
    step(
      'patient-health',
      '/dashboard',
      '[data-tour="health-metric-entry"]',
      { en: 'Track your health metrics', ar: 'تابع مؤشراتك الصحية' },
      {
        en: 'Log values such as sleep, water intake, heart rate, and more over time.',
        ar: 'سجل قيمًا مثل النوم وشرب الماء ومعدل النبض وغيرها عبر الزمن.',
      }
    ),
    step(
      'patient-profile',
      '/profile',
      '[data-tour="profile-page"]',
      { en: 'Manage your profile and preferences', ar: 'حدّث ملفك الشخصي وتفضيلاتك' },
      {
        en: 'Keep your account details, interests, and privacy settings up to date.',
        ar: 'حافظ على تحديث بيانات حسابك واهتماماتك وإعدادات الخصوصية الخاصة بك.',
      }
    ),
    step(
      'patient-symptom-checker',
      '/symptom-checker',
      '[data-tour="symptom-checker-entry"]',
      { en: 'Prepare questions for your doctor', ar: 'حضّر أسئلتك للطبيب' },
      {
        en: 'The symptom checker helps you organize symptoms, urgency, and next steps before a visit.',
        ar: 'يساعدك فاحص الأعراض على تنظيم الأعراض ومستوى الاستعجال والخطوات التالية قبل الزيارة.',
      }
    ),
    step(
      'patient-assistant',
      '/',
      '[data-tour="medical-assistant"]',
      { en: 'Use the medical assistant for general guidance', ar: 'استخدم المساعد الطبي للإرشاد العام' },
      {
        en: 'Ask grounded questions, review medical sources, and prepare for a real consultation.',
        ar: 'اطرح أسئلة عامة مبنية على المصادر، وراجع المعلومات قبل الاستشارة الطبية الفعلية.',
      },
      { side: 'left', align: 'end' }
    ),
    step(
      'patient-reviews',
      '/articles/1',
      '[data-tour="review-section"]',
      { en: 'Share helpful feedback', ar: 'شارك تقييمك المفيد' },
      {
        en: 'You can rate articles, doctors, and patient stories to help other users.',
        ar: 'يمكنك تقييم المقالات والأطباء وقصص المرضى لمساعدة المستخدمين الآخرين.',
      }
    ),
  ],
  doctor: [
    step(
      'doctor-dashboard',
      '/doctor-dashboard',
      '[data-tour="doctor-dashboard"]',
      { en: 'Welcome to your doctor dashboard', ar: 'مرحبًا بك في لوحة الطبيب' },
      {
        en: 'This workspace is where approved doctors manage submissions and request status.',
        ar: 'هذه المساحة مخصصة للأطباء المعتمدين لإدارة الطلبات والمحتوى المرسل.',
      }
    ),
    step(
      'doctor-submit-article',
      '/doctor-dashboard',
      '[data-tour="doctor-submit-article"]',
      { en: 'Submit articles for review', ar: 'أرسل مقالاتك للمراجعة' },
      {
        en: 'Prepare bilingual content and submit it to the editorial workflow.',
        ar: 'جهّز محتوى ثنائي اللغة وأرسله ضمن مسار المراجعة التحريرية.',
      }
    ),
    step(
      'doctor-review-status',
      '/doctor-dashboard',
      '[data-tour="doctor-review-status"]',
      { en: 'Track your submitted content', ar: 'تابع حالة المحتوى المرسل' },
      {
        en: 'Watch approval status so you know what is pending, approved, or rejected.',
        ar: 'تابع حالة الموافقة لمعرفة ما هو قيد المراجعة أو المقبول أو المرفوض.',
      }
    ),
    step(
      'doctor-profile',
      '/profile',
      '[data-tour="profile-page"]',
      { en: 'Keep your profile updated', ar: 'حدّث ملفك الطبي باستمرار' },
      {
        en: 'Your professional details and preferences should stay accurate for readers and admins.',
        ar: 'احرص على بقاء بياناتك المهنية وتفضيلاتك دقيقة للقراء والإدارة.',
      }
    ),
    step(
      'doctor-public-profile',
      '/doctors',
      '[data-tour="doctors-section"]',
      { en: 'See the public doctor experience', ar: 'اطّلع على ملف الطبيب العام' },
      {
        en: 'Review how users discover your profile and published articles.',
        ar: 'راجع كيف يرى المستخدمون ملفك العام والمقالات المنشورة الخاصة بك.',
      }
    ),
  ],
  admin: [
    step(
      'admin-reviews',
      '/admin/reviews',
      '[data-tour="admin-reviews"]',
      { en: 'Review pending user reviews', ar: 'راجع تقييمات المستخدمين المعلقة' },
      {
        en: 'Approve or reject reviews to keep public feedback useful and safe.',
        ar: 'اعتمد أو ارفض التقييمات للحفاظ على جودة وسلامة المحتوى الظاهر للعامة.',
      }
    ),
    step(
      'admin-review-actions',
      '/admin/reviews',
      '[data-tour="admin-review-actions"]',
      { en: 'Moderate the review flow carefully', ar: 'أدر مسار المراجعة بعناية' },
      {
        en: 'Use moderation actions consistently so public ratings remain trustworthy.',
        ar: 'استخدم إجراءات الإشراف بشكل متسق حتى تبقى التقييمات العامة موثوقة.',
      }
    ),
    step(
      'admin-knowledge-base',
      '/admin/knowledge-base',
      '[data-tour="knowledge-base"]',
      { en: 'Manage knowledge sources', ar: 'حدّث مصادر المعرفة الطبية' },
      {
        en: 'Approved knowledge sources directly affect assistant quality and medical safety.',
        ar: 'تؤثر مصادر المعرفة المعتمدة مباشرة على جودة المساعد الطبي وسلامة الإجابات.',
      }
    ),
    step(
      'admin-seo-content',
      '/admin/knowledge-base',
      '[data-tour="seo-content-link"]',
      { en: 'Moderate medical content carefully', ar: 'أدر المحتوى الطبي بعناية' },
      {
        en: 'Use the admin tools to keep content accurate, discoverable, and professionally maintained.',
        ar: 'استخدم أدوات الإدارة للحفاظ على دقة المحتوى الطبي وقابليته للاكتشاف وإدارته باحتراف.',
      }
    ),
  ],
};

export function getTourRole(user) {
  const role = user?.role;

  if (role === 'admin' || role === 'manager') {
    return 'admin';
  }

  if (role === 'doctor') {
    return 'doctor';
  }

  if (role) {
    return 'patient';
  }

  return 'guest';
}

export function getTourRoleLabel(role, lang) {
  return TOUR_COPY.labels[lang]?.[role] || TOUR_COPY.labels.en[role] || TOUR_COPY.labels.en.guest;
}

export function getTourStepsForRole(role) {
  return TOUR_STEPS[role] || TOUR_STEPS.guest;
}

export function hasStepsForPath(role, pathname) {
  return getTourStepsForRole(role).some((stepDefinition) => stepDefinition.route === pathname);
}
