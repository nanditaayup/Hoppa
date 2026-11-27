import { AppLanguage, InjuryStatus, RunDataQuality, TrainingZoneType } from './types';

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
    todayLookWorkoutBtn: string;
    activePlanLabel: string;
    paceGuidePrefix: string;
    todayWarmHeadlines: {
      easy: string;
      tempo: string;
      interval: string;
      long: string;
      rest: string;
      strength: string;
    };
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
    extraMetricsHeading: string;
    weeklyProgressRunSessions: string;
    weeklyProgressDistance: string;
    weeklyProgressCrossTrain: string;
    overloadAlertTitle: string;
    overloadAlertBody: (pct: number) => string;
    carbsShort: string;
    proteinShort: string;
    estVo2Short: string;
    hydrationEstPrefix: string;
    weeklyTitle: string;
    activeGoalTitle: string;
    viewPlanLink: string;
    editGoalLink: string;
    nutritionLink: string;
    daysToRaceText: (days: number) => string;
    todayStructureLabel: string;
    estDurationUnit: string;
    predictedFinishPrefix: string;
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
    vo2NonLabDisclaimer: string;
    vo2MethodResting: string;
    vo2MethodBlended: string;
    shoeDisclaimer: string;
    bmiOptionalTitle: string;
    bmiOptionalSubtitle: string;
    metricsOverviewTitle: string;
    editBmiAction: string;
    editVo2Action: string;
    nonEssentialHint: string;
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
    viewSimulatorTab: string;
    customPaceBadge: string;
    resetCustomPaceBtn: string;
    baselineVolumeChip: string;
    baselinePaceChip: string;
    strengthToggleShow: string;
    strengthToggleHide: string;
    exportIcsBtn: string;
    exportedIcsNotice: string;
    paceBasisLabel: string;
    paceBasisTags: {
      race_goal: string;
      strava_baseline: string;
      default: string;
    };
    adaptiveHeading: string;
    adaptiveToggleLabel: string;
    adaptiveToggleHint: string;
    adaptiveStatusNormal: string;
    adaptiveAdjustCta: string;
    planHeading: (race: string) => string;
    planMetaLine: (days: number, raceDateLabel: string) => string;
    editPlanBtn: string;
    previewHeading: string;
    confirmPlanBtn: string;
    cancelEditPlanBtn: string;
    basisDisclosureLabel: string;
    nutritionLinkLabel: string;
    blockWeeksHeading: string;
    weekChipLabel: (weekNumber: number) => string;
    activeWeekTag: string;
    weeklyMixSummary: (
      easyCount: number,
      qualityCount: number,
      longCount: number,
      strengthCount: number
    ) => string;
    workoutStepsHeading: string;
    coachCueLabel: string;
    estDurationShort: (min: number) => string;
    predictorHeading: string;
    predictorSubtitle: string;
    predictorDisclaimer: string;
    predictorCurrentTargetBadge: string;
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
    practicalHeading: string;
    macroToggleShow: string;
    macroToggleHide: string;
    macroCalcNote: string;
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
    feelSimpleOptions: {
      hard: string;
      steady: string;
      comfy: string;
    };
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
    streakRestNote: string;
    runSessionsLabel: string;
    runDistanceLabel: string;
    strengthRestSummary: (crossCount: number, restCount: number) => string;
    overloadCautionBanner: (pct: number, plannedKm: string, actualKm: string) => string;
    subTabCheckInCalendar: string;
    subTabRunHistory: string;
    historyToggleShow: string;
    historyToggleHide: string;
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
    provenanceToggle: string;
    provenanceItems: Array<{ title: string; body: string }>;
    flaggedAnomalyBanner: (count: number) => string;
    anomalyBadge: string;
    flaggedBannerCompact: (count: number) => string;
    reviewAnomaliesBtn: string;
    showAllRunsBtn: string;
    weeklyAvgSummaryLabel: string;
    thirtyDayTotalSummaryLabel: string;
    sessionsCountLabel: string;
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
    anomalyTitle: string;
    anomalyBody: (
      computedPace: string,
      reportedPace: string | null,
      reason?: RunDataQuality['reason']
    ) => string;
    editSectionHeading: string;
    editDistanceLabel: string;
    editDurationMinLabel: string;
    saveEditBtn: string;
    deleteActivityBtn: string;
    confirmDeleteActivityBtn: string;
    cancelEditBtn: string;
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
    readinessHeading: string;
    applyConservativeBtn: (pace: string) => string;
    goalVsTrainingNote: string;
    statusActiveBadge: string;
    statusSimulationBadge: string;
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
    qrisSectionDesc: (planTitle: string, priceLabel: string) => string;
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
    previewLabel: string;
    previewTodayTag: string;
    previewTodayHeadline: string;
    previewTodayMetrics: string;
    previewTodaySteps: string;
    previewTodayCue: string;
    previewActivePlan: string;
    previewWeeklyTitle: string;
    previewWeeklySessionLabel: string;
    previewWeeklySessionVal: string;
    previewWeeklyDistLabel: string;
    previewWeeklyDistVal: string;
    previewWeeklyCrossLabel: string;
    previewWeeklyCrossVal: string;
    showcaseHeading: string;
    showcaseSubtitle: string;
    showcaseCards: Array<{
      badge: string;
      title: string;
      desc: string;
    }>;
    progressionNote: string;
    demoHeading: string;
    demoSubtitle: string;
    demoOpenFullBtn: string;
    demoApplyCta: string;
    demoAppliedHint: string;
    videoDemoBadge: string;
    videoDemoTitle: string;
    videoDemoDesc: string;
    videoDemoFallback: string;
    videoDemoChapters: Array<{
      id: 'progress' | 'calculator' | 'strava';
      label: string;
      caption: string;
      timeSec: number;
    }>;
    pricingHeading: string;
    pricingSubtitle: string;
    pricingBestValueBadge: string;
    pricingFooterNote: string;
    comparisonTableHeading: string;
    comparisonFeatureHeader: string;
    comparisonIncludedLabel: string;
    comparisonNotIncludedLabel: string;
    selectedPlanHint: (planTitle: string, priceLabel: string) => string;
    alreadyBoughtToggleLabel: string;
    photoSectionTitle: string;
    photoSectionDesc: string;
    faqHeading: string;
    faqSubtitle: string;
    faqItems: Array<{ q: string; a: string; hasPwaAction?: boolean }>;
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
      profileBmi: 'Profil',
      trainingPlan: 'Rencana',
      nutrition: 'Makan & Pulih',
      dailyProgress: 'Progres',
      stravaHistory: 'Riwayat Lari',
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
        overview: { label: 'Hari Ini', hint: 'Latihan hari ini & progres' },
        training: { label: 'Rencana', hint: 'Jadwal & simulasi target' },
        progress: { label: 'Progres', hint: 'Catat lari, kalender & riwayat' },
        profile: { label: 'Profil', hint: 'Profil pelari, performa & sepatu' },
        nutrition: { label: 'Makan & Pulih', hint: 'Panduan makan & minum' },
        strava: { label: 'Riwayat Lari', hint: 'Impor CSV/GPX & grafik' },
      },
    },
    overview: {
      greetingTitle: 'Siap lari hari ini? Fokus ke satu sesi dulu.',
      greetingSubtitle:
        'Jadwal, progres pekan ini, dan targetmu tersusun ringkas di bawah.',
      quickPlanBtn: 'Ubah Target',
      quickLogBtn: 'Catat Hasil',
      todaySectionLabel: 'Latihan hari ini',
      todayDoneBadge: 'Selesai',
      todayRestDesc:
        'Hari ini jadwal istirahat agar otot pulih. Jalan santai atau peregangan ringan sudah cukup.',
      todayQuickLogBtn: 'Catat Hasil',
      todayViewProgressBtn: 'Lihat di Progres',
      todayViewPlanBtn: 'Lihat rencana',
      todayLookWorkoutBtn: 'Lihat Latihan',
      activePlanLabel: 'Target aktif',
      paceGuidePrefix: 'Pace panduan',
      todayWarmHeadlines: {
        easy: 'Hari ini, lari santai dulu',
        tempo: 'Hari ini, lari tempo',
        interval: 'Hari ini, sesi interval',
        long: 'Hari ini, lari jarak jauh',
        rest: 'Hari ini, istirahat & pulih',
        strength: 'Hari ini, penguatan & mobilitas',
      },
      cards: {
        trainingTitle: 'Rencana Lari',
        trainingAction: 'Lihat rencana',
        progressTitle: 'Progres minggu ini',
        progressAction: 'Catat / Kalender',
        profileTitle: 'Profil Pelari',
        profileAction: 'Buka Profil',
        nutritionTitle: 'Makan & Pulih',
        nutritionAction: 'Lihat Panduan',
      },
      stravaEmptyBanner:
        'Belum ada riwayat lari? Muat data contoh agar baseline terisi otomatis.',
      stravaLoadSampleShort: 'Muat Data Contoh',
      extraMetricsHeading: 'Ringkasan Tambahan',
      weeklyProgressRunSessions: 'Sesi selesai',
      weeklyProgressDistance: 'Jarak lari',
      weeklyProgressCrossTrain: 'Strength / istirahat',
      overloadAlertTitle: 'Jarak minggu ini di atas rencana (>115%)',
      overloadAlertBody: (pct) =>
        `Total lari pekan ini sudah ${pct}% dari rencana. Tinjau beban latihan dan prioritaskan pemulihan.`,
      carbsShort: 'Karbo',
      proteinShort: 'Protein',
      estVo2Short: 'Est. VO2',
      hydrationEstPrefix: 'Perkiraan awal',
      weeklyTitle: 'Progres minggu ini',
      activeGoalTitle: 'Target aktif',
      viewPlanLink: 'Lihat rencana',
      editGoalLink: 'Ubah target',
      nutritionLink: 'Panduan Makan & Pulih',
      daysToRaceText: (days) => `${days} hari menuju race`,
      todayStructureLabel: 'Struktur sesi hari ini',
      estDurationUnit: 'mnt',
      predictedFinishPrefix: 'Proyeksi finis',
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
      heading: 'Profil Pelari',
      subtitle:
        'Atur data pelari, zona detak jantung, sepatu lari, dan cadangan data akunmu.',
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
      resultLabel: 'Indeks Massa Tubuh',
      categoryPrefix: 'Kategori',
      maxIncreaseLabel: 'Saran Progres Awal/Mgg',
      maxPrefix: 'Patokan',
      extraEasyLabel: 'Porsi Lari Santai Tambahan',
      hrSectionTitle: 'Zona Detak Jantung & Perkiraan VO2max',
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
        body: 'Profil Pelari',
        hr: 'Performa',
        shoes: 'Sepatu',
        account: 'Pengaturan',
        admin: 'Admin Pemilik',
      },
      helperTip:
        'BMI tidak menentukan keamanan kenaikan jarak secara mutlak. Selalu sesuaikan latihan dengan riwayat lari, pemulihan, rasa sakit, dan respons tubuh.',
      vo2NonLabDisclaimer:
        'Estimasi kebugaran non-lab (bukan pengganti uji VO2max laboratorium). Nilai dipengaruhi variasi HR maksimal individu, kelelahan, suhu panas, rute tanjakan, dan tidur.',
      vo2MethodResting: 'Sumber: Rumus Uth (15,3 × HRmaks / HRistirahat)',
      vo2MethodBlended: 'Sumber: Gabungan rumus Uth & kecepatan–HR submaximal Strava',
      shoeDisclaimer:
        'Catatan: Kilometer sepatu saja tidak memastikan kondisi bantalan atau mencegah cedera. Periksa juga keausan sol, respons pantulan, dan kenyamanan saat mendarat.',
      bmiOptionalTitle: 'Indeks Massa Tubuh (opsional)',
      bmiOptionalSubtitle:
        'Membantu memberi patokan awal progres volume dan porsi lari santai. Tidak menggantikan evaluasi medis atau sinyal pemulihan tubuh.',
      metricsOverviewTitle: 'Metrik Tubuh & Kebugaran',
      editBmiAction: 'Atur Berat & BMI',
      editVo2Action: 'Atur HR & Performa',
      nonEssentialHint:
        'Estimasi pendukung yang disimpan di Profil agar beranda tetap fokus ke latihan hari ini.',
    },
    training: {
      heading: 'Rencana Lari',
      subtitlePrefix: 'Mengikuti rata-rata volume 4 minggu (',
      weekUnit: 'km/mgg',
      subtitleMiddle: ') dan pace dasar',
      defaultBaselineTag: ' (acuan awal bawaan)',
      stravaBaselineTag: ' (dari riwayat Strava)',
      step1Title: '1. Pilih Target Jarak Lomba',
      raceGroupAria: 'Target jarak lomba',
      step2Title: '2. Hari Lari per Minggu',
      freqGroupAria: 'Frekuensi hari latihan per minggu',
      daysPerWeekShort: 'hari/mgg',
      totalPlannedLabel: 'Total rencana minggu ini:',
      paceZonesHeading: 'Zona Pace Latihan',
      progressionHeading: 'Progresi Volume 4 Minggu',
      progressionDescPrefix: 'Saran progres awal hingga',
      progressionDescSuffix:
        'per minggu, disertai pekan pemulihan (cutback -20%) di minggu ke-4. Sesuaikan dengan respons tubuh.',
      scheduleHeadingPrefix: 'Jadwal Mingguan',
      activeDaysUnit: 'hari lari',
      restLabel: 'Istirahat',
      loggedBtn: '✓ Selesai',
      logCompleteBtn: 'Catat Hasil',
      taperNoticeTitle: 'Penyesuaian Fase Tapering',
      taperNoticeBody: (days, reductionPct, eventLabel) =>
        `Sisa ${days} hari menuju ${eventLabel}. Volume minggu ini diturunkan ${reductionPct}% agar otot pulih di garis start.`,
      raceWeekNoticeTitle: 'Penyesuaian Pekan Lomba',
      raceWeekNoticeBody: (days, eventLabel) =>
        `Tinggal ${days} hari menuju ${eventLabel}. Sesi diubah menjadi lari ringan (shakeout) agar kaki segar.`,
      raceDayNoticeTitle: 'Hari Lomba Telah Tiba!',
      raceDayNoticeBody: (eventLabel) =>
        `Hari ini jadwal ${eventLabel}. Pemanasan santai, jaga ritme awal, dan nikmati larimu.`,
      strengthHeaderTag: (count) =>
        count > 0 ? `· ${count}x Strength Training` : '',
      strengthBadgePrefix: 'Strength & Mobility',
      minuteShort: 'menit',
      viewScheduleTab: 'Minggu ini',
      viewZonesTab: 'Progres program',
      viewSimulatorTab: 'Simulasi Target',
      customPaceBadge: 'Target Simulasi Diterapkan',
      resetCustomPaceBtn: 'Pakai Acuan Strava',
      baselineVolumeChip: 'Acuan Volume',
      baselinePaceChip: 'Acuan Pace',
      strengthToggleShow: 'Lihat gerakan',
      strengthToggleHide: 'Sembunyikan gerakan',
      exportIcsBtn: 'Simpan ke Kalender HP (.ics)',
      exportedIcsNotice: 'File jadwal .ics berhasil diunduh untuk Google Calendar atau Apple Calendar.',
      paceBasisLabel: 'Basis Zona Pace',
      paceBasisTags: {
        race_goal: 'Target Race Diterapkan',
        strava_baseline: 'Baseline Strava 30 Hari',
        default: 'Acuan Awal Bawaan',
      },
      adaptiveHeading: 'Penyesuaian Latihan Saat Lelah',
      adaptiveToggleLabel: 'Mode Pemulihan (Lagi Terasa Berat)',
      adaptiveToggleHint:
        'Saat dinyalakan, sisa sesi Tempo/Interval minggu ini berubah menjadi Easy Run dan target jarak dipangkas 15–20%.',
      adaptiveStatusNormal: 'Rencana berjalan normal',
      adaptiveAdjustCta: 'Lagi terasa berat? Sesuaikan latihan',
      planHeading: (race) => `Rencana ${race} kamu`,
      planMetaLine: (days, raceDateLabel) =>
        `${days} hari lari/minggu · Target race ${raceDateLabel}`,
      editPlanBtn: 'Ubah rencana',
      previewHeading: 'Pratinjau perubahan rencana',
      confirmPlanBtn: 'Konfirmasi & Simpan Rencana',
      cancelEditPlanBtn: 'Batal',
      basisDisclosureLabel: 'Dasar rekomendasi',
      nutritionLinkLabel: 'Lihat panduan Makan & Pulih',
      blockWeeksHeading: 'Blok 4 Minggu',
      weekChipLabel: (weekNumber) => `Minggu ${weekNumber}`,
      activeWeekTag: 'Minggu aktif',
      weeklyMixSummary: (easyCount, qualityCount, longCount, strengthCount) => {
        const parts = [`${easyCount} Easy`];
        if (qualityCount > 0) parts.push(`${qualityCount} Cepat/Tempo`);
        if (longCount > 0) parts.push(`${longCount} Long Run`);
        if (strengthCount > 0) parts.push(`${strengthCount} Strength`);
        return parts.join(' · ');
      },
      workoutStepsHeading: 'Struktur Latihan',
      coachCueLabel: 'Catatan coach',
      estDurationShort: (min) => `~${min} mnt`,
      predictorHeading: 'Proyeksi Finis Lomba (5K–42K)',
      predictorSubtitle:
        'Estimasi ekivalen Riegel berdasarkan pace acuanmu saat ini untuk membantu menilai kesiapan target waktu.',
      predictorDisclaimer:
        'Angka proyeksi bersifat estimasi matematis; hasil hari lomba tetap bergantung pada konsistensi long run, rute, cuaca, dan pemulihan.',
      predictorCurrentTargetBadge: 'Target aktif',
      zoneLabels: {
        easy: 'Easy Run',
        tempo: 'Tempo',
        interval: 'Interval',
        long_run: 'Long Run',
        rest: 'Istirahat',
      },
    },
    nutrition: {
      headingPrefix: 'Makan & Pulih',
      subtitleBeforeWeight:
        'Panduan praktis sekitar waktu lari agar energi cukup dan pemulihan tetap nyaman (referensi berat',
      subtitleAfterWeight: ').',
      carbsLabel: 'Karbohidrat Harian',
      carbsUnitNote: 'g/kg BB · Energi utama',
      proteinLabel: 'Protein Pemulihan',
      proteinUnitNote: 'g/kg BB · Perbaikan otot',
      hydrationLabel: 'Hidrasi Harian',
      hydrationUnitNote:
        'Perkiraan awal air & elektrolit (sesuaikan cuaca & keringat)',
      strategyHeadingPrefix: 'Panduan Praktis Harian',
      examplesLabel: 'Contoh menu:',
      practicalHeading: 'Panduan Makan & Minum di Sekitar Jam Lari',
      macroToggleShow: 'Lihat perkiraan kebutuhan harian ▾',
      macroToggleHide: 'Sembunyikan perkiraan kebutuhan harian ▴',
      macroCalcNote:
        'Angka di atas adalah estimasi kasar berdasarkan berat badan dan jarak target—bukan resep medis ketat.',
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
        2: 'Berat',
        3: 'Biasa',
        4: 'Nyaman',
        5: 'Nyaman',
      },
      feelSimpleOptions: {
        hard: 'Berat',
        steady: 'Biasa',
        comfy: 'Nyaman',
      },
      noteLabel: 'Catatan Singkat (opsional)',
      notePlaceholder:
        'Misal: Napas lebih ringan, kaki terasa segar di km terakhir',
      saveBtn: 'Simpan Hasil',
      savedFeedback: (dayName, title) =>
        `Hasil ${dayName} (${title}) berhasil disimpan.`,
      savedLogsHeading: 'Riwayat Catatan Tersimpan',
      emptyLogsBeforeBtn: 'Belum ada sesi harian yang dicatat. Pilih hari dan tekan',
      emptyLogsBtnName: 'Simpan Hasil',
      emptyLogsAfterBtn: 'untuk mencatat progres.',
      feelingPrefix: 'Rasa',
      deleteLogAria: 'Hapus catatan',
      quickLogDefaultNote: 'Diselesaikan sesuai rencana',
      stravaSyncTitle: (count) =>
        `${count} sesi Strava terbaru siap dicocokkan ke Progres`,
      stravaSyncDesc:
        'Otomatis mencocokkan jarak lari dari riwayat Strava Anda ke hari yang sesuai tanpa menimpa catatan manual.',
      stravaSyncBtn: (count) => `Sinkronkan dari Strava (${count} sesi)`,
      stravaSyncSuccess: (count) =>
        `${count} sesi Strava berhasil dicatat ke Progres.`,
      stravaSyncedTag: 'Sinkronisasi Strava',
      paceInputLabel: 'Pace (mnt:dtk/km)',
      paceInputPlaceholder: 'Misal: 06:15',
      hrInputLabel: 'Detak Jantung (bpm)',
      hrInputPlaceholder: 'Misal: 148',
      avgPaceLabel: 'Rata-rata Pace',
      avgHrLabel: 'Rata-rata HR',
      shareBtn: 'Bagikan Progres',
      optionalDetailsShow: 'Tambah pace, detak jantung & catatan (opsional)',
      optionalDetailsHide: 'Sembunyikan detail tambahan',
      jumpToCalendarBtn: 'Lihat Kalender Bulanan',
      streakRestNote:
        'Hari istirahat terjadwal tetap menjaga streak (lari setiap hari tidak wajib).',
      runSessionsLabel: 'Sesi lari',
      runDistanceLabel: 'Jarak lari',
      strengthRestSummary: (crossCount, restCount) =>
        `Aktivitas tambahan pekan ini: ${crossCount} strength/mobilitas · ${restCount} hari istirahat tercatat`,
      overloadCautionBanner: (pct, plannedKm, actualKm) =>
        `Perhatian beban latihan: jarak lari tercatat pekan ini (${actualKm} km) sudah ${pct}% dari rencana (${plannedKm} km). Tinjau beban dan utamakan pemulihan.`,
      subTabCheckInCalendar: 'Catat & Kalender',
      subTabRunHistory: 'Riwayat Lari',
      historyToggleShow: 'Lihat riwayat catatan',
      historyToggleHide: 'Tutup riwayat catatan',
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
      provenanceToggle: 'Cara data dibaca, disaring & dipakai untuk kalibrasi',
      provenanceItems: [
        {
          title: 'Moving Time vs Elapsed Time',
          body: 'Pace sesi dihitung dari Jarak ÷ Waktu Bergerak (Moving Time) agar jeda lampu merah atau berhenti minum tidak merusak ritme lari. Waktu Total (Elapsed Time) tetap tampil di detail aktivitas.',
        },
        {
          title: 'Volume vs Baseline Pace',
          body: 'Rata-rata volume 4 minggu memakai total jarak semua aktivitas lari valid, sedangkan Baseline Pace memakai rata-rata 30 hari terakhir dari aktivitas dengan pace wajar (02:20–30:00/km).',
        },
        {
          title: 'Aktivitas Non-Lari, Duplikat & Trail',
          body: 'Bersepeda, renang, jalan kaki, serta duplikat ID/waktu disaring otomatis. Lari trail dengan tanjakan tinggi tetap masuk volume, namun perlu diingat pace trail umumnya lebih lambat daripada jalan raya.',
        },
        {
          title: 'Rata-rata Pace ≠ Kemampuan Lomba',
          body: 'Rata-rata pace Strava 30 hari biasanya mencerminkan gabungan Easy run, Long Run, dan pemulihan—bukan otomatis pace terbaik lomba Anda.',
        },
      ],
      flaggedAnomalyBanner: (count) =>
        `${count} aktivitas perlu diperiksa · Sebagian data pace tidak terbaca wajar dan belum digunakan untuk rekomendasi terkait.`,
      anomalyBadge: 'Perlu Dicek',
      flaggedBannerCompact: (count) =>
        `${count} aktivitas perlu diperiksa · Sebagian data pace tidak terbaca wajar dan belum digunakan untuk rekomendasi terkait.`,
      reviewAnomaliesBtn: 'Periksa Aktivitas',
      showAllRunsBtn: 'Tampilkan semua',
      weeklyAvgSummaryLabel: 'Rata-rata jarak mingguan',
      thirtyDayTotalSummaryLabel: 'Total jarak 30 hari',
      sessionsCountLabel: 'Jumlah sesi',
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
      anomalyTitle: 'Data Aktivitas Perlu Diperiksa',
      anomalyBody: (computedPace, reportedPace, reason) =>
        reportedPace && reportedPace !== computedPace
          ? `Kolom kecepatan di file sumber terbaca setara ${reportedPace}, sedangkan jarak dan waktu bergerak menghasilkan ${computedPace}. PaceCraft menampilkan ${computedPace} dan belum memakainya untuk rekomendasi terkait.`
          : reason === 'speed_distance_mismatch'
            ? `Kolom kecepatan pada file sumber tidak selaras dengan jarak dan waktu bergerak (${computedPace}). Kamu bisa memperbaiki jarak/waktu di bawah atau menghapus aktivitas ini.`
            : `Kombinasi jarak dan waktu bergerak menghasilkan ${computedPace} di luar batas wajar. Perbaiki jarak/waktu di bawah atau hapus aktivitas ini.`,
      editSectionHeading: 'Perbaiki Jarak atau Durasi Aktivitas',
      editDistanceLabel: 'Jarak (km)',
      editDurationMinLabel: 'Durasi Bergerak (menit)',
      saveEditBtn: 'Simpan Perbaikan',
      deleteActivityBtn: 'Hapus Aktivitas Ini',
      confirmDeleteActivityBtn: 'Konfirmasi Hapus Aktivitas',
      cancelEditBtn: 'Batal',
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
      readinessHeading: 'Pemeriksaan Kesiapan Target vs Kemampuan Saat Ini',
      applyConservativeBtn: (pace) => `Pakai Pace Latihan Konservatif (${pace})`,
      goalVsTrainingNote:
        'Target race pace adalah sasaran hari lomba; zona latihan harian idealnya tetap bertumpu pada kemampuan saat ini.',
      statusActiveBadge: 'Rencana aktif',
      statusSimulationBadge: 'Simulasi—belum diterapkan',
    },
    shoeTracker: {
      heading: 'Pelacak Jarak Sepatu Lari (Shoe Mileage Tracker)',
      subtitle:
        'Pantau akumulasi jarak sepatu utama menuju batas kilometer yang Anda tetapkan (umumnya 600–800 km).',
      nameLabel: 'Nama / Model Sepatu Utama',
      namePlaceholder: 'Misal: Pegasus 41 / Novablast 4',
      currentKmLabel: 'Jarak Terpakai (km)',
      maxKmLabel: 'Batas Kilometer Anda (km)',
      maxKmHint: 'Rentang rekomendasi 200 – 2.000 km (standar 600–800 km)',
      usagePrefix: 'Terpakai',
      remainingPrefix: 'Sisa menuju batas',
      syncLatestRunBtn: (kmLabel) => `+ Tambah Sesi Terakhir (${kmLabel} km)`,
      add5KmBtn: '+ 5 km',
      resetNewShoeBtn: 'Reset Sepatu Baru',
      healthyBadge: 'Dalam Batas Kilometer Anda',
      warningBadge: 'Mendekati Batas Kilometer',
      replaceBadge: 'Melewati Batas — Perlu Cek Fisik',
      warningText:
        'Sepatu sudah melewati 80% batas kilometer yang Anda tetapkan. Evaluasi kondisi sol dan kenyamanan saat berlari.',
      replaceText:
        'Jarak tempuh sepatu sudah melewati batas yang Anda tetapkan. Pertimbangkan evaluasi fisik sepatu atau rotasi dengan pasangan lain.',
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
      planLifetime: 'PaceCraft Lifetime (Rp99.000 · Sekali bayar selamanya)',
      planPro: 'PaceCraft Essential (Rp59.000 · Akses 12 bulan)',
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
      planChooseLabel: '1. Pilih Paket PaceCraft',
      qrisSectionTitle: '2. Transfer via QRIS / Rekening',
      qrisSectionDesc: (planTitle, priceLabel) =>
        `Scan QRIS di bawah sebesar ${priceLabel} (${planTitle}), lalu klik tombol WhatsApp agar email Google dan paket Anda otomatis terisi.`,
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
      planLifetime: 'PaceCraft Lifetime (Rp99.000)',
      planPro: 'PaceCraft Essential 12 Bulan (Rp59.000)',
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
        rest: 'Hari istirahat atau tidak ada sesi lari tercatat',
        light: 'Sesi Easy / pemulihan singkat (< 6 km)',
        moderate: 'Sesi aerobik stabil (6–11,9 km) atau trail ringan',
        high: 'Menandakan sesi tempo atau lari jauh (12–17,9 km), bukan risiko cedera',
        peak: 'Menandakan sesi interval cepat atau long run ≥ 18 km (butuh pemulihan cukup)',
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
      metricComfort: 'Rasa',
    },
    landing: {
      navFeatures: 'Fitur',
      navDemo: 'Kalkulator Gratis',
      navPricing: 'Harga',
      navFaq: 'FAQ',
      navLoginBtn: 'Masuk',
      heroBadge: 'Perencana Lari 5K · 10K · 21K · 42K',
      heroTitle: 'Target lomba jelas. Latihan harian nggak bikin bingung.',
      heroSubtitle:
        'Susun rencana lari sesuai rutinitas dan riwayat latihanmu—dari 5K hingga maraton. Lihat latihan hari ini, catat progres, dan tetap pegang kendali saat rencana perlu diubah.',
      heroDemoCta: 'Coba Kalkulator Gratis',
      heroOpenDemoCta: 'Lihat Cara Kerjanya',
      heroBuyCta: 'Lihat Paket',
      heroImageAlt: 'Pelari pagi di jalur lari berlatar cahaya matahari terbit',
      trust1: 'Kalkulator pace tetap gratis',
      trust2: 'Impor Strava CSV/GPX tanpa langganan berbayar',
      trust3: 'Mulai Rp59.000/12 bln · atau Rp99.000 Lifetime',
      previewLabel: 'Pratinjau Ruang Kerja PaceCraft',
      previewTodayTag: 'Latihan Hari Ini · Selasa · Tempo Terkontrol',
      previewTodayHeadline: 'Hari ini, lari tempo',
      previewTodayMetrics: '6,2 km · Pace panduan 05:25–05:35/km',
      previewTodaySteps: 'Pemanasan 1,5 km · Inti 3,7 km Tempo · Pendinginan 1 km · ~36 mnt',
      previewTodayCue: 'Kunci ritme stabil di sesi inti—masih cukup terkontrol untuk 3–4 kata.',
      previewActivePlan: 'Target aktif: 10K · 4 hari/minggu',
      previewWeeklyTitle: 'Progres minggu ini',
      previewWeeklySessionLabel: 'Sesi selesai',
      previewWeeklySessionVal: '3 dari 4 selesai',
      previewWeeklyDistLabel: 'Jarak lari',
      previewWeeklyDistVal: '16,2 dari 26,1 km',
      previewWeeklyCrossLabel: 'Strength / istirahat',
      previewWeeklyCrossVal: '1 strength · 2 rest',
      showcaseHeading: 'Latihan Terstruktur ala Coach, Satu Manfaat per Bagian',
      showcaseSubtitle:
        'Setiap bagian punya peran jelas—mulai dari struktur sesi harian lengkap hingga proyeksi finis lomba dan riwayat larimu.',
      showcaseCards: [
        {
          badge: '01 · Jadwal Terstruktur',
          title: 'Blok 4 Minggu, Pemanasan–Inti & Strength',
          desc: 'Pilih target 5K–42K dan frekuensi lari. Tiap sesi dipecah jelas menjadi Pemanasan, Sesi Inti, Pendinginan, perkiraan durasi, plus panduan set & repetisi strength.',
        },
        {
          badge: '02 · Progres Mingguan',
          title: 'Catat Hasil & Pantau Beban Secara Terpisah',
          desc: 'Sesi lari, jarak aktual, rasa nyaman, dan latihan strength/istirahat dipisahkan rapi agar kamu mudah menilai konsistensi tanpa mencampur angka.',
        },
        {
          badge: '03 · Riwayat Strava',
          title: 'Impor CSV/GPX Gratis & Kalibrasi Baseline',
          desc: 'Unggah file ekspor Strava langsung di browser tanpa langganan berbayar untuk menyaring aktivitas non-lari dan menghitung pace dasar pribadi.',
        },
        {
          badge: '04 · Proyeksi & Perlengkapan',
          title: 'Proyeksi Finis, Kalender Intensitas & Sepatu',
          desc: 'Lihat estimasi waktu finis 5K–42K, peta intensitas bulanan, rekor PB, kilometer sepatu, ekspor kalender ponsel (.ics), dan kartu progres PNG.',
        },
      ],
      progressionNote:
        'Catatan pendekatan: saran kenaikan volume bertahap dan penyesuaian menjelang lomba bersifat panduan umum—selalu sesuaikan dengan riwayat latihan, rasa nyeri, dan pemulihan tubuhmu.',
      demoHeading: 'Lihat Cara Kerjanya & Coba Kalkulator Pace Gratis',
      demoSubtitle:
        'Tonton cuplikan singkat ruang kerja PaceCraft, lalu uji target waktu lombamu di kalkulator gratis tanpa perlu login.',
      demoOpenFullBtn: 'Lihat Cara Kerjanya',
      demoApplyCta: 'Masuk untuk Simpan Target & Buat Jadwal',
      demoAppliedHint:
        'Target pace Anda dicatat! Masuk dengan Akun Google di bawah untuk mulai menyusun jadwal mingguan.',
      videoDemoBadge: 'Cuplikan Rekaman Layar (Data Contoh 21K)',
      videoDemoTitle: 'Lihat Cara Kerja PaceCraft Sebelum Masuk',
      videoDemoDesc:
        'Tonton alur tiga fitur utama: Pelacakan Progres harian & kalender bulanan, Kalkulator Pace lomba, serta Sinkronisasi Strava CSV/GPX.',
      videoDemoFallback: 'Browser Anda tidak mendukung pemutaran video HTML5.',
      videoDemoChapters: [
        {
          id: 'progress',
          label: 'Pelacakan Progres',
          caption: 'Latihan hari ini, progres mingguan terpisah, dan kalender intensitas bulanan.',
          timeSec: 0,
        },
        {
          id: 'calculator',
          label: 'Kalkulator Pace',
          caption: 'Hitung target pace 5K–42K, zona latihan terpadu, dan cek kesiapan pelari.',
          timeSec: 9,
        },
        {
          id: 'strava',
          label: 'Sinkronisasi Strava',
          caption: 'Impor file CSV/GPX Strava gratis di browser lengkap dengan peta rute & deteksi anomali.',
          timeSec: 25,
        },
      ],
      pricingHeading: 'Pilih Paket yang Sesuai Ritme Latihanmu',
      pricingSubtitle:
        'Mulai dengan PaceCraft Essential Rp59.000 untuk 12 bulan, atau pilih PaceCraft Lifetime Rp99.000 sekali bayar selamanya. Kalkulator pace publik tetap gratis.',
      pricingBestValueBadge: 'Paling Hemat · Selamanya',
      pricingFooterNote: 'Sekali bayar sesuai paket · Tanpa tagihan bulanan.',
      comparisonTableHeading: 'Perbandingan Essential vs Lifetime',
      comparisonFeatureHeader: 'Fitur Utama',
      comparisonIncludedLabel: 'Termasuk',
      comparisonNotIncludedLabel: 'Tidak termasuk',
      selectedPlanHint: (planTitle, priceLabel) =>
        `Paket aktif: ${planTitle} (${priceLabel}). Masuk dengan Akun Google untuk melanjutkan pembayaran QRIS atau aktivasi akses.`,
      alreadyBoughtToggleLabel: 'Sudah membeli? Aktifkan akses',
      photoSectionTitle: 'Latihan terukur, mulai dari satu sesi hari ini.',
      photoSectionDesc:
        'Coba kalkulator gratisnya lebih dulu, pilih paket Essential 12 bulan atau Lifetime, lalu aktifkan aksesmu lewat Google.',
      faqHeading: 'Pertanyaan yang Sering Diajukan',
      faqSubtitle: 'Jawaban singkat sebelum kamu memulai latihan bersama PaceCraft.',
      faqItems: [
        {
          q: 'Kalau aku coba kalkulator, apakah rencana aktif berubah?',
          a: 'Tidak. Mengubah jarak atau waktu di kalkulator halaman depan maupun menu Simulasi Target hanya bersifat simulasi dan tidak mengubah rencana aktif kecuali kamu menyimpannya.',
        },
        {
          q: 'Apakah wajib punya langganan Strava berbayar (Strava Subscription)?',
          a: 'Tidak wajib. Pada paket Lifetime kamu cukup mengunggah file activities.csv atau .gpx hasil ekspor akun Strava gratis langsung di browser.',
        },
        {
          q: 'Apa beda paket Rp59.000 (12 bulan) dan Rp99.000 (Lifetime)?',
          a: 'Essential (Rp59.000) memberi akses 12 bulan ke rencana terstruktur 5K–42K, struktur Warm-up/Inti/Cool-down, strength, dan check-in harian. Lifetime (Rp99.000) bayar sekali selamanya plus impor Strava CSV/GPX, proyeksi finis, kalender intensitas, pelacak sepatu, dan ekspor .ics—keduanya tanpa perpanjangan otomatis.',
        },
        {
          q: 'Apakah bisa dipakai di HP seperti aplikasi?',
          a: 'Ya. PaceCraft mendukung mode PWA (Progressive Web App) sehingga bisa dipasang ke layar utama HP lewat Chrome Android atau Safari iPhone.',
          hasPwaAction: true,
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
      heading: 'Perkiraan Terbaik dari Aktivitas (Personal Best)',
      subtitle: 'Tinjau perkiraan waktu tercepat 5K hingga 42K dari aktivitas larimu, lalu konfirmasi atau ubah manual.',
      detectBtn: 'Pindai dari Riwayat Lari',
      detectedNotice: (count) => `Menemukan ${count} perkiraan waktu terbaik dari riwayat aktivitasmu.`,
      noRunsDetectedNotice: 'Belum ditemukan aktivitas lari di rentang jarak lomba (5K/10K/21K/42K) yang lebih cepat dari catatan saat ini.',
      clearBtn: 'Hapus',
      overviewLabel: 'Perkiraan Terbaik Tercatat',
      placeholder: 'mm:dd atau j:mm:dd',
      saveHint: 'Format waktu: mm:dd (contoh 24:30) atau j:mm:dd (contoh 1:52:10). Kosongkan untuk menghapus.',
      invalidHint: 'Format belum valid. Gunakan mm:dd atau j:mm:dd (minimal 10 menit).',
    },
  },
  en: {
    nav: {
      mainAriaLabel: 'Main navigation',
      mobileAriaLabel: 'Mobile quick navigation',
      profileBmi: 'Profile',
      trainingPlan: 'Plan',
      nutrition: 'Eat & Recover',
      dailyProgress: 'Progress',
      stravaHistory: 'Run History',
      buildMenuCta: 'Build Plan',
      languageGroupLabel: 'Select language',
      idButton: 'ID',
      enButton: 'EN',
    },
    sidebar: {
      ariaLabel: 'PaceCraft feature menu',
      openMenuAria: 'Open sidebar menu',
      closeMenuAria: 'Close sidebar menu',
      workspaceCaption: 'Running Training Planner',
      items: {
        overview: { label: 'Today', hint: "Today's workout & progress" },
        training: { label: 'Plan', hint: 'Weekly schedule & goal sim' },
        progress: { label: 'Progress', hint: 'Logs, calendar & history' },
        profile: { label: 'Profile', hint: 'Runner profile, stats & shoes' },
        nutrition: { label: 'Eat & Recover', hint: 'Daily fueling & hydration' },
        strava: { label: 'Run History', hint: 'CSV/GPX import & charts' },
      },
    },
    overview: {
      greetingTitle: 'Ready for today’s run? Start with one clear step.',
      greetingSubtitle:
        'Your workout today, weekly progress, and active goal in one calm view.',
      quickPlanBtn: 'Edit Goal',
      quickLogBtn: 'Log Result',
      todaySectionLabel: "Today's Workout",
      todayDoneBadge: 'Done',
      todayRestDesc:
        'Today is a recovery day so your legs rebuild stronger. A light walk or gentle stretch is plenty.',
      todayQuickLogBtn: 'Log Result',
      todayViewProgressBtn: 'View in Progress',
      todayViewPlanBtn: 'View plan',
      todayLookWorkoutBtn: 'View Workout',
      activePlanLabel: 'Active goal',
      paceGuidePrefix: 'Target pace',
      todayWarmHeadlines: {
        easy: 'Easy run today',
        tempo: 'Tempo run today',
        interval: 'Interval session today',
        long: 'Long run today',
        rest: 'Rest & recovery day today',
        strength: 'Strength & mobility today',
      },
      cards: {
        trainingTitle: 'Running Plan',
        trainingAction: 'View plan',
        progressTitle: 'This Week Progress',
        progressAction: 'Log / Calendar',
        profileTitle: 'Runner Profile',
        profileAction: 'Open Profile',
        nutritionTitle: 'Eat & Recover',
        nutritionAction: 'View Guide',
      },
      stravaEmptyBanner:
        'New to PaceCraft? Load sample runs so your weekly baseline calibrates automatically.',
      stravaLoadSampleShort: 'Try Sample Runs',
      extraMetricsHeading: 'Additional Summary',
      weeklyProgressRunSessions: 'Completed sessions',
      weeklyProgressDistance: 'Run distance',
      weeklyProgressCrossTrain: 'Strength / rest',
      overloadAlertTitle: 'Actual distance well above plan (>115%)',
      overloadAlertBody: (pct) =>
        `This week's running distance is already at ${pct}% of plan. Review total training load and prioritize recovery.`,
      carbsShort: 'Carbs',
      proteinShort: 'Protein',
      estVo2Short: 'Est. VO2',
      hydrationEstPrefix: 'Initial est.',
      weeklyTitle: 'This week progress',
      activeGoalTitle: 'Active goal',
      viewPlanLink: 'View plan',
      editGoalLink: 'Edit goal',
      nutritionLink: 'Eat & Recover Guide',
      daysToRaceText: (days) => `${days} days to race`,
      todayStructureLabel: "Today's session breakdown",
      estDurationUnit: 'min',
      predictedFinishPrefix: 'Projected finish',
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
      heading: 'Runner Profile',
      subtitle:
        'Manage your runner details, performance metrics, shoes, and account settings.',
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
      resultLabel: 'Body Mass Index',
      categoryPrefix: 'Category',
      maxIncreaseLabel: 'Initial Build Suggestion/Wk',
      maxPrefix: 'Guide',
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
        body: 'Runner Profile',
        hr: 'Performance',
        shoes: 'Shoes',
        account: 'Settings',
        admin: 'Owner Admin',
      },
      helperTip:
        'BMI alone does not determine safe weekly mileage growth. Always adjust to your training history, recovery, soreness, and body response.',
      vo2NonLabDisclaimer:
        'Non-lab fitness estimate (not a substitute for clinical VO2max testing). Values shift with true HRmax, fatigue, heat, hills, and sleep.',
      vo2MethodResting: 'Source: Uth formula (15.3 × HRmax / HRrest)',
      vo2MethodBlended: 'Source: Blended Uth ratio & submaximal Strava Speed–HR',
      shoeDisclaimer:
        'Note: Shoe mileage alone does not guarantee midsole condition or prevent injury. Also inspect outsole wear, responsiveness, and landing comfort.',
      bmiOptionalTitle: 'Body Mass Index (optional)',
      bmiOptionalSubtitle:
        'Used only as an initial volume/easy-pace baseline guide. Does not replace medical evaluation or recovery signals.',
      metricsOverviewTitle: 'Body & Fitness Metrics',
      editBmiAction: 'Adjust Weight & BMI',
      editVo2Action: 'Adjust HR & Performance',
      nonEssentialHint:
        'Supporting estimates kept in Profile so your dashboard stays focused on today’s run.',
    },
    training: {
      heading: 'Running Plan',
      subtitlePrefix: 'Calibrated to your 4-week average volume (',
      weekUnit: 'km/wk',
      subtitleMiddle: ') and baseline pace',
      defaultBaselineTag: ' (default baseline)',
      stravaBaselineTag: ' (from Strava history)',
      step1Title: '1. Choose Target Race Distance',
      raceGroupAria: 'Target race distance',
      step2Title: '2. Running Days per Week',
      freqGroupAria: 'Weekly training days frequency',
      daysPerWeekShort: 'days/wk',
      totalPlannedLabel: 'Planned weekly total:',
      paceZonesHeading: 'Training Pace Zones',
      progressionHeading: '4-Week Volume Progression',
      progressionDescPrefix: 'Initial build suggestion up to',
      progressionDescSuffix:
        'per week, with a recovery cutback (-20%) on week 4. Adjust to recovery and body response.',
      scheduleHeadingPrefix: 'Weekly Schedule',
      activeDaysUnit: 'running days',
      restLabel: 'Rest',
      loggedBtn: '✓ Done',
      logCompleteBtn: 'Log Result',
      taperNoticeTitle: 'Tapering Phase Adjustment',
      taperNoticeBody: (days, reductionPct, eventLabel) =>
        `${days} days left until ${eventLabel}. Volume is trimmed by ${reductionPct}% so legs stay fresh.`,
      raceWeekNoticeTitle: 'Race Week Adjustment',
      raceWeekNoticeBody: (days, eventLabel) =>
        `Only ${days} days left until ${eventLabel}. Workouts shift to relaxed shakeout runs.`,
      raceDayNoticeTitle: 'Race Day Has Arrived!',
      raceDayNoticeBody: (eventLabel) =>
        `Today is ${eventLabel}. Keep your warm-up calm and enjoy your race.`,
      strengthHeaderTag: (count) =>
        count > 0 ? `· ${count}x Strength Training` : '',
      strengthBadgePrefix: 'Strength & Mobility',
      minuteShort: 'min',
      viewScheduleTab: 'This week',
      viewZonesTab: 'Program progress',
      viewSimulatorTab: 'Goal Simulator',
      customPaceBadge: 'Simulated Target Active',
      resetCustomPaceBtn: 'Use Strava Baseline',
      baselineVolumeChip: 'Baseline Volume',
      baselinePaceChip: 'Baseline Pace',
      strengthToggleShow: 'Show exercises',
      strengthToggleHide: 'Hide exercises',
      exportIcsBtn: 'Save to Phone Calendar (.ics)',
      exportedIcsNotice: 'Schedule .ics file downloaded for Google or Apple Calendar.',
      paceBasisLabel: 'Pace Zone Basis',
      paceBasisTags: {
        race_goal: 'Applied Goal Pace',
        strava_baseline: '30-Day Strava Baseline',
        default: 'Default Baseline',
      },
      adaptiveHeading: 'Fatigue Adjustment',
      adaptiveToggleLabel: 'Recovery Mode (Feeling Heavy)',
      adaptiveToggleHint:
        'When enabled, remaining Tempo/Interval sessions switch to Easy Run and weekly distance eases back 15–20%.',
      adaptiveStatusNormal: 'Plan running normally',
      adaptiveAdjustCta: 'Feeling heavy? Adjust training',
      planHeading: (race) => `Your ${race} plan`,
      planMetaLine: (days, raceDateLabel) =>
        `${days} running days/week · Target race ${raceDateLabel}`,
      editPlanBtn: 'Edit plan',
      previewHeading: 'Preview plan changes',
      confirmPlanBtn: 'Confirm & Save Plan',
      cancelEditPlanBtn: 'Cancel',
      basisDisclosureLabel: 'Recommendation basis',
      nutritionLinkLabel: 'View Eat & Recover guide',
      blockWeeksHeading: '4-Week Block',
      weekChipLabel: (weekNumber) => `Week ${weekNumber}`,
      activeWeekTag: 'Current week',
      weeklyMixSummary: (easyCount, qualityCount, longCount, strengthCount) => {
        const parts = [`${easyCount} Easy`];
        if (qualityCount > 0) parts.push(`${qualityCount} Quality/Tempo`);
        if (longCount > 0) parts.push(`${longCount} Long Run`);
        if (strengthCount > 0) parts.push(`${strengthCount} Strength`);
        return parts.join(' · ');
      },
      workoutStepsHeading: 'Workout Steps',
      coachCueLabel: 'Coach cue',
      estDurationShort: (min) => `~${min} min`,
      predictorHeading: 'Race Finish Predictor (5K–42K)',
      predictorSubtitle:
        'Riegel equivalent finish estimates based on your current baseline pace to sanity-check race targets.',
      predictorDisclaimer:
        'Predictions are mathematical estimates; race-day performance depends on long-run endurance, terrain, weather, and recovery.',
      predictorCurrentTargetBadge: 'Active goal',
      zoneLabels: {
        easy: 'Easy Run',
        tempo: 'Tempo',
        interval: 'Interval',
        long_run: 'Long Run',
        rest: 'Rest',
      },
    },
    nutrition: {
      headingPrefix: 'Eat & Recover',
      subtitleBeforeWeight:
        'Practical fueling around runs so energy and recovery stay steady (reference weight',
      subtitleAfterWeight: ').',
      carbsLabel: 'Daily Carbohydrates',
      carbsUnitNote: 'g/kg BW · Primary fuel',
      proteinLabel: 'Recovery Protein',
      proteinUnitNote: 'g/kg BW · Muscle repair',
      hydrationLabel: 'Daily Hydration',
      hydrationUnitNote:
        'Initial water & electrolyte estimate (adjust for heat & sweat)',
      strategyHeadingPrefix: 'Daily Practical Guide',
      examplesLabel: 'Examples:',
      practicalHeading: 'Practical Fueling Around Your Runs',
      macroToggleShow: 'View daily intake estimate ▾',
      macroToggleHide: 'Hide daily intake estimate ▴',
      macroCalcNote:
        'Numbers above are rough estimates from weight and race target—not a strict medical prescription.',
    },
    dailyProgress: {
      heading: 'Progress & Intensity Calendar',
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
      logSectionPrefix: 'Log Result',
      targetLabel: 'Target:',
      actualDistanceLabel: 'Actual Distance (km)',
      comfortLabel: 'How Did It Feel?',
      comfortGroupAria: 'Session feel rating',
      comfortScoreAria: 'Feel score',
      comfortRatings: {
        1: 'Hard',
        2: 'Hard',
        3: 'Steady',
        4: 'Comfortable',
        5: 'Comfortable',
      },
      feelSimpleOptions: {
        hard: 'Hard',
        steady: 'Steady',
        comfy: 'Comfortable',
      },
      noteLabel: 'Quick Note (optional)',
      notePlaceholder:
        'E.g., Easy breathing, legs felt light on the final kilometer',
      saveBtn: 'Save Result',
      savedFeedback: (dayName, title) =>
        `Result for ${dayName} (${title}) saved.`,
      savedLogsHeading: 'Saved Check-In History',
      emptyLogsBeforeBtn: 'No daily sessions logged yet. Pick a day and click',
      emptyLogsBtnName: 'Save Result',
      emptyLogsAfterBtn: 'to start tracking.',
      feelingPrefix: 'Feel',
      deleteLogAria: 'Delete log',
      quickLogDefaultNote: 'Completed per plan',
      stravaSyncTitle: (count) =>
        `${count} recent Strava runs ready to match into Progress`,
      stravaSyncDesc:
        'Automatically maps matching run distances from your Strava history to the right weekday without overwriting manual entries.',
      stravaSyncBtn: (count) => `Sync from Strava (${count} runs)`,
      stravaSyncSuccess: (count) =>
        `${count} Strava runs matched into Progress.`,
      stravaSyncedTag: 'Strava Sync',
      paceInputLabel: 'Pace (min:sec/km)',
      paceInputPlaceholder: 'E.g., 06:15',
      hrInputLabel: 'Heart Rate (bpm)',
      hrInputPlaceholder: 'E.g., 148',
      avgPaceLabel: 'Avg Pace',
      avgHrLabel: 'Avg HR',
      shareBtn: 'Share Progress',
      optionalDetailsShow: 'Add pace, heart rate & note (optional)',
      optionalDetailsHide: 'Hide extra details',
      jumpToCalendarBtn: 'View Monthly Calendar',
      streakRestNote:
        'Scheduled rest days preserve your streak (daily running is not required).',
      runSessionsLabel: 'Run sessions',
      runDistanceLabel: 'Run distance',
      strengthRestSummary: (crossCount, restCount) =>
        `Extra logs this week: ${crossCount} strength/mobility · ${restCount} logged rest days`,
      overloadCautionBanner: (pct, plannedKm, actualKm) =>
        `Load & recovery check: logged running distance this week (${actualKm} km) is ${pct}% of plan (${plannedKm} km). Review load and prioritize recovery.`,
      subTabCheckInCalendar: 'Check-In & Calendar',
      subTabRunHistory: 'Run History',
      historyToggleShow: 'View check-in history',
      historyToggleHide: 'Hide check-in history',
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
      provenanceToggle: 'How imported data is parsed, filtered & used',
      provenanceItems: [
        {
          title: 'Moving Time vs Elapsed Time',
          body: 'Session pace is derived from Distance ÷ Moving Time so stoplights or water breaks do not skew effort. Total Elapsed Time remains visible in activity details.',
        },
        {
          title: 'Volume vs Baseline Pace',
          body: '4-week volume uses all valid running distances, while 30-day baseline pace averages only recent runs with plausible paces (02:20–30:00/km).',
        },
        {
          title: 'Non-Runs, Duplicates & Trails',
          body: 'Cycling, swimming, walking, and duplicate IDs/timestamps are filtered automatically. Trail runs count toward volume, though steep terrain naturally yields slower paces than road runs.',
        },
        {
          title: 'Average Pace ≠ Race Capability',
          body: 'Your 30-day average pace blends easy runs, long runs, and recovery—it is not automatically your peak race pace.',
        },
      ],
      flaggedAnomalyBanner: (count) =>
        `${count} activities need review · Some pace values look unrealistic and are excluded from related recommendations.`,
      anomalyBadge: 'Needs Review',
      flaggedBannerCompact: (count) =>
        `${count} activities need review · Some pace values look unrealistic and are excluded from related recommendations.`,
      reviewAnomaliesBtn: 'Review Activities',
      showAllRunsBtn: 'Show all',
      weeklyAvgSummaryLabel: 'Weekly distance average',
      thirtyDayTotalSummaryLabel: '30-day total distance',
      sessionsCountLabel: 'Session count',
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
      anomalyTitle: 'Activity Data Needs Review',
      anomalyBody: (computedPace, reportedPace, reason) =>
        reportedPace && reportedPace !== computedPace
          ? `The source speed column implied ${reportedPace}, whereas distance ÷ moving time yields ${computedPace}. PaceCraft displays ${computedPace} and excludes it from calibration.`
          : reason === 'speed_distance_mismatch'
            ? `The source speed column disagreed with distance and moving time (${computedPace}). You can correct distance/time below or remove this activity.`
            : `Distance ÷ moving time yields ${computedPace}, outside normal running bounds. Fix distance/time below or delete this entry.`,
      editSectionHeading: 'Fix Distance or Moving Time',
      editDistanceLabel: 'Distance (km)',
      editDurationMinLabel: 'Moving Time (minutes)',
      saveEditBtn: 'Save Fix',
      deleteActivityBtn: 'Delete This Activity',
      confirmDeleteActivityBtn: 'Confirm Delete Activity',
      cancelEditBtn: 'Cancel',
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
      readinessHeading: 'Goal Pace vs Current Readiness Check',
      applyConservativeBtn: (pace) => `Use Conservative Training Pace (${pace})`,
      goalVsTrainingNote:
        'Goal race pace is what you aim for on race day; daily training zones should reflect your current readiness.',
      statusActiveBadge: 'Active plan',
      statusSimulationBadge: 'Simulation—not applied yet',
    },
    shoeTracker: {
      heading: 'Shoe Mileage Tracker',
      subtitle:
        'Track logged mileage on your primary running shoe toward your own mileage limit (typically 600–800 km).',
      nameLabel: 'Primary Shoe Model / Name',
      namePlaceholder: 'E.g., Pegasus 41 / Novablast 4',
      currentKmLabel: 'Logged Distance (km)',
      maxKmLabel: 'Your Mileage Limit (km)',
      maxKmHint: 'Recommended range 200 – 2,000 km (typical 600–800 km)',
      usagePrefix: 'Used',
      remainingPrefix: 'Remaining to limit',
      syncLatestRunBtn: (kmLabel) => `+ Add Latest Run (${kmLabel} km)`,
      add5KmBtn: '+ 5 km',
      resetNewShoeBtn: 'Reset for New Shoe',
      healthyBadge: 'Within Your Mileage Limit',
      warningBadge: 'Approaching Your Limit',
      replaceBadge: 'Past Limit — Inspect Shoe',
      warningText:
        'Your shoe has passed 80% of the mileage limit you set. Inspect outsole wear and ride comfort.',
      replaceText:
        'Shoe mileage has reached your configured limit. Consider inspecting the shoe physically or rotating in another pair.',
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
      planLifetime: 'PaceCraft Lifetime (Rp99.000 · One-time forever)',
      planPro: 'PaceCraft Essential (Rp59.000 · 12-month access)',
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
      planChooseLabel: '1. Choose PaceCraft Plan',
      qrisSectionTitle: '2. Pay via QRIS / Bank Transfer',
      qrisSectionDesc: (planTitle, priceLabel) =>
        `Scan the QRIS code below for ${priceLabel} (${planTitle}), then tap WhatsApp so your Google email and selected plan are pre-filled.`,
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
      planLifetime: 'PaceCraft Lifetime (Rp99.000)',
      planPro: 'PaceCraft Essential 12 Months (Rp59.000)',
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
        rest: 'Rest day or no running sessions logged',
        light: 'Short Easy / recovery effort (< 6 km)',
        moderate: 'Steady aerobic run (6–11.9 km) or light trail',
        high: 'Indicates tempo effort or 12–17.9 km run (not injury risk)',
        peak: 'Indicates speed intervals or ≥ 18 km long run (plan recovery after)',
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
      metricComfort: 'Feel',
    },
    landing: {
      navFeatures: 'Features',
      navDemo: 'Free Calculator',
      navPricing: 'Pricing',
      navFaq: 'FAQ',
      navLoginBtn: 'Sign In',
      heroBadge: '5K · 10K · 21K · 42K Running Planner',
      heroTitle: 'Clear race goals. Daily workouts without the guesswork.',
      heroSubtitle:
        'Build a running schedule around your routine and past runs—from 5K to marathon. See today’s workout, log progress, and stay in control when plans need to adjust.',
      heroDemoCta: 'Try Free Calculator',
      heroOpenDemoCta: 'See How It Works',
      heroBuyCta: 'View Plan',
      heroImageAlt: 'Runner jogging at sunrise along a calm running path',
      trust1: 'Public pace calculator stays free',
      trust2: 'Strava CSV/GPX import without paid Strava',
      trust3: 'From Rp59.000/12 mos · or Rp99.000 Lifetime',
      previewLabel: 'PaceCraft Workspace Preview',
      previewTodayTag: "Today's Workout · Tuesday · Controlled Tempo",
      previewTodayHeadline: 'Tempo run today',
      previewTodayMetrics: '6.2 km · Target pace 05:25–05:35/km',
      previewTodaySteps: 'Warm-up 1.5 km · Main 3.7 km Tempo · Cool-down 1 km · ~36 min',
      previewTodayCue: 'Lock into a smooth threshold rhythm—comfortable for 3–4 word cues.',
      previewActivePlan: 'Active goal: 10K · 4 days/week',
      previewWeeklyTitle: 'This week progress',
      previewWeeklySessionLabel: 'Completed sessions',
      previewWeeklySessionVal: '3 of 4 done',
      previewWeeklyDistLabel: 'Run distance',
      previewWeeklyDistVal: '16.2 of 26.1 km',
      previewWeeklyCrossLabel: 'Strength / rest',
      previewWeeklyCrossVal: '1 strength · 2 rest',
      showcaseHeading: 'Coach-Style Structured Training, One Clear Benefit per Section',
      showcaseSubtitle:
        'Every piece of PaceCraft stays focused—from daily structured blocks to race finish predictions and run history calibration.',
      showcaseCards: [
        {
          badge: '01 · Structured Blocks',
          title: '4-Week Blocks, Warm-up/Main Steps & Strength',
          desc: 'Pick 5K–42K targets and your weekly days. Every workout breaks down into Warm-up, Main Set, Cool-down, estimated time, plus sets × reps strength work.',
        },
        {
          badge: '02 · Weekly Progress',
          title: 'Log Workouts & Track Load Separately',
          desc: 'Run sessions, actual kilometers, comfort ratings, and strength/rest days stay clearly separated so you can review consistency without mixed numbers.',
        },
        {
          badge: '03 · Strava History',
          title: 'Free Browser CSV/GPX Import & Baseline',
          desc: 'Upload your Strava archive directly in the browser—filters non-runs automatically and calibrates your personal training baseline without a paid Strava subscription.',
        },
        {
          badge: '04 · Predictions & Gear',
          title: 'Finish Predictor, Intensity Calendar & Shoes',
          desc: 'See 5K–42K projected finish times, monthly intensity heatmaps, PB records, shoe mileage, phone calendar (.ics) export, and PNG progress cards.',
        },
      ],
      progressionNote:
        'Approach note: gradual weekly volume guidelines and pre-race tapering are general planning aids—always adapt to your training history, soreness, and recovery.',
      demoHeading: 'See How It Works & Try the Free Pace Calculator',
      demoSubtitle:
        'Watch a quick walkthrough of the PaceCraft workspace, then test your race goal in the free pace calculator with no sign-in needed.',
      demoOpenFullBtn: 'See How It Works',
      demoApplyCta: 'Sign In to Save Target & Build Plan',
      demoAppliedHint:
        'Target pace noted! Sign in with Google below to start building your weekly running schedule.',
      videoDemoBadge: 'Screen Recording Preview (21K Sample Data)',
      videoDemoTitle: 'See How PaceCraft Works Before You Sign In',
      videoDemoDesc:
        'Watch a quick walkthrough of the three core workflows: Progress Tracking & Monthly Calendar, Race Pace Calculator, and Strava CSV/GPX Sync.',
      videoDemoFallback: 'Your browser does not support HTML5 video playback.',
      videoDemoChapters: [
        {
          id: 'progress',
          label: 'Progress Tracking',
          caption: 'Today’s Workout centerpiece, separated weekly volume, and monthly intensity calendar.',
          timeSec: 0,
        },
        {
          id: 'calculator',
          label: 'Pace Calculator',
          caption: 'Convert 5K–42K goals into unified Easy, Tempo, and Interval training zones.',
          timeSec: 9,
        },
        {
          id: 'strava',
          label: 'Strava Sync',
          caption: 'Import Strava CSV/GPX files right in your browser with route previews and anomaly checks.',
          timeSec: 25,
        },
      ],
      pricingHeading: 'Choose the Plan That Fits Your Training Rhythm',
      pricingSubtitle:
        'Start with Essential at Rp59.000 for 12 months, or lock in Lifetime at Rp99.000 one-time forever. The public pace calculator remains free anytime.',
      pricingBestValueBadge: 'Best Value · Lifetime',
      pricingFooterNote: 'One-time payment per tier · Zero auto-renewals.',
      comparisonTableHeading: 'Essential vs Lifetime Comparison',
      comparisonFeatureHeader: 'Feature',
      comparisonIncludedLabel: 'Included',
      comparisonNotIncludedLabel: 'Not included',
      selectedPlanHint: (planTitle, priceLabel) =>
        `Active plan: ${planTitle} (${priceLabel}). Sign in with Google to continue QRIS payment or license activation.`,
      alreadyBoughtToggleLabel: 'Already purchased? Activate access',
      photoSectionTitle: 'Consistent training starts with today’s run.',
      photoSectionDesc:
        'Test the free calculator first, pick Essential (12 months) or Lifetime, and unlock your workspace with Google.',
      faqHeading: 'Frequently Asked Questions',
      faqSubtitle: 'Quick answers before you start training with PaceCraft.',
      faqItems: [
        {
          q: 'If I test the calculator, does my active plan change?',
          a: 'No. Changing distances or finish times in the public calculator or Goal Simulator never alters your active training plan unless you confirm saving it.',
        },
        {
          q: 'Do I need a paid Strava Subscription?',
          a: 'Not at all. On the Lifetime plan, simply export activities.csv or .gpx files from a free Strava account and import them directly in your browser.',
        },
        {
          q: 'What is the difference between Rp59.000 (12 months) and Rp99.000 (Lifetime)?',
          a: 'Essential (Rp59.000) unlocks 12 months of structured 5K–42K plans, Warm-up/Main/Cool-down steps, strength sessions, and daily check-ins. Lifetime (Rp99.000) is a one-time forever unlock adding Strava CSV/GPX import, 5K–42K finish predictor, monthly intensity calendar, shoe mileage, and .ics calendar export—zero auto-renewals on either plan.',
        },
        {
          q: 'Can I use it like a mobile app on my phone?',
          a: 'Yes. PaceCraft supports PWA mode so you can add it to your phone home screen via Android Chrome or iPhone Safari.',
          hasPwaAction: true,
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
      heading: 'Estimated Bests from Activities (Personal Best)',
      subtitle: 'Review your fastest estimated times across 5K to 42K from your activity history, then confirm or edit manually.',
      detectBtn: 'Scan from Run History',
      detectedNotice: (count) => `Found ${count} fastest estimated time(s) from your run history.`,
      noRunsDetectedNotice: 'No runs found within race distances (5K/10K/21K/42K) faster than your current saved estimates.',
      clearBtn: 'Clear',
      overviewLabel: 'Estimated Best Records',
      placeholder: 'mm:ss or h:mm:ss',
      saveHint: 'Time format: mm:ss (e.g. 24:30) or h:mm:ss (e.g. 1:52:10). Leave blank to clear.',
      invalidHint: 'Invalid time format. Use mm:ss or h:mm:ss (at least 10 minutes).',
    },
  },
};
