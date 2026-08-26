/**
 * Multi-Language Vedic Astrology Translations — English (en), Marathi (mr), Hindi (hi), Gujarati (gu)
 * Usage: t('key', lang) returns the localized string.
 */

export const TRANSLATIONS = {
  // ─── Navbar ──────────────────────────────────────────────────
  'nav.brand':   { en: 'Kundali Milan', mr: 'कुंडली मिलन', hi: 'कुंडली मिलन', gu: 'કુંડળી મિલન' },
  'nav.kundali': { en: 'Individual Kundali', mr: 'वैयक्तिक कुंडली', hi: 'व्यक्तिगत कुंडली', gu: 'વ્યક્તિગત કુંડળી' },
  'nav.match':   { en: 'Match Compatibility', mr: 'विवाह जुळवणी', hi: 'कुंडली मिलान', gu: 'કુંડળી મેળવણ' },
  'nav.panchang':{ en: 'Panchang', mr: 'पंचांग', hi: 'पंचांग', gu: 'પંચાંગ' },
  'nav.profiles':{ en: 'Profiles Hub', mr: 'प्रोफाइल केंद्र', hi: 'प्रोफाइल केंद्र', gu: 'પ્રોફાઇલ કેન્દ્ર' },

  // ─── Footer ──────────────────────────────────────────────────
  'footer.note': {
    en: 'Sidereal calculations via Swiss Ephemeris (Lahiri Ayanamsha). For guidance only — consult a professional astrologer for significant life decisions.',
    mr: 'स्विस एफेमेरिस (लाहिरी अयनांश) द्वारे नाक्षत्रिक गणना. केवळ मार्गदर्शनासाठी — महत्त्वाच्या जीवन निर्णयांसाठी व्यावसायिक ज्योतिषाचा सल्ला घ्या.',
    hi: 'स्विस एफिमेरिस (लाहिड़ी अयनांश) द्वारा नाक्षत्रिक गणना। केवल मार्गदर्शन हेतु — महत्वपूर्ण जीवन निर्णयों के लिए योग्य ज्योतिषी से परामर्श लें।',
    gu: 'સ્વિસ એફેમેરિસ (લાહિરી અયનાંશ) દ્વારા નાક્ષત્રિક ગણતરી. માત્ર માર્ગદર્શન માટે — મહત્વપૂર્ણ જીવન નિર્ણયો માટે નિષ્ણાત જ્યોતિષીનો સંપર્ક કરો.',
  },

  // ─── HomePage ─────────────────────────────────────────────────
  'home.eyebrow':      { en: 'Vedic Astrology', mr: 'वैदिक ज्योतिष', hi: 'वैदिक ज्योतिष', gu: 'વૈદિક જ્યોતિષ' },
  'home.headline':     { en: 'Your complete Kundali, revealed.', mr: 'आपली संपूर्ण कुंडली, उघड.', hi: 'आपकी संपूर्ण कुंडली, प्रकट।', gu: 'તમારી સંપૂર્ણ કુંડળી, પ્રગટ.' },
  'home.sub':          {
    en: 'Enter your birth details and receive a precise Vedic birth chart, planetary positions, Nakshatra analysis and compatibility scores — powered by Swiss Ephemeris.',
    mr: 'आपले जन्म तपशील प्रविष्ट करा आणि अचूक वैदिक जन्मकुंडली, ग्रहांची स्थिती, नक्षत्र विश्लेषण आणि सुसंगतता गुण मिळवा — स्विस एफेमेरिस द्वारे.',
    hi: 'अपने जन्म का विवरण दर्ज करें और सटीक वैदिक जन्म कुंडली, ग्रह स्थिति, नक्षत्र विश्लेषण और मिलान अंक प्राप्त करें — स्विस एफिमेरिस द्वारा।',
    gu: 'તમારી જન્મ વિગતો દાખલ કરો અને સચોટ વૈદિક જન્મકુંડળી, ગ્રહ સ્થિતિ, નક્ષત્ર વિશ્લેષણ અને મેળવણ સ્કોર મેળવો — સ્વિસ એફેમેરિસ દ્વારા.',
  },
  'home.cta.kundali':  { en: 'Get My Kundali →', mr: 'माझी कुंडली पाहा →', hi: 'कुंडली देखें →', gu: 'મારી કુંડળી જુઓ →' },
  'home.cta.match':    { en: 'Check Compatibility', mr: 'सुसंगतता तपासा', hi: 'सुसंगतता जांचें', gu: 'મેળવણ ચકાસો' },
  'home.how.title':    { en: 'How it works', mr: 'हे कसे कार्य करते', hi: 'यह कैसे कार्य करता है', gu: 'આ કેવી રીતે કાર્ય કરે છે' },
  'home.step1.title':  { en: 'Enter birth details', mr: 'जन्म तपशील द्या', hi: 'जन्म विवरण दें', gu: 'જન્મ વિગતો આપો' },
  'home.step1.desc':   { en: 'Name, date, time and birthplace (village or city)', mr: 'नाव, तारीख, वेळ आणि जन्मस्थान (गाव किंवा शहर)', hi: 'नाम, जन्म तिथि, समय और जन्मस्थान', gu: 'નામ, જન્મ તારીખ, સમય અને જન્મસ્થળ' },
  'home.step2.title':  { en: 'We calculate your chart', mr: 'आम्ही आपली कुंडली काढतो', hi: 'हम आपकी कुंडली बनाते हैं', gu: 'અમે તમારી કુંડળી બનાવીએ છીએ' },
  'home.step2.desc':   { en: 'Precise sidereal positions via Swiss Ephemeris with Lahiri Ayanamsha', mr: 'लाहिरी अयनांशासह स्विस एफेमेरिसद्वारे अचूक नाक्षत्रिक स्थिती', hi: 'लाहिड़ी अयनांश के साथ स्विस एफिमेरिस द्वारा सटीक नाक्षत्रिक गणना', gu: 'લાહિરી અયનાંશ સાથે સ્વિસ એફેમેરિસ દ્વારા સચોટ ગણતરી' },
  'home.step3.title':  { en: 'Read your full report', mr: 'आपला संपूर्ण अहवाल वाचा', hi: 'अपना संपूर्ण विवरण देखें', gu: 'તમારો સંપૂર્ણ અહેવાલ વાંચો' },
  'home.step3.desc':   { en: 'Charts, planets, dignities, health insights, Guna Milan and more', mr: 'कुंडली, ग्रह, गुण, आरोग्य अंतर्दृष्टी, गुण मिलन आणि बरेच काही', hi: 'कुंडली, ग्रह, दशा, स्वास्थ्य विश्लेषण, गुण मिलान और बहुत कुछ', gu: 'કુંડળી, ગ્રહ, દશા, સ્વાસ્થ્ય વિશ્લેષણ, ગુણ મિલન અને વધુ' },

  // ─── Form ─────────────────────────────────────────────────────
  'form.name':               { en: 'Full name',                       mr: 'पूर्ण नाव', hi: 'पूरा नाम', gu: 'પૂરું નામ' },
  'form.name.placeholder':   { en: 'e.g. Sunita',                     mr: 'उदा. सुनीता', hi: 'उदा. अमित', gu: 'દા.ત. રાહુલ' },
  'form.gender':             { en: 'Gender',                          mr: 'लिंग', hi: 'लिंग', gu: 'જાતિ' },
  'form.dob':                { en: 'Date of birth',                   mr: 'जन्म तारीख', hi: 'जन्म तिथि', gu: 'જન્મ તારીખ' },
  'form.day':                { en: 'Day',                             mr: 'दिवस', hi: 'दिन', gu: 'દિવસ' },
  'form.month':              { en: 'Month',                           mr: 'महिना', hi: 'माह', gu: 'મહિનો' },
  'form.year':               { en: 'Year',                            mr: 'वर्ष', hi: 'वर्ष', gu: 'વર્ષ' },
  'form.tob':                { en: 'Time of birth (24-hour)',         mr: 'जन्म वेळ (२४ तास)', hi: 'जन्म समय (२४ घंटे)', gu: 'જન્મ સમય (૨૪ કલાક)' },
  'form.hour':               { en: 'Hour',                            mr: 'तास', hi: 'घंटा', gu: 'કલાક' },
  'form.minute':             { en: 'Minute',                          mr: 'मिनिट', hi: 'मिनट', gu: 'મિનિટ' },
  'form.birthplace':         { en: 'Birthplace',                      mr: 'जन्मस्थान', hi: 'जन्मस्थान', gu: 'જન્મસ્થળ' },
  'form.birthplace.hint':    { en: 'Search by village, town or city', mr: 'गाव, तालुका किंवा शहराचे नाव शोधा', hi: 'गांव, कस्बा या शहर का नाम खोजें', gu: 'ગામ, તાલુકો કે શહેરનું નામ શોધો' },
  'form.coords':             { en: 'Coordinates',                     mr: 'भौगोलिक स्थान', hi: 'भौगोलिक निर्देशांक', gu: 'ભૌગોલિક સ્થાન' },
  'form.lat':                { en: 'Latitude',                        mr: 'अक्षांश', hi: 'अक्षांश', gu: 'અક્ષાંશ' },
  'form.lon':                { en: 'Longitude',                       mr: 'रेखांश', hi: 'रेखांश', gu: 'રેખાંશ' },
  'form.tz':                 { en: 'Timezone at birth',               mr: 'जन्माच्या वेळचा कालपट्टा', hi: 'समय क्षेत्र (Timezone)', gu: 'સમય ક્ષેત્ર' },
  'form.submit.kundali':     { en: 'Calculate Kundali',               mr: 'कुंडली काढा', hi: 'कुंडली बनाएं', gu: 'કુંડળી બનાવો' },
  'form.submit.match':       { en: 'Check Match',                     mr: 'जुळणी तपासा', hi: 'मिलान जांचें', gu: 'મેળવણ ચકાસો' },
  'form.calculating':        { en: 'Calculating…',                    mr: 'गणना करत आहे…', hi: 'गणना हो रही है…', gu: 'ગણતરી થઈ રહી છે…' },

  // ─── Kundali Report ───────────────────────────────────────────
  'report.eyebrow':        { en: 'Kundali Report',                       mr: 'कुंडली अहवाल', hi: 'कुंडली विवरण', gu: 'કુંડળી અહેવાલ' },
  'report.ascendant':      { en: 'Ascendant (Lagna)',                    mr: 'लग्न', hi: 'लग्न', gu: 'લગ્ન' },
  'report.asc.nakshatra':  { en: 'Asc. Nakshatra',                       mr: 'लग्न नक्षत्र', hi: 'लग्न नक्षत्र', gu: 'લગ્ન નક્ષત્ર' },
  'report.moon.sign':      { en: 'Moon Sign (Rashi)',                     mr: 'चंद्र राशी', hi: 'चंद्र राशि', gu: 'ચંદ્ર રાશિ' },
  'report.moon.nakshatra': { en: 'Moon Nakshatra',                       mr: 'चंद्र नक्षत्र', hi: 'चंद्र नक्षत्र', gu: 'ચંદ્ર નક્ષત્ર' },
  'report.ayanamsha':      { en: 'Ayanamsha',                            mr: 'अयनांश', hi: 'अयनांश', gu: 'અયનાંશ' },
  'report.manglik':        { en: 'Manglik Status',                       mr: 'मंगळ दोष', hi: 'मांगलिक स्थिति', gu: 'માંગલિક સ્થિતિ' },
  'report.varna':          { en: 'Varna (Ego & Work)',                    mr: 'वर्ण (अहंकार आणि कार्य)', hi: 'वर्ण', gu: 'વર્ણ' },
  'report.gana':           { en: 'Gana (Temperament)',                    mr: 'गण (स्वभाव)', hi: 'गण', gu: 'ગણ' },
  'report.nadi':           { en: 'Nadi (Health & Genes)',                 mr: 'नाडी (आरोग्य आणि जनुके)', hi: 'नाड़ी', gu: 'નાડી' },
  'report.house.strip':    { en: 'House Summary (D1):',                   mr: 'भाव सारांश (D1):', hi: 'भाव सारांश (D1):', gu: 'ભાવ સારાંશ (D1):' },
  'report.chart.select':   { en: 'Select Chart:',                        mr: 'कुंडली निवडा:', hi: 'कुंडली चुनें:', gu: 'કુંડળી પસંદ કરો:' },
  'report.chart.d1':       { en: 'D1 — Lagna Chart',                     mr: 'D1 — लग्न कुंडली', hi: 'D1 — लग्न कुंडली', gu: 'D1 — લગ્ન કુંડળી' },
  'report.chart.d9':       { en: 'D9 — Navamsha Chart',                  mr: 'D9 — नवांश कुंडली', hi: 'D9 — नवांश कुंडली', gu: 'D9 — નવાંશ કુંડળી' },
  'report.chart.rashi':    { en: 'Rashi — Moon Chart',                   mr: 'राशी — चंद्र कुंडली', hi: 'राशि — चंद्र कुंडली', gu: 'રાશિ — ચંદ્ર કુંડળી' },

  // ─── Chart styles ─────────────────────────────────────────────
  'chart.south.btn':       { en: 'South Indian (Fixed Signs)',            mr: 'दक्षिण भारतीय (स्थिर राशी)', hi: 'दक्षिण भारतीय (स्थिर राशि)', gu: 'દક્ષિણ ભારતીય' },
  'chart.north.btn':       { en: 'North Indian (Diamond)',                mr: 'उत्तर भारतीय (हिरा कुंडली)', hi: 'उत्तर भारतीय (हीरा कुंडली)', gu: 'ઉત્તર ભારતીય' },
  'chart.east.btn':        { en: 'East Indian (Bengali)',                 mr: 'पूर्व भारतीय (बंगाली)', hi: 'पूर्वी भारतीय (बंगाली)', gu: 'પૂર્વ ભારતીય (બંગાળી)' },
  'chart.no.data':         { en: 'No chart data available',              mr: 'कुंडली डेटा उपलब्ध नाही', hi: 'कोई डेटा उपलब्ध नहीं', gu: 'કોઈ ડેટા ઉપલબ્ધ નથી' },
  'chart.lagna.label':     { en: 'Lagna',                                mr: 'लग्न', hi: 'लग्न', gu: 'લગ્ન' },
  'chart.retrograde':      { en: 'retrograde',                           mr: 'वक्री', hi: 'वक्री', gu: 'વક્રી' },

  // ─── 12 Zodiac Signs ─────────────────────────────────────────
  'sign.0':  { en: 'Aries',       mr: 'मेष',     hi: 'मेष',     gu: 'મેષ',     abbr_en: 'Ari', abbr_mr: 'मेष', abbr_hi: 'मेष', abbr_gu: 'મેષ' },
  'sign.1':  { en: 'Taurus',      mr: 'वृषभ',    hi: 'वृषभ',    gu: 'વૃષભ',    abbr_en: 'Tau', abbr_mr: 'वृष', abbr_hi: 'वृष', abbr_gu: 'વૃષ' },
  'sign.2':  { en: 'Gemini',      mr: 'मिथुन',   hi: 'मिथुन',   gu: 'મિથુન',   abbr_en: 'Gem', abbr_mr: 'मिथ', abbr_hi: 'मिथ', abbr_gu: 'મિથ' },
  'sign.3':  { en: 'Cancer',      mr: 'कर्क',    hi: 'कर्क',    gu: 'કર્ક',    abbr_en: 'Can', abbr_mr: 'कर्क', abbr_hi: 'कर्क', abbr_gu: 'કર્ક' },
  'sign.4':  { en: 'Leo',         mr: 'सिंह',    hi: 'सिंह',    gu: 'સિંહ',    abbr_en: 'Leo', abbr_mr: 'सिंह', abbr_hi: 'सिंह', abbr_gu: 'સિંહ' },
  'sign.5':  { en: 'Virgo',       mr: 'कन्या',   hi: 'कन्या',   gu: 'કન્યા',   abbr_en: 'Vir', abbr_mr: 'कन्या', abbr_hi: 'कन्या', abbr_gu: 'કન્યા' },
  'sign.6':  { en: 'Libra',       mr: 'तुला',    hi: 'तुला',    gu: 'તુલા',    abbr_en: 'Lib', abbr_mr: 'तुला', abbr_hi: 'तुला', abbr_gu: 'તુલા' },
  'sign.7':  { en: 'Scorpio',     mr: 'वृश्चिक', hi: 'वृश्चिक', gu: 'વૃશ્ચિક', abbr_en: 'Sco', abbr_mr: 'वृश्चि', abbr_hi: 'वृश्चि', abbr_gu: 'વૃશ્ચિ' },
  'sign.8':  { en: 'Sagittarius', mr: 'धनु',     hi: 'धनु',     gu: 'ધન',     abbr_en: 'Sag', abbr_mr: 'धनु', abbr_hi: 'धनु', abbr_gu: 'ધન' },
  'sign.9':  { en: 'Capricorn',   mr: 'मकर',     hi: 'मकर',     gu: 'મકર',     abbr_en: 'Cap', abbr_mr: 'मकर', abbr_hi: 'मकर', abbr_gu: 'મકર' },
  'sign.10': { en: 'Aquarius',    mr: 'कुंभ',    hi: 'कुंभ',    gu: 'કુંભ',    abbr_en: 'Aqu', abbr_mr: 'कुंभ', abbr_hi: 'कुंभ', abbr_gu: 'કુંભ' },
  'sign.11': { en: 'Pisces',      mr: 'मीन',     hi: 'मीन',     gu: 'મીન',     abbr_en: 'Pis', abbr_mr: 'मीन', abbr_hi: 'मीन', abbr_gu: 'મીન' },

  // ─── 9 Planets ────────────────────────────────────────────────
  'planet.Sun':     { en: 'Sun',     mr: 'सूर्य',   hi: 'सूर्य',   gu: 'સૂર્ય',   abbr_en: 'Su',  abbr_mr: 'सू', abbr_hi: 'सू', abbr_gu: 'સૂ' },
  'planet.Moon':    { en: 'Moon',    mr: 'चंद्र',   hi: 'चंद्र',   gu: 'ચંદ્ર',   abbr_en: 'Mo',  abbr_mr: 'चं', abbr_hi: 'चं', abbr_gu: 'ચં' },
  'planet.Mars':    { en: 'Mars',    mr: 'मंगळ',    hi: 'मंगल',    gu: 'મંગળ',    abbr_en: 'Ma',  abbr_mr: 'मं', abbr_hi: 'मं', abbr_gu: 'મં' },
  'planet.Mercury': { en: 'Mercury', mr: 'बुध',     hi: 'बुध',     gu: 'બુધ',     abbr_en: 'Me',  abbr_mr: 'बु', abbr_hi: 'बु', abbr_gu: 'બુ' },
  'planet.Jupiter': { en: 'Jupiter', mr: 'गुरू',    hi: 'बृहस्पति / गुरु', gu: 'ગુરુ', abbr_en: 'Ju',  abbr_mr: 'गु', abbr_hi: 'गु', abbr_gu: 'ગુ' },
  'planet.Venus':   { en: 'Venus',   mr: 'शुक्र',   hi: 'शुक्र',   gu: 'શુક્ર',   abbr_en: 'Ve',  abbr_mr: 'शु', abbr_hi: 'शु', abbr_gu: 'શુ' },
  'planet.Saturn':  { en: 'Saturn',  mr: 'शनी',     hi: 'शनि',     gu: 'શનિ',     abbr_en: 'Sa',  abbr_mr: 'श', abbr_hi: 'श', abbr_gu: 'શ' },
  'planet.Rahu':    { en: 'Rahu',    mr: 'राहू',    hi: 'राहु',    gu: 'રાહુ',    abbr_en: 'Ra',  abbr_mr: 'रा', abbr_hi: 'रा', abbr_gu: 'રા' },
  'planet.Ketu':    { en: 'Ketu',    mr: 'केतू',    hi: 'केतु',    gu: 'કેતુ',    abbr_en: 'Ke',  abbr_mr: 'के', abbr_hi: 'के', abbr_gu: 'કે' },

  // ─── Match Report ─────────────────────────────────────────────
  'match.title':   { en: 'Ashtakoot Guna Milan Report', mr: 'अष्टकूट गुण मिलन अहवाल', hi: 'अष्टकूट गुण मिलान विवरण', gu: 'અષ્ટકૂટ ગુણ મિલન અહેવાલ' },
  'match.score':   { en: 'Total Score', mr: 'एकूण गुण', hi: 'कुल प्राप्तांक', gu: 'કુલ ગુણ' },
  'match.verdict': { en: 'Compatibility Verdict', mr: 'सुसंगतता निर्णय', hi: 'मिलान निर्णय', gu: 'મેળવણ નિર્ણય' },
};

