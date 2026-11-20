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
      workspaceCaption: 'Perencana Lari Terpadu',
      items: {
        overview: { label: 'Ringkasan', hint: 'Target & snapshot mingguan' },
        training: { label: 'Menu Latihan', hint: 'Jadwal, pace & strength' },
        progress: { label: 'Progres Harian', hint: 'Check-in, pace, HR & share' },
        profile: { label: 'Profil & HR', hint: 'BMI, zona HR & VO2max' },
        nutrition: { label: 'Nutrisi', hint: 'Karbo, protein & hidrasi' },
        strava: { label: 'Riwayat Strava', hint: 'Impor CSV/GPX & grafik' },
      },
    },
    overview: {
      greetingTitle: 'Fokus latihan hari ini, satu langkah demi satu langkah.',
      greetingSubtitle:
        'Pilih fitur di sidebar kiri untuk mengatur menu, mencatat progres harian, atau meninjau riwayat lari Anda.',
      quickPlanBtn: 'Lihat Menu Latihan',
      quickLogBtn: 'Catat Progres Hari Ini',
      cards: {
        trainingTitle: 'Rencana Mingguan',
        trainingAction: 'Buka Menu',
        progressTitle: 'Capaian Minggu Ini',
        progressAction: 'Catat Sesi',
        profileTitle: 'Kondisi Tubuh & VO2max',
        profileAction: 'Atur Profil & HR',
        nutritionTitle: 'Kebutuhan Nutrisi',
        nutritionAction: 'Panduan Makan',
      },
      stravaEmptyBanner:
        'Belum ada riwayat Strava? Muat data contoh untuk mengkalibrasi pace dasar Anda secara otomatis.',
      stravaLoadSampleShort: 'Muat Contoh Strava',
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
      heading: 'Profil Tubuh & Pengaman BMI',
      subtitle:
        'Menghitung Indeks Massa Tubuh otomatis untuk menyesuaikan proporsi Easy Run dan batas aman kenaikan volume mingguan Anda.',
      methodLabel: 'Metode Perhitungan',
      weightHeightBtn: 'Berat & Tinggi',
      directBmiBtn: 'BMI Langsung',
      weightLabel: 'Berat Badan (kg)',
      weightHint: 'Rentang 30 – 200 kg',
      heightLabel: 'Tinggi Badan (cm)',
      heightHint: 'Rentang 120 – 230 cm',
      directBmiLabel: 'Nilai BMI Langsung',
      ageLabel: 'Usia (tahun)',
      injuryLabel: 'Status Cedera',
      injuryOptions: {
        none: 'Tidak ada cedera (Bugar)',
        recovering: 'Pemulihan ringan',
        active: 'Cedera aktif / nyeri sendi',
      },
      resultLabel: 'Hasil Kalkulasi BMI Anda',
      categoryPrefix: 'Kategori',
      maxIncreaseLabel: 'Batas Kenaikan/Minggu',
      maxPrefix: 'Maks',
      extraEasyLabel: 'Tambahan Porsi Easy',
      hrSectionTitle: 'Pelacakan Detak Jantung (HR) & Estimasi VO2max',
      hrSectionSubtitle:
        'Pantau detak jantung istirahat, zona latihan Karvonen (Z1–Z5), dan perkiraan kebugaran aerobik VO2max Anda.',
      restingHrLabel: 'HR Istirahat (bpm)',
      restingHrHint: 'Ukur saat bangun tidur (35–110 bpm)',
      maxHrLabel: 'HR Maksimal (bpm, opsional)',
      maxHrPlaceholder: 'Otomatis',
      maxHrAutoHint: (autoVal) => `Otomatis Tanaka: ${autoVal} bpm`,
      vo2MaxLabel: 'Estimasi VO2max',
      vo2MaxUnit: 'ml/kg/mnt',
      avgObservedHrLabel: 'Rata-rata HR Terpantau',
      noObservedHrYet: 'Catat HR di log harian atau impor Strava',
      hrZonesTitle: '5 Zona Detak Jantung Latihan Anda',
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
      viewZonesTab: 'Zona Pace & Progresi 4 Minggu',
      zoneLabels: {
        easy: 'Easy Pace',
        tempo: 'Tempo Pace',
        interval: 'Interval',
        long_run: 'Long Run',
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
          title: '1. Isolasi Ketat per Akun Google',
          body: 'Profil tubuh, target lomba, log progres harian, dan riwayat lari Anda hanya dapat dibaca dan diubah oleh UID akun Google Anda sendiri melalui aturan keamanan server Firestore.',
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
      workspaceCaption: 'Guided Running Planner',
      items: {
        overview: { label: 'Overview', hint: 'Race target & weekly snapshot' },
        training: { label: 'Training Plan', hint: 'Schedule, pace & strength' },
        progress: { label: 'Daily Progress', hint: 'Log pace, HR & share' },
        profile: { label: 'Profile & HR', hint: 'BMI, HR zones & VO2max' },
        nutrition: { label: 'Nutrition', hint: 'Carbs, protein & hydration' },
        strava: { label: 'Strava History', hint: 'CSV/GPX import & charts' },
      },
    },
    overview: {
      greetingTitle: 'Stay focused on today, one comfortable kilometer at a time.',
      greetingSubtitle:
        'Pick any tool from the sidebar to customize your plan, log today’s run, or review your Strava history.',
      quickPlanBtn: 'Open Training Plan',
      quickLogBtn: "Log Today's Progress",
      cards: {
        trainingTitle: 'Weekly Plan',
        trainingAction: 'Open Plan',
        progressTitle: 'Weekly Progress',
        progressAction: 'Log Session',
        profileTitle: 'Body & VO2max',
        profileAction: 'Edit Profile & HR',
        nutritionTitle: 'Daily Fueling',
        nutritionAction: 'View Guide',
      },
      stravaEmptyBanner:
        'No Strava runs imported yet? Load sample runs to auto-calibrate your baseline pace.',
      stravaLoadSampleShort: 'Load Sample Runs',
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
      heading: 'Body Profile & BMI Safeguards',
      subtitle:
        'Automatically calculates your Body Mass Index to tune Easy Run proportions and safe weekly mileage progression limits.',
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
        none: 'No injuries (Healthy)',
        recovering: 'Mild recovery',
        active: 'Active injury / joint pain',
      },
      resultLabel: 'Your BMI Result',
      categoryPrefix: 'Category',
      maxIncreaseLabel: 'Max Weekly Increase',
      maxPrefix: 'Max',
      extraEasyLabel: 'Extra Easy Share',
      hrSectionTitle: 'Heart Rate Tracking & VO2max Estimate',
      hrSectionSubtitle:
        'Track your resting heart rate, Karvonen training zones (Z1–Z5), and estimated VO2max aerobic fitness.',
      restingHrLabel: 'Resting HR (bpm)',
      restingHrHint: 'Measure upon waking (35–110 bpm)',
      maxHrLabel: 'Max HR (bpm, optional)',
      maxHrPlaceholder: 'Auto',
      maxHrAutoHint: (autoVal) => `Auto Tanaka: ${autoVal} bpm`,
      vo2MaxLabel: 'Estimated VO2max',
      vo2MaxUnit: 'ml/kg/min',
      avgObservedHrLabel: 'Avg Observed HR',
      noObservedHrYet: 'Log HR in daily check-ins or import Strava',
      hrZonesTitle: 'Your 5 Heart Rate Training Zones',
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
      viewZonesTab: 'Pace Zones & 4-Week Plan',
      zoneLabels: {
        easy: 'Easy Pace',
        tempo: 'Tempo Pace',
        interval: 'Interval',
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
          title: '1. Strict Per-Account Isolation',
          body: 'Your body profile, race targets, daily progress logs, and running history can only be read and modified by your verified Google account UID enforced by Firestore rules.',
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
  },
};
