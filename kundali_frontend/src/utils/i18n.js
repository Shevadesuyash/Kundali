/**
 * Bilingual translations — English + Marathi (मराठी)
 * Usage: t('key') returns the string for the active language.
 */

export const TRANSLATIONS = {
  // ─── Navbar ──────────────────────────────────────────────────
  'nav.brand':   { en: 'Kundali Milan', mr: 'कुंडली मिलन' },
  'nav.kundali': { en: 'Individual Kundali', mr: 'वैयक्तिक कुंडली' },
  'nav.match':   { en: 'Match Compatibility', mr: 'विवाह जुळवणी' },

  // ─── Footer ──────────────────────────────────────────────────
  'footer.note': {
    en: 'Sidereal calculations via Swiss Ephemeris (Lahiri Ayanamsha). For guidance only — consult a professional astrologer for significant life decisions.',
    mr: 'स्विस एफेमेरिस (लाहिरी अयनांश) द्वारे नाक्षत्रिक गणना. केवळ मार्गदर्शनासाठी — महत्त्वाच्या जीवन निर्णयांसाठी व्यावसायिक ज्योतिषाचा सल्ला घ्या.',
  },

  // ─── HomePage ─────────────────────────────────────────────────
  'home.eyebrow':      { en: 'Vedic Astrology',    mr: 'वैदिक ज्योतिष' },
  'home.headline':     { en: 'Your complete Kundali, revealed.', mr: 'आपली संपूर्ण कुंडली, उघड.' },
  'home.sub':          { en: 'Enter your birth details and receive a precise Vedic birth chart, planetary positions, Nakshatra analysis and compatibility scores — powered by Swiss Ephemeris.', mr: 'आपले जन्म तपशील प्रविष्ट करा आणि अचूक वैदिक जन्मकुंडली, ग्रहांची स्थिती, नक्षत्र विश्लेषण आणि सुसंगतता गुण मिळवा — स्विस एफेमेरिस द्वारे.' },
  'home.cta.kundali':  { en: 'Get My Kundali →',  mr: 'माझी कुंडली पाहा →' },
  'home.cta.match':    { en: 'Check Compatibility', mr: 'सुसंगतता तपासा' },
  'home.how.title':    { en: 'How it works', mr: 'हे कसे कार्य करते' },
  'home.step1.title':  { en: 'Enter birth details', mr: 'जन्म तपशील द्या' },
  'home.step1.desc':   { en: 'Name, date, time and birthplace (village or city)', mr: 'नाव, तारीख, वेळ आणि जन्मस्थान (गाव किंवा शहर)' },
  'home.step2.title':  { en: 'We calculate your chart', mr: 'आम्ही आपली कुंडली काढतो' },
  'home.step2.desc':   { en: 'Precise sidereal positions via Swiss Ephemeris with Lahiri Ayanamsha', mr: 'लाहिरी अयनांशासह स्विस एफेमेरिसद्वारे अचूक नाक्षत्रिक स्थिती' },
  'home.step3.title':  { en: 'Read your full report', mr: 'आपला संपूर्ण अहवाल वाचा' },
  'home.step3.desc':   { en: 'Charts, planets, dignities, health insights, Guna Milan and more', mr: 'कुंडली, ग्रह, गुण, आरोग्य अंतर्दृष्टी, गुण मिलन आणि बरेच काही' },

  // ─── Form ─────────────────────────────────────────────────────
  'form.name':               { en: 'Full name',                       mr: 'पूर्ण नाव' },
  'form.name.placeholder':   { en: 'e.g. Sunita',                     mr: 'उदा. सुनीता' },
  'form.dob':                { en: 'Date of birth',                   mr: 'जन्म तारीख' },
  'form.day':                { en: 'Day',                             mr: 'दिवस' },
  'form.month':              { en: 'Month',                           mr: 'महिना' },
  'form.year':               { en: 'Year',                            mr: 'वर्ष' },
  'form.tob':                { en: 'Time of birth (24-hour)',         mr: 'जन्म वेळ (२४ तास)' },
  'form.hour':               { en: 'Hour',                            mr: 'तास' },
  'form.minute':             { en: 'Minute',                          mr: 'मिनिट' },
  'form.birthplace':         { en: 'Birthplace',                      mr: 'जन्मस्थान' },
  'form.birthplace.hint':    { en: 'Search by village, town or city', mr: 'गाव, तालुका किंवा शहराचे नाव शोधा' },
  'form.birthplace.placeholder': { en: 'e.g. Nashik, Jaipur, Kanpur…', mr: 'उदा. नाशिक, पुणे, नागपूर…' },
  'form.coords':             { en: 'Coordinates',                     mr: 'भौगोलिक स्थान' },
  'form.lat':                { en: 'Latitude',                        mr: 'अक्षांश' },
  'form.lon':                { en: 'Longitude',                       mr: 'रेखांश' },
  'form.tz':                 { en: 'Timezone at birth',               mr: 'जन्माच्या वेळचा कालपट्टा' },
  'form.autofilled':         { en: 'Auto-filled from place search',   mr: 'स्थान शोधातून स्वयंचलित भरले' },
  'form.submit.kundali':     { en: 'Calculate Kundali',               mr: 'कुंडली काढा' },
  'form.submit.match':       { en: 'Check Match',                     mr: 'जुळणी तपासा' },
  'form.calculating':        { en: 'Calculating…',                    mr: 'गणना करत आहे…' },

  // ─── Kundali Report ───────────────────────────────────────────
  'report.eyebrow':        { en: 'Kundali Report',                       mr: 'कुंडली अहवाल' },
  'report.ascendant':      { en: 'Ascendant (Lagna)',                    mr: 'लग्न' },
  'report.asc.nakshatra':  { en: 'Asc. Nakshatra',                       mr: 'लग्न नक्षत्र' },
  'report.moon.sign':      { en: 'Moon Sign (Rashi)',                     mr: 'चंद्र राशी' },
  'report.moon.nakshatra': { en: 'Moon Nakshatra',                       mr: 'चंद्र नक्षत्र' },
  'report.ayanamsha':      { en: 'Ayanamsha',                            mr: 'अयनांश' },
  'report.manglik':        { en: 'Manglik Status',                       mr: 'मंगळ दोष' },
  'report.varna':          { en: 'Varna (Ego & Work)',                    mr: 'वर्ण (अहंकार आणि कार्य)' },
  'report.gana':           { en: 'Gana (Temperament)',                    mr: 'गण (स्वभाव)' },
  'report.nadi':           { en: 'Nadi (Health & Genes)',                 mr: 'नाडी (आरोग्य आणि जनुके)' },
  'report.house.strip':    { en: 'House Summary (D1):',                   mr: 'भाव सारांश (D1):' },
  'report.chart.select':   { en: 'Select Chart:',                        mr: 'कुंडली निवडा:' },
  'report.chart.d1':       { en: 'D1 — Lagna Chart',                     mr: 'D1 — लग्न कुंडली' },
  'report.chart.d9':       { en: 'D9 — Navamsha Chart',                  mr: 'D9 — नवांश कुंडली' },
  'report.chart.rashi':    { en: 'Rashi — Moon Chart',                   mr: 'राशी — चंद्र कुंडली' },
  'report.chart.all':      { en: 'View All Charts',                      mr: 'सर्व कुंडल्या पाहा' },
  'report.planets.title':  { en: 'Complete Planetary Positions & Dignities', mr: 'संपूर्ण ग्रह स्थिती आणि बल' },
  'report.lord':           { en: 'Lord',                                 mr: 'स्वामी' },
  'report.pada':           { en: 'Pada',                                 mr: 'पाद' },
  'report.house':          { en: 'House',                                mr: 'भाव' },
  'report.cancelled':      { en: 'Cancelled',                            mr: 'रद्द' },
  'report.clear':          { en: 'Clear',                                mr: 'दोष नाही' },

  // ─── Chart titles ─────────────────────────────────────────────
  'chart.d1.label':        { en: 'D1 — Lagna Chart (Main Birth Chart)',   mr: 'D1 — लग्न कुंडली (मुख्य जन्म कुंडली)' },
  'chart.d9.label':        { en: 'D9 — Navamsha Chart (Spouse & Destiny)', mr: 'D9 — नवांश कुंडली (जीवनसाथी आणि भाग्य)' },
  'chart.rashi.label':     { en: 'Chandra Lagna — Moon Chart (Mind & Emotion)', mr: 'चंद्र लग्न — राशी कुंडली (मन आणि भावना)' },
  'chart.south.label':     { en: 'South Indian Grid',                    mr: 'दक्षिण भारतीय चार्ट' },
  'chart.north.label':     { en: 'North Indian',                         mr: 'उत्तर भारतीय' },
  'chart.south.btn':       { en: 'South Indian (Fixed Signs)',            mr: 'दक्षिण भारतीय (स्थिर राशी)' },
  'chart.north.btn':       { en: 'North Indian (Diamond Chart)',          mr: 'उत्तर भारतीय (हिरा कुंडली)' },
  'chart.no.data':         { en: 'No chart data available',              mr: 'कुंडली डेटा उपलब्ध नाही' },
  'chart.lagna.label':     { en: 'Lagna',                                mr: 'लग्न' },
  'chart.retrograde':      { en: 'retrograde',                           mr: 'वक्री' },

  // ─── 12 Zodiac Signs ─────────────────────────────────────────
  'sign.0':  { en: 'Aries',       mr: 'मेष',     abbr_en: 'Ari', abbr_mr: 'मेष' },
  'sign.1':  { en: 'Taurus',      mr: 'वृषभ',    abbr_en: 'Tau', abbr_mr: 'वृष' },
  'sign.2':  { en: 'Gemini',      mr: 'मिथुन',   abbr_en: 'Gem', abbr_mr: 'मिथ' },
  'sign.3':  { en: 'Cancer',      mr: 'कर्क',    abbr_en: 'Can', abbr_mr: 'कर्क' },
  'sign.4':  { en: 'Leo',         mr: 'सिंह',    abbr_en: 'Leo', abbr_mr: 'सिंह' },
  'sign.5':  { en: 'Virgo',       mr: 'कन्या',   abbr_en: 'Vir', abbr_mr: 'कन्या' },
  'sign.6':  { en: 'Libra',       mr: 'तुला',    abbr_en: 'Lib', abbr_mr: 'तुला' },
  'sign.7':  { en: 'Scorpio',     mr: 'वृश्चिक', abbr_en: 'Sco', abbr_mr: 'वृश्चि' },
  'sign.8':  { en: 'Sagittarius', mr: 'धनु',     abbr_en: 'Sag', abbr_mr: 'धनु' },
  'sign.9':  { en: 'Capricorn',   mr: 'मकर',     abbr_en: 'Cap', abbr_mr: 'मकर' },
  'sign.10': { en: 'Aquarius',    mr: 'कुंभ',    abbr_en: 'Aqu', abbr_mr: 'कुंभ' },
  'sign.11': { en: 'Pisces',      mr: 'मीन',     abbr_en: 'Pis', abbr_mr: 'मीन' },

  // ─── 9 Planets ────────────────────────────────────────────────
  'planet.Sun':     { en: 'Sun',     mr: 'सूर्य',   abbr_en: 'Su',  abbr_mr: 'सू' },
  'planet.Moon':    { en: 'Moon',    mr: 'चंद्र',   abbr_en: 'Mo',  abbr_mr: 'चं' },
  'planet.Mars':    { en: 'Mars',    mr: 'मंगळ',    abbr_en: 'Ma',  abbr_mr: 'मं' },
  'planet.Mercury': { en: 'Mercury', mr: 'बुध',     abbr_en: 'Me',  abbr_mr: 'बु' },
  'planet.Jupiter': { en: 'Jupiter', mr: 'गुरू',    abbr_en: 'Ju',  abbr_mr: 'गु' },
  'planet.Venus':   { en: 'Venus',   mr: 'शुक्र',   abbr_en: 'Ve',  abbr_mr: 'शु' },
  'planet.Saturn':  { en: 'Saturn',  mr: 'शनी',     abbr_en: 'Sa',  abbr_mr: 'श' },
  'planet.Rahu':    { en: 'Rahu',    mr: 'राहू',    abbr_en: 'Ra',  abbr_mr: 'रा' },
  'planet.Ketu':    { en: 'Ketu',    mr: 'केतू',    abbr_en: 'Ke',  abbr_mr: 'के' },

  // ─── 27 Nakshatras ────────────────────────────────────────────
  'nakshatra.Ashwini':      { en: 'Ashwini',      mr: 'अश्विनी' },
  'nakshatra.Bharani':      { en: 'Bharani',      mr: 'भरणी' },
  'nakshatra.Krittika':     { en: 'Krittika',     mr: 'कृत्तिका' },
  'nakshatra.Rohini':       { en: 'Rohini',       mr: 'रोहिणी' },
  'nakshatra.Mrigashira':   { en: 'Mrigashira',   mr: 'मृगशीर्ष' },
  'nakshatra.Ardra':        { en: 'Ardra',        mr: 'आर्द्रा' },
  'nakshatra.Punarvasu':    { en: 'Punarvasu',    mr: 'पुनर्वसू' },
  'nakshatra.Pushya':       { en: 'Pushya',       mr: 'पुष्य' },
  'nakshatra.Ashlesha':     { en: 'Ashlesha',     mr: 'आश्लेषा' },
  'nakshatra.Magha':        { en: 'Magha',        mr: 'मघा' },
  'nakshatra.Purva Phalguni': { en: 'Purva Phalguni', mr: 'पूर्व फाल्गुनी' },
  'nakshatra.Uttara Phalguni': { en: 'Uttara Phalguni', mr: 'उत्तर फाल्गुनी' },
  'nakshatra.Hasta':        { en: 'Hasta',        mr: 'हस्त' },
  'nakshatra.Chitra':       { en: 'Chitra',       mr: 'चित्रा' },
  'nakshatra.Swati':        { en: 'Swati',        mr: 'स्वाती' },
  'nakshatra.Vishakha':     { en: 'Vishakha',     mr: 'विशाखा' },
  'nakshatra.Anuradha':     { en: 'Anuradha',     mr: 'अनुराधा' },
  'nakshatra.Jyeshtha':     { en: 'Jyeshtha',     mr: 'ज्येष्ठा' },
  'nakshatra.Mula':         { en: 'Mula',         mr: 'मूळ' },
  'nakshatra.Purva Ashadha': { en: 'Purva Ashadha', mr: 'पूर्व आषाढा' },
  'nakshatra.Uttara Ashadha': { en: 'Uttara Ashadha', mr: 'उत्तर आषाढा' },
  'nakshatra.Shravana':     { en: 'Shravana',     mr: 'श्रवण' },
  'nakshatra.Dhanishtha':   { en: 'Dhanishtha',   mr: 'धनिष्ठा' },
  'nakshatra.Shatabhisha':  { en: 'Shatabhisha',  mr: 'शतभिषा' },
  'nakshatra.Purva Bhadrapada': { en: 'Purva Bhadrapada', mr: 'पूर्व भाद्रपदा' },
  'nakshatra.Uttara Bhadrapada': { en: 'Uttara Bhadrapada', mr: 'उत्तर भाद्रपदा' },
  'nakshatra.Revati':       { en: 'Revati',       mr: 'रेवती' },

  // ─── Planetary Dignities ──────────────────────────────────────
  'dignity.Exalted':     { en: 'Exalted',     mr: 'उच्च' },
  'dignity.Own Sign':    { en: 'Own Sign',    mr: 'स्वराशी' },
  'dignity.Friendly':    { en: 'Friendly',    mr: 'मित्र राशी' },
  'dignity.Debilitated': { en: 'Debilitated', mr: 'नीच' },
  'dignity.Enemy Sign':  { en: 'Enemy Sign',  mr: 'शत्रू राशी' },
  'dignity.Neutral':     { en: 'Neutral',     mr: 'सम' },

  // ─── Planet table headers ─────────────────────────────────────
  'planet.graha':   { en: 'Graha',        mr: 'ग्रह' },
  'planet.sign':    { en: 'Sign',         mr: 'राशी' },
  'planet.degree':  { en: 'Degree',       mr: 'अंश' },
  'planet.abs.lon': { en: 'Abs. Lon',     mr: 'पूर्ण रेखांश' },
  'planet.nakshatra': { en: 'Nakshatra',  mr: 'नक्षत्र' },
  'planet.pada':    { en: 'Pada',         mr: 'पाद' },
  'planet.house':   { en: 'House',        mr: 'भाव' },
  'planet.lord':    { en: 'Sign Lord',    mr: 'राशी स्वामी' },
  'planet.dignity': { en: 'Dignity',      mr: 'ग्रह बल' },
  'planet.retrograde': { en: 'Retrograde', mr: 'वक्री' },

  // ─── Health Report ────────────────────────────────────────────
  'health.title':         { en: 'Health & Disease Insights',             mr: 'आरोग्य आणि रोग अंतर्दृष्टी' },
  'health.subtitle':      { en: 'Based on your Kundali — 6th house, planetary afflictions & Ascendant constitution', mr: 'आपल्या कुंडलीवर आधारित — ६वा भाव, ग्रह दोष आणि लग्न प्रकृती' },
  'health.constitution':  { en: 'Body Constitution (Prakriti)',          mr: 'शरीर प्रकृती' },
  'health.body.part':     { en: 'Body Parts (Ascendant)',                mr: 'शरीर अवयव (लग्न)' },
  'health.tendencies':    { en: 'Disease Tendencies',                    mr: 'रोग प्रवृत्ती' },
  'health.fever':         { en: 'Fever & Inflammation',                  mr: 'ताप आणि दाह' },
  'health.chronic':       { en: 'Chronic Conditions (8th House)',        mr: 'दीर्घकालीन आजार (८वा भाव)' },
  'health.mental':        { en: 'Mental & Emotional Health',             mr: 'मानसिक आणि भावनिक आरोग्य' },
  'health.remedy':        { en: 'Suggested Remedies',                    mr: 'सुचवलेले उपाय' },
  'health.disclaimer':    { en: 'This analysis is based on classical Vedic principles. Consult a certified medical professional for health decisions.', mr: 'हे विश्लेषण शास्त्रीय वैदिक तत्त्वांवर आधारित आहे. आरोग्य निर्णयांसाठी प्रमाणित वैद्यकीय व्यावसायिकांचा सल्ला घ्या.' },

  // ─── Match Page ───────────────────────────────────────────────
  'match.title':   { en: 'Marriage Compatibility',                   mr: 'विवाह सुसंगतता' },
  'match.intro':   { en: "Enter both persons' birth details to calculate Guna Milan (Ashtakoota matching) and Manglik compatibility.", mr: 'गुण मिलन (अष्टकूट जुळणी) आणि मंगळ सुसंगतता काढण्यासाठी दोन्ही व्यक्तींचे जन्म तपशील प्रविष्ट करा.' },
  'match.person1': { en: 'Person 1 (Bride / Vara)',                   mr: 'व्यक्ती १ (वधू / वर)' },
  'match.person2': { en: 'Person 2 (Groom / Vadhu)',                  mr: 'व्यक्ती २ (वर / वधू)' },

  // ─── General ──────────────────────────────────────────────────
  'general.loading': { en: 'Calculating your Kundali…', mr: 'आपली कुंडली काढत आहे…' },
  'general.error':   { en: 'Something went wrong',      mr: 'काहीतरी चुकले' },
  'general.retry':   { en: 'Try Again',                 mr: 'पुन्हा प्रयत्न करा' },
};