/**
 * Get a translated string.
 * @param {string} key
 * @param {'en'|'mr'|'hi'|'gu'} lang
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
  return entry[lang] || entry.en || String(idx + 1);
}

/** Translate a sign abbreviation by its 0-based index */
export function signAbbr(idx, lang = 'en') {
  const entry = TRANSLATIONS[`sign.${idx}`];
  if (!entry) return String(idx + 1);
  if (lang === 'mr') return entry.abbr_mr || entry.abbr_en;
  if (lang === 'hi') return entry.abbr_hi || entry.abbr_en;
  if (lang === 'gu') return entry.abbr_gu || entry.abbr_en;
  return entry.abbr_en;
}

/** Translate a planet name */
export function planetName(name, lang = 'en') {
  const entry = TRANSLATIONS[`planet.${name}`];
  if (!entry) return name;
  return entry[lang] || entry.en || name;
}

/** Translate a dignity string */
export function dignityName(dignity, lang = 'en') {
  const entry = TRANSLATIONS[`dignity.${dignity}`];
  if (!entry) return dignity;
  return entry[lang] || entry.en || dignity;
}

/** Translate a nakshatra name */
export function nakshatraName(name, lang = 'en') {
  const entry = TRANSLATIONS[`nakshatra.${name}`];
  if (!entry) return name;
  return entry[lang] || entry.en || name;
}

