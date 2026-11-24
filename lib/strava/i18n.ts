import { AppLanguage, InjuryStatus, TrainingZoneType } from './types';

export interface PaceCraftCopy {
  nav: {
    mainAriaLabel: string;
    mobileAriaLabel: string;
    profileBmi: string;
    trainingPlan: string;
    nutrition: string;
    dailyProgress: string;
    stravaHistory: string;
    buildMenuCta: string;
    languageGroupLabel: string;
    idButton: string;
    enButton: string;
  };
  sidebar: {
    ariaLabel: string;
    openMenuAria: string;
    closeMenuAria: string;
    workspaceCaption: string;
    items: {
      overview: { label: string; hint: string };
      training: { label: string; hint: string };
      progress: { label: string; hint: string };
      profile: { label: string; hint: string };
      nutrition: { label: string; hint: string };
      strava: { label: string; hint: string };
    };
  };
  overview: {
    greetingTitle: string;
    greetingSubtitle: string;
    quickPlanBtn: string;
    quickLogBtn: string;
    todaySectionLabel: string;
    todayDoneBadge: string;
    todayRestDesc: string;
    todayQuickLogBtn: string;
    todayViewProgressBtn: string;
    todayViewPlanBtn: string;
    cards: {
      trainingTitle: string;
      trainingAction: string;
      progressTitle: string;
      progressAction: string;
      profileTitle: string;
      profileAction: string;
      nutritionTitle: string;
      nutritionAction: string;
    };
    stravaEmptyBanner: string;
    stravaLoadSampleShort: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    loadSampleBtn: string;
    logTodayBtn: string;
    raceTargetLabel: string;
    daysPerWeekUnit: string;
    currentBmiLabel: string;
    categoryPrefix: string;
    weeklyVolumeLabel: string;
    progressBarAria: string;
    sessionsUnit: string;
    baselinePaceLabel: string;
    stravaSessionsUnit: string;
    defaultBaselineHint: string;
  };
  countdown: {
    badgeLabel: string;
    untilPrefix: string;
    daysLeftUnit: string;
    todayLabel: string;
    passedDaysSuffix: string;
    weeksDaysFormat: (weeks: number, days: number) => string;
    dateInputLabel: string;
    dateInputAria: string;
    nameInputLabel: string;
    nameInputPlaceholder: string;
    nameInputAria: string;
    resetDateBtn: string;
    editEventBtn: string;
    doneEditBtn: string;
  };
  bmi: {
    heading: string;
    subtitle: string;
    methodLabel: string;
    weightHeightBtn: string;
    directBmiBtn: string;
    weightLabel: string;
    weightHint: string;
    heightLabel: string;
    heightHint: string;
    directBmiLabel: string;
    ageLabel: string;
    injuryLabel: string;
    injuryOptions: Record<InjuryStatus, string>;
    resultLabel: string;
    categoryPrefix: string;
    maxIncreaseLabel: string;
    maxPrefix: string;
    extraEasyLabel: string;
    hrSectionTitle: string;
    hrSectionSubtitle: string;
    restingHrLabel: string;
    restingHrHint: string;
    maxHrLabel: string;
    maxHrPlaceholder: string;
    maxHrAutoHint: (autoVal: number) => string;
    vo2MaxLabel: string;
    vo2MaxUnit: string;
    avgObservedHrLabel: string;
    noObservedHrYet: string;
    hrZonesTitle: string;
    tabsAriaLabel: string;
    tabs: {
      body: string;
      hr: string;
      shoes: string;
      account: string;
      admin: string;
    };
    helperTip: string;
  };
  training: {
    heading: string;
    subtitlePrefix: string;
    weekUnit: string;
    subtitleMiddle: string;
    defaultBaselineTag: string;
    stravaBaselineTag: string;
    step1Title: string;
    raceGroupAria: string;
    step2Title: string;
    freqGroupAria: string;
    daysPerWeekShort: string;
    totalPlannedLabel: string;
    paceZonesHeading: string;
    progressionHeading: string;
    progressionDescPrefix: string;
    progressionDescSuffix: string;
    scheduleHeadingPrefix: string;
    activeDaysUnit: string;
    restLabel: string;
    loggedBtn: string;
    logCompleteBtn: string;
    taperNoticeTitle: string;
    taperNoticeBody: (days: number, reductionPct: number, eventLabel: string) => string;
    raceWeekNoticeTitle: string;
    raceWeekNoticeBody: (days: number, eventLabel: string) => string;
    raceDayNoticeTitle: string;
    raceDayNoticeBody: (eventLabel: string) => string;
    strengthHeaderTag: (count: number) => string;
    strengthBadgePrefix: string;
    minuteShort: string;
    viewScheduleTab: string;
    viewZonesTab: string;
    customPaceBadge: string;
    resetCustomPaceBtn: string;
    baselineVolumeChip: string;
    baselinePaceChip: string;
    strengthToggleShow: string;
    strengthToggleHide: string;
    exportIcsBtn: string;
    exportedIcsNotice: string;
    zoneLabels: Record<TrainingZoneType, string>;
  };
  nutrition: {
    headingPrefix: string;
    subtitleBeforeWeight: string;
    subtitleAfterWeight: string;
    carbsLabel: string;
    carbsUnitNote: string;
    proteinLabel: string;
    proteinUnitNote: string;
    hydrationLabel: string;
    hydrationUnitNote: string;
    strategyHeadingPrefix: string;
    examplesLabel: string;
  };
  dailyProgress: {
    heading: string;
    motivationDone: string;
    motivationStreak: (days: number) => string;
    motivationStarted: string;
    motivationEmpty: string;
    streakLabel: string;
    daysUnit: string;
    thisWeekLabel: string;
    sessionsUnit: string;
    weeklyAchievementLabel: string;
    kmLoggedUnit: string;
    progressBarAria: string;
    dayAriaDone: string;
    selectDayPrefix: string;
    restShort: string;
    logSectionPrefix: string;
    targetLabel: string;
    actualDistanceLabel: string;
    comfortLabel: string;
    comfortGroupAria: string;
    comfortScoreAria: string;
    comfortRatings: Record<1 | 2 | 3 | 4 | 5, string>;
    noteLabel: string;
    notePlaceholder: string;
    saveBtn: string;
    savedFeedback: (dayName: string, title: string) => string;
    savedLogsHeading: string;
    emptyLogsBeforeBtn: string;
    emptyLogsBtnName: string;
    emptyLogsAfterBtn: string;
    feelingPrefix: string;
    deleteLogAria: string;
    quickLogDefaultNote: string;
    stravaSyncTitle: (count: number) => string;
    stravaSyncDesc: string;
    stravaSyncBtn: (count: number) => string;
    stravaSyncSuccess: (count: number) => string;
    stravaSyncedTag: string;
    paceInputLabel: string;
    paceInputPlaceholder: string;
    hrInputLabel: string;
    hrInputPlaceholder: string;
    avgPaceLabel: string;
    avgHrLabel: string;
    shareBtn: string;
    optionalDetailsShow: string;
    optionalDetailsHide: string;
    jumpToCalendarBtn: string;
    shareModal: {
      title: string;
      subtitle: string;
      closeAria: string;
      cardBadge: string;
      streakMetric: string;
      sessionsMetric: string;
      distanceMetric: string;
      paceMetric: string;
      hrMetric: string;
      vo2Metric: string;
      copyTextBtn: string;
      copiedTextBtn: string;
      downloadPngBtn: string;
      nativeShareBtn: string;
      captionHeader: (eventLabel: string) => string;
      captionFooter: string;
      formatLabel: string;
      formatSquare: string;
      formatStory: string;
      storyWatermark: string;
    };
  };
  strava: {
    heading: string;
    subtitle: string;
    importSourceHeading: string;
    importSourceDescBeforeCsv: string;
    importSourceDescMiddle: string;
    importSourceDescAfterGpx: string;
    fileInputAria: string;
    importBtn: string;
    loadSampleBtn: string;
    resyncStravaBtn: string;
    connectingStravaBtn: string;
    oauthBtn: string;
    clearDataBtn: string;
    clearDataAria: string;
    oauthMissingCreds: string;
    oauthPopupBlocked: string;
    oauthCanceled: string;
    oauthEndpointError: string;
    kpi4WeekTitle: string;
    kpi4WeekSub: string;
    kpiPerWeekUnit: string;
    kpi30DayTitle: string;
    kpi30DaySub: string;
    kpiPaceTitle: string;
    kpiPaceSub: string;
    kpiLongestTitle: string;
    kpiLongestSubPrefix: string;
    kpiLongestSubSuffix: string;
    barChartTitle: string;
    barChartDescBefore: string;
    barChartDescUnit: string;
    barChartWeekPrefix: string;
    barChartSessionsUnit: string;
    areaChartTitle: string;
    areaChartDesc: string;
    areaChartActiveWeeks: (active: number) => string;
    areaChartTooltipSessions: string;
    areaChartSeriesName: string;
    chartAreaTab: string;
    chartBarTab: string;
    filterGroupAria: string;
    filters: {
      all: string;
      Run: string;
      TrailRun: string;
      VirtualRun: string;
    };
    searchPlaceholder: string;
    searchAria: string;
    resetFilterBtn: string;
    emptyRunsTitle: string;
    emptyRunsDescBefore: string;
    emptyRunsDescMiddle: string;
    emptyRunsDescAfter: string;
    emptyFilterDesc: string;
    cardViewAria: string;
    cardDistance: string;
    cardPace: string;
    cardTime: string;
    noGpsRoute: string;
    routePreviewAria: string;
    sampleLoadedNotice: string;
    importNotice: (count: number, sourceLabel: string, skippedNonRuns: number) => string;
    oauthSyncedNotice: (count: number) => string;
    clearedRunsNotice: string;
    csvAndGpxLabel: string;
    csvStravaLabel: string;
    gpxFileLabel: string;
    syncToProgressBtn: (count: number) => string;
    syncToProgressDone: string;
    offlineFriendlyTip: string;
    howToExportToggle: string;
    howToExportSteps: [string, string, string];
    advancedOAuthToggle: string;
  };
  detailModal: {
    closeAria: string;
    startPoint: string;
    endPoint: string;
    distance: string;
    avgPace: string;
    movingTime: string;
    elapsedTime: string;
    maxSpeed: string;
    elevationHr: string;
    dataSourcePrefix: string;
    sources: {
      sample: string;
      csv: string;
      gpx: string;
      strava_oauth: string;
    };
    closeBtn: string;
  };
  disconnectModal: {
    titleOAuth: string;
    titleLocal: string;
    closeAria: string;
    bodyBeforeCount: string;
    bodyMiddleLocal: string;
    bodyOAuthAddon: string;
    bodyAfter: string;
    cancelBtn: string;
    confirmBtn: string;
  };
  footer: {
    left: string;
    right: string;
  };
  auth: {
    loadingText: string;
    loginEyebrow: string;
    loginTitle: string;
    loginSubtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    cardTitle: string;
    cardSubtitle: string;
    licenseKeyLabel: string;
    licenseKeyPlaceholder: string;
    licenseKeyHint: string;
    googleBtn: string;
    signingInBtn: string;
    privacyNote: string;
    popupClosedError: string;
    popupBlockedError: string;
    genericAuthError: string;
    accountLabel: string;
    signOutBtn: string;
    signingOutBtn: string;
    syncReadyLabel: string;
  };
  migration: {
    title: string;
    desc: (runsCount: number, progressCount: number) => string;
    importBtn: string;
    importingBtn: string;
    startFreshBtn: string;
    importedNotice: string;
  };
  privacyModal: {
    linkLabel: string;
    title: string;
    subtitle: string;
    closeAria: string;
    items: Array<{ title: string; body: string }>;
    closeBtn: string;
  };
  accountSecurity: {
    heading: string;
    subtitle: string;
    privacyBtn: string;
    deleteBtn: string;
    modalTitle: string;
    modalDesc: string;
    confirmKeyword: string;
    inputLabel: (keyword: string) => string;
    inputPlaceholder: string;
    cancelBtn: string;
    confirmDeleteBtn: string;
    deletingBtn: string;
    errorNotice: string;
  };
  theme: {
    darkShort: string;
    lightShort: string;
    ariaToDark: string;
    ariaToLight: string;
  };
  paceCalculator: {
    heading: string;
    subtitle: string;
    distanceLabel: string;
    hoursLabel: string;
    minutesLabel: string;
    secondsLabel: string;
    resetBtn: string;
    applyToPlanBtn: string;
    appliedNotice: (race: string, pace: string) => string;
    activeCustomBanner: (pace: string) => string;
    useStravaBaselineBtn: string;
    racePaceLabel: string;
    speedLabel: string;
    easyTitle: string;
    easyNote: string;
    tempoTitle: string;
    tempoNote: string;
    intervalTitle: string;
    intervalNote: string;
  };
  shoeTracker: {
    heading: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    currentKmLabel: string;
    maxKmLabel: string;
    maxKmHint: string;
    usagePrefix: string;
    remainingPrefix: string;
    syncLatestRunBtn: (kmLabel: string) => string;
    add5KmBtn: string;
    resetNewShoeBtn: string;
    healthyBadge: string;
    warningBadge: string;
    replaceBadge: string;
    warningText: string;
    replaceText: string;
  };
  backup: {
    heading: string;
    subtitle: string;
    exportBtn: string;
    importBtn: string;
    exportDone: string;
    restoreSuccess: (runsCount: number, progressCount: number) => string;
    restoreInvalidError: string;
  };
  disclaimer: {
    text: string;
  };
  accessGate: {
    badge: string;
    title: string;
    subtitle: string;
    signedInAs: string;
    refreshBtn: string;
    checkingText: string;
    checkoutCardTitle: string;
    checkoutCardDesc: string;
    checkoutBtn: string;
    checkoutOpeningBtn: string;
    checkoutNotConfigured: string;
    codeCardTitle: string;
    codeCardDesc: string;
    codeLabel: string;
    codePlaceholder: string;
    verifyCodeBtn: string;
    verifyingBtn: string;
    invalidCodeError: string;
    alreadyUsedCodeError: string;
    manualCardTitle: string;
    manualCardDesc: string;
    planLabel: string;
    planLifetime: string;
    planPro: string;
    orderRefLabel: string;
    orderRefPlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    submitManualBtn: string;
    submittingManualBtn: string;
    pendingTitle: string;
    pendingDesc: (orderRef: string) => string;
    revokedTitle: string;
    revokedDesc: string;
    stripeReturnedChecking: string;
    stripeCanceledNotice: string;
    planChooseLabel: string;
    qrisSectionTitle: string;
    qrisSectionDesc: string;
    qrisScanHint: string;
    qrisNotConfiguredNote: string;
    bankSectionLabel: string;
    whatsappBtn: string;
    whatsappMissingNote: string;
    manualFormHeading: string;
    manualFormDesc: string;
    gatewayTitle: string;
    gatewayDesc: string;
  };
  adminAccess: {
    heading: string;
    subtitle: string;
    planLabel: string;
    planLifetime: string;
    planPro: string;
    customCodeLabel: string;
    customCodePlaceholder: string;
    buyerNoteLabel: string;
    buyerNotePlaceholder: string;
    generateCodeBtn: string;
    generatingBtn: string;
    generatedLabel: string;
    singleUseHint: string;
    generateError: string;
    copyCodeBtn: string;
    copiedBtn: string;
    licenseListTitle: string;
    licenseEmptyList: string;
    revokeLicenseBtn: string;
    licenseStatusLabels: {
      unused: string;
      used: string;
      revoked: string;
    };
    emptyList: string;
    approveBtn: string;
    revokeBtn: string;
    statusLabels: {
      pending: string;
      active: string;
      revoked: string;
    };
  };
  monthlyCalendar: {
    heading: string;
    subtitle: string;
    prevMonthAria: string;
    nextMonthAria: string;
    thisMonthBtn: string;
    activeDaysLabel: string;
    monthlyTotalKmLabel: string;
    highIntensityDaysLabel: string;
    avgPaceLabel: string;
    avgHrLabel: string;
    daysUnit: string;
    sessionsUnit: string;
    weekdayHeadersShort: [string, string, string, string, string, string, string];
    legendTitle: string;
    intensityLabels: Record<'rest' | 'light' | 'moderate' | 'high' | 'peak', string>;
    intensityDescriptions: Record<'rest' | 'light' | 'moderate' | 'high' | 'peak', string>;
    todayTag: string;
    restLoggedTag: string;
    dayCellAria: (
      fullDate: string,
      intensityLabel: string,
      kmText: string,
      sessionsCount: number
    ) => string;
    detailPanelHeading: string;
    selectedTotalLabel: string;
    selectedDurationLabel: string;
    emptyDayTitle: string;
    emptyDayPlannedHint: (title: string, kmText: string) => string;
    emptyDayRestHint: string;
    emptyDayDefaultHint: string;
    logForWeekdayBtn: (dayName: string) => string;
    sourceLabels: {
      daily_log: string;
      strava_sample: string;
      strava_csv: string;
      strava_gpx: string;
      strava_oauth: string;
    };
    metricDistance: string;
    metricPace: string;
    metricDuration: string;
    metricHr: string;
    metricElevation: string;
    metricComfort: string;
  };
  landing: {
    navFeatures: string;
    navDemo: string;
    navPricing: string;
    navFaq: string;
    navLoginBtn: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDemoCta: string;
    heroOpenDemoCta: string;
    heroBuyCta: string;
    heroImageAlt: string;
    trust1: string;
    trust2: string;
    trust3: string;
    showcaseHeading: string;
    showcaseSubtitle: string;
    showcaseTryDemoBtn: string;
    showcaseCards: Array<{
      badge: string;
      title: string;
      desc: string;
      highlightLabel: string;
      highlightValue: string;
    }>;
    demoHeading: string;
    demoSubtitle: string;
    demoOpenFullBtn: string;
    demoApplyCta: string;
    demoAppliedHint: string;
    pricingHeading: string;
    pricingSubtitle: string;
    pricingSelectBtn: string;
    pricingSelectedBtn: string;
    comparisonTableHeading: string;
    comparisonFeatureHeader: string;
    comparisonIncludedLabel: string;
    faqHeading: string;
    faqSubtitle: string;
    faqItems: Array<{ q: string; a: string }>;
  };
  demoMode: {
    badge: string;
    title: string;
    subtitle: string;
    signInCta: string;
    backHomeBtn: string;
    sidebarName: string;
    sidebarEmail: string;
    exitSidebarBtn: string;
  };
  onboarding: {
    badge: string;
    stepOf: (step: number, total: number) => string;
    titleStep1: string;
    subtitleStep1: string;
    titleStep2: string;
    subtitleStep2: string;
    titleStep3: string;
    subtitleStep3: string;
    raceLabel: string;
    freqLabel: string;
    eventNameLabel: string;
    eventNamePlaceholder: string;
    eventDateLabel: string;
    targetTimeToggle: string;
    targetPacePreview: string;
    previewSummaryHeading: string;
    previewBmiLabel: string;
    previewVolumeLabel: string;
    previewPaceLabel: string;
    nextBtn: string;
    backBtn: string;
    submitBtn: string;
    skipBtn: string;
    reopenBtn: string;
  };
  pwa: {
    installBtn: string;
    bannerTitle: string;
    bannerDesc: string;
    guideTitle: string;
    iosSubtitle: string;
    androidSubtitle: string;
    iosStep1: string;
    iosStep2: string;
    iosStep3: string;
    androidStep1: string;
    androidStep2: string;
    offlineNotice: string;
    closeAria: string;
    closeBtn: string;
  };
  personalBests: {
    heading: string;
    subtitle: string;
    detectBtn: string;
    detectedNotice: (count: number) => string;
    noRunsDetectedNotice: string;
    clearBtn: string;
    overviewLabel: string;
    placeholder: string;
    saveHint: string;
    invalidHint: string;
  };
}

