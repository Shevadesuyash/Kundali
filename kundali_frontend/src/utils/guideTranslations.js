/**
 * Complete Multi-Language Vedic Astrology Knowledge Center (/guide)
 * Covers: The 12 Bhavas, 9 Grahas, Ashtakvarga SAV benchmarks, Vimshottari Dashas,
 * Ashtakoot Guna Milan, Doshas & Remedies, KP System & Varshapal in EN, MR, HI, GU.
 */

export const GUIDE_CONTENT = {
  header: {
    eyebrow: { en: 'Jyotish Vidya Knowledge Center', mr: 'ज्योतिष विद्या ज्ञान केंद्र', hi: 'ज्योतिष विद्या ज्ञान केंद्र', gu: 'જ્યોતિષ વિદ્યા જ્ઞાન કેન્દ્ર' },
    title: { en: 'Vedic Astrology Reference Guide', mr: 'वैदिक ज्योतिष संपूर्ण संदर्भ मार्गदर्शिका', hi: 'वैदिक ज्योतिष संपूर्ण संदर्भ गाइड', gu: 'વૈદિક જ્યોતિષ સંપૂર્ણ સંદર્ભ માર્ગદર્શિકા' },
    intro: {
      en: 'A structured guide to understanding how planetary positions, 12 Bhavas (houses), Ashtakvarga scores, Vimshottari Dashas, and Guna Milan matchmaking are computed and interpreted.',
      mr: 'ग्रहांची स्थिती, १२ भाव (स्थाने), अष्टकवर्ग गुण, विंशोत्तरी महादशा आणि अष्टकूट गुण मिलन कसे मोजले व तपासले जातात, याची शास्त्रोक्त आणि सोपी मार्गदर्शिका.',
      hi: 'ग्रह स्थिति, १२ भाव (स्थान), अष्टकवर्ग अंक, विंशोत्तरी महादशा और अष्टकूट गुण मिलान की गणना और फलित को सरलता से समझने हेतु संपूर्ण गाइड।',
      gu: 'ગ્રહોની સ્થિતિ, ૧૨ ભાવ, અષ્ટકવર્ગ ગુણ, વિંશોત્તરી દશા અને અષ્ટકૂટ ગુણ મેળવણ કેવી રીતે સમજવું તેની સંપૂર્ણ માર્ગદર્શિકા.',
    },
  },
  nav: {
    houses: { en: '1. The 12 Bhavas (Houses)', mr: '१. १२ भाव (स्थाने)', hi: '१. १२ भाव (घर)', gu: '૧. ૧૨ ભાવ' },
    planets: { en: '2. The 9 Grahas (Planets)', mr: '२. ९ नवग्रह', hi: '२. ९ नवग्रह', gu: '૨. ૯ નવગ્રહ' },
    ashtakvarga: { en: '3. Ashtakvarga & SAV', mr: '३. अष्टकवर्ग व SAV गुण', hi: '३. अष्टकवर्ग एवं SAV अंक', gu: '૩. અષ્ટકવર્ગ અને SAV ગુણ' },
    dashas: { en: '4. Vimshottari Dasha', mr: '४. विंशोत्तरी दशा पद्धती', hi: '४. विंशोत्तरी दशा प्रणाली', gu: '૪. વિંશોત્તરી દશા પદ્ધતિ' },
    matchmaking: { en: '5. Ashtakoot Guna Milan', mr: '५. अष्टकूट गुण मिलन (३६ गुण)', hi: '५. अष्टकूट गुण मिलान (३६ अंक)', gu: '૫. અષ્ટકૂટ ગુણ મેળવણ (૩૬ ગુણ)' },
    doshas: { en: '6. Doshas & Remedies', mr: '६. दोष व शास्त्रोक्त उपाय', hi: '६. दोष एवं वैदिक उपाय', gu: '૬. દોષ અને વૈદિક ઉપાય' },
    kp: { en: '7. KP System & Varshapal', mr: '७. केपी पद्धती व वर्षफळ', hi: '७. केपी पद्धति एवं वर्षफल', gu: '૭. કેપી પદ્ધતિ અને વર્ષફળ' },
  },
  houses: [
    {
      num: 1,
      sanskrit: { en: 'Tanu Bhava (Lagna)', mr: 'तनु भाव (लग्न)', hi: 'तनु भाव (लग्न)', gu: 'તનુ ભાવ (લગ્ન)' },
      type: { en: 'Kendra & Trikona', mr: 'केंद्र व त्रिकोण', hi: 'केंद्र एवं त्रिकोण', gu: 'કેન્દ્ર અને ત્રિકોણ' },
      significations: {
        en: 'Self, physical vitality, appearance, character, head, foundational life direction',
        mr: 'शरीर, व्यक्तिमत्त्व, आरोग्य, तेज, स्वभाव, डोके, आयुष्य व आत्मसन्मान',
        hi: 'स्वयं, शारीरिक स्वास्थ्य, रूप-रंग, स्वभाव, मस्तक और जीवन की दिशा',
        gu: 'શરીર, સ્વાસ્થ્ય, વ્યક્તિત્વ, સ્વભાવ અને જીવનની દિશા',
      },
      karaka: { en: 'Sun (Surya)', mr: 'सूर्य', hi: 'सूर्य', gu: 'સૂર્ય' },
    },
    {
      num: 2,
      sanskrit: { en: 'Dhana Bhava', mr: 'धन भाव', hi: 'धन भाव', gu: 'ધન ભાવ' },
      type: { en: 'Maraka / Wealth', mr: 'मारक / धनस्थान', hi: 'मारक / धन स्थान', gu: 'મારક / ધન સ્થાન' },
      significations: {
        en: 'Accumulated wealth, family lineage, speech, eyes, eating habits, liquid assets',
        mr: 'संचित धन, कुटुंब, वाणी, उजवा डोळा, खाण्यापिण्याच्या सवयी, बँक शिल्लक',
        hi: 'संचित धन, कुटुंब, वाणी, नेत्र, खान-पान की आदतें और चल संपत्ति',
        gu: 'સંચિત ધન, પરિવાર, વાણી, નેત્ર અને ખાનપાનની આદતો',
      },
      karaka: { en: 'Jupiter (Guru)', mr: 'गुरु', hi: 'गुरु / बृहस्पति', gu: 'ગુરુ' },
    },
    {
      num: 3,
      sanskrit: { en: 'Sahaja Bhava', mr: 'सहज भाव (पराक्रम)', hi: 'सहज भाव (पराक्रम)', gu: 'સહજ ભાવ (પરાક્રમ)' },
      type: { en: 'Upachaya', mr: 'उपचय भाव', hi: 'उपचय भाव', gu: 'ઉપચય ભાવ' },
      significations: {
        en: 'Younger siblings, courage, enterprise, short travels, communication, arms and hands',
        mr: 'लहान भावंडे, धैर्य, पराक्रम, छोटे प्रवास, संभाषण कौशल्य, हात व खांदे',
        hi: 'छोटे भाई-बहन, साहस, पराक्रम, छोटी यात्राएं, संवाद और भुजाएं',
        gu: 'નાના ભાઈ-બહેન, સાહસ, યાત્રાઓ અને સંચાર કૌશલ્ય',
      },
      karaka: { en: 'Mars (Mangal)', mr: 'मंगळ', hi: 'मंगल', gu: 'મંગળ' },
    },
    {
      num: 4,
      sanskrit: { en: 'Sukha Bhava', mr: 'सुख भाव (मातृस्थान)', hi: 'सुख भाव (मातृ स्थान)', gu: 'સુખ ભાવ (માતૃ સ્થાન)' },
      type: { en: 'Kendra (Heart)', mr: 'केंद्र (हृदय स्थान)', hi: 'केंद्र (हृदय स्थान)', gu: 'કેન્દ્ર (હૃદય સ્થાન)' },
      significations: {
        en: 'Mother, home, real estate, vehicles, inner peace, basic education, chest',
        mr: 'आई, घर, भूमी, वाहने, मानसिक सुख-शांतता, शालेय शिक्षण, छाती',
        hi: 'माता, गृह, भूमि, वाहन, मानसिक शांति, प्राथमिक शिक्षा और हृदय',
        gu: 'માતા, ઘર, વાહન, માનસિક શાંતિ અને પ્રાથમિક શિક્ષણ',
      },
      karaka: { en: 'Moon (Chandra)', mr: 'चंद्र', hi: 'चंद्रमा', gu: 'ચંદ્ર' },
    },
    {
      num: 5,
      sanskrit: { en: 'Putra Bhava', mr: 'पुत्र भाव (विद्या व संतती)', hi: 'पुत्र भाव (विद्या एवं संतान)', gu: 'પુત્ર ભાવ (વિદ્યા અને સંતાન)' },
      type: { en: 'Trikona (Dharma)', mr: 'त्रिकोण (धर्मस्थान)', hi: 'त्रिकोण (धर्म स्थान)', gu: 'ત્રિકોણ (ધર્મ સ્થાન)' },
      significations: {
        en: 'Children, intellect, creativity, speculative investments, Purva Punya (past karmas)',
        mr: 'संतती, कुशाग्र बुद्धिमत्ता, उच्च शिक्षण, कल्पकता, पूर्वपुण्याई, शेअर्स व गुंतवणूक',
        hi: 'संतान, तीव्र बुद्धि, उच्च विद्या, रचनात्मकता, पूर्वजन्म के पुण्य और निवेश',
        gu: 'સંતાન, બુદ્ધિ, રચનાત્મકતા અને પૂર્વ પુણ્ય',
      },
      karaka: { en: 'Jupiter (Guru)', mr: 'गुरु', hi: 'गुरु', gu: 'ગુરુ' },
    },
    {
      num: 6,
      sanskrit: { en: 'Ripu / Roga Bhava', mr: 'रिपु/रोग भाव (शत्रू स्थान)', hi: 'रिपु/रोग भाव (शत्रु स्थान)', gu: 'રિપુ/રોગ ભાવ (શત્રુ સ્થાન)' },
      type: { en: 'Dusthana / Upachaya', mr: 'त्रिक / उपचय', hi: 'त्रिक / उपचय', gu: 'ત્રિક / ઉપચય' },
      significations: {
        en: 'Daily work, enemies, diseases, debts, litigation, service, immunity',
        mr: 'नोकरी, दैनंदिन काम, आजारपण, कर्जे, शत्रू, न्यायालयीन बाबी, रोगप्रतिकारशक्ती',
        hi: 'दैनिक कार्य, शत्रु, रोग, ऋण, मुकदमेबाजी, सेवा और रोग प्रतिरोधक क्षमता',
        gu: 'રોજિંદુ કાર્ય, શત્રુ, રોગ, દેવું અને સ્પર્ધાત્મક પરીક્ષાઓ',
      },
      karaka: { en: 'Mars & Saturn', mr: 'मंगळ व शनी', hi: 'मंगल एवं शनि', gu: 'મંગળ અને શનિ' },
    },
    {
      num: 7,
      sanskrit: { en: 'Jaya Bhava (Kalatra)', mr: 'जाया भाव (विवाह व भागीदारी)', hi: 'जाया भाव (विवाह एवं साझेदारी)', gu: 'જાયા ભાવ (લગ્ન અને ભાગીદારી)' },
      type: { en: 'Kendra & Maraka', mr: 'केंद्र व मारक', hi: 'केंद्र एवं मारक', gu: 'કેન્દ્ર અને મારક' },
      significations: {
        en: 'Spouse, marriage, business partnerships, public relations, foreign trade',
        mr: 'पती/पत्नी, वैवाहिक जीवन, व्यावसायिक भागीदारी, जनसंपर्क, परदेश व्यापार',
        hi: 'जीवनसाथी, वैवाहिक जीवन, व्यापारिक साझेदारी, जनसंपर्क और विदेश व्यापार',
        gu: 'જીવનસાથી, લગ્ન જીવન, ભાગીદારી અને જનસંપર્ક',
      },
      karaka: { en: 'Venus (Shukra)', mr: 'शुक्र', hi: 'शुक्र', gu: 'શુક્ર' },
    },
    {
      num: 8,
      sanskrit: { en: 'Ayur Bhava (Randhra)', mr: 'आयुष्य भाव (गूढ स्थान)', hi: 'आयु भाव (गूढ़ स्थान)', gu: 'આયુષ્ય ભાવ (ગૂઢ સ્થાન)' },
      type: { en: 'Dusthana (Moksha)', mr: 'त्रिक / मोक्ष स्थान', hi: 'त्रिक / मोक्ष स्थान', gu: 'ત્રિક / મોક્ષ સ્થાન' },
      significations: {
        en: 'Longevity, transformation, occult sciences, inheritance, sudden events, research',
        mr: 'आयुर्मान, अचानक घडणाऱ्या घटना, गूढ विद्या, वारसा हक्क, संशोधन, गुप्त बाबी',
        hi: 'दीर्घायु, अप्रत्याशित परिवर्तन, गूढ़ विद्याएं, पैतृक संपत्ति और शोध',
        gu: 'આયુષ્ય, અણધારી ઘટનાઓ, ગૂઢ વિદ્યા અને વારસાગત મિલકત',
      },
      karaka: { en: 'Saturn (Shani)', mr: 'शनी', hi: 'शनि', gu: 'શનિ' },
    },
    {
      num: 9,
      sanskrit: { en: 'Bhagya Bhava', mr: 'भाग्य भाव (धर्मस्थान)', hi: 'भाग्य भाव (धर्म स्थान)', gu: 'ભાગ્ય ભાવ (ધર્મ સ્થાન)' },
      type: { en: 'Trikona (Fortune)', mr: 'सर्वोत्तम त्रिकोण', hi: 'सर्वोत्तम त्रिकोण', gu: 'સર્વોત્તમ ત્રિકોણ' },
      significations: {
        en: 'Father, guru, higher wisdom, dharma, pilgrimages, destiny, divine fortune',
        mr: 'वडील, गुरु, उच्च ज्ञान, धर्म, तीर्थयात्रा, भाग्योदय, ईश्वर कृपा',
        hi: 'पिता, गुरु, उच्च ज्ञान, धर्म, तीर्थाटन, भाग्य और ईश्वरीय कृपा',
        gu: 'પિતા, ગુરુ, ઉચ્ચ શિક્ષણ, ધર્મ, તીર્થયાત્રા અને ભાગ્યોદય',
      },
      karaka: { en: 'Jupiter & Sun', mr: 'गुरु व सूर्य', hi: 'गुरु एवं सूर्य', gu: 'ગુરુ અને સૂર્ય' },
    },
    {
      num: 10,
      sanskrit: { en: 'Karma Bhava', mr: 'कर्म भाव (व्यवसाय व अधिकार)', hi: 'कर्म भाव (आजीविका एवं अधिकार)', gu: 'કર્મ ભાવ (આજીવિકા અને અધિકાર)' },
      type: { en: 'Kendra (Highest)', mr: 'सर्वोच्च केंद्र स्थान', hi: 'सर्वोच्च केंद्र स्थान', gu: 'સર્વોચ્ચ કેન્દ્ર સ્થાન' },
      significations: {
        en: 'Career, profession, reputation, government status, fame, executive authority',
        mr: 'करिअर, व्यवसाय, सामाजिक मान-सन्मान, शासकीय पद, अधिकार, नेतृत्व',
        hi: 'करियर, व्यवसाय, सामाजिक मान-प्रतिष्ठा, शासकीय पद और प्रशासनिक अधिकार',
        gu: 'કારકિર્દી, વ્યવસાય, સામાજિક પ્રતિષ્ઠા અને પદવી',
      },
      karaka: { en: 'Sun, Mercury, Saturn', mr: 'सूर्य, बुध, शनी', hi: 'सूर्य, बुध, शनि', gu: 'સૂર્ય, બુધ, શનિ' },
    },
    {
      num: 11,
      sanskrit: { en: 'Labha Bhava', mr: 'लाभ भाव (आयस्थान)', hi: 'लाभ भाव (आय स्थान)', gu: 'લાભ ભાવ (આવક સ્થાન)' },
      type: { en: 'Upachaya (Wealth)', mr: 'उपचय / लाभ स्थान', hi: 'उपचय / लाभ स्थान', gu: 'ઉપચય / લાભ સ્થાન' },
      significations: {
        en: 'Gains, elder siblings, social networks, realization of ambitions, regular income',
        mr: 'आर्थिक लाभ, मोठे भावंडे, मित्रपरिवार, सर्व मनोकामनांची पूर्ती, नियमित उत्पन्न',
        hi: 'आर्थिक लाभ, बड़े भाई-बहन, सामाजिक संपर्क, मनोकामना पूर्ति और नियमित आय',
        gu: 'આર્થિક લાભ, મોટા ભાઈ-બહેન, મિત્રો અને સર્વ મનોકામના પૂર્તિ',
      },
      karaka: { en: 'Jupiter (Guru)', mr: 'गुरु', hi: 'गुरु', gu: 'ગુરુ' },
    },
    {
      num: 12,
      sanskrit: { en: 'Vyaya Bhava', mr: 'व्यय भाव (मोक्ष स्थान)', hi: 'व्यय भाव (मोक्ष स्थान)', gu: 'વ્યય ભાવ (મોક્ષ સ્થાન)' },
      type: { en: 'Dusthana (Moksha)', mr: 'त्रिक / मोक्ष स्थान', hi: 'त्रिक / मोक्ष स्थान', gu: 'ત્રિક / મોક્ષ સ્થાન' },
      significations: {
        en: 'Expenditures, foreign travels, hospitalization, isolation, sleep, spiritual liberation (Moksha)',
        mr: 'खर्च, परदेश गमन, दानधर्म, एकांत, निद्रा सुख, आत्मिक मुक्ती व मोक्ष',
        hi: 'व्यय, विदेश यात्रा, अस्पताल, एकांत, शयन सुख और आध्यात्मिक मोक्ष',
        gu: 'ખર્ચ, વિદેશ ગમન, દાન, એકાંત અને આધ્યાત્મિક મોક્ષ',
      },
      karaka: { en: 'Saturn & Ketu', mr: 'शनी व केतू', hi: 'शनि एवं केतु', gu: 'શનિ અને કેતુ' },
    },
  ],
};
