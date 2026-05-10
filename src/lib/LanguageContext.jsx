import React, { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    nav: { home: 'Home', articles: 'Articles', healthTools: 'Health Tools', stories: 'Patient Stories', qa: 'Expert Q&A', news: 'Medical News', guidelines: 'Guidelines', symptomChecker: 'Symptom Checker', doctors: 'Doctors', more: 'More', dashboard: 'My Dashboard', saved: 'Saved Articles' },
    hero: { title: 'Evidence-Based Medical Insights', subtitle: 'Trusted, peer-reviewed research for healthcare professionals and informed readers', cta: 'Explore Articles', secondaryCta: 'Health Tools' },
    categories: { cardiology: 'Cardiology', neurology: 'Neurology', oncology: 'Oncology', pediatrics: 'Pediatrics', dermatology: 'Dermatology', orthopedics: 'Orthopedics', psychiatry: 'Psychiatry', general_medicine: 'General Medicine', surgery: 'Surgery', infectious_diseases: 'Infectious Diseases' },
    common: { readMore: 'Read More', featured: 'Featured', peerReviewed: 'Peer-Reviewed', minRead: 'min read', subscribe: 'Subscribe', email: 'Email address', search: 'Search articles...', all: 'All', loading: 'Loading...', noResults: 'No results found', viewAll: 'View All', submit: 'Submit', cancel: 'Cancel', back: 'Back', upcoming: 'Upcoming', live: 'Live Now', completed: 'Completed', breaking: 'Breaking', calculate: 'Calculate', reset: 'Reset', result: 'Result', anonymous: 'Anonymous', add: 'Add', startOver: 'Start Over', searchByName: 'Search by name, specialty, or title...', you: 'You', source: 'Source', requiredFields: 'Missing required source fields.' },
    newsletter: { badge: 'Newsletter', title: 'Stay Updated', subtitle: 'Get personalized medical insights delivered to your inbox', placeholder: 'Enter your email', success: 'Successfully subscribed!', description: "You'll receive the latest medical insights in your inbox.", subscribed: 'Subscribed!', stayUpdated: 'Stay updated' },
    bmi: { title: 'BMI Calculator', weight: 'Weight (kg)', height: 'Height (cm)', underweight: 'Underweight', normal: 'Normal weight', overweight: 'Overweight', obese: 'Obese' },
    stories: { title: 'Patient Stories', subtitle: 'Real experiences from real patients', share: 'Share Your Story' },
    qa: { title: 'Expert Q&A', subtitle: 'Learn from leading medical professionals', askQuestion: 'Submit a Question' },
    news: { title: 'Medical News', subtitle: 'Latest breakthroughs and updates' },
    guidelines: { title: 'Medical Guidelines', subtitle: 'Access global medical guidelines from WHO, CDC, and more', searchPlaceholder: 'Search guidelines by disease, treatment, or medication...' },
    footer: { about: 'About MedBlog', aboutText: 'MedBlog provides trusted, evidence-based medical research and insights for healthcare professionals and general readers.', quickLinks: 'Quick Links', categories: 'Categories', connect: 'Connect With Us', rights: 'All rights reserved.', disclaimer: 'Medical Disclaimer: Content is for informational purposes only and does not constitute medical advice.' },
    home: {
      stats: { articlesPublished: 'Articles Published', expertContributors: 'Expert Contributors', peerReviewed: 'Peer Reviewed' },
      doctors: { eyebrow: 'Medical Experts', title: 'Featured Doctors', subtitle: 'Meet the leading specialists behind our evidence-based content', viewAll: 'View All Doctors', featuredExpert: 'Featured Expert', topContributor: 'Top Contributor', researchLead: 'Research Lead', articles: 'articles', viewProfile: 'View Profile' }
    },
    symptomChecker: {
      title: 'Symptom Checker',
      subtitle: 'AI-powered triage guidance - not a substitute for professional care',
      disclaimer: 'This tool provides informational guidance only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional for medical advice.',
      prompt: 'What symptoms are you experiencing?',
      customPlaceholder: 'Type a custom symptom and press Enter...',
      analyzing: 'Analyzing symptoms...',
      analyze: 'Analyze Symptoms',
      recommendation: 'Recommendation',
      possibleCauses: 'Possible Causes',
      redFlags: 'Seek emergency care if you also experience:',
      urgency: {
        emergency: 'Seek Emergency Care Immediately',
        urgent: 'See a Doctor Soon',
        moderate: 'Schedule a Doctor Visit',
        mild: 'Home Care May Be Sufficient'
      },
      symptoms: {
        'Headache': 'Headache',
        'Fever': 'Fever',
        'Fatigue': 'Fatigue',
        'Cough': 'Cough',
        'Shortness of breath': 'Shortness of breath',
        'Chest pain': 'Chest pain',
        'Nausea': 'Nausea',
        'Vomiting': 'Vomiting',
        'Dizziness': 'Dizziness',
        'Sore throat': 'Sore throat',
        'Runny nose': 'Runny nose',
        'Body aches': 'Body aches',
        'Abdominal pain': 'Abdominal pain',
        'Diarrhea': 'Diarrhea',
        'Rash': 'Rash',
        'Joint pain': 'Joint pain',
        'Back pain': 'Back pain',
        'Swollen lymph nodes': 'Swollen lymph nodes',
        'Loss of appetite': 'Loss of appetite',
        'Chills': 'Chills'
      }
    },
    dashboard: {
      title: 'Health Dashboard',
      subtitle: 'Your personal health overview and progress tracker',
      logMetric: 'Log Health Metric',
      metricType: 'Metric Type',
      value: 'Value',
      date: 'Date',
      notes: 'Notes',
      optional: 'optional',
      notesPlaceholder: 'e.g. After breakfast, morning reading...',
      saving: 'Saving...',
      saveMetric: 'Save Metric',
      noData: 'No health data yet',
      noDataDescription: 'Start logging your health metrics to see your progress over time.',
      firstMetric: 'Log your first metric',
      readingActivity: 'Reading Activity',
      saved: 'Saved',
      articles: 'Articles',
      stories: 'Stories',
      viewSaved: 'View Saved Articles',
      quickTools: 'Quick Tools',
      symptomChecker: 'Symptom Checker',
      healthTools: 'Health Tools (BMI & Risk)',
      metrics: {
        weight: 'Weight',
        blood_pressure_systolic: 'BP Systolic',
        blood_pressure_diastolic: 'BP Diastolic',
        heart_rate: 'Heart Rate',
        blood_glucose: 'Blood Glucose',
        sleep_hours: 'Sleep',
        steps: 'Steps',
        water_intake: 'Water Intake',
        temperature: 'Temperature',
        oxygen_saturation: 'O2 Saturation'
      }
    },
    savedPage: {
      title: 'Saved Articles',
      subtitle: "Your personal reading list - articles, stories, and news you've bookmarked.",
      emptyTitle: 'No saved articles yet',
      emptyDescription: 'Tap the bookmark icon on any article, story, or news item to save it here.',
      browseArticles: 'Browse Articles',
      itemTypes: { article: 'Article', story: 'Story', news: 'News' }
    },
    doctors: {
      title: 'Our Medical Experts',
      subtitle: 'Board-certified physicians and researchers contributing evidence-based content',
      backToAll: 'Back to all doctors',
      publishedArticles: 'Published Articles',
      articlesPublished: 'Articles Published',
      totalViews: 'Total Views',
      totalLikes: 'Total Likes'
    },
    articleDetail: {
      likes: 'Likes',
      share: 'Share',
      writtenBy: 'Written by',
      viewProfile: 'View Profile & Articles',
      relatedArticles: 'Related Articles',
      recentArticles: 'Recent Articles',
      viewAllArticles: 'View All Articles',
      browseByCategory: 'Browse by Category'
    },
    healthTools: {
      subtitle: 'Interactive health tools to help you understand your health metrics. These tools are for educational purposes only.'
    },
    riskAssessment: {
      title: 'Heart Disease Risk Assessment',
      question: 'Question',
      of: 'of',
      next: 'Next',
      seeResult: 'See Result',
      tryAgain: 'Try Again',
      educationalEstimate: 'This is an educational estimate only. Please consult a healthcare professional for personalized assessment.',
      riskSuffix: 'Risk',
      levels: { low: 'Low', moderate: 'Moderate', high: 'High' },
      questions: {
        age: { question: 'What is your age group?', options: ['Under 45', '45-64', '65+'] },
        smoking: { question: 'Do you smoke?', options: ['No', 'Formerly', 'Yes'] },
        exercise: { question: 'How often do you exercise?', options: ['Regularly', 'Sometimes', 'Rarely'] },
        family: { question: 'Family history of heart disease?', options: ['No', 'Not sure', 'Yes'] },
        diet: { question: 'How would you describe your diet?', options: ['Healthy', 'Average', 'Unhealthy'] },
      },
    },
    metricChart: {
      history: 'History',
      entries: 'entries',
      vsPrev: 'vs prev',
      showChart: 'Show Chart',
      showTable: 'Show Table',
      date: 'Date',
      value: 'Value',
      notes: 'Notes',
    },
    trendingTopics: {
      title: 'Your Trending Topics',
      empty: 'Based on your saved articles. Start bookmarking to see personalized trends!',
      savedSuffix: 'saved',
    },
    patientStoriesForm: {
      title: 'Title',
      titlePlaceholder: 'My recovery journey...',
      condition: 'Medical Condition',
      conditionPlaceholder: 'e.g. Type 2 Diabetes',
      story: 'Your Story',
      storyPlaceholder: 'Share your experience...',
      anonymous: 'Post anonymously',
      displayName: 'Display Name',
      displayNamePlaceholder: 'Your name',
    },
    articlesPage: {
      library: 'Medical Library',
      searchSuffix: 'articles, topics, authors...',
      resultsFor: 'results for',
      resultFor: 'result for',
      filterBySpecialty: 'Filter by specialty',
      tryDifferentKeyword: 'Try a different keyword or category',
    },
    newsPage: {
      sourceLink: 'Source',
      categories: {
        breakthrough: 'Breakthrough',
        treatment: 'Treatment',
        regulatory: 'Regulatory',
        research: 'Research',
        technology: 'Technology',
        public_health: 'Public Health',
      },
    },
    profile: {
      tabs: { overview: 'Overview', health: 'Health Metrics', saved: 'Saved Articles', history: 'View History', settings: 'Settings' },
      editProfile: 'Edit Profile',
      editAccountProfile: 'Edit Account & Profile',
      stats: { savedArticles: 'Saved Articles', healthRecords: 'Health Records', articlesRead: 'Articles Read', interests: 'Interests' },
      cards: { recentlySaved: 'Recently Saved', latestMetrics: 'Latest Metrics', readingHistory: 'Reading History', myInterests: 'My Interests', accountInformation: 'Account Information', notifications: 'Notifications', emailNotifications: 'Email Notifications', emailNotificationsDesc: 'Receive health & article updates' },
      empty: { noSavedArticles: 'No saved articles yet', noHealthMetrics: 'No health metrics logged yet', noHealthData: 'No health data yet', noHealthDataDesc: 'Start tracking your health metrics', noReadingHistory: 'No reading history yet', noReadingHistoryDesc: 'Articles you read will appear here', noInterests: 'No interests set yet' },
      actions: { viewAll: 'View all', edit: 'Edit', addInterests: 'Add Interests', browseArticles: 'Browse Articles', logMetric: 'Log Metric', logFirstMetric: 'Log First Metric', clearAll: 'Clear All', remove: 'Remove' },
      account: { fullName: 'Full Name', arabicName: 'Arabic Name', email: 'Email', emailStatus: 'Email Status', verified: 'Verified', verificationPending: 'Verification Pending', phone: 'Phone', dateOfBirth: 'Date of Birth', gender: 'Gender', location: 'Location', role: 'Role', memberSince: 'Member Since' },
      gender: { male: 'Male', female: 'Female', prefer_not_to_say: 'Prefer not to say', select: 'Select' },
      modal: { title: 'Edit Profile', avatarHint: 'Click the camera to change your avatar', avatarHintWithRemove: 'Click the camera to change your avatar or the trash icon to remove it', removeAvatar: 'Remove avatar', confirmRemoveAvatar: 'Are you sure you want to remove your profile picture?', emailReverify: 'Changing your email will require reverification.', currentPasswordRequired: 'Required to confirm this email change securely.', placeholders: { fullName: 'Your full name', arabicName: 'Your Arabic name', email: 'you@example.com', currentPassword: 'Required to change email', phone: 'Phone number', bio: 'Tell us a bit about yourself...', location: 'City, Country', condition: 'e.g. Hypertension, Diabetes...' }, fields: { fullName: 'Full Name', arabicName: 'Arabic Name', email: 'Email', currentPassword: 'Current Password', phone: 'Phone', bio: 'Bio', dateOfBirth: 'Date of Birth', gender: 'Gender', location: 'Location', healthConditions: 'Health Conditions', medicalInterests: 'Medical Interests', emailNotifications: 'Email Notifications', emailNotificationsDesc: 'Receive personalized health updates' }, buttons: { saveChanges: 'Save Changes' }, messages: { avatarUpdated: 'Avatar updated.', avatarUpdateFailed: 'Failed to upload avatar.', avatarRemoved: 'Avatar removed.', avatarRemoveFailed: 'Failed to remove avatar.', profileUpdated: 'Profile updated.', profileUpdatedVerifyEmail: 'Profile updated. Please verify your new email address.', profileUpdateFailed: 'Failed to save profile.' } },
      password: { title: 'Password & Security', changePassword: 'Change Password', keepSecure: 'Keep your account secure with a strong password.', forgotPassword: 'Forgot password? Send reset link', noEmail: 'No email address is available for this account.', resetSent: 'Password reset email sent. Check your inbox.', resetFailed: 'Failed to send reset email. Please try again.', currentPassword: 'Current Password', newPassword: 'New Password', confirmNewPassword: 'Confirm New Password', placeholders: { currentPassword: 'Enter current password', newPassword: 'Enter new password', confirmNewPassword: 'Re-enter new password' }, requirements: { min: 'At least 8 characters', upper: 'Contains uppercase letter', lower: 'Contains lowercase letter', number: 'Contains a number' }, errors: { requirements: 'Password does not meet all requirements.', mismatch: 'New passwords do not match.', incorrectCurrent: 'Incorrect current password. Please try again.' }, success: 'Password changed successfully.', buttons: { cancel: 'Cancel', update: 'Update Password', saving: 'Saving...' } },
    },
  },
  ar: {
    nav: { home: 'الرئيسية', articles: 'المقالات', healthTools: 'أدوات صحية', stories: 'قصص المرضى', qa: 'أسئلة وأجوبة', news: 'أخبار طبية', guidelines: 'الإرشادات', symptomChecker: 'فاحص الأعراض', doctors: 'الأطباء', more: 'المزيد', dashboard: 'لوحة المتابعة', saved: 'المحفوظات' },
    hero: { title: 'رؤى طبية مبنية على الأدلة', subtitle: 'أبحاث موثوقة ومراجعة من قبل الأقران للمهنيين الصحيين والقراء', cta: 'استكشف المقالات', secondaryCta: 'أدوات صحية' },
    categories: { cardiology: 'أمراض القلب', neurology: 'أمراض الأعصاب', oncology: 'الأورام', pediatrics: 'طب الأطفال', dermatology: 'الأمراض الجلدية', orthopedics: 'جراحة العظام', psychiatry: 'الطب النفسي', general_medicine: 'الطب العام', surgery: 'الجراحة', infectious_diseases: 'الأمراض المعدية' },
    common: { readMore: 'اقرأ المزيد', featured: 'مميز', peerReviewed: 'مراجع من الأقران', minRead: 'دقيقة قراءة', subscribe: 'اشترك', email: 'البريد الإلكتروني', search: 'ابحث في المقالات...', all: 'الكل', loading: 'جاري التحميل...', noResults: 'لا توجد نتائج', viewAll: 'عرض الكل', submit: 'إرسال', cancel: 'إلغاء', back: 'رجوع', upcoming: 'قادم', live: 'مباشر', completed: 'مكتمل', breaking: 'عاجل', calculate: 'احسب', reset: 'إعادة', result: 'النتيجة', anonymous: 'مجهول', add: 'إضافة', startOver: 'ابدأ من جديد', searchByName: 'ابحث بالاسم أو التخصص أو المسمى...', you: 'أنت', source: 'المصدر', requiredFields: 'الحقول الأساسية للمصدر غير مكتملة.' },
    newsletter: { badge: 'النشرة البريدية', title: 'ابق على اطلاع', subtitle: 'احصل على رؤى طبية مخصصة في بريدك', placeholder: 'أدخل بريدك الإلكتروني', success: 'تم الاشتراك بنجاح!', description: 'ستصلك أحدث الرؤى الطبية إلى بريدك الإلكتروني.', subscribed: 'تم الاشتراك', stayUpdated: 'ابق على اطلاع' },
    bmi: { title: 'حاسبة مؤشر كتلة الجسم', weight: 'الوزن (كجم)', height: 'الطول (سم)', underweight: 'نقص الوزن', normal: 'وزن طبيعي', overweight: 'زيادة الوزن', obese: 'سمنة' },
    stories: { title: 'قصص المرضى', subtitle: 'تجارب حقيقية من مرضى حقيقيين', share: 'شارك قصتك' },
    qa: { title: 'أسئلة وأجوبة الخبراء', subtitle: 'تعلم من كبار المتخصصين الطبيين', askQuestion: 'أرسل سؤالاً' },
    news: { title: 'أخبار طبية', subtitle: 'آخر الاكتشافات والتحديثات' },
    guidelines: { title: 'الإرشادات الطبية', subtitle: 'الوصول إلى الإرشادات الطبية العالمية من منظمة الصحة العالمية ومركز السيطرة على الأمراض', searchPlaceholder: 'ابحث عن الإرشادات حسب المرض أو العلاج أو الدواء...' },
    footer: { about: 'عن MedBlog', aboutText: 'MedBlog يوفر أبحاثًا طبية موثوقة ومبنية على الأدلة للمهنيين الصحيين والقراء العامين.', quickLinks: 'روابط سريعة', categories: 'التصنيفات', connect: 'تواصل معنا', rights: 'جميع الحقوق محفوظة.', disclaimer: 'إخلاء المسؤولية الطبية: المحتوى لأغراض إعلامية فقط ولا يشكل نصيحة طبية.' },
    home: {
      stats: { articlesPublished: 'مقال منشور', expertContributors: 'خبير مساهم', peerReviewed: 'مراجع من الأقران' },
      doctors: { eyebrow: 'خبراء طبيون', title: 'أطباء مميزون', subtitle: 'تعرف على أبرز المتخصصين خلف المحتوى الطبي المبني على الأدلة', viewAll: 'عرض جميع الأطباء', featuredExpert: 'خبير مميز', topContributor: 'أكثر المساهمين', researchLead: 'قائد بحثي', articles: 'مقالات', viewProfile: 'عرض الملف' }
    },
    symptomChecker: {
      title: 'فاحص الأعراض',
      subtitle: 'إرشاد أولي مدعوم بالذكاء الاصطناعي - وليس بديلاً عن الرعاية الطبية المتخصصة',
      disclaimer: 'هذه الأداة تقدم إرشادات معلوماتية فقط ولا تمثل تشخيصًا طبيًا. استشر دائمًا مختصًا صحيًا مؤهلًا للحصول على المشورة الطبية.',
      prompt: 'ما الأعراض التي تشعر بها؟',
      customPlaceholder: 'اكتب عرضًا إضافيًا ثم اضغط Enter...',
      analyzing: 'جارٍ تحليل الأعراض...',
      analyze: 'تحليل الأعراض',
      recommendation: 'التوصية',
      possibleCauses: 'الأسباب المحتملة',
      redFlags: 'اطلب رعاية طارئة إذا ظهرت أيضًا هذه العلامات:',
      urgency: {
        emergency: 'اطلب رعاية طارئة فورًا',
        urgent: 'راجع طبيبًا قريبًا',
        moderate: 'حدد موعدًا مع طبيب',
        mild: 'قد تكفي الرعاية المنزلية'
      },
      symptoms: {
        'Headache': 'صداع',
        'Fever': 'حمى',
        'Fatigue': 'إرهاق',
        'Cough': 'سعال',
        'Shortness of breath': 'ضيق في التنفس',
        'Chest pain': 'ألم في الصدر',
        'Nausea': 'غثيان',
        'Vomiting': 'قيء',
        'Dizziness': 'دوخة',
        'Sore throat': 'التهاب الحلق',
        'Runny nose': 'سيلان الأنف',
        'Body aches': 'آلام بالجسم',
        'Abdominal pain': 'ألم في البطن',
        'Diarrhea': 'إسهال',
        'Rash': 'طفح جلدي',
        'Joint pain': 'ألم المفاصل',
        'Back pain': 'ألم الظهر',
        'Swollen lymph nodes': 'تورم الغدد اللمفاوية',
        'Loss of appetite': 'فقدان الشهية',
        'Chills': 'قشعريرة'
      }
    },
    dashboard: {
      title: 'لوحة المتابعة الصحية',
      subtitle: 'نظرة عامة على صحتك ومتابعة تقدمك',
      logMetric: 'تسجيل مؤشر صحي',
      metricType: 'نوع المؤشر',
      value: 'القيمة',
      date: 'التاريخ',
      notes: 'ملاحظات',
      optional: 'اختياري',
      notesPlaceholder: 'مثال: بعد الإفطار، قراءة صباحية...',
      saving: 'جارٍ الحفظ...',
      saveMetric: 'حفظ المؤشر',
      noData: 'لا توجد بيانات صحية بعد',
      noDataDescription: 'ابدأ بتسجيل مؤشراتك الصحية لرؤية تقدمك مع الوقت.',
      firstMetric: 'سجل أول مؤشر صحي',
      readingActivity: 'نشاط القراءة',
      saved: 'المحفوظات',
      articles: 'المقالات',
      stories: 'القصص',
      viewSaved: 'عرض المقالات المحفوظة',
      quickTools: 'أدوات سريعة',
      symptomChecker: 'فاحص الأعراض',
      healthTools: 'الأدوات الصحية (BMI والمخاطر)',
      metrics: {
        weight: 'الوزن',
        blood_pressure_systolic: 'الضغط الانقباضي',
        blood_pressure_diastolic: 'الضغط الانبساطي',
        heart_rate: 'معدل النبض',
        blood_glucose: 'سكر الدم',
        sleep_hours: 'النوم',
        steps: 'الخطوات',
        water_intake: 'شرب الماء',
        temperature: 'الحرارة',
        oxygen_saturation: 'تشبع الأكسجين'
      }
    },
    savedPage: {
      title: 'المقالات المحفوظة',
      subtitle: 'قائمة القراءة الخاصة بك - مقالات وقصص وأخبار قمت بحفظها.',
      emptyTitle: 'لا توجد مقالات محفوظة بعد',
      emptyDescription: 'اضغط على أيقونة الحفظ في أي مقال أو قصة أو خبر ليظهر هنا.',
      browseArticles: 'تصفح المقالات',
      itemTypes: { article: 'مقال', story: 'قصة', news: 'خبر' }
    },
    doctors: {
      title: 'خبراؤنا الطبيون',
      subtitle: 'أطباء وباحثون معتمدون يساهمون بمحتوى مبني على الأدلة',
      backToAll: 'العودة إلى جميع الأطباء',
      publishedArticles: 'المقالات المنشورة',
      articlesPublished: 'مقالات منشورة',
      totalViews: 'إجمالي المشاهدات',
      totalLikes: 'إجمالي الإعجابات'
    },
    articleDetail: {
      likes: 'إعجاب',
      share: 'مشاركة',
      writtenBy: 'بقلم',
      viewProfile: 'عرض الملف والمقالات',
      relatedArticles: 'مقالات ذات صلة',
      recentArticles: 'أحدث المقالات',
      viewAllArticles: 'عرض جميع المقالات',
      browseByCategory: 'تصفح حسب التصنيف'
    },
    healthTools: {
      subtitle: 'أدوات صحية تفاعلية تساعدك على فهم مؤشراتك الصحية. هذه الأدوات لأغراض تثقيفية فقط.'
    },
    riskAssessment: {
      title: 'تقييم خطر أمراض القلب',
      question: 'السؤال',
      of: 'من',
      next: 'التالي',
      seeResult: 'عرض النتيجة',
      tryAgain: 'إعادة المحاولة',
      educationalEstimate: 'هذا تقدير تثقيفي فقط. يُرجى استشارة مختص صحي للحصول على تقييم شخصي.',
      riskSuffix: 'خطورة',
      levels: { low: 'منخفضة', moderate: 'متوسطة', high: 'مرتفعة' },
      questions: {
        age: { question: 'ما الفئة العمرية الخاصة بك؟', options: ['أقل من 45', '45-64', '65 فأكثر'] },
        smoking: { question: 'هل تدخن؟', options: ['لا', 'سابقًا', 'نعم'] },
        exercise: { question: 'كم مرة تمارس الرياضة؟', options: ['بانتظام', 'أحيانًا', 'نادرًا'] },
        family: { question: 'هل يوجد تاريخ عائلي لأمراض القلب؟', options: ['لا', 'غير متأكد', 'نعم'] },
        diet: { question: 'كيف تصف نظامك الغذائي؟', options: ['صحي', 'متوسط', 'غير صحي'] },
      },
    },
    metricChart: {
      history: 'السجل',
      entries: 'قراءات',
      vsPrev: 'مقارنة بالسابق',
      showChart: 'عرض الرسم',
      showTable: 'عرض الجدول',
      date: 'التاريخ',
      value: 'القيمة',
      notes: 'الملاحظات',
    },
    trendingTopics: {
      title: 'الموضوعات الأكثر اهتمامًا لديك',
      empty: 'يعتمد ذلك على مقالاتك المحفوظة. ابدأ بالحفظ لرؤية اهتماماتك المخصصة.',
      savedSuffix: 'محفوظ',
    },
    patientStoriesForm: {
      title: 'العنوان',
      titlePlaceholder: 'رحلة تعافي الخاصة بي...',
      condition: 'الحالة الطبية',
      conditionPlaceholder: 'مثال: السكري من النوع الثاني',
      story: 'قصتك',
      storyPlaceholder: 'شارك تجربتك...',
      anonymous: 'انشر بشكل مجهول',
      displayName: 'اسم العرض',
      displayNamePlaceholder: 'اسمك',
    },
    articlesPage: {
      library: 'المكتبة الطبية',
      searchSuffix: 'مقالات، مواضيع، كتّاب...',
      resultsFor: 'نتائج عن',
      resultFor: 'نتيجة عن',
      filterBySpecialty: 'التصفية حسب التخصص',
      tryDifferentKeyword: 'جرّب كلمة مختلفة أو تصنيفًا آخر',
    },
    newsPage: {
      sourceLink: 'المصدر',
      categories: {
        breakthrough: 'اختراق طبي',
        treatment: 'علاج',
        regulatory: 'تنظيمي',
        research: 'أبحاث',
        technology: 'تقنية',
        public_health: 'صحة عامة',
      },
    },
    profile: {
      tabs: { overview: 'نظرة عامة', health: 'المؤشرات الصحية', saved: 'المقالات المحفوظة', history: 'سجل المشاهدة', settings: 'الإعدادات' },
      editProfile: 'تعديل الملف',
      editAccountProfile: 'تعديل الحساب والملف',
      stats: { savedArticles: 'المقالات المحفوظة', healthRecords: 'السجلات الصحية', articlesRead: 'المقالات المقروءة', interests: 'الاهتمامات' },
      cards: { recentlySaved: 'المحفوظة مؤخرًا', latestMetrics: 'أحدث المؤشرات', readingHistory: 'سجل القراءة', myInterests: 'اهتماماتي', accountInformation: 'معلومات الحساب', notifications: 'الإشعارات', emailNotifications: 'إشعارات البريد', emailNotificationsDesc: 'استقبل تحديثات الصحة والمقالات' },
      empty: { noSavedArticles: 'لا توجد مقالات محفوظة بعد', noHealthMetrics: 'لا توجد مؤشرات صحية مسجلة بعد', noHealthData: 'لا توجد بيانات صحية بعد', noHealthDataDesc: 'ابدأ بتتبع مؤشراتك الصحية', noReadingHistory: 'لا يوجد سجل قراءة بعد', noReadingHistoryDesc: 'ستظهر هنا المقالات التي تقرؤها', noInterests: 'لم يتم تحديد اهتمامات بعد' },
      actions: { viewAll: 'عرض الكل', edit: 'تعديل', addInterests: 'إضافة اهتمامات', browseArticles: 'تصفح المقالات', logMetric: 'تسجيل مؤشر', logFirstMetric: 'سجل أول مؤشر', clearAll: 'مسح الكل', remove: 'إزالة' },
      account: { fullName: 'الاسم الكامل', arabicName: 'الاسم بالعربية', email: 'البريد الإلكتروني', emailStatus: 'حالة البريد', verified: 'موثق', verificationPending: 'بانتظار التوثيق', phone: 'الهاتف', dateOfBirth: 'تاريخ الميلاد', gender: 'الجنس', location: 'الموقع', role: 'الدور', memberSince: 'عضو منذ' },
      gender: { male: 'ذكر', female: 'أنثى', prefer_not_to_say: 'أفضل عدم الإفصاح', select: 'اختر' },
      modal: { title: 'تعديل الملف', avatarHint: 'اضغط على الكاميرا لتغيير الصورة الشخصية', avatarHintWithRemove: 'اضغط على الكاميرا لتغيير الصورة الشخصية أو سلة المهملات لحذفها', removeAvatar: 'حذف الصورة', confirmRemoveAvatar: 'هل أنت متأكد أنك تريد حذف صورتك الشخصية؟', emailReverify: 'سيستلزم تغيير البريد الإلكتروني إعادة التحقق.', currentPasswordRequired: 'مطلوب لتأكيد تغيير البريد الإلكتروني بشكل آمن.', placeholders: { fullName: 'اسمك الكامل', arabicName: 'اسمك بالعربية', email: 'you@example.com', currentPassword: 'مطلوب لتغيير البريد', phone: 'رقم الهاتف', bio: 'أخبرنا قليلًا عنك...', location: 'المدينة، الدولة', condition: 'مثال: ارتفاع ضغط الدم، السكري...' }, fields: { fullName: 'الاسم الكامل', arabicName: 'الاسم بالعربية', email: 'البريد الإلكتروني', currentPassword: 'كلمة المرور الحالية', phone: 'الهاتف', bio: 'نبذة', dateOfBirth: 'تاريخ الميلاد', gender: 'الجنس', location: 'الموقع', healthConditions: 'الحالات الصحية', medicalInterests: 'الاهتمامات الطبية', emailNotifications: 'إشعارات البريد الإلكتروني', emailNotificationsDesc: 'استقبل تحديثات صحية مخصصة' }, buttons: { saveChanges: 'حفظ التغييرات' }, messages: { avatarUpdated: 'تم تحديث الصورة الشخصية.', avatarUpdateFailed: 'فشل رفع الصورة الشخصية.', avatarRemoved: 'تم حذف الصورة الشخصية.', avatarRemoveFailed: 'فشل حذف الصورة الشخصية.', profileUpdated: 'تم تحديث الملف.', profileUpdatedVerifyEmail: 'تم تحديث الملف. يرجى توثيق بريدك الإلكتروني الجديد.', profileUpdateFailed: 'فشل حفظ الملف.' } },
      password: { title: 'كلمة المرور والأمان', changePassword: 'تغيير كلمة المرور', keepSecure: 'حافظ على أمان حسابك بكلمة مرور قوية.', forgotPassword: 'هل نسيت كلمة المرور؟ أرسل رابط إعادة التعيين', noEmail: 'لا يوجد بريد إلكتروني متاح لهذا الحساب.', resetSent: 'تم إرسال رسالة إعادة تعيين كلمة المرور. تحقق من بريدك.', resetFailed: 'فشل إرسال رسالة إعادة التعيين. حاول مرة أخرى.', currentPassword: 'كلمة المرور الحالية', newPassword: 'كلمة المرور الجديدة', confirmNewPassword: 'تأكيد كلمة المرور الجديدة', placeholders: { currentPassword: 'أدخل كلمة المرور الحالية', newPassword: 'أدخل كلمة المرور الجديدة', confirmNewPassword: 'أعد إدخال كلمة المرور الجديدة' }, requirements: { min: '8 أحرف على الأقل', upper: 'تحتوي على حرف كبير', lower: 'تحتوي على حرف صغير', number: 'تحتوي على رقم' }, errors: { requirements: 'كلمة المرور لا تستوفي جميع الشروط.', mismatch: 'كلمتا المرور الجديدتان غير متطابقتين.', incorrectCurrent: 'كلمة المرور الحالية غير صحيحة. حاول مرة أخرى.' }, success: 'تم تغيير كلمة المرور بنجاح.', buttons: { cancel: 'إلغاء', update: 'تحديث كلمة المرور', saving: 'جارٍ الحفظ...' } },
    },
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    return window.localStorage.getItem('lang') || 'en';
  });
  const t = translations[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', lang);
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  const toggleLang = () => setLang((l) => l === 'en' ? 'ar' : 'en');
  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL, toggleLang }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className="font-sans">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