export const UI_COPY: Record<AppLanguage, PaceCraftCopy> = {
  id: {
    nav: {
      mainAriaLabel: 'Navigasi utama',
      mobileAriaLabel: 'Navigasi cepat mobile',
      profileBmi: 'Profil & BMI',
      trainingPlan: 'Menu Latihan',
      nutrition: 'Nutrisi',
      dailyProgress: 'Progres Harian',
      stravaHistory: 'Riwayat Strava',
      buildMenuCta: 'Susun Menu',
      languageGroupLabel: 'Pilih bahasa',
      idButton: 'ID',
      enButton: 'EN',
    },
    sidebar: {
      ariaLabel: 'Menu fitur PaceCraft',
      openMenuAria: 'Buka menu samping',
      closeMenuAria: 'Tutup menu samping',
      workspaceCaption: 'Asisten Latihan Lari',
      items: {
        overview: { label: 'Beranda', hint: 'Fokus hari ini & ringkasan' },
        training: { label: 'Menu Latihan', hint: 'Jadwal & kalkulator pace' },
        progress: { label: 'Progres & Kalender', hint: 'Catat lari & kalender bulan' },
        profile: { label: 'Profil & Alat', hint: 'BMI, HR, sepatu & akun' },
        nutrition: { label: 'Nutrisi', hint: 'Makan & minum harian' },
        strava: { label: 'Riwayat Strava', hint: 'Impor CSV/GPX & grafik' },
      },
    },
    overview: {
      greetingTitle: 'Siap lari hari ini? Mulai dengan langkah yang nyaman.',
      greetingSubtitle:
        'Semua alat latihan Anda tersusun rapi. Fokus cukup pada sesi hari ini dulu.',
      quickPlanBtn: 'Atur Menu Latihan',
      quickLogBtn: 'Catat Lari Hari Ini',
      todaySectionLabel: 'Fokus Latihan Hari Ini',
      todayDoneBadge: 'Sudah Dicatat',
      todayRestDesc:
        'Hari ini jadwal istirahat agar otot pulih. Jalan santai atau peregangan ringan sudah cukup.',
      todayQuickLogBtn: 'Tandai Selesai',
      todayViewProgressBtn: 'Lihat di Progres',
      todayViewPlanBtn: 'Lihat Jadwal Lengkap',
      cards: {
        trainingTitle: 'Menu Mingguan',
        trainingAction: 'Buka Jadwal',
        progressTitle: 'Progres Pekan Ini',
        progressAction: 'Catat / Kalender',
        profileTitle: 'Tubuh, Jantung & Sepatu',
        profileAction: 'Buka Profil',
        nutritionTitle: 'Panduan Makan & Minum',
        nutritionAction: 'Lihat Panduan',
      },
      stravaEmptyBanner:
        'Baru mulai memakai PaceCraft? Muat data lari contoh agar jadwal dan pace langsung terisi otomatis.',
      stravaLoadSampleShort: 'Coba Data Contoh',
    },
    hero: {
      eyebrow: 'Perencana Lari 5K · 10K · 21K · 42K',
      title:
        'Rencanakan menu lari yang aman untuk tubuh Anda dan pantau progresnya setiap hari.',
      subtitle:
        'PaceCraft memadukan perhitungan BMI, target lomba, dan riwayat lari Strava Anda (lewat impor CSV/GPX gratis maupun OAuth) menjadi jadwal latihan mingguan yang ramah persendian.',
      loadSampleBtn: 'Muat Data Contoh Strava',
      logTodayBtn: 'Catat Progres Hari Ini',
      raceTargetLabel: 'Target Lomba',
      daysPerWeekUnit: 'hari / minggu',
      currentBmiLabel: 'BMI Saat Ini',
      categoryPrefix: 'Kategori',
      weeklyVolumeLabel: 'Volume Mingguan',
      progressBarAria: 'Progres volume mingguan tercatat',
      sessionsUnit: 'sesi',
      baselinePaceLabel: 'Pace Dasar',
      stravaSessionsUnit: 'sesi Strava',
      defaultBaselineHint: 'Acuan awal bawaan',
    },
    countdown: {
      badgeLabel: 'Hitung Mundur Lomba',
      untilPrefix: 'Menuju',
      daysLeftUnit: 'hari lagi',
      todayLabel: 'Hari Ini!',
      passedDaysSuffix: 'hari lalu',
      weeksDaysFormat: (weeks, days) =>
        days > 0 ? `${weeks} mgg ${days} hr` : `${weeks} minggu`,
      dateInputLabel: 'Tanggal Event',
      dateInputAria: 'Pilih tanggal target event lari',
      nameInputLabel: 'Nama Event',
      nameInputPlaceholder: 'Misal: Jakarta Marathon',
      nameInputAria: 'Masukkan nama event lari pilihan Anda',
      resetDateBtn: 'Reset',
      editEventBtn: 'Atur Event',
      doneEditBtn: 'Selesai',
    },
    bmi: {
      heading: 'Profil & Pengaturan Pelari',
      subtitle:
        'Atur data tubuh, zona detak jantung, kilometer sepatu, dan cadangan data Anda dari satu tempat yang rapi.',
      methodLabel: 'Cara Hitung',
      weightHeightBtn: 'Berat & Tinggi',
      directBmiBtn: 'BMI Langsung',
      weightLabel: 'Berat Badan (kg)',
      weightHint: 'Rentang 30 – 200 kg',
      heightLabel: 'Tinggi Badan (cm)',
      heightHint: 'Rentang 120 – 230 cm',
      directBmiLabel: 'Nilai BMI Langsung',
      ageLabel: 'Usia (tahun)',
      injuryLabel: 'Kondisi Tubuh / Cedera',
      injuryOptions: {
        none: 'Bugar (Tidak ada cedera)',
        recovering: 'Pemulihan ringan',
        active: 'Nyeri sendi / cedera aktif',
      },
      resultLabel: 'Hasil BMI Anda',
      categoryPrefix: 'Kategori',
      maxIncreaseLabel: 'Batas Naik Jarak/Mgg',
      maxPrefix: 'Maks',
      extraEasyLabel: 'Porsi Lari Santai Tambahan',
      hrSectionTitle: 'Zona Detak Jantung (HR) & Perkiraan Kebugaran (VO2max)',
      hrSectionSubtitle:
        'Panduan batas detak jantung agar lari santai tidak kelelahan dan sesi cepat tetap efektif.',
      restingHrLabel: 'Detak Jantung Istirahat (bpm)',
      restingHrHint: 'Cek pagi saat baru bangun (35–110 bpm)',
      maxHrLabel: 'Detak Jantung Maksimal (opsional)',
      maxHrPlaceholder: 'Otomatis',
      maxHrAutoHint: (autoVal) => `Perkiraan otomatis sesuai usia: ${autoVal} bpm`,
      vo2MaxLabel: 'Perkiraan VO2max',
      vo2MaxUnit: 'ml/kg/mnt',
      avgObservedHrLabel: 'Rata-rata HR Lari Anda',
      noObservedHrYet: 'Catat HR di Progres atau impor Strava untuk melihat rata-rata',
      hrZonesTitle: '5 Zona Detak Jantung Latihan Anda',
      tabsAriaLabel: 'Kategori pengaturan profil',
      tabs: {
        body: 'Tubuh & BMI',
        hr: 'Detak Jantung & VO2',
        shoes: 'Sepatu Lari',
        account: 'Backup & Akun',
        admin: 'Admin Pemilik',
      },
      helperTip:
        'Nilai BMI membantu PaceCraft mengatur porsi Easy Run lebih banyak bila sendi butuh perlindungan ekstra.',
    },
    training: {
      heading: 'Kalkulator Menu Latihan Ideal',
      subtitlePrefix: 'Menyesuaikan target lomba dengan rata-rata volume 4 minggu (',
      weekUnit: 'km/mgg',
      subtitleMiddle: ') dan pace dasar',
      defaultBaselineTag: ' (acuan awal bawaan)',
      stravaBaselineTag: ' (dari riwayat Strava)',
      step1Title: '1. Pilih Target Jarak Lomba',
      raceGroupAria: 'Target jarak lomba',
      step2Title: '2. Frekuensi Latihan per Minggu',
      freqGroupAria: 'Frekuensi hari latihan per minggu',
      daysPerWeekShort: 'hari/mgg',
      totalPlannedLabel: 'Total rencana minggu ini:',
      paceZonesHeading: 'Zona Pace Latihan Anda',
      progressionHeading: 'Progresi Volume 4 Minggu',
      progressionDescPrefix: 'Kenaikan bertahap maksimal',
      progressionDescSuffix:
        'per minggu, disertai pekan pemulihan (cutback -20%) di minggu ke-4.',
      scheduleHeadingPrefix: 'Jadwal Menu Mingguan',
      activeDaysUnit: 'hari aktif',
      restLabel: 'Pemulihan',
      loggedBtn: 'Tercatat',
      logCompleteBtn: 'Catat Selesai',
      taperNoticeTitle: 'Penyesuaian Otomatis Fase Tapering',
      taperNoticeBody: (days, reductionPct, eventLabel) =>
        `Sisa ${days} hari menuju ${eventLabel}. Volume minggu ini otomatis diturunkan ${reductionPct}% agar otot pulih dan segar di garis start.`,
      raceWeekNoticeTitle: 'Penyesuaian Otomatis Pekan Lomba',
      raceWeekNoticeBody: (days, eventLabel) =>
        `Tinggal ${days} hari menuju ${eventLabel}. Seluruh sesi diubah menjadi lari ringan (shakeout) bervolume rendah agar kaki siap maksimal.`,
      raceDayNoticeTitle: 'Hari Lomba Telah Tiba!',
      raceDayNoticeBody: (eventLabel) =>
        `Hari ini jadwal perlombaan ${eventLabel}. Lakukan pemanasan santai, jaga ritme awal, dan utamakan pemulihan setelah finis.`,
      strengthHeaderTag: (count) =>
        count > 0 ? `· ${count}x Strength Training` : '',
      strengthBadgePrefix: 'Strength Training',
      minuteShort: 'mnt',
      viewScheduleTab: 'Jadwal Mingguan',
      viewZonesTab: 'Zona Pace & Progresi',
      customPaceBadge: 'Target Kalkulator Aktif',
      resetCustomPaceBtn: 'Pakai Acuan Strava',
      baselineVolumeChip: 'Acuan Volume',
      baselinePaceChip: 'Acuan Pace',
      strengthToggleShow: 'Lihat gerakan',
      strengthToggleHide: 'Sembunyikan gerakan',
      exportIcsBtn: 'Simpan ke Kalender HP (.ics)',
      exportedIcsNotice: 'File jadwal .ics berhasil diunduh. Buka file tersebut untuk menyimpan ke Google Calendar atau Apple Calendar lengkap dengan pengingat.',
      zoneLabels: {
        easy: 'Santai (Easy)',
        tempo: 'Tempo',
        interval: 'Interval Cepat',
        long_run: 'Lari Jauh (Long Run)',
        rest: 'Istirahat',
      },
    },
    nutrition: {
      headingPrefix: 'Rekomendasi Nutrisi & Pemulihan',
      subtitleBeforeWeight:
        'Kebutuhan karbohidrat, protein, dan hidrasi harian dihitung untuk berat badan',
      subtitleAfterWeight: 'agar glikogen dan jaringan otot pulih optimal.',
      carbsLabel: 'Karbohidrat Harian',
      carbsUnitNote: 'g/kg BB · Sumber energi utama',
      proteinLabel: 'Protein Pemulihan',
      proteinUnitNote: 'g/kg BB · Perbaikan otot',
      hydrationLabel: 'Hidrasi Harian',
      hydrationUnitNote: 'Air & elektrolit pengganti cairan keringat',
      strategyHeadingPrefix: 'Strategi Asupan Sesuai Profil BMI & Target',
      examplesLabel: 'Contoh:',
    },
    dailyProgress: {
      heading: 'Pelacakan Progres Harian',
      motivationDone:
        'Luar biasa! Seluruh target sesi minggu ini telah Anda tuntaskan dengan konsisten.',
      motivationStreak: (days) =>
        `Ritme Anda terjaga ${days} hari beruntun. Pertahankan langkah santai dan pemulihan cukup.`,
      motivationStarted:
        'Langkah awal yang baik! Satu sesi selesai membuat target lomba terasa semakin dekat.',
      motivationEmpty:
        'Mulai dari satu sesi ringan hari ini. Konsistensi kecil selalu mengalahkan latihan berat sesekali.',
      streakLabel: 'Streak Aktif',
      daysUnit: 'hari',
      thisWeekLabel: 'Pekan Ini',
      sessionsUnit: 'sesi',
      weeklyAchievementLabel: 'Capaian Mingguan',
      kmLoggedUnit: 'km tercatat',
      progressBarAria: 'Persentase penyelesaian menu latihan mingguan',
      dayAriaDone: ' (Selesai)',
      selectDayPrefix: 'Pilih hari',
      restShort: 'Rest',
      logSectionPrefix: 'Catat Progres',
      targetLabel: 'Target:',
      actualDistanceLabel: 'Jarak Aktual (km)',
      comfortLabel: 'Rasa Nyaman',
      comfortGroupAria: 'Tingkat rasa nyaman sesi',
      comfortScoreAria: 'Skor kenyamanan',
      comfortRatings: {
        1: 'Berat',
        2: 'Cukup Lelah',
        3: 'Stabil',
        4: 'Nyaman',
        5: 'Sangat Segar',
      },
      noteLabel: 'Catatan Singkat (opsional)',
      notePlaceholder:
        'Misal: Napas lebih ringan, kaki terasa segar di km terakhir',
      saveBtn: 'Simpan Progres Hari Ini',
      savedFeedback: (dayName, title) =>
        `Progres ${dayName} (${title}) berhasil disimpan.`,
      savedLogsHeading: 'Catatan Progres Tersimpan',
      emptyLogsBeforeBtn: 'Belum ada sesi harian yang dicatat. Pilih hari dan tekan',
      emptyLogsBtnName: 'Simpan Progres Hari Ini',
      emptyLogsAfterBtn: 'untuk membangun streak Anda.',
      feelingPrefix: 'Rasa',
      deleteLogAria: 'Hapus catatan',
      quickLogDefaultNote: 'Diselesaikan sesuai menu mingguan',
      stravaSyncTitle: (count) =>
        `${count} sesi Strava terbaru siap disinkronkan ke Progres Harian`,
      stravaSyncDesc:
        'Otomatis mencocokkan jarak lari dari riwayat Strava Anda ke hari yang sesuai tanpa menimpa catatan manual.',
      stravaSyncBtn: (count) => `Sinkronkan dari Strava (${count} sesi)`,
      stravaSyncSuccess: (count) =>
        `${count} sesi Strava berhasil dicatat ke Progres Harian Anda.`,
      stravaSyncedTag: 'Sinkronisasi Strava',
      paceInputLabel: 'Catatan Pace (mnt:dtk/km)',
      paceInputPlaceholder: 'Misal: 06:15',
      hrInputLabel: 'Detak Jantung (bpm, opsional)',
      hrInputPlaceholder: 'Misal: 148',
      avgPaceLabel: 'Rata-rata Pace',
      avgHrLabel: 'Rata-rata HR',
      shareBtn: 'Bagikan Progres',
      optionalDetailsShow: 'Tambah pace, detak jantung & catatan (opsional)',
      optionalDetailsHide: 'Sembunyikan detail tambahan',
      jumpToCalendarBtn: 'Lihat Kalender Bulanan',
      shareModal: {
        title: 'Bagikan Ringkasan Progres',
        subtitle:
          'Salin teks pencapaian atau unduh kartu gambar siap unggah ke media sosial Anda.',
        closeAria: 'Tutup jendela bagikan progres',
        cardBadge: 'Ringkasan Latihan Mingguan',
        streakMetric: 'Streak Aktif',
        sessionsMetric: 'Sesi Pekan Ini',
        distanceMetric: 'Total Jarak',
        paceMetric: 'Pace Rata-rata',
        hrMetric: 'Rata-rata HR',
        vo2Metric: 'Estimasi VO2max',
        copyTextBtn: 'Salin Teks Ringkasan',
        copiedTextBtn: 'Teks Tersalin!',
        downloadPngBtn: 'Unduh Kartu PNG',
        nativeShareBtn: 'Bagikan Langsung',
        captionHeader: (eventLabel) =>
          `Progres lari minggu ini menuju ${eventLabel} bersama PaceCraft:`,
        captionFooter: 'Konsistensi kecil setiap hari membangun hasil besar di garis finis!',
        formatLabel: 'Format Kartu:',
        formatSquare: 'Feed (1:1)',
        formatStory: 'IG Story (9:16)',
        storyWatermark: 'pacecraft.app · Menu & Progres Lari',
      },
    },
    strava: {
      heading: 'Ringkasan & Riwayat Aktivitas Strava',
      subtitle:
        'Otomatis menyaring aktivitas non-lari dan menghitung baseline 4 minggu untuk menu latihan Anda.',
      importSourceHeading: 'Sumber Data Riwayat Lari Strava',
      importSourceDescBeforeCsv: 'Unggah ekspor',
      importSourceDescMiddle: 'atau multi-file',
      importSourceDescAfterGpx:
        'langsung di browser secara gratis, muat data contoh, atau hubungkan Strava API.',
      fileInputAria: 'Pilih file CSV atau GPX Strava',
      importBtn: 'Impor CSV / GPX',
      loadSampleBtn: 'Muat Data Contoh',
      resyncStravaBtn: 'Sinkronkan Ulang Strava',
      connectingStravaBtn: 'Menghubungkan...',
      oauthBtn: 'OAuth Strava API',
      clearDataBtn: 'Hapus Data',
      clearDataAria: 'Hapus atau putuskan data aktivitas',
      oauthMissingCreds:
        'Kredensial OAuth Strava API belum diatur. Gunakan tombol Impor CSV / GPX gratis di samping.',
      oauthPopupBlocked:
        'Popup diblokir browser. Izinkan popup untuk menyambungkan Strava.',
      oauthCanceled: 'Otorisasi Strava dibatalkan.',
      oauthEndpointError:
        'Gagal menghubungi endpoint Strava OAuth. Silakan gunakan Impor CSV / GPX lokal.',
      kpi4WeekTitle: 'Rata-rata 4 Minggu',
      kpi4WeekSub: 'Acuan volume awal menu',
      kpiPerWeekUnit: 'km/mgg',
      kpi30DayTitle: 'Total 30 Hari',
      kpi30DaySub: 'sesi lari tercatat',
      kpiPaceTitle: 'Pace Rata-rata 30 Hari',
      kpiPaceSub: 'Basis zona Easy–Interval',
      kpiLongestTitle: 'Lari Terjauh',
      kpiLongestSubPrefix: 'Total',
      kpiLongestSubSuffix: 'riwayat',
      barChartTitle: 'Tren Volume Lari 8 Minggu',
      barChartDescBefore: 'Garis putus menunjukkan rata-rata 4 minggu terakhir (',
      barChartDescUnit: 'km/minggu',
      barChartWeekPrefix: 'Pekan',
      barChartSessionsUnit: 'sesi',
      areaChartTitle: 'Grafik Area Konsistensi 8 Minggu',
      areaChartDesc:
        'Kurva tren jarak mingguan untuk memantau ritme latihan Anda.',
      areaChartActiveWeeks: (active) => `${active}/8 minggu aktif`,
      areaChartTooltipSessions: 'sesi lari',
      areaChartSeriesName: 'Jarak Mingguan',
      chartAreaTab: 'Grafik Area',
      chartBarTab: 'Grafik Batang',
      filterGroupAria: 'Filter tipe lari',
      filters: {
        all: 'Semua',
        Run: 'Jalan Raya',
        TrailRun: 'Trail',
        VirtualRun: 'Virtual',
      },
      searchPlaceholder: 'Cari nama sesi lari...',
      searchAria: 'Cari nama sesi lari',
      resetFilterBtn: 'Reset Filter',
      emptyRunsTitle: 'Belum Ada Riwayat Aktivitas Lari',
      emptyRunsDescBefore:
        'Muat dataset contoh untuk melihat cara kerja PaceCraft, atau unggah file',
      emptyRunsDescMiddle: '/',
      emptyRunsDescAfter: 'dari Strava Anda.',
      emptyFilterDesc:
        'Tidak ada sesi lari yang sesuai dengan filter atau kata kunci Anda.',
      cardViewAria: 'Lihat detail rute',
      cardDistance: 'Jarak',
      cardPace: 'Pace',
      cardTime: 'Waktu',
      noGpsRoute: 'Tanpa rute GPS',
      routePreviewAria: 'Pratinjau rute',
      sampleLoadedNotice:
        '8 sesi lari contoh PaceCraft berhasil dimuat. Baseline volume & pace Anda kini terhitung otomatis.',
      importNotice: (count, sourceLabel, skippedNonRuns) => {
        const skippedMsg =
          skippedNonRuns > 0
            ? ` · ${skippedNonRuns} aktivitas non-lari (bersepeda/renang/jalan) dilewati otomatis.`
            : '.';
        return `${count} sesi lari dari ${sourceLabel} berhasil diimpor${skippedMsg}`;
      },
      oauthSyncedNotice: (count) =>
        `${count} sesi lari berhasil disinkronkan dari akun Strava Anda.`,
      clearedRunsNotice:
        'Seluruh riwayat aktivitas lari telah dihapus dari browser.',
      csvAndGpxLabel: 'CSV & GPX',
      csvStravaLabel: 'CSV Strava',
      gpxFileLabel: 'File GPX',
      syncToProgressBtn: (count) => `Terapkan ke Progres Harian (${count} sesi)`,
      syncToProgressDone: 'Semua sesi terbaru sudah tercatat di Progres Harian.',
      offlineFriendlyTip:
        'Gratis tanpa langganan Strava: cukup unggah file CSV/GPX ekspor Strava Anda atau coba dengan data contoh.',
      howToExportToggle: 'Cara unduh file CSV/GPX dari Strava',
      howToExportSteps: [
        'Buka Strava.com di browser, masuk ke menu Settings -> My Account.',
        'Pilih "Download or Delete Your Account" lalu klik "Request Your Archive".',
        'Setelah ZIP diterima lewat email, ekstrak lalu unggah file activities.csv atau file .gpx di sini.',
      ],
      advancedOAuthToggle: 'Opsi lanjutan: Hubungkan Strava API (bila tersedia)',
    },
    detailModal: {
      closeAria: 'Tutup detail aktivitas',
      startPoint: 'Titik Mulai',
      endPoint: 'Titik Selesai',
      distance: 'Jarak Tempuh',
      avgPace: 'Pace Rata-rata',
      movingTime: 'Waktu Bergerak',
      elapsedTime: 'Waktu Total',
      maxSpeed: 'Kecepatan Maks',
      elevationHr: 'Elevasi & HR',
      dataSourcePrefix: 'Sumber data:',
      sources: {
        sample: 'Dataset Contoh PaceCraft',
        csv: 'Impor CSV Strava',
        gpx: 'Impor GPX Lokal',
        strava_oauth: 'Strava OAuth API',
      },
      closeBtn: 'Tutup',
    },
    disconnectModal: {
      titleOAuth: 'Putuskan Koneksi & Hapus Riwayat?',
      titleLocal: 'Hapus Riwayat Aktivitas Lari?',
      closeAria: 'Tutup dialog konfirmasi',
      bodyBeforeCount: 'Tindakan ini akan menghapus',
      bodyMiddleLocal: 'aktivitas lari dari penyimpanan browser Anda',
      bodyOAuthAddon: ' serta memutus sesi otorisasi Strava.',
      bodyAfter:
        ' Menu latihan Anda akan kembali memakai baseline bawaan hingga Anda mengimpor data baru.',
      cancelBtn: 'Batal',
      confirmBtn: 'Hapus Data Aktivitas',
    },
    footer: {
      left: 'PaceCraft — Kalkulator Menu Latihan Lari & Sinkronisasi Strava',
      right: 'Seluruh impor CSV & GPX diproses langsung di browser Anda.',
    },
    auth: {
      loadingText: 'Menyiapkan akun PaceCraft Anda...',
      loginEyebrow: 'Ruang Latihan Lari Pribadi',
      loginTitle: 'Satu akun khusus untuk setiap langkah dan progres lari Anda.',
      loginSubtitle:
        'Masuk dengan Akun Google agar profil BMI, zona detak jantung, jadwal lomba, log harian, dan riwayat Strava tersimpan aman terpisah per pelari.',
      feature1Title: 'Menu & Zona Pribadi',
      feature1Desc:
        'Target 5K hingga Marathon disesuaikan dengan BMI, VO2max, dan jadwal strength training Anda.',
      feature2Title: 'Log Harian & Streak Tersimpan',
      feature2Desc:
        'Catatan pace, HR, dan progres mingguan tetap utuh saat berganti perangkat atau browser.',
      feature3Title: 'Riwayat Strava Terisolasi',
      feature3Desc:
        'Impor CSV atau GPX Strava langsung terkalibrasi ke baseline lari pribadi Anda sendiri.',
      cardTitle: 'Masuk ke PaceCraft',
      cardSubtitle:
        'Gunakan Akun Google Anda untuk membuka ruang kerja latihan pribadi.',
      licenseKeyLabel: 'License Key Pembeli (opsional sebelum masuk)',
      licenseKeyPlaceholder: 'Misal: PACE-LT-XXXX-XXXX-XXXX',
      licenseKeyHint:
        'Sudah menerima License Key? Masukkan di sini agar otomatis diaktifkan saat login Google berhasil.',
      googleBtn: 'Masuk dengan Google',
      signingInBtn: 'Menghubungkan Akun...',
      privacyNote:
        'Data latihan Anda terisolasi privat per akun dan tidak dapat diakses pengguna lain.',
      popupClosedError:
        'Jendela login Google ditutup sebelum selesai. Silakan coba lagi.',
      popupBlockedError:
        'Popup login diblokir oleh browser Anda. Izinkan popup untuk melanjutkan.',
      genericAuthError:
        'Gagal masuk dengan Akun Google. Periksa koneksi Anda lalu coba kembali.',
      accountLabel: 'Akun Aktif',
      signOutBtn: 'Keluar',
      signingOutBtn: 'Keluar...',
      syncReadyLabel: 'Tersinkron ke akun',
    },
    migration: {
      title: 'Data latihan lama ditemukan di browser ini',
      desc: (runsCount, progressCount) =>
        `Kami menemukan profil latihan (${runsCount} riwayat lari, ${progressCount} log progres) dari sesi lokal sebelumnya. Ingin memindahkannya ke akun Google Anda?`,
      importBtn: 'Impor Data Lokal ke Akun',
      importingBtn: 'Mengimpor ke Akun...',
      startFreshBtn: 'Mulai Profil Baru',
      importedNotice:
        'Data latihan lokal berhasil diimpor ke akun cloud Anda.',
    },
    privacyModal: {
      linkLabel: 'Privasi & Keamanan Data',
      title: 'Privasi & Keamanan Akun PaceCraft',
      subtitle:
        'Ringkasan bagaimana data latihan Anda disimpan dan dilindungi secara terpisah per akun.',
      closeAria: 'Tutup informasi privasi',
      items: [
        {
          title: '1. Isolasi Ketat per Akun Google & Proteksi App Check',
          body: 'Profil tubuh, target lomba, log progres harian, dan riwayat lari Anda hanya dapat dibaca dan diubah oleh UID akun Google Anda melalui aturan server Firestore, serta mendukung verifikasi Firebase App Check (reCAPTCHA v3) untuk mencegah akses bot otomatis.',
        },
        {
          title: '2. Tanpa Penyimpanan Email di Database',
          body: 'Alamat email Anda hanya dipakai oleh sesi autentikasi Google di browser untuk menampilkan identitas akun aktif dan tidak disalin ke dokumen database.',
        },
        {
          title: '3. Pemrosesan Lokal CSV/GPX & Pembersihan Sesi',
          body: 'File CSV maupun GPX Strava diurai langsung di browser sebelum ringkasan larinya disinkronkan ke akun Anda. Saat Anda menekan Keluar, sesi Strava OAuth browser ikut diputuskan.',
        },
        {
          title: '4. Kendali Penuh Menghapus Data',
          body: 'Anda dapat menghapus riwayat lari Strava atau menghapus seluruh data akun Anda dari cloud kapan saja melalui tab Profil & HR.',
        },
        {
          title: '5. Garansi Aktivasi & Bantuan Pembeli',
          body: 'Bila Anda mengalami kendala aktivasi License Key atau konfirmasi pembayaran QRIS, hubungi kami melalui email dukungan atau WhatsApp konfirmasi dengan menyertakan email Google akun Anda.',
        },
      ],
      closeBtn: 'Mengerti',
    },
    accountSecurity: {
      heading: 'Privasi & Manajemen Akun',
      subtitle:
        'Tinjau kebijakan privasi data Anda atau hapus seluruh data latihan yang tersimpan di akun cloud ini.',
      privacyBtn: 'Lihat Kebijakan Privasi',
      deleteBtn: 'Hapus Akun & Semua Data',
      modalTitle: 'Hapus Semua Data Akun Secara Permanen?',
      modalDesc:
        'Tindakan ini akan menghapus profil tubuh, target lomba, seluruh catatan progres harian, serta semua riwayat Strava Anda dari database cloud secara permanen dan mengeluarkan Anda dari sesi ini.',
      confirmKeyword: 'HAPUS',
      inputLabel: (keyword) => `Ketik ${keyword} untuk mengonfirmasi penghapusan:`,
      inputPlaceholder: 'HAPUS',
      cancelBtn: 'Batal',
      confirmDeleteBtn: 'Hapus Permanen',
      deletingBtn: 'Menghapus Data...',
      errorNotice:
        'Gagal menghapus sebagian data akun. Pastikan koneksi stabil lalu coba lagi.',
    },
    theme: {
      darkShort: 'Malam',
      lightShort: 'Terang',
      ariaToDark: 'Aktifkan mode gelap untuk kenyamanan malam hari',
      ariaToLight: 'Kembali ke mode terang',
    },
    paceCalculator: {
      heading: 'Kalkulator Pace & Zona Latihan',
      subtitle:
        'Konversikan target waktu finis 5K, 10K, 21K, atau 42K Anda menjadi acuan Race Pace serta zona Easy, Tempo, dan Interval secara otomatis.',
      distanceLabel: 'Pilih Jarak Target Lomba',
      hoursLabel: 'Jam',
      minutesLabel: 'Menit',
      secondsLabel: 'Detik',
      resetBtn: 'Reset Default',
      applyToPlanBtn: 'Terapkan ke Menu Latihan',
      appliedNotice: (race, pace) =>
        `Target ${race} dengan Race Pace ${pace} telah diterapkan ke jadwal latihan Anda.`,
      activeCustomBanner: (pace) =>
        `Menu latihan saat ini memakai Race Pace target Anda (${pace}).`,
      useStravaBaselineBtn: 'Gunakan Baseline Strava',
      racePaceLabel: 'Target Race Pace',
      speedLabel: 'Kecepatan Rata-rata',
      easyTitle: 'Easy Pace',
      easyNote: 'Pemulihan & fondasi aerobik (+45 s/d +75 dtk/km)',
      tempoTitle: 'Tempo Pace',
      tempoNote: 'Ambang laktat & ketahanan ritme lomba',
      intervalTitle: 'Interval Pace',
      intervalNote: 'VO2 max & peningkatan kecepatan puncak',
    },
    shoeTracker: {
      heading: 'Pelacak Jarak Sepatu Lari (Shoe Mileage Tracker)',
      subtitle:
        'Pantau usia pakai bantalan sepatu lari utama Anda (ideal 600–800 km) guna mengurangi risiko cedera lutut dan pergelangan kaki.',
      nameLabel: 'Nama / Model Sepatu Utama',
      namePlaceholder: 'Misal: Pegasus 41 / Novablast 4',
      currentKmLabel: 'Jarak Terpakai (km)',
      maxKmLabel: 'Batas Pakai Ideal (km)',
      maxKmHint: 'Rentang rekomendasi 200 – 2.000 km (standar 600–800 km)',
      usagePrefix: 'Terpakai',
      remainingPrefix: 'Sisa estimasi',
      syncLatestRunBtn: (kmLabel) => `+ Tambah Sesi Terakhir (${kmLabel} km)`,
      add5KmBtn: '+ 5 km',
      resetNewShoeBtn: 'Reset Sepatu Baru',
      healthyBadge: 'Bantalan Masih Prima',
      warningBadge: 'Mendekati Batas Pakai',
      replaceBadge: 'Waktunya Evaluasi / Ganti Sepatu',
      warningText:
        'Sepatu sudah melewati 80% batas pakai ideal. Perhatikan respons bantalan dan kenyamanan tumit Anda.',
      replaceText:
        'Jarak tempuh sepatu mencapai batas maksimal. Pertimbangkan rotasi sepatu baru untuk menjaga keamanan persendian.',
    },
    backup: {
      heading: 'Cadangan & Pemulihan Data (JSON)',
      subtitle:
        'Unduh seluruh data profil, target lomba, progres harian, sepatu, dan riwayat Strava Anda sebagai file JSON atau pulihkan kapan saja.',
      exportBtn: 'Ekspor Backup JSON',
      importBtn: 'Impor / Pulihkan JSON',
      exportDone: 'File cadangan JSON berhasil diunduh ke perangkat Anda.',
      restoreSuccess: (runsCount, progressCount) =>
        `Pemulihan berhasil: profil, ${progressCount} catatan progres, dan ${runsCount} aktivitas lari disinkronkan ke cloud.`,
      restoreInvalidError:
        'Format file JSON tidak dikenali atau rusak. Pastikan Anda memilih file backup resmi PaceCraft.',
    },
    disclaimer: {
      text: 'Program latihan dan rekomendasi nutrisi di PaceCraft bersifat panduan umum dan bukan pengganti saran medis profesional.',
    },
    accessGate: {
      badge: 'Akses Pembeli Terverifikasi',
      title: 'Aktifkan ruang latihan pribadi PaceCraft Anda.',
      subtitle:
        'Akun Google Anda sudah terhubung. Selesaikan pembayaran atau masukkan kode akses pembeli untuk membuka kalkulator menu latihan, sinkronisasi Strava, dan penyimpanan cloud pribadi.',
      signedInAs: 'Masuk sebagai',
      refreshBtn: 'Periksa Status Akses',
      checkingText: 'Memeriksa status akses pembeli Anda...',
      checkoutCardTitle: '1. Pembayaran Instan / Checkout',
      checkoutCardDesc:
        'Bayar melalui halaman checkout resmi agar akses akun Anda aktif otomatis.',
      checkoutBtn: 'Lanjutkan ke Pembayaran',
      checkoutOpeningBtn: 'Membuka Pembayaran...',
      checkoutNotConfigured:
        'Gateway checkout otomatis belum diaktifkan pada deployment ini. Gunakan kode lisensi atau konfirmasi manual di samping.',
      codeCardTitle: '2. Punya Kode Akses / Lisensi Pembeli?',
      codeCardDesc:
        'Masukkan kode akses resmi dari bukti pembelian atau email konfirmasi Anda.',
      codeLabel: 'Kode Lisensi / Akses Pembeli',
      codePlaceholder: 'Misal: PACE-LT-XXXX-XXXX-XXXX',
      verifyCodeBtn: 'Verifikasi & Buka Akses',
      verifyingBtn: 'Memverifikasi...',
      invalidCodeError:
        'Kode lisensi tidak valid atau sudah kedaluwarsa. Periksa kembali atau kirim konfirmasi pembayaran manual.',
      alreadyUsedCodeError:
        'License key ini tidak ditemukan, sudah dipakai akun lain, atau telah dicabut.',
      manualCardTitle: '3. Konfirmasi Pembayaran Manual (Transfer / QRIS)',
      manualCardDesc:
        'Sudah melakukan pembayaran manual? Kirim nomor referensi transaksi agar pemilik dapat mengaktifkan akses akun Anda.',
      planLabel: 'Paket Dipilih',
      planLifetime: 'Akses Penuh (Lifetime)',
      planPro: 'Paket Pro Pelari',
      orderRefLabel: 'Nomor Referensi / Bukti Transfer',
      orderRefPlaceholder: 'Misal: INV-20261121-001 / QRIS-8821',
      noteLabel: 'Catatan Singkat (opsional)',
      notePlaceholder: 'Misal: Transfer BCA a.n. Budi pukul 09.15',
      submitManualBtn: 'Kirim Konfirmasi Pembayaran',
      submittingManualBtn: 'Mengirim Konfirmasi...',
      pendingTitle: 'Konfirmasi Pembayaran Sedang Ditinjau',
      pendingDesc: (orderRef) =>
        `Pengajuan referensi ${orderRef} sudah tercatat di database. Halaman akan terbuka otomatis begitu akses diaktifkan.`,
      revokedTitle: 'Akses Akun Sedang Dinonaktifkan',
      revokedDesc:
        'Status akses untuk akun ini sedang ditangguhkan. Anda dapat menghubungi admin atau mengirim referensi pembayaran baru.',
      stripeReturnedChecking:
        'Memverifikasi status pembayaran checkout Anda...',
      stripeCanceledNotice:
        'Pembayaran checkout dibatalkan. Anda dapat mencoba kembali kapan saja.',
      planChooseLabel: '1. Pilih Paket Akses PaceCraft',
      qrisSectionTitle: '2. Transfer via QRIS / Rekening',
      qrisSectionDesc:
        'Scan QRIS di bawah sesuai nominal paket, lalu klik tombol WhatsApp agar pesan email Google dan paket Anda otomatis terisi.',
      qrisScanHint: 'Scan menggunakan GoPay, OVO, DANA, ShopeePay, atau Mobile Banking',
      qrisNotConfiguredNote:
        'Gambar QRIS merchant belum diisi di konfigurasi server (NEXT_PUBLIC_QRIS_IMAGE_URL). Gunakan info rekening di bawah atau hubungi Admin via WhatsApp.',
      bankSectionLabel: 'Alternatif Transfer Bank:',
      whatsappBtn: 'Bayar & Kirim Bukti via WhatsApp',
      whatsappMissingNote:
        'Nomor WhatsApp Admin (NEXT_PUBLIC_SELLER_WHATSAPP) belum diisi. Silakan isi referensi transfer di form konfirmasi manual.',
      manualFormHeading: 'Sudah Transfer? Catat Referensi di Sini',
      manualFormDesc:
        'Setelah mengirim bukti ke WhatsApp atau mencatat kode transaksi, kirim referensi agar akses Anda tercatat rapi di sistem.',
      gatewayTitle: 'Atau Pembayaran Otomatis (Payment Gateway)',
      gatewayDesc:
        'Jika deployment Anda terhubung ke Midtrans / Mayar / Xendit / Stripe, klik tombol ini untuk aktivasi instan otomatis.',
    },
    adminAccess: {
      heading: 'Panel Pemilik: Konfirmasi Akses & License Key Sekali Pakai',
      subtitle:
        'Buat License Key unik di koleksi access-codes (otomatis hangus setelah dipakai 1 akun Google) atau setujui konfirmasi QRIS secara real-time.',
      planLabel: 'Jenis Paket',
      planLifetime: 'Lifetime',
      planPro: 'Pro Pelari',
      customCodeLabel: 'Kode Kustom (opsional, kosongkan agar otomatis)',
      customCodePlaceholder: 'Misal: VIP-JAKARTA-01',
      buyerNoteLabel: 'Nama / Catatan Pembeli QRIS (opsional)',
      buyerNotePlaceholder: 'Misal: Budi - QRIS 21 Nov',
      generateCodeBtn: 'Buat License Key 1x Pakai',
      generatingBtn: 'Menyimpan ke Firestore...',
      generatedLabel: 'License Key Unik Siap Kirim (1x Pakai):',
      singleUseHint:
        'Tersimpan di access-codes sebagai "unused" dan langsung berubah menjadi "used" saat pembeli pertama kali masuk.',
      generateError:
        'Gagal menyimpan license key ke Firestore. Periksa format kode (min. 8 karakter huruf/angka/-) dan koneksi Anda.',
      copyCodeBtn: 'Salin Kode',
      copiedBtn: 'Tersalin!',
      licenseListTitle: 'Daftar License Key (access-codes)',
      licenseEmptyList: 'Belum ada License Key yang dibuat.',
      revokeLicenseBtn: 'Cabut Kode',
      licenseStatusLabels: {
        unused: 'Belum Dipakai',
        used: 'Sudah Dipakai',
        revoked: 'Dicabut',
      },
      emptyList: 'Belum ada permintaan konfirmasi manual dari pembeli.',
      approveBtn: 'Aktifkan Akses',
      revokeBtn: 'Nonaktifkan',
      statusLabels: {
        pending: 'Menunggu Verifikasi',
        active: 'Aktif',
        revoked: 'Dinonaktifkan',
      },
    },
    monthlyCalendar: {
      heading: 'Kalender Intensitas Latihan Bulanan',
      subtitle:
        'Gabungan catatan progres harian dan riwayat lari Strava Anda. Ketuk tanggal mana saja untuk meninjau detail sesi.',
      prevMonthAria: 'Lihat bulan sebelumnya',
      nextMonthAria: 'Lihat bulan berikutnya',
      thisMonthBtn: 'Bulan Ini',
      activeDaysLabel: 'Hari Aktif',
      monthlyTotalKmLabel: 'Total Bulan Ini',
      highIntensityDaysLabel: 'Intensitas Tinggi / Puncak',
      avgPaceLabel: 'Rata-rata Pace',
      avgHrLabel: 'Rata-rata HR',
      daysUnit: 'hari',
      sessionsUnit: 'sesi',
      weekdayHeadersShort: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
      legendTitle: 'Skala Intensitas:',
      intensityLabels: {
        rest: 'Istirahat',
        light: 'Ringan',
        moderate: 'Sedang',
        high: 'Tinggi',
        peak: 'Puncak',
      },
      intensityDescriptions: {
        rest: 'Hari pemulihan atau belum ada sesi lari tercatat',
        light: 'Sesi Easy / pemulihan singkat (< 6 km)',
        moderate: 'Sesi aerobik stabil (6–11,9 km) atau trail ringan',
        high: 'Tempo run, Long Run menengah (12–17,9 km), atau HR zona Z3–Z4',
        peak: 'Interval kecepatan, VO2max (Z5), atau Long Run ≥ 18 km',
      },
      todayTag: 'Hari Ini',
      restLoggedTag: 'Pemulihan Tercatat',
      dayCellAria: (fullDate, intensityLabel, kmText, sessionsCount) =>
        `${fullDate}, intensitas ${intensityLabel}, ${kmText} km, ${sessionsCount} sesi`,
      detailPanelHeading: 'Detail Sesi Tanggal Terpilih',
      selectedTotalLabel: 'Total Jarak',
      selectedDurationLabel: 'Durasi Gerak',
      emptyDayTitle: 'Belum ada aktivitas lari tercatat pada tanggal ini',
      emptyDayPlannedHint: (title, kmText) =>
        `Rencana menu hari tersebut: ${title} (${kmText} km).`,
      emptyDayRestHint:
        'Berdasarkan jadwal mingguan, hari ini adalah hari pemulihan/istirahat.',
      emptyDayDefaultHint:
        'Gunakan form check-in di atas untuk mencatat sesi atau impor riwayat Strava Anda.',
      logForWeekdayBtn: (dayName) => `Catat Sesi ${dayName}`,
      sourceLabels: {
        daily_log: 'Check-In Harian',
        strava_sample: 'Strava Contoh',
        strava_csv: 'Strava CSV',
        strava_gpx: 'Strava GPX',
        strava_oauth: 'Strava API',
      },
      metricDistance: 'Jarak',
      metricPace: 'Pace',
      metricDuration: 'Durasi',
      metricHr: 'HR Rata-rata',
      metricElevation: 'Elevasi',
      metricComfort: 'Nyaman',
    },
    landing: {
      navFeatures: 'Fitur',
      navDemo: 'Kalkulator Gratis',
      navPricing: 'Harga',
      navFaq: 'FAQ',
      navLoginBtn: 'Masuk / Aktivasi',
      heroBadge: 'Siap Lomba 5K · 10K · Half & Full Marathon',
      heroTitle: 'Susun Menu Latihan Lari Sesuai Tubuh Anda dalam 30 Detik.',
      heroSubtitle:
        'Kalkulator pace target lomba, jadwal mingguan berpengaman BMI, kalender intensitas bulanan, hingga impor Strava CSV/GPX gratis tanpa wajib berlangganan Strava berbayar.',
      heroDemoCta: 'Coba Kalkulator Pace',
      heroOpenDemoCta: 'Buka Demo Aplikasi',
      heroBuyCta: 'Lihat Harga & Paket',
      heroImageAlt: 'Pelari pagi di jalur lari berlatar cahaya matahari terbit',
      trust1: 'Impor Strava CSV/GPX Gratis',
      trust2: 'Bisa Dipakai di HP (PWA)',
      trust3: 'Data Terisolasi per Akun Google',
      showcaseHeading: 'Semua Alat Penting Pelari dalam Satu Ruang yang Rapi',
      showcaseSubtitle:
        'Dirancang agar pelari pemula hingga target Personal Best bisa berlatih konsisten tanpa menebak-nebak pace atau membebani lutut.',
      showcaseTryDemoBtn: 'Jelajahi Semua Fitur di Mode Demo',
      showcaseCards: [
        {
          badge: 'Menu Adaptif',
          title: 'Menu Latihan + Pengaman BMI & Tapering',
          desc: 'Atur jarak 5K–42K dan frekuensi 3–6 hari/minggu. Volume otomatis aman <=10% per minggu dan tapering menjelang hari lomba.',
          highlightLabel: 'Ekspor Kalender HP',
          highlightValue: 'Format .ics + pengingat 30 mnt',
        },
        {
          badge: 'Kalender Bulanan',
          title: 'Kalender Intensitas & Rekor Personal Best',
          desc: 'Pantau peta warna intensitas bulanan dari catatan harian maupun Strava, ketuk tanggal mana saja untuk detail sesi, dan simpan rekor PB 5K–42K.',
          highlightLabel: 'IG Story Ready',
          highlightValue: 'Unduh kartu progres 9:16 & 1:1',
        },
        {
          badge: 'Tanpa Langganan Strava',
          title: 'Impor CSV/GPX Strava Langsung di Browser',
          desc: 'Cukup unggah file activities.csv atau .gpx ekspor Strava Anda—langsung menyaring aktivitas non-lari dan menghitung pace dasar pribadi.',
          highlightLabel: 'Pelacak Sepatu',
          highlightValue: 'Peringatan ganti bantalan 600–800 km',
        },
      ],
      demoHeading: 'Coba Kalkulator Pace atau Buka Demo Aplikasi (Tanpa Login)',
      demoSubtitle:
        'Uji target waktu lomba Anda di bawah, atau buka versi Demo lengkap berisi data lari, jadwal mingguan, kalender intensitas, dan peta rute contoh tanpa perlu login.',
      demoOpenFullBtn: 'Buka Demo Aplikasi Lengkap',
      demoApplyCta: 'Masuk untuk Simpan Target & Buat Jadwal',
      demoAppliedHint:
        'Target pace Anda dicatat! Silakan masuk dengan Akun Google di atas untuk membangun jadwal mingguan lengkap.',
      pricingHeading: 'Harga Transparan, Tanpa Biaya Bulanan Mengikat',
      pricingSubtitle:
        'Bandingkan Paket Lifetime dan Paket Pro Tahunan. Aktivasi mudah lewat QRIS + WhatsApp atau License Key sekali pakai.',
      pricingSelectBtn: 'Pilih Paket Ini',
      pricingSelectedBtn: 'Paket Dipilih',
      comparisonTableHeading: 'Tabel Perbandingan Paket Lifetime vs Tahunan',
      comparisonFeatureHeader: 'Fitur & Akses',
      comparisonIncludedLabel: 'Termasuk',
      faqHeading: 'Pertanyaan yang Sering Diajukan',
      faqSubtitle: 'Jawaban singkat sebelum Anda memulai latihan bersama PaceCraft.',
      faqItems: [
        {
          q: 'Apakah wajib punya langganan Strava berbayar (Strava Subscription)?',
          a: 'Tidak wajib sama sekali. Anda bisa mengekspor file activities.csv atau .gpx dari akun Strava gratis dan langsung mengimpornya di browser tanpa biaya tambahan.',
        },
        {
          q: 'Apakah ini sekali bayar atau langganan bulanan?',
          a: 'Anda bisa memilih Paket Lifetime (bayar sekali Rp 149.000 untuk akses selamanya) atau Paket Pro Tahunan (Rp 99.000/tahun) tanpa tagihan bulanan otomatis.',
        },
        {
          q: 'Apakah bisa dipakai di HP seperti aplikasi?',
          a: 'Ya. PaceCraft mendukung mode PWA (Progressive Web App). Cukup klik "Pasang di Layar Utama" di Android Chrome atau Add to Home Screen di Safari iPhone.',
        },
        {
          q: 'Bagaimana cara mencoba Demo atau mengaktifkan akun lewat QRIS?',
          a: 'Klik "Buka Demo Aplikasi" untuk langsung menjelajah aplikasi dengan data contoh tanpa login. Jika siap membeli, masuk dengan Google, scan QRIS, lalu konfirmasi via WhatsApp untuk menerima License Key sekali pakai.',
        },
      ],
    },
    demoMode: {
      badge: 'Mode Demo Interaktif (Tanpa Login)',
      title: 'Anda sedang mencoba PaceCraft dengan data contoh pelari 21K.',
      subtitle:
        'Semua kalkulator, jadwal latihan, kalender intensitas, dan peta rute Strava aktif penuh di browser. Perubahan tidak disimpan ke server.',
      signInCta: 'Masuk & Aktifkan Akun',
      backHomeBtn: 'Kembali ke Halaman Depan',
      sidebarName: 'Pelari Demo',
      sidebarEmail: 'Mode Pratinjau Gratis',
      exitSidebarBtn: 'Keluar Mode Demo',
    },
    onboarding: {
      badge: 'Setup Cepat 30 Detik',
      stepOf: (step, total) => `Langkah ${step} dari ${total}`,
      titleStep1: 'Pilih Target Lomba & Jadwal Mingguan',
      subtitleStep1: 'Tentukan jarak lomba tujuan Anda dan berapa hari per minggu Anda nyaman berlari.',
      titleStep2: 'Sesuaikan Profil Tubuh & Target Pace',
      subtitleStep2: 'Data berat, tinggi, usia, dan kondisi sendi menjaga kenaikan volume tetap aman.',
      titleStep3: 'Menu Latihan Siap Dibangun!',
      subtitleStep3: 'Periksa ringkasan zona dan batas aman Anda sebelum masuk ke beranda latihan.',
      raceLabel: 'Target Jarak Lomba',
      freqLabel: 'Hari Latihan / Minggu',
      eventNameLabel: 'Nama Event Lomba (opsional)',
      eventNamePlaceholder: 'Misal: Jakarta Marathon / Borobudur 10K',
      eventDateLabel: 'Tanggal Lomba',
      targetTimeToggle: 'Punya target waktu finis tertentu? (opsional)',
      targetPacePreview: 'Estimasi Race Pace target:',
      previewSummaryHeading: 'Ringkasan Kalibrasi Awal Anda',
      previewBmiLabel: 'Batas Aman BMI',
      previewVolumeLabel: 'Volume Minggu Pertama',
      previewPaceLabel: 'Pace Dasar Latihan',
      nextBtn: 'Lanjutkan',
      backBtn: 'Kembali',
      submitBtn: 'Buat Menu Latihan Saya',
      skipBtn: 'Lewati, pakai pengaturan standar',
      reopenBtn: 'Ulangi Wizard Setup Cepat',
    },
    pwa: {
      installBtn: 'Pasang di Layar Utama',
      bannerTitle: 'Pasang PaceCraft di Layar Utama HP',
      bannerDesc: 'Buka jadwal lari & catat progres langsung dari homescreen layar penuh tanpa perlu unduh dari toko aplikasi.',
      guideTitle: 'Pasang Aplikasi di Layar Utama',
      iosSubtitle: 'Ikuti 3 langkah singkat ini di browser Safari iPhone/iPad:',
      androidSubtitle: 'Pasang lewat menu browser Chrome / Edge perangkat Anda:',
      iosStep1: '1. Ketuk tombol Bagikan (ikon kotak dengan panah ke atas) di bagian bawah Safari.',
      iosStep2: '2. Gulir ke bawah lalu pilih "Tambah ke Layar Utama" (Add to Home Screen).',
      iosStep3: '3. Ketuk "Tambah" di pojok kanan atas—ikon PaceCraft siap dibuka layar penuh.',
      androidStep1: '1. Ketuk ikon menu titik tiga (⋮) di pojok kanan atas browser Anda.',
      androidStep2: '2. Pilih "Tambahkan ke Layar Utama" atau "Instal Aplikasi" lalu konfirmasi.',
      offlineNotice: 'Anda sedang offline. Jadwal dan data tersimpan masih dapat dilihat, dan perubahan akan sinkron saat tersambung kembali.',
      closeAria: 'Tutup panduan pasang aplikasi',
      closeBtn: 'Mengerti',
    },
    personalBests: {
      heading: 'Rekam Jejak Personal Best (PB) Lomba',
      subtitle: 'Catat waktu terbaik pribadi Anda untuk jarak 5K hingga 42K, atau deteksi otomatis dari riwayat lari Strava Anda.',
      detectBtn: 'Deteksi dari Riwayat Strava',
      detectedNotice: (count) => `Berhasil mendeteksi ${count} rekor PB lebih cepat dari riwayat Strava Anda.`,
      noRunsDetectedNotice: 'Belum ditemukan aktivitas lari Strava di rentang jarak lomba (5K/10K/21K/42K) yang lebih cepat dari catatan saat ini.',
      clearBtn: 'Hapus',
      overviewLabel: 'Personal Best Tercatat',
      placeholder: 'mm:dd atau j:mm:dd',
      saveHint: 'Format waktu: mm:dd (contoh 24:30) atau j:mm:dd (contoh 1:52:10). Kosongkan untuk menghapus.',
      invalidHint: 'Format belum valid. Gunakan mm:dd atau j:mm:dd (minimal 10 menit).',
    },
  },
  en: {
    nav: {
      mainAriaLabel: 'Main navigation',
      mobileAriaLabel: 'Mobile quick navigation',
      profileBmi: 'Profile & BMI',
      trainingPlan: 'Training Plan',
      nutrition: 'Nutrition',
      dailyProgress: 'Daily Progress',
      stravaHistory: 'Strava History',
      buildMenuCta: 'Build Plan',
      languageGroupLabel: 'Select language',
      idButton: 'ID',
      enButton: 'EN',
    },
    sidebar: {
      ariaLabel: 'PaceCraft feature menu',
      openMenuAria: 'Open sidebar menu',
      closeMenuAria: 'Close sidebar menu',
      workspaceCaption: 'Friendly Running Assistant',
      items: {
        overview: { label: 'Home', hint: "Today's focus & summary" },
        training: { label: 'Training Plan', hint: 'Schedule & pace calculator' },
        progress: { label: 'Progress & Calendar', hint: 'Quick log & monthly view' },
        profile: { label: 'Profile & Tools', hint: 'BMI, HR, shoes & backup' },
        nutrition: { label: 'Nutrition', hint: 'Daily fueling & hydration' },
        strava: { label: 'Strava History', hint: 'CSV/GPX import & charts' },
      },
    },
    overview: {
      greetingTitle: 'Ready to run today? Take it one comfortable step at a time.',
      greetingSubtitle:
        'Everything is organized simply. Start with today’s workout below.',
      quickPlanBtn: 'Customize Plan',
      quickLogBtn: "Log Today's Run",
      todaySectionLabel: "Today's Focus",
      todayDoneBadge: 'Logged Today',
      todayRestDesc:
        'Today is a recovery day so your legs rebuild stronger. A light walk or gentle stretch is plenty.',
      todayQuickLogBtn: 'Mark Done',
      todayViewProgressBtn: 'View in Progress',
      todayViewPlanBtn: 'Full Weekly Plan',
      cards: {
        trainingTitle: 'Weekly Schedule',
        trainingAction: 'Open Schedule',
        progressTitle: 'This Week Progress',
        progressAction: 'Log / Calendar',
        profileTitle: 'Body, Heart Rate & Shoes',
        profileAction: 'Open Profile',
        nutritionTitle: 'Daily Fueling Guide',
        nutritionAction: 'View Guide',
      },
      stravaEmptyBanner:
        'New to PaceCraft? Load sample runs so your weekly schedule and paces calibrate automatically.',
      stravaLoadSampleShort: 'Try Sample Runs',
    },
    hero: {
      eyebrow: '5K · 10K · 21K · 42K Running Planner',
      title:
        'Plan safe, body-smart running workouts and track your progress every day.',
      subtitle:
        'PaceCraft combines BMI safeguards, race targets, and your Strava running history (via free CSV/GPX import or OAuth) into a joint-friendly weekly training schedule.',
      loadSampleBtn: 'Load Strava Sample Data',
      logTodayBtn: "Log Today's Progress",
      raceTargetLabel: 'Race Target',
      daysPerWeekUnit: 'days / week',
      currentBmiLabel: 'Current BMI',
      categoryPrefix: 'Category',
      weeklyVolumeLabel: 'Weekly Volume',
      progressBarAria: 'Logged weekly volume progress',
      sessionsUnit: 'sessions',
      baselinePaceLabel: 'Baseline Pace',
      stravaSessionsUnit: 'Strava runs',
      defaultBaselineHint: 'Default starting baseline',
    },
    countdown: {
      badgeLabel: 'Race Countdown',
      untilPrefix: 'Until',
      daysLeftUnit: 'days to go',
      todayLabel: 'Today!',
      passedDaysSuffix: 'days ago',
      weeksDaysFormat: (weeks, days) =>
        days > 0 ? `${weeks}w ${days}d` : `${weeks} weeks`,
      dateInputLabel: 'Event Date',
      dateInputAria: 'Choose target race event date',
      nameInputLabel: 'Event Name',
      nameInputPlaceholder: 'E.g., Jakarta Marathon',
      nameInputAria: 'Enter your target race event name',
      resetDateBtn: 'Reset',
      editEventBtn: 'Edit Event',
      doneEditBtn: 'Done',
    },
    bmi: {
      heading: 'Runner Profile & Tools',
      subtitle:
        'Manage your body metrics, heart-rate zones, running shoes, and data backups from one tidy space.',
      methodLabel: 'Calculation Method',
      weightHeightBtn: 'Weight & Height',
      directBmiBtn: 'Direct BMI',
      weightLabel: 'Weight (kg)',
      weightHint: 'Range 30 – 200 kg',
      heightLabel: 'Height (cm)',
      heightHint: 'Range 120 – 230 cm',
      directBmiLabel: 'Direct BMI Value',
      ageLabel: 'Age (years)',
      injuryLabel: 'Injury Status',
      injuryOptions: {
        none: 'Healthy (No injuries)',
        recovering: 'Mild recovery',
        active: 'Active injury / joint pain',
      },
      resultLabel: 'Your BMI Result',
      categoryPrefix: 'Category',
      maxIncreaseLabel: 'Max Weekly Increase',
      maxPrefix: 'Max',
      extraEasyLabel: 'Extra Easy Share',
      hrSectionTitle: 'Heart Rate Zones & VO2max Estimate',
      hrSectionSubtitle:
        'Clear heart-rate boundaries so your easy days stay genuinely relaxed and fast days hit the right effort.',
      restingHrLabel: 'Resting HR (bpm)',
      restingHrHint: 'Measure right after waking up (35–110 bpm)',
      maxHrLabel: 'Max HR (bpm, optional)',
      maxHrPlaceholder: 'Auto',
      maxHrAutoHint: (autoVal) => `Auto estimate for your age: ${autoVal} bpm`,
      vo2MaxLabel: 'Estimated VO2max',
      vo2MaxUnit: 'ml/kg/min',
      avgObservedHrLabel: 'Your Avg Run HR',
      noObservedHrYet: 'Log HR in Progress or import Strava to see your average',
      hrZonesTitle: 'Your 5 Heart Rate Training Zones',
      tabsAriaLabel: 'Profile tool categories',
      tabs: {
        body: 'Body & BMI',
        hr: 'Heart Rate & VO2',
        shoes: 'Running Shoes',
        account: 'Backup & Account',
        admin: 'Owner Admin',
      },
      helperTip:
        'Your BMI helps PaceCraft gently add more Easy Run recovery when joints benefit from extra cushioning.',
    },
    training: {
      heading: 'Ideal Training Plan Calculator',
      subtitlePrefix: 'Calibrates your race target to your 4-week average volume (',
      weekUnit: 'km/wk',
      subtitleMiddle: ') and baseline pace',
      defaultBaselineTag: ' (default baseline)',
      stravaBaselineTag: ' (from Strava history)',
      step1Title: '1. Choose Target Race Distance',
      raceGroupAria: 'Target race distance',
      step2Title: '2. Weekly Training Frequency',
      freqGroupAria: 'Weekly training days frequency',
      daysPerWeekShort: 'days/wk',
      totalPlannedLabel: 'Planned weekly total:',
      paceZonesHeading: 'Your Training Pace Zones',
      progressionHeading: '4-Week Volume Progression',
      progressionDescPrefix: 'Gradual progression capped at',
      progressionDescSuffix:
        'per week, with a mandatory recovery cutback (-20%) on week 4.',
      scheduleHeadingPrefix: 'Weekly Training Schedule',
      activeDaysUnit: 'active days',
      restLabel: 'Recovery',
      loggedBtn: 'Logged',
      logCompleteBtn: 'Mark Done',
      taperNoticeTitle: 'Automatic Tapering Adjustment',
      taperNoticeBody: (days, reductionPct, eventLabel) =>
        `${days} days left until ${eventLabel}. This week's volume is automatically trimmed by ${reductionPct}% so your legs arrive fresh at the start line.`,
      raceWeekNoticeTitle: 'Automatic Race Week Adjustment',
      raceWeekNoticeBody: (days, eventLabel) =>
        `Only ${days} days left until ${eventLabel}. Hard workouts are swapped for light shakeout runs at reduced volume.`,
      raceDayNoticeTitle: 'Race Day Has Arrived!',
      raceDayNoticeBody: (eventLabel) =>
        `Today is ${eventLabel}. Keep your warm-up relaxed, start at a calm rhythm, and prioritize post-race recovery.`,
      strengthHeaderTag: (count) =>
        count > 0 ? `· ${count}x Strength Training` : '',
      strengthBadgePrefix: 'Strength Training',
      minuteShort: 'min',
      viewScheduleTab: 'Weekly Schedule',
      viewZonesTab: 'Pace Zones & Progression',
      customPaceBadge: 'Calculator Pace Active',
      resetCustomPaceBtn: 'Use Strava Baseline',
      baselineVolumeChip: 'Baseline Volume',
      baselinePaceChip: 'Baseline Pace',
      strengthToggleShow: 'Show exercises',
      strengthToggleHide: 'Hide exercises',
      exportIcsBtn: 'Save to Phone Calendar (.ics)',
      exportedIcsNotice: 'Schedule .ics file downloaded. Open it to add this week’s workouts with 30-min reminders to Google or Apple Calendar.',
      zoneLabels: {
        easy: 'Easy Run',
        tempo: 'Tempo',
        interval: 'Speed Intervals',
        long_run: 'Long Run',
        rest: 'Rest',
      },
    },
    nutrition: {
      headingPrefix: 'Daily Nutrition & Recovery Guide',
      subtitleBeforeWeight:
        'Daily carbohydrate, protein, and hydration targets calculated for',
      subtitleAfterWeight:
        'so muscle glycogen and fibers recover smoothly.',
      carbsLabel: 'Daily Carbohydrates',
      carbsUnitNote: 'g/kg BW · Primary fuel source',
      proteinLabel: 'Recovery Protein',
      proteinUnitNote: 'g/kg BW · Muscle repair',
      hydrationLabel: 'Daily Hydration',
      hydrationUnitNote: 'Water & electrolytes to replace sweat loss',
      strategyHeadingPrefix: 'Fueling Strategy for Your BMI & Target',
      examplesLabel: 'Examples:',
    },
    dailyProgress: {
      heading: 'Daily Progress Tracker',
      motivationDone:
        'Outstanding! You have completed every planned running session for this week.',
      motivationStreak: (days) =>
        `Your rhythm is locked in for ${days} consecutive days. Keep your effort relaxed and recovery steady.`,
      motivationStarted:
        'Great start! Every finished session brings your race-day goal closer.',
      motivationEmpty:
        'Start with one gentle session today. Small consistency always beats occasional hard workouts.',
      streakLabel: 'Active Streak',
      daysUnit: 'days',
      thisWeekLabel: 'This Week',
      sessionsUnit: 'sessions',
      weeklyAchievementLabel: 'Weekly Completion',
      kmLoggedUnit: 'km logged',
      progressBarAria: 'Weekly training plan completion percentage',
      dayAriaDone: ' (Completed)',
      selectDayPrefix: 'Select day',
      restShort: 'Rest',
      logSectionPrefix: 'Log Progress',
      targetLabel: 'Target:',
      actualDistanceLabel: 'Actual Distance (km)',
      comfortLabel: 'Comfort Rating',
      comfortGroupAria: 'Session comfort rating',
      comfortScoreAria: 'Comfort score',
      comfortRatings: {
        1: 'Hard',
        2: 'Tired',
        3: 'Steady',
        4: 'Comfortable',
        5: 'Very Fresh',
      },
      noteLabel: 'Quick Note (optional)',
      notePlaceholder:
        'E.g., Easy breathing, legs felt light on the final kilometer',
      saveBtn: "Save Today's Progress",
      savedFeedback: (dayName, title) =>
        `Progress for ${dayName} (${title}) saved.`,
      savedLogsHeading: 'Saved Progress Logs',
      emptyLogsBeforeBtn: 'No daily sessions logged yet. Pick a day and click',
      emptyLogsBtnName: "Save Today's Progress",
      emptyLogsAfterBtn: 'to start building your streak.',
      feelingPrefix: 'Feel',
      deleteLogAria: 'Delete log',
      quickLogDefaultNote: 'Completed per weekly schedule',
      stravaSyncTitle: (count) =>
        `${count} recent Strava runs ready to sync into Daily Progress`,
      stravaSyncDesc:
        'Automatically maps matching run distances from your Strava history to the right weekday without overwriting manual entries.',
      stravaSyncBtn: (count) => `Sync from Strava (${count} runs)`,
      stravaSyncSuccess: (count) =>
        `${count} Strava runs have been logged into your Daily Progress.`,
      stravaSyncedTag: 'Strava Sync',
      paceInputLabel: 'Pace Log (min:sec/km)',
      paceInputPlaceholder: 'E.g., 06:15',
      hrInputLabel: 'Heart Rate (bpm, optional)',
      hrInputPlaceholder: 'E.g., 148',
      avgPaceLabel: 'Avg Pace',
      avgHrLabel: 'Avg HR',
      shareBtn: 'Share Progress',
      optionalDetailsShow: 'Add pace, heart rate & note (optional)',
      optionalDetailsHide: 'Hide extra details',
      jumpToCalendarBtn: 'View Monthly Calendar',
      shareModal: {
        title: 'Share Progress Summary',
        subtitle:
          'Copy your training caption or download a clean summary card for social media.',
        closeAria: 'Close share progress modal',
        cardBadge: 'Weekly Training Summary',
        streakMetric: 'Active Streak',
        sessionsMetric: 'This Week',
        distanceMetric: 'Total Distance',
        paceMetric: 'Avg Pace',
        hrMetric: 'Avg Heart Rate',
        vo2Metric: 'Est. VO2max',
        copyTextBtn: 'Copy Summary Text',
        copiedTextBtn: 'Copied!',
        downloadPngBtn: 'Download PNG Card',
        nativeShareBtn: 'Share Now',
        captionHeader: (eventLabel) =>
          `This week's running progress toward ${eventLabel} with PaceCraft:`,
        captionFooter: 'Small daily consistency builds big race-day confidence!',
        formatLabel: 'Card Format:',
        formatSquare: 'Feed (1:1)',
        formatStory: 'IG Story (9:16)',
        storyWatermark: 'pacecraft.app · Running Plan & Progress',
      },
    },
    strava: {
      heading: 'Strava Summary & Run History',
      subtitle:
        'Automatically filters out non-running activities and computes your 4-week baseline for training.',
      importSourceHeading: 'Strava Running Data Sources',
      importSourceDescBeforeCsv: 'Upload your exported',
      importSourceDescMiddle: 'or multiple',
      importSourceDescAfterGpx:
        'files directly in your browser for free, load sample runs, or connect Strava API.',
      fileInputAria: 'Choose Strava CSV or GPX files',
      importBtn: 'Import CSV / GPX',
      loadSampleBtn: 'Load Sample Data',
      resyncStravaBtn: 'Re-sync Strava',
      connectingStravaBtn: 'Connecting...',
      oauthBtn: 'Strava OAuth API',
      clearDataBtn: 'Clear Data',
      clearDataAria: 'Clear or disconnect activity data',
      oauthMissingCreds:
        'Strava OAuth API credentials are not configured. Use the free Import CSV / GPX button beside it.',
      oauthPopupBlocked:
        'Popup blocked by your browser. Allow popups to connect Strava.',
      oauthCanceled: 'Strava authorization was canceled.',
      oauthEndpointError:
        'Unable to reach Strava OAuth endpoint. Please use local CSV / GPX import instead.',
      kpi4WeekTitle: '4-Week Average',
      kpi4WeekSub: 'Starting plan baseline',
      kpiPerWeekUnit: 'km/wk',
      kpi30DayTitle: '30-Day Total',
      kpi30DaySub: 'running sessions logged',
      kpiPaceTitle: '30-Day Avg Pace',
      kpiPaceSub: 'Basis for Easy–Interval zones',
      kpiLongestTitle: 'Longest Run',
      kpiLongestSubPrefix: 'Total',
      kpiLongestSubSuffix: 'activities',
      barChartTitle: '8-Week Running Volume Trend',
      barChartDescBefore: 'Dashed line shows your last 4-week average (',
      barChartDescUnit: 'km/week',
      barChartWeekPrefix: 'Week of',
      barChartSessionsUnit: 'runs',
      areaChartTitle: '8-Week Consistency Area Chart',
      areaChartDesc:
        'Smooth weekly distance curve to track your training consistency.',
      areaChartActiveWeeks: (active) => `${active}/8 active weeks`,
      areaChartTooltipSessions: 'runs',
      areaChartSeriesName: 'Weekly Distance',
      chartAreaTab: 'Area Chart',
      chartBarTab: 'Bar Chart',
      filterGroupAria: 'Filter run type',
      filters: {
        all: 'All',
        Run: 'Road Run',
        TrailRun: 'Trail',
        VirtualRun: 'Virtual',
      },
      searchPlaceholder: 'Search run name...',
      searchAria: 'Search run name',
      resetFilterBtn: 'Reset Filters',
      emptyRunsTitle: 'No Running History Yet',
      emptyRunsDescBefore:
        'Load the sample dataset to explore PaceCraft, or upload your Strava',
      emptyRunsDescMiddle: '/',
      emptyRunsDescAfter: 'exports.',
      emptyFilterDesc:
        'No running sessions match your current filter or search query.',
      cardViewAria: 'View route details',
      cardDistance: 'Distance',
      cardPace: 'Pace',
      cardTime: 'Time',
      noGpsRoute: 'No GPS route',
      routePreviewAria: 'Route preview',
      sampleLoadedNotice:
        '8 sample PaceCraft runs loaded. Your baseline volume and pace are now calculated automatically.',
      importNotice: (count, sourceLabel, skippedNonRuns) => {
        const skippedMsg =
          skippedNonRuns > 0
            ? ` · ${skippedNonRuns} non-running activities (ride/swim/walk) skipped automatically.`
            : '.';
        return `${count} running sessions from ${sourceLabel} imported${skippedMsg}`;
      },
      oauthSyncedNotice: (count) =>
        `${count} running sessions synced from your Strava account.`,
      clearedRunsNotice:
        'All running activity history has been cleared from your browser.',
      csvAndGpxLabel: 'CSV & GPX',
      csvStravaLabel: 'Strava CSV',
      gpxFileLabel: 'GPX Files',
      syncToProgressBtn: (count) => `Apply to Daily Progress (${count} runs)`,
      syncToProgressDone: 'All recent runs are already logged in Daily Progress.',
      offlineFriendlyTip:
        'Free without a paid Strava subscription: upload your exported CSV/GPX file or try the sample runs right here.',
      howToExportToggle: 'How to export CSV/GPX from Strava',
      howToExportSteps: [
        'Open Strava.com in your browser and go to Settings -> My Account.',
        'Select "Download or Delete Your Account" and click "Request Your Archive".',
        'Unzip the archive from your email and upload activities.csv or .gpx files here.',
      ],
      advancedOAuthToggle: 'Advanced option: Connect Strava API (if configured)',
    },
    detailModal: {
      closeAria: 'Close activity details',
      startPoint: 'Start Point',
      endPoint: 'Finish Point',
      distance: 'Distance',
      avgPace: 'Average Pace',
      movingTime: 'Moving Time',
      elapsedTime: 'Elapsed Time',
      maxSpeed: 'Max Speed',
      elevationHr: 'Elevation & HR',
      dataSourcePrefix: 'Data source:',
      sources: {
        sample: 'PaceCraft Sample Dataset',
        csv: 'Strava CSV Import',
        gpx: 'Local GPX Import',
        strava_oauth: 'Strava OAuth API',
      },
      closeBtn: 'Close',
    },
    disconnectModal: {
      titleOAuth: 'Disconnect & Clear History?',
      titleLocal: 'Clear Running Activity History?',
      closeAria: 'Close confirmation dialog',
      bodyBeforeCount: 'This will remove',
      bodyMiddleLocal: 'running activities from your browser storage',
      bodyOAuthAddon: ' and disconnect your Strava authorization session.',
      bodyAfter:
        ' Your training plan will revert to the default baseline until you import new runs.',
      cancelBtn: 'Cancel',
      confirmBtn: 'Clear Activity Data',
    },
    footer: {
      left: 'PaceCraft — Running Training Planner & Strava Sync',
      right: 'All CSV & GPX imports are processed locally in your browser.',
    },
    auth: {
      loadingText: 'Preparing your PaceCraft workspace...',
      loginEyebrow: 'Personal Running Workspace',
      loginTitle: 'Your own private account for every mile, zone, and progress log.',
      loginSubtitle:
        'Sign in with Google so your BMI profile, heart-rate zones, race countdown, daily check-ins, and Strava history stay cleanly separated per runner.',
      feature1Title: 'Tailored Plans & Zones',
      feature1Desc:
        '5K to Marathon schedules calibrated to your BMI, VO2max, and strength days.',
      feature2Title: 'Synced Daily Streaks',
      feature2Desc:
        'Daily pace, HR logs, and weekly volume progress stay intact across devices.',
      feature3Title: 'Isolated Strava History',
      feature3Desc:
        'Your CSV or GPX Strava uploads calibrate only your personal training baseline.',
      cardTitle: 'Sign in to PaceCraft',
      cardSubtitle:
        'Continue with your Google Account to open your private running planner.',
      licenseKeyLabel: 'Buyer License Key (optional before sign-in)',
      licenseKeyPlaceholder: 'E.g., PACE-LT-XXXX-XXXX-XXXX',
      licenseKeyHint:
        'Already have a License Key? Enter it here to redeem automatically right after Google sign-in.',
      googleBtn: 'Sign in with Google',
      signingInBtn: 'Connecting Account...',
      privacyNote:
        'Your training data is strictly private to your signed-in account.',
      popupClosedError:
        'The Google sign-in window was closed before completing. Please try again.',
      popupBlockedError:
        'Sign-in popup was blocked by your browser. Please allow popups and retry.',
      genericAuthError:
        'Unable to sign in with Google. Please check your connection and try again.',
      accountLabel: 'Signed-in Account',
      signOutBtn: 'Sign Out',
      signingOutBtn: 'Signing Out...',
      syncReadyLabel: 'Synced to account',
    },
    migration: {
      title: 'Previous local training data found in this browser',
      desc: (runsCount, progressCount) =>
        `We detected saved local data (${runsCount} Strava runs, ${progressCount} progress logs) on this device. Would you like to move it into your Google account?`,
      importBtn: 'Import Local Data to Account',
      importingBtn: 'Importing to Account...',
      startFreshBtn: 'Start Fresh',
      importedNotice:
        'Local training data has been imported into your cloud account.',
    },
    privacyModal: {
      linkLabel: 'Privacy & Data Security',
      title: 'PaceCraft Privacy & Account Security',
      subtitle:
        'How your training data is stored, validated, and isolated per runner account.',
      closeAria: 'Close privacy policy',
      items: [
        {
          title: '1. Strict Per-Account Isolation & App Check Protection',
          body: 'Your body profile, race targets, daily progress logs, and running history can only be read and modified by your verified Google account UID enforced by Firestore rules, alongside Firebase App Check (reCAPTCHA v3) support to block automated bot abuse.',
        },
        {
          title: '2. Zero Email PII in Database',
          body: 'Your email address stays inside your active Google Auth session in the browser and is never persisted into Firestore documents.',
        },
        {
          title: '3. Local CSV/GPX Parsing & Clean Sign-Out',
          body: 'Strava CSV and GPX exports are parsed locally in your browser before syncing run summaries to your account. Signing out automatically clears any browser Strava OAuth session.',
        },
        {
          title: '4. Full Data Deletion Control',
          body: 'You can clear your Strava history or permanently delete your entire cloud account data at any time from the Profile & HR tab.',
        },
        {
          title: '5. Buyer Activation Guarantee & Support',
          body: 'If you run into any issue activating your License Key or confirming your QRIS transfer, reach out via our support email or WhatsApp confirmation link with your Google account email.',
        },
      ],
      closeBtn: 'Got It',
    },
    accountSecurity: {
      heading: 'Privacy & Account Management',
      subtitle:
        'Review how your runner data is protected or permanently erase all cloud data tied to this account.',
      privacyBtn: 'View Privacy Policy',
      deleteBtn: 'Delete Account & All Data',
      modalTitle: 'Permanently Delete All Account Data?',
      modalDesc:
        'This will permanently erase your body profile, race countdown, all daily progress logs, and all Strava running history from cloud storage and sign you out.',
      confirmKeyword: 'DELETE',
      inputLabel: (keyword) => `Type ${keyword} to confirm permanent deletion:`,
      inputPlaceholder: 'DELETE',
      cancelBtn: 'Cancel',
      confirmDeleteBtn: 'Delete Permanently',
      deletingBtn: 'Deleting Data...',
      errorNotice:
        'Could not complete account deletion. Please check your connection and try again.',
    },
    theme: {
      darkShort: 'Dark',
      lightShort: 'Light',
      ariaToDark: 'Switch to dark mode for comfortable night viewing',
      ariaToLight: 'Switch back to light mode',
    },
    paceCalculator: {
      heading: 'Pace & Training Zone Calculator',
      subtitle:
        'Convert your 5K, 10K, 21K, or 42K finish time goal into an exact Race Pace plus calibrated Easy, Tempo, and Interval training zones.',
      distanceLabel: 'Choose Race Distance',
      hoursLabel: 'Hours',
      minutesLabel: 'Minutes',
      secondsLabel: 'Seconds',
      resetBtn: 'Reset Default',
      applyToPlanBtn: 'Apply to Training Plan',
      appliedNotice: (race, pace) =>
        `${race} target with Race Pace ${pace} has been applied to your training schedule.`,
      activeCustomBanner: (pace) =>
        `Your training plan is currently calibrated to your calculator Race Pace (${pace}).`,
      useStravaBaselineBtn: 'Use Strava Baseline',
      racePaceLabel: 'Target Race Pace',
      speedLabel: 'Average Speed',
      easyTitle: 'Easy Pace',
      easyNote: 'Recovery & aerobic base (+45s to +75s/km)',
      tempoTitle: 'Tempo Pace',
      tempoNote: 'Lactate threshold & race rhythm stamina',
      intervalTitle: 'Interval Pace',
      intervalNote: 'VO2 max & top-end speed work',
    },
    shoeTracker: {
      heading: 'Shoe Mileage Tracker',
      subtitle:
        'Monitor cushioning wear on your primary running shoe (recommended 600–800 km) to help protect knees and ankles from overuse.',
      nameLabel: 'Primary Shoe Model / Name',
      namePlaceholder: 'E.g., Pegasus 41 / Novablast 4',
      currentKmLabel: 'Logged Distance (km)',
      maxKmLabel: 'Lifespan Limit (km)',
      maxKmHint: 'Recommended range 200 – 2,000 km (typical 600–800 km)',
      usagePrefix: 'Used',
      remainingPrefix: 'Remaining est.',
      syncLatestRunBtn: (kmLabel) => `+ Add Latest Run (${kmLabel} km)`,
      add5KmBtn: '+ 5 km',
      resetNewShoeBtn: 'Reset for New Shoe',
      healthyBadge: 'Cushioning Healthy',
      warningBadge: 'Approaching Replacement',
      replaceBadge: 'Inspect / Rotate New Shoe',
      warningText:
        'Your shoe has passed 80% of its lifespan limit. Pay attention to midsole responsiveness and heel comfort.',
      replaceText:
        'Shoe mileage has reached its target limit. Consider rotating in a fresh pair to protect your joints.',
    },
    backup: {
      heading: 'Backup & Restore Data (JSON)',
      subtitle:
        'Download your profile, race target, daily logs, shoe mileage, and Strava runs as a JSON file or restore anytime.',
      exportBtn: 'Export Backup JSON',
      importBtn: 'Import / Restore JSON',
      exportDone: 'Backup JSON file downloaded to your device.',
      restoreSuccess: (runsCount, progressCount) =>
        `Restore complete: profile, ${progressCount} progress entries, and ${runsCount} running activities synced to cloud.`,
      restoreInvalidError:
        'Unrecognized or invalid JSON backup file. Please choose a valid PaceCraft backup.',
    },
    disclaimer: {
      text: 'Training plans and nutrition recommendations in PaceCraft are general guidance only and do not replace professional medical advice.',
    },
    accessGate: {
      badge: 'Verified Buyer Access',
      title: 'Unlock your private PaceCraft running workspace.',
      subtitle:
        'Your Google account is signed in. Complete checkout or enter your buyer license code to unlock the training calculator, Strava analytics, and cloud sync.',
      signedInAs: 'Signed in as',
      refreshBtn: 'Refresh Access Status',
      checkingText: 'Verifying your buyer entitlement...',
      checkoutCardTitle: '1. Instant Checkout',
      checkoutCardDesc:
        'Complete payment via our checkout page to activate your account automatically.',
      checkoutBtn: 'Proceed to Payment',
      checkoutOpeningBtn: 'Opening Checkout...',
      checkoutNotConfigured:
        'Automated checkout is not configured on this deployment. Please use a buyer license code or submit manual payment confirmation.',
      codeCardTitle: '2. Have a Buyer License / Access Code?',
      codeCardDesc:
        'Enter the official access key from your purchase receipt or confirmation message.',
      codeLabel: 'Buyer License / Access Code',
      codePlaceholder: 'E.g., PACE-LT-XXXX-XXXX-XXXX',
      verifyCodeBtn: 'Verify & Unlock Access',
      verifyingBtn: 'Verifying...',
      invalidCodeError:
        'Invalid or expired buyer code. Double-check your code or submit manual payment confirmation below.',
      alreadyUsedCodeError:
        'This license key was not found, has already been used by another account, or was revoked.',
      manualCardTitle: '3. Manual Payment Confirmation',
      manualCardDesc:
        'Already paid via bank transfer or QRIS? Submit your transaction reference so the owner can activate your account.',
      planLabel: 'Selected Plan',
      planLifetime: 'Full Access (Lifetime)',
      planPro: 'Pro Runner Plan',
      orderRefLabel: 'Order / Transfer Reference',
      orderRefPlaceholder: 'E.g., INV-20261121-001 / QRIS-8821',
      noteLabel: 'Short Note (optional)',
      notePlaceholder: 'E.g., Bank transfer at 09:15 AM',
      submitManualBtn: 'Submit Payment Confirmation',
      submittingManualBtn: 'Submitting Confirmation...',
      pendingTitle: 'Payment Confirmation Under Review',
      pendingDesc: (orderRef) =>
        `Reference ${orderRef} is recorded in our cloud database. Your workspace opens automatically once approved.`,
      revokedTitle: 'Account Access Suspended',
      revokedDesc:
        'Access for this account is currently suspended. Contact the owner or submit a new payment confirmation.',
      stripeReturnedChecking: 'Verifying your checkout payment status...',
      stripeCanceledNotice:
        'Checkout was canceled. You can retry whenever you are ready.',
      planChooseLabel: '1. Select Your PaceCraft Access Plan',
      qrisSectionTitle: '2. Pay via QRIS / Bank Transfer',
      qrisSectionDesc:
        'Scan the QRIS code below for the selected plan amount, then tap WhatsApp so your Google email and chosen plan are pre-filled.',
      qrisScanHint: 'Scan using GoPay, OVO, DANA, ShopeePay, or any QRIS banking app',
      qrisNotConfiguredNote:
        'Merchant QRIS image URL (NEXT_PUBLIC_QRIS_IMAGE_URL) is not configured yet. Use the bank details below or message the Owner via WhatsApp.',
      bankSectionLabel: 'Alternative Bank Transfer:',
      whatsappBtn: 'Pay & Send Receipt via WhatsApp',
      whatsappMissingNote:
        'Seller WhatsApp number (NEXT_PUBLIC_SELLER_WHATSAPP) is not configured yet. Please submit your transfer reference using the manual form.',
      manualFormHeading: 'Already Paid? Record Reference Here',
      manualFormDesc:
        'After sending your receipt on WhatsApp, submit your transaction reference here so your pending status is tracked in real time.',
      gatewayTitle: 'Or Instant Gateway Checkout',
      gatewayDesc:
        'If your deployment connects Midtrans / Mayar / Xendit / Stripe, click below for instant automated activation.',
    },
    adminAccess: {
      heading: 'Owner Panel: Buyer Approvals & Single-Use License Keys',
      subtitle:
        'Create single-use keys in access-codes (marked "used" upon first Google account login) or approve QRIS payment confirmations in real time.',
      planLabel: 'Plan Type',
      planLifetime: 'Lifetime',
      planPro: 'Pro Runner',
      customCodeLabel: 'Custom Key (optional, leave blank to auto-generate)',
      customCodePlaceholder: 'E.g., VIP-JAKARTA-01',
      buyerNoteLabel: 'Buyer Name / QRIS Note (optional)',
      buyerNotePlaceholder: 'E.g., Budi - QRIS Nov 21',
      generateCodeBtn: 'Create Single-Use License Key',
      generatingBtn: 'Saving to Firestore...',
      generatedLabel: 'Ready-to-Send Single-Use Key:',
      singleUseHint:
        'Stored in access-codes as "unused" and atomically marked "used" the moment the first buyer logs in.',
      generateError:
        'Could not save the license key to Firestore. Use at least 8 alphanumeric/-/_ characters and retry.',
      copyCodeBtn: 'Copy Key',
      copiedBtn: 'Copied!',
      licenseListTitle: 'Issued License Keys (access-codes)',
      licenseEmptyList: 'No single-use license keys created yet.',
      revokeLicenseBtn: 'Revoke Key',
      licenseStatusLabels: {
        unused: 'Unused',
        used: 'Used',
        revoked: 'Revoked',
      },
      emptyList: 'No manual buyer payment confirmations yet.',
      approveBtn: 'Activate Access',
      revokeBtn: 'Revoke',
      statusLabels: {
        pending: 'Pending Review',
        active: 'Active',
        revoked: 'Revoked',
      },
    },
    monthlyCalendar: {
      heading: 'Monthly Training Intensity Calendar',
      subtitle:
        'Combines your daily progress check-ins and imported Strava runs. Tap any day to inspect detailed session stats.',
      prevMonthAria: 'View previous month',
      nextMonthAria: 'View next month',
      thisMonthBtn: 'This Month',
      activeDaysLabel: 'Active Days',
      monthlyTotalKmLabel: 'Monthly Total',
      highIntensityDaysLabel: 'High / Peak Days',
      avgPaceLabel: 'Avg Pace',
      avgHrLabel: 'Avg HR',
      daysUnit: 'days',
      sessionsUnit: 'sessions',
      weekdayHeadersShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      legendTitle: 'Intensity Scale:',
      intensityLabels: {
        rest: 'Rest',
        light: 'Light',
        moderate: 'Moderate',
        high: 'High',
        peak: 'Peak',
      },
      intensityDescriptions: {
        rest: 'Recovery day or no running sessions logged',
        light: 'Short Easy / recovery effort (< 6 km)',
        moderate: 'Steady aerobic run (6–11.9 km) or light trail',
        high: 'Tempo workout, medium Long Run (12–17.9 km), or Z3–Z4 HR',
        peak: 'Speed intervals, Z5 VO2max effort, or Long Run ≥ 18 km',
      },
      todayTag: 'Today',
      restLoggedTag: 'Rest Logged',
      dayCellAria: (fullDate, intensityLabel, kmText, sessionsCount) =>
        `${fullDate}, ${intensityLabel} intensity, ${kmText} km, ${sessionsCount} sessions`,
      detailPanelHeading: 'Selected Day Session Details',
      selectedTotalLabel: 'Total Distance',
      selectedDurationLabel: 'Moving Time',
      emptyDayTitle: 'No running sessions logged on this date',
      emptyDayPlannedHint: (title, kmText) =>
        `Weekly plan for this weekday: ${title} (${kmText} km).`,
      emptyDayRestHint:
        'According to your weekly schedule, this weekday is a planned recovery/rest day.',
      emptyDayDefaultHint:
        'Use the check-in form above to record a session or import your Strava runs.',
      logForWeekdayBtn: (dayName) => `Log ${dayName} Session`,
      sourceLabels: {
        daily_log: 'Daily Check-In',
        strava_sample: 'Strava Sample',
        strava_csv: 'Strava CSV',
        strava_gpx: 'Strava GPX',
        strava_oauth: 'Strava API',
      },
      metricDistance: 'Distance',
      metricPace: 'Pace',
      metricDuration: 'Duration',
      metricHr: 'Avg HR',
      metricElevation: 'Elevation',
      metricComfort: 'Comfort',
    },
    landing: {
      navFeatures: 'Features',
      navDemo: 'Free Calculator',
      navPricing: 'Pricing',
      navFaq: 'FAQ',
      navLoginBtn: 'Sign In / Activate',
      heroBadge: 'Built for 5K · 10K · Half & Full Marathon',
      heroTitle: 'Build Your Body-Smart Running Plan in 30 Seconds.',
      heroSubtitle:
        'Target race pace calculator, BMI-safe weekly schedules, monthly training intensity calendar, plus free browser-based Strava CSV/GPX import—no paid Strava Subscription required.',
      heroDemoCta: 'Try Pace Calculator',
      heroOpenDemoCta: 'Open App Demo',
      heroBuyCta: 'View Plans & Pricing',
      heroImageAlt: 'Runner jogging at sunrise along a calm running path',
      trust1: 'Free Strava CSV/GPX Import',
      trust2: 'Installable Phone App (PWA)',
      trust3: 'Private Per-Account Cloud Sync',
      showcaseHeading: 'Every Essential Running Tool in One Calm Workspace',
      showcaseSubtitle:
        'Built so beginners and Personal Best chasers can train consistently without guessing paces or overloading knees.',
      showcaseTryDemoBtn: 'Explore All Features in Demo Mode',
      showcaseCards: [
        {
          badge: 'Adaptive Schedule',
          title: 'Training Plan + BMI Guard & Auto Tapering',
          desc: 'Choose 5K–42K and 3–6 training days per week. Volume stays capped safely <=10% weekly and tapers automatically before race day.',
          highlightLabel: 'Phone Calendar Export',
          highlightValue: 'One-click .ics + 30m reminder',
        },
        {
          badge: 'Monthly Calendar',
          title: 'Intensity Heatmap & Personal Best Records',
          desc: 'Track monthly effort zones across daily check-ins and Strava runs, tap any day for full metrics, and maintain your 5K–42K PB wall.',
          highlightLabel: 'IG Story Ready',
          highlightValue: 'Download 9:16 & 1:1 progress cards',
        },
        {
          badge: 'No Strava Subscription',
          title: 'Browser Strava CSV/GPX Import',
          desc: 'Upload activities.csv or .gpx exports right in your browser—filters non-runs automatically and calibrates your personal training pace.',
          highlightLabel: 'Shoe Tracker',
          highlightValue: '600–800 km cushioning alerts',
        },
      ],
      demoHeading: 'Try the Pace Calculator or Launch the Full App Demo',
      demoSubtitle:
        'Test your finish time goal below, or launch the complete login-free Demo workspace pre-filled with sample runs, training schedules, calendar heatmaps, and routes.',
      demoOpenFullBtn: 'Launch Interactive App Demo',
      demoApplyCta: 'Sign In to Save Target & Build Plan',
      demoAppliedHint:
        'Target pace noted! Sign in with Google above to generate your complete weekly training schedule.',
      pricingHeading: 'Clear Pricing, Zero Recurring Traps',
      pricingSubtitle:
        'Compare Lifetime vs Annual Pro plans. Fast activation via QRIS + WhatsApp or a single-use License Key.',
      pricingSelectBtn: 'Choose This Plan',
      pricingSelectedBtn: 'Selected Plan',
      comparisonTableHeading: 'Lifetime vs Annual Pro Plan Comparison',
      comparisonFeatureHeader: 'Feature & Access',
      comparisonIncludedLabel: 'Included',
      faqHeading: 'Frequently Asked Questions',
      faqSubtitle: 'Quick answers before you start training with PaceCraft.',
      faqItems: [
        {
          q: 'Do I need a paid Strava Subscription?',
          a: 'Not at all. You can export activities.csv or .gpx files from a free Strava account and upload them directly in your browser with zero recurring API fees.',
        },
        {
          q: 'Is PaceCraft a one-time payment or a monthly subscription?',
          a: 'You choose: Lifetime Access (one-time Rp 149.000, pay once forever) or Annual Pro (Rp 99.000/year) with no surprise auto-charges.',
        },
        {
          q: 'Can I use it like a mobile app on my phone?',
          a: 'Yes! PaceCraft is an installable PWA. Tap "Install on Home Screen" in Chrome on Android or Add to Home Screen in Safari on iPhone.',
        },
        {
          q: 'How do I try the Demo or activate an account via QRIS?',
          a: 'Click "Open App Demo" to explore the entire running dashboard with pre-filled sample data without signing in. When ready, sign in with Google, scan QRIS, and confirm via WhatsApp for a single-use License Key.',
        },
      ],
    },
    demoMode: {
      badge: 'Interactive Demo Mode (No Login)',
      title: 'You are exploring PaceCraft with a sample 21K runner workspace.',
      subtitle:
        'Every calculator, weekly plan, monthly intensity calendar, and Strava route map runs live in your browser. Edits are not saved to any server.',
      signInCta: 'Sign In & Activate Account',
      backHomeBtn: 'Back to Homepage',
      sidebarName: 'Demo Runner',
      sidebarEmail: 'Free Interactive Preview',
      exitSidebarBtn: 'Exit Demo Mode',
    },
    onboarding: {
      badge: '30-Second Quick Setup',
      stepOf: (step, total) => `Step ${step} of ${total}`,
      titleStep1: 'Choose Your Race Target & Weekly Days',
      subtitleStep1: 'Pick the distance you are training for and how many days per week fit your routine.',
      titleStep2: 'Tune Body Metrics & Target Pace',
      subtitleStep2: 'Weight, height, age, and joint status keep weekly progression gentle and injury-aware.',
      titleStep3: 'Your Plan Is Ready to Build!',
      subtitleStep3: 'Review your safety limits and baseline zones before entering your workspace.',
      raceLabel: 'Target Race Distance',
      freqLabel: 'Training Days / Week',
      eventNameLabel: 'Race Event Name (optional)',
      eventNamePlaceholder: 'E.g., Jakarta Marathon / Borobudur 10K',
      eventDateLabel: 'Race Date',
      targetTimeToggle: 'Have a specific finish time goal? (optional)',
      targetPacePreview: 'Estimated Target Race Pace:',
      previewSummaryHeading: 'Your Initial Calibration Summary',
      previewBmiLabel: 'BMI Safety Cap',
      previewVolumeLabel: 'Week 1 Volume',
      previewPaceLabel: 'Baseline Run Pace',
      nextBtn: 'Continue',
      backBtn: 'Back',
      submitBtn: 'Build My Training Plan',
      skipBtn: 'Skip for now (use defaults)',
      reopenBtn: 'Re-run Quick Setup Wizard',
    },
    pwa: {
      installBtn: 'Install on Home Screen',
      bannerTitle: 'Install PaceCraft on Your Phone Home Screen',
      bannerDesc: 'Open your running plan and log workouts full-screen right from your home screen without an app store download.',
      guideTitle: 'Add PaceCraft to Home Screen',
      iosSubtitle: 'Follow these 3 quick steps in iPhone/iPad Safari:',
      androidSubtitle: 'Install from your Android Chrome or Edge browser menu:',
      iosStep1: '1. Tap the Share button (square with upward arrow) at the bottom of Safari.',
      iosStep2: '2. Scroll down and select "Add to Home Screen".',
      iosStep3: '3. Tap "Add" in the top-right corner—PaceCraft launches full-screen.',
      androidStep1: '1. Tap the three-dot menu (⋮) in the top-right corner of your browser.',
      androidStep2: '2. Choose "Add to Home screen" or "Install app" and confirm.',
      offlineNotice: 'You are offline. Saved schedules and logs remain readable, and edits will sync once reconnected.',
      closeAria: 'Close install guide',
      closeBtn: 'Got It',
    },
    personalBests: {
      heading: 'Personal Best (PB) Race Records',
      subtitle: 'Track your fastest official times across 5K to 42K, or auto-detect them from your Strava run history.',
      detectBtn: 'Detect from Strava History',
      detectedNotice: (count) => `Detected ${count} faster PB record(s) from your Strava runs.`,
      noRunsDetectedNotice: 'No Strava runs found within race distances (5K/10K/21K/42K) faster than your current saved PBs.',
      clearBtn: 'Clear',
      overviewLabel: 'Recorded Personal Bests',
      placeholder: 'mm:ss or h:mm:ss',
      saveHint: 'Time format: mm:ss (e.g. 24:30) or h:mm:ss (e.g. 1:52:10). Leave blank to clear.',
      invalidHint: 'Invalid time format. Use mm:ss or h:mm:ss (at least 10 minutes).',
    },
  },
};
