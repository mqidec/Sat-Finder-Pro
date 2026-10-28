export type Language = 'ar' | 'fr' | 'en';

export interface Translations {
  appName: string;
  appSubtitle: string;
  // Nav
  tabMeter: string;
  tabSats: string;
  tabPointer: string;
  tabReceiver: string;
  // Header Actions
  apkBtn: string;
  gpsNearestBtn: string;
  sunModeBtn: string;
  sunModeActive: string;
  beepBtn: string;
  beepActive: string;
  // Banner
  selectedSatLabel: string;
  locationLabel: string;
  changeSatLabel: string;
  nearestZenithLabel: string;
  // Signal Meter
  snrTitle: string;
  tunerTitle: string;
  locked: string;
  unlocked: string;
  quality: string;
  strength: string;
  ber: string;
  audioBeepStart: string;
  audioBeepStop: string;
  volume: string;
  iqDiagram: string;
  hideIq: string;
  signalSimulator: string;
  windSim: string;
  windSimActive: string;
  presetZero: string;
  presetWeak: string;
  presetLock: string;
  presetOptimal: string;
  lnbLof: string;
  currentTp: string;
  ftaBadge: string;
  payBadge: string;
  beamLabel: string;
  mainChannels: string;
  // Dish Pointer
  dishLocationTitle: string;
  locateGpsBtn: string;
  locatingGps: string;
  chooseCity: string;
  azimuthTrue: string;
  azimuthMag: string;
  elevation: string;
  aboveHorizon: string;
  belowHorizon: string;
  lnbSkew: string;
  clockwise: string;
  counterClockwise: string;
  compassTitle: string;
  sensorActive: string;
  sensorManual: string;
  manualHeadingAdjust: string;
  north: string;
  east: string;
  south: string;
  west: string;
  dishGuidanceNote: string;
  pointingAligned: string;
  // Satellites
  satDatabaseTitle: string;
  searchPlaceholder: string;
  filterAll: string;
  filterKu: string;
  filterC: string;
  filterFta: string;
  filterNear: string;
  filterFav: string;
  arcAll: string;
  arcEast: string;
  arcCentral: string;
  arcWest: string;
  noSatsFound: string;
  addTpBtn: string;
  addSatBtn: string;
  kingOfSatDir: string;
  activeTpBadge: string;
  // Receiver Modal
  receiverModalTitle: string;
  receiverSupported: string;
  tunerType: string;
  connStatus: string;
  connActive: string;
  connInactive: string;
  ipAddress: string;
  port: string;
  tuner: string;
  tunerPrimary: string;
  tunerSecondary: string;
  protocol: string;
  diseqcControl: string;
  moveEast: string;
  moveWest: string;
  connectAndTest: string;
  connectingTest: string;
  closeBtn: string;
  // Geo Suggester
  geoModalTitle: string;
  geoModalSubtitle: string;
  updateGpsBtn: string;
  yourCurrentLocation: string;
  nearestRefCity: string;
  distance: string;
  zenithSatTitle: string;
  tuneDishToSat: string;
  currentSatSelected: string;
  topSatsAboveHorizon: string;
  selectBtn: string;
  selectedBtn: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    appName: 'Cristor Toro Pro',
    appSubtitle: 'Ali 2661 SatFinder',
    tabMeter: 'مقياس الإشارة',
    tabSats: 'الأقمار والترددات',
    tabPointer: 'زوايا الصحن والبوصلة',
    tabReceiver: 'الريسيفر IP',
    apkBtn: 'ملف APK',
    gpsNearestBtn: 'أقرب قمر GPS',
    sunModeBtn: 'شمس',
    sunModeActive: 'وضع الشمس',
    beepBtn: 'صافرة',
    beepActive: 'الصافرة نشطة',
    selectedSatLabel: 'القمر المحدد:',
    locationLabel: 'الموقع:',
    changeSatLabel: 'تغيير القمر ❮',
    nearestZenithLabel: 'الأقرب في سمائك:',
    snrTitle: 'SIGNAL TO NOISE RATIO',
    tunerTitle: 'DVB-S2 TUNER 1',
    locked: '🟢 LOCKED (مقفل)',
    unlocked: '🔴 UNLOCKED (جاري البحث)',
    quality: 'جودة الإشارة (QUALITY)',
    strength: 'قوة الإشارة (PWR / BER)',
    ber: 'نسبة الخطأ BER:',
    audioBeepStart: '🔊 تشغيل الصافرة الصوتية (Beep)',
    audioBeepStop: 'الصافرة الصوتية شـغالة (إيقاف)',
    volume: 'الصوت:',
    iqDiagram: 'مخطط I/Q',
    hideIq: 'إخفاء I/Q',
    signalSimulator: 'مؤشر محاكاة واختبار التيونر:',
    windSim: 'محاكاة الرياح',
    windSimActive: 'تمايل الرياح نشط',
    presetZero: '0 dB (مقطوعة)',
    presetWeak: '5.2 dB (ضعيفة)',
    presetLock: '8.8 dB (قفل أولي)',
    presetOptimal: '13.5 dB (ممتازة)',
    lnbLof: 'LNB LOF',
    currentTp: 'التردد:',
    ftaBadge: 'FTA مفتوح',
    payBadge: 'مشفر',
    beamLabel: 'فايسو:',
    mainChannels: 'أهم القنوات:',
    dishLocationTitle: 'موقع تركيب الصحن:',
    locateGpsBtn: 'تحديد الموقع GPS',
    locatingGps: 'جاري التحديد...',
    chooseCity: 'اختر مدينة قريبة:',
    azimuthTrue: 'زاوية السمت (Azimuth)',
    azimuthMag: 'مغناطيسي:',
    elevation: 'زاوية الارتفاع (Elevation)',
    aboveHorizon: 'فوق الأفق ✓',
    belowHorizon: 'تحت الأفق ✗',
    lnbSkew: 'ميل اللاقط (LNB Skew)',
    clockwise: 'مع عقارب الساعة ↷',
    counterClockwise: 'عكس العقارب ↶',
    compassTitle: 'بوصلة توجيه الصحن نحو',
    sensorActive: 'حساس الهاتف: نشط ✓',
    sensorManual: 'يدوي',
    manualHeadingAdjust: 'ضبط اتجاه الهاتف يدوياً:',
    north: 'ش (N)',
    east: 'ق (E)',
    south: 'ج (S)',
    west: 'غ (W)',
    dishGuidanceNote: 'قم بتوجيه الصحن أفقياً حتى يتطابق المؤشر البرتقالي مع زاوية السمت، ثم ارفع الصحن عمودياً إلى زاوية الارتفاع، وأدر اللاقط LNB.',
    pointingAligned: 'تم التوجيه',
    satDatabaseTitle: 'أقمار وترددات KingOfSat',
    searchPlaceholder: '🔍 ابحث في الأقمار والترددات (مثل: 7W, beIN, Canal+, 11636)...',
    filterAll: 'الكل',
    filterKu: 'Ku-Band',
    filterC: 'C-Band',
    filterFta: 'FTA',
    filterNear: 'الأقرب GPS',
    filterFav: 'المفضلة',
    arcAll: 'كامل القوس',
    arcEast: 'الشرق (80°E - 26°E)',
    arcCentral: 'الوسط (23°E - 7°W)',
    arcWest: 'الغرب (8°W - 70°W)',
    noSatsFound: 'لم يتم العثور على أقمار مطابقة لخيارات الفلترة',
    addTpBtn: 'إضافة تردد TP',
    addSatBtn: 'قمر مخصص',
    kingOfSatDir: 'دليل KingOfSat',
    activeTpBadge: 'التردد النشط',
    receiverModalTitle: 'إعدادات الاتصال بالريسيفر',
    receiverSupported: 'الجهاز المدعوم: Cristor Toro 700 4K / Ali M2661',
    tunerType: 'DVB-S2X Multi-Stream Twin Tuner',
    connStatus: 'حالة الربط:',
    connActive: 'متصل ومفعل ✓',
    connInactive: 'غير متصل (اضغط اتصال)',
    ipAddress: 'عنوان IP الريسيفر على شبكة الواي فاي:',
    port: 'المنفذ (Port):',
    tuner: 'التيونر (Tuner):',
    tunerPrimary: 'Tuner 1 (رئيسي)',
    tunerSecondary: 'Tuner 2 (ثانوي)',
    protocol: 'بروتوكول البث والتحكم:',
    diseqcControl: 'تحكم محرك الصحن (DiSEqC 1.2 / USALS):',
    moveEast: 'تحريك شرق (East)',
    moveWest: 'تحريك غرب (West)',
    connectAndTest: 'اتصال واختبار التيونر',
    connectingTest: 'جاري الاتصال والتحقق...',
    closeBtn: 'إغلاق',
    geoModalTitle: 'تحديد الموقع عبر GPS واقتراح الأقمار',
    geoModalSubtitle: 'حساب القمر الأقرب والأعلى زاوية في سمائك آلياً',
    updateGpsBtn: 'تحديث إحداثياتي GPS',
    yourCurrentLocation: 'موقعك الحالي:',
    nearestRefCity: 'أقرب مرجع جغرافي:',
    distance: 'المسافة:',
    zenithSatTitle: '🥇 القمر الأعلى زاوية في سمائك (Zenith Satellite):',
    tuneDishToSat: 'توجيه الصحن له',
    currentSatSelected: 'القمر الحالي ✓',
    topSatsAboveHorizon: 'أقوى الأقمار المتاحة فوق الأفق من موقعك:',
    selectBtn: 'اختيار',
    selectedBtn: 'محدد ✓'
  },
  fr: {
    appName: 'Cristor Toro Pro',
    appSubtitle: 'Ali 2661 SatFinder',
    tabMeter: 'Signal dB',
    tabSats: 'Satellites & TPs',
    tabPointer: 'Angles & Parabole',
    tabReceiver: 'Récepteur IP',
    apkBtn: 'Fichier APK',
    gpsNearestBtn: 'Plus Proche GPS',
    sunModeBtn: 'Soleil',
    sunModeActive: 'Plein Soleil',
    beepBtn: 'Bip',
    beepActive: 'Bip Actif',
    selectedSatLabel: 'Satellite actif:',
    locationLabel: 'Position:',
    changeSatLabel: 'Changer ❯',
    nearestZenithLabel: 'Au zénith:',
    snrTitle: 'SIGNAL TO NOISE RATIO',
    tunerTitle: 'DVB-S2 TUNER 1',
    locked: '🟢 VERROUILLÉ (LOCKED)',
    unlocked: '🔴 NON VERROUILLÉ (RECHERCHE)',
    quality: 'Qualité du Signal (QUALITY)',
    strength: 'Puissance (PWR / BER)',
    ber: 'Taux d\'erreur BER:',
    audioBeepStart: '🔊 Activer le Bip Sonore (Buzzer)',
    audioBeepStop: 'Bip Sonore Actif (Arrêter)',
    volume: 'Volume:',
    iqDiagram: 'Constellation I/Q',
    hideIq: 'Masquer I/Q',
    signalSimulator: 'Simulateur & Test Tuner:',
    windSim: 'Simulation Vent',
    windSimActive: 'Vent actif',
    presetZero: '0 dB (Coupé)',
    presetWeak: '5.2 dB (Faible)',
    presetLock: '8.8 dB (Lock initial)',
    presetOptimal: '13.5 dB (Optimal)',
    lnbLof: 'LNB O.L',
    currentTp: 'Fréquence:',
    ftaBadge: 'En clair (FTA)',
    payBadge: 'Crypté',
    beamLabel: 'Faisceau:',
    mainChannels: 'Chaînes clés:',
    dishLocationTitle: 'Position de pointage parabole:',
    locateGpsBtn: 'Position GPS',
    locatingGps: 'Localisation en cours...',
    chooseCity: 'Choisir une ville proche:',
    azimuthTrue: 'Azimut Vrai (Azimuth)',
    azimuthMag: 'Magnétique:',
    elevation: 'Élévation (Elevation)',
    aboveHorizon: 'Visible (au-dessus) ✓',
    belowHorizon: 'Sous l\'horizon ✗',
    lnbSkew: 'Inclinaison LNB (Polarisation)',
    clockwise: 'Sens horaire ↷',
    counterClockwise: 'Sens anti-horaire ↶',
    compassTitle: 'Boussole vers',
    sensorActive: 'Capteur: Actif ✓',
    sensorManual: 'Manuel',
    manualHeadingAdjust: 'Ajuster cap manuel:',
    north: 'N',
    east: 'E',
    south: 'S',
    west: 'O',
    dishGuidanceNote: 'Tournez la parabole pour aligner le repère orange avec l\'azimut, ajustez l\'élévation verticale, puis tournez la tête LNB à l\'angle calculé.',
    pointingAligned: 'Aligné ✓',
    satDatabaseTitle: 'Satellites & Fréquences KingOfSat',
    searchPlaceholder: '🔍 Rechercher (ex: 7W, beIN, Canal+, 11636)...',
    filterAll: 'Tous',
    filterKu: 'Ku-Band',
    filterC: 'C-Band',
    filterFta: 'FTA',
    filterNear: 'Plus Proche GPS',
    filterFav: 'Favoris',
    arcAll: 'Tout l\'arc',
    arcEast: 'Est (80°E - 26°E)',
    arcCentral: 'Centre (23°E - 7°W)',
    arcWest: 'Ouest (8°W - 70°W)',
    noSatsFound: 'Aucun satellite correspondant aux critères',
    addTpBtn: 'Ajouter TP',
    addSatBtn: 'Satellite Personnalisé',
    kingOfSatDir: 'Guide KingOfSat',
    activeTpBadge: 'TP Actif',
    receiverModalTitle: 'Connexion Récepteur Cristor Toro 700',
    receiverSupported: 'Appareil supporté: Cristor Toro 700 4K / Ali M2661',
    tunerType: 'DVB-S2X Multi-Stream Double Tuner',
    connStatus: 'État de connexion:',
    connActive: 'Connecté & Actif ✓',
    connInactive: 'Déconnecté (Cliquez Connecter)',
    ipAddress: 'Adresse IP du récepteur (Wi-Fi):',
    port: 'Port:',
    tuner: 'Tuner:',
    tunerPrimary: 'Tuner 1 (Principal)',
    tunerSecondary: 'Tuner 2 (Secondaire)',
    protocol: 'Protocole de diffusion & contrôle:',
    diseqcControl: 'Contrôle Moteur (DiSEqC 1.2 / USALS):',
    moveEast: 'Tourner vers l\'Est',
    moveWest: 'Tourner vers l\'Ouest',
    connectAndTest: 'Connexion & Test Tuner',
    connectingTest: 'Connexion en cours...',
    closeBtn: 'Fermer',
    geoModalTitle: 'Localisation GPS & Suggestion de Satellite',
    geoModalSubtitle: 'Calcul automatique du satellite au zénith le plus proche',
    updateGpsBtn: 'Actualiser GPS',
    yourCurrentLocation: 'Votre position actuelle:',
    nearestRefCity: 'Ville de référence la plus proche:',
    distance: 'Distance:',
    zenithSatTitle: '🥇 Satellite au Zénith le plus haut dans votre ciel:',
    tuneDishToSat: 'Pointer la parabole',
    currentSatSelected: 'Satellite actif ✓',
    topSatsAboveHorizon: 'Principaux satellites au-dessus de l\'horizon:',
    selectBtn: 'Choisir',
    selectedBtn: 'Sélectionné ✓'
  },
  en: {
    appName: 'Cristor Toro Pro',
    appSubtitle: 'Ali 2661 SatFinder',
    tabMeter: 'Signal Meter',
    tabSats: 'Satellites & TPs',
    tabPointer: 'Dish Angles & Compass',
    tabReceiver: 'Receiver IP',
    apkBtn: 'APK App',
    gpsNearestBtn: 'Nearest Sat GPS',
    sunModeBtn: 'Sun',
    sunModeActive: 'Sun Mode',
    beepBtn: 'Beep',
    beepActive: 'Beep Active',
    selectedSatLabel: 'Active Satellite:',
    locationLabel: 'Location:',
    changeSatLabel: 'Change ❯',
    nearestZenithLabel: 'Zenith Sat:',
    snrTitle: 'SIGNAL TO NOISE RATIO',
    tunerTitle: 'DVB-S2 TUNER 1',
    locked: '🟢 LOCKED',
    unlocked: '🔴 UNLOCKED / SEARCHING',
    quality: 'Signal Quality',
    strength: 'Signal Strength (PWR / BER)',
    ber: 'Bit Error Rate BER:',
    audioBeepStart: '🔊 Enable Acoustic Beeper',
    audioBeepStop: 'Beeper Active (Mute)',
    volume: 'Volume:',
    iqDiagram: 'I/Q Constellation',
    hideIq: 'Hide I/Q',
    signalSimulator: 'Tuner Simulator & Test Slider:',
    windSim: 'Wind Drift',
    windSimActive: 'Wind Active',
    presetZero: '0 dB (Cut)',
    presetWeak: '5.2 dB (Weak)',
    presetLock: '8.8 dB (Lock)',
    presetOptimal: '13.5 dB (Optimal)',
    lnbLof: 'LNB LOF',
    currentTp: 'Frequency:',
    ftaBadge: 'FTA Free',
    payBadge: 'Encrypted',
    beamLabel: 'Beam:',
    mainChannels: 'Key Channels:',
    dishLocationTitle: 'Dish Installation Location:',
    locateGpsBtn: 'GPS Location',
    locatingGps: 'Locating...',
    chooseCity: 'Choose nearby city:',
    azimuthTrue: 'True Azimuth',
    azimuthMag: 'Magnetic:',
    elevation: 'Elevation Angle',
    aboveHorizon: 'Above Horizon ✓',
    belowHorizon: 'Below Horizon ✗',
    lnbSkew: 'LNB Polarization Tilt (Skew)',
    clockwise: 'Clockwise ↷',
    counterClockwise: 'Counter-clockwise ↶',
    compassTitle: 'Dish Pointer Compass toward',
    sensorActive: 'Phone Sensor: Active ✓',
    sensorManual: 'Manual',
    manualHeadingAdjust: 'Manual heading adjustment:',
    north: 'N',
    east: 'E',
    south: 'S',
    west: 'W',
    dishGuidanceNote: 'Align dish horizontally to the true azimuth, elevate the bracket to the elevation angle, and twist the LNB horn to the skew degree.',
    pointingAligned: 'Aligned ✓',
    satDatabaseTitle: 'KingOfSat Satellites & Transponders',
    searchPlaceholder: '🔍 Search satellites and TPs (e.g., 7W, beIN, Canal+, 11636)...',
    filterAll: 'All',
    filterKu: 'Ku-Band',
    filterC: 'C-Band',
    filterFta: 'FTA',
    filterNear: 'Nearest GPS',
    filterFav: 'Favorites',
    arcAll: 'Full Arc',
    arcEast: 'East (80°E - 26°E)',
    arcCentral: 'Central (23°E - 7°W)',
    arcWest: 'West (8°W - 70°W)',
    noSatsFound: 'No satellites matched your filters',
    addTpBtn: 'Add TP',
    addSatBtn: 'Custom Satellite',
    kingOfSatDir: 'KingOfSat Directory',
    activeTpBadge: 'Active TP',
    receiverModalTitle: 'Cristor Toro 700 Connection Settings',
    receiverSupported: 'Supported Device: Cristor Toro 700 4K / Ali M2661',
    tunerType: 'DVB-S2X Multi-Stream Twin Tuner',
    connStatus: 'Connection Status:',
    connActive: 'Connected & Active ✓',
    connInactive: 'Disconnected (Click Connect)',
    ipAddress: 'Receiver IP Address on Wi-Fi:',
    port: 'Port:',
    tuner: 'Tuner:',
    tunerPrimary: 'Tuner 1 (Primary)',
    tunerSecondary: 'Tuner 2 (Secondary)',
    protocol: 'Streaming & Control Protocol:',
    diseqcControl: 'Dish Motor Control (DiSEqC 1.2 / USALS):',
    moveEast: 'Move East',
    moveWest: 'Move West',
    connectAndTest: 'Connect & Test Tuner',
    connectingTest: 'Connecting & Testing...',
    closeBtn: 'Close',
    geoModalTitle: 'GPS Location & Nearest Satellite Suggester',
    geoModalSubtitle: 'Automatic calculation of nearest zenith satellite overhead',
    updateGpsBtn: 'Update GPS Coordinates',
    yourCurrentLocation: 'Your Current Location:',
    nearestRefCity: 'Nearest Landmark City:',
    distance: 'Distance:',
    zenithSatTitle: '🥇 Zenith Satellite (Highest in your sky):',
    tuneDishToSat: 'Tune Dish to this Sat',
    currentSatSelected: 'Current Sat ✓',
    topSatsAboveHorizon: 'Top satellites visible above your horizon:',
    selectBtn: 'Select',
    selectedBtn: 'Selected ✓'
  }
};