/**
 * Get a translated string.
 * @param {string} key
 * @param {'en'|'mr'} lang
 * @returns {string}
 */
export function t(key, lang = 'en') {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

/** Translate a sign name by its 0-based index */
export function signName(idx, lang = 'en') {
  const entry = TRANSLATIONS[`sign.${idx}`];
  if (!entry) return String(idx + 1);
  return lang === 'mr' ? entry.mr : entry.en;
}

/** Translate a sign abbreviation by its 0-based index */
export function signAbbr(idx, lang = 'en') {
  const entry = TRANSLATIONS[`sign.${idx}`];
  if (!entry) return String(idx + 1);
  return lang === 'mr' ? entry.abbr_mr : entry.abbr_en;
}

/** Translate a planet name */
export function planetName(name, lang = 'en') {
  const entry = TRANSLATIONS[`planet.${name}`];
  if (!entry) return name;
  return lang === 'mr' ? entry.mr : entry.en;
}

/** Translate a dignity string */
export function dignityName(dignity, lang = 'en') {
  const entry = TRANSLATIONS[`dignity.${dignity}`];
  if (!entry) return dignity;
  return lang === 'mr' ? entry.mr : entry.en;
}

/** Translate a nakshatra name */
export function nakshatraName(name, lang = 'en') {
  const entry = TRANSLATIONS[`nakshatra.${name}`];
  if (!entry) return name;
  return lang === 'mr' ? entry.mr : entry.en;
}
