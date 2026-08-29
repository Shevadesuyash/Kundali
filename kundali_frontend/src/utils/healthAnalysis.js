/**
 * Vedic Health & Disease Analysis Engine
 * Based on classical Jyotish principles:
 *  - Ascendant sign → Prakriti (constitution) & body parts
 *  - 6th house (lord + occupants) → acute disease tendencies
 *  - 8th house → chronic / hidden conditions
 *  - Mars placement → fever, inflammation, surgery
 *  - Moon affliction → mental/emotional health
 *  - Saturn → nervous system, chronic, bones
 *  - Sun → heart, vitality
 *  - Nakshatra of Lagna lord → specific tendencies
 */

// ── Ascendant Sign Data ────────────────────────────────────────────────────
const SIGN_HEALTH = {
  0: { // Aries
    sign: 'Aries / मेष',
    prakriti: { en: 'Pitta (Fire & Water)', mr: 'पित्त (अग्नी आणि जल)', hi: 'पित्त (अग्नि एवं जल)', gu: 'પિત્ત (અગ્નિ અને જળ)' },
    constitution: {
      en: 'Hot, sharp, and energetic constitution. Strong metabolism and digestion. Tendency toward inflammation and heat-related disorders.',
      mr: 'उष्ण, तीव्र आणि ऊर्जावान प्रकृती. चांगली पचनशक्ती. दाह आणि उष्णतेशी संबंधित आजारांची प्रवृत्ती.'
    },
    bodyParts: { en: 'Head, brain, face, eyes, sinuses', mr: 'डोके, मेंदू, चेहरा, डोळे, सायनस' },
    diseases: [
      { en: 'Headaches & migraines', mr: 'डोकेदुखी व मायग्रेन' },
      { en: 'Eye inflammation', mr: 'डोळ्यांची जळजळ' },
      { en: 'Fever & high temperature', mr: 'ताप व उच्च तापमान' },
      { en: 'Brain-related disorders', mr: 'मेंदू संबंधित विकार' },
      { en: 'Acne & skin rashes (pitta)', mr: 'मुरुमे व पुरळ (पित्त)' },
    ],
    fever: { en: 'Prone to sudden high fevers (Mars rules Aries). Fevers tend to be acute but short-lived.', mr: 'अचानक तीव्र तापाची प्रवृत्ती (मंगळ मेष राशीचा स्वामी). ताप तीव्र पण कमी काळाचा असतो.' },
    remedy: { en: 'Keep cool, avoid spicy food, wear ruby/coral for strength. Regular cooling herbs like coriander and fennel help.', mr: 'थंड राहा, मसालेदार अन्न टाळा, बळकटीसाठी माणिक/पोवळे घाला. कोथिंबीर आणि बडीशेप यांसारखी थंड औषधी वनस्पती उपयुक्त.' },
  },
  1: { // Taurus
    sign: 'Taurus / वृषभ',
    prakriti: { en: 'Kapha-Vata (Earth & Air)', mr: 'कफ-वात (पृथ्वी आणि वायू)', hi: 'कफ-वात (पृथ्वी एवं वायु)', gu: 'કફ-વાત (પૃથ્વી અને વાયુ)' },
    constitution: {
      en: 'Stable, strong and enduring constitution. Slow metabolism. Tendency toward respiratory and thyroid issues.',
      mr: 'स्थिर, मजबूत आणि टिकाऊ प्रकृती. मंद चयापचय. श्वसन आणि थायरॉईड समस्यांची प्रवृत्ती.'
    },
    bodyParts: { en: 'Throat, neck, thyroid, tonsils, vocal cords', mr: 'घसा, मान, थायरॉईड, टॉन्सिल, आवाजाच्या नाड्या' },
    diseases: [
      { en: 'Thyroid disorders', mr: 'थायरॉईड विकार' },
      { en: 'Tonsillitis & sore throat', mr: 'टॉन्सिलायटिस व घसादुखी' },
      { en: 'Neck stiffness & cervical issues', mr: 'मान ताठरणे व सर्व्हायकल समस्या' },
      { en: 'Obesity (Kapha predominance)', mr: 'लठ्ठपणा (कफ प्राधान्य)' },
      { en: 'Voice & speech problems', mr: 'आवाज व बोलण्याच्या समस्या' },
    ],
    fever: { en: 'Low-grade, persistent fevers with mucus build-up. Slow to develop, slow to recover.', mr: 'श्लेष्मा वाढीसह सौम्य, सतत ताप. हळूहळू विकसित होतो, हळूहळू बरे होते.' },
    remedy: { en: 'Warm, light diet. Avoid dairy excess. Honey and ginger decoctions. Diamond/emerald for strength.', mr: 'उबदार, हलका आहार. दुग्धजन्य पदार्थ टाळा. मध आणि आले काढा. बळकटीसाठी हिरा/पाचू.' },
  },
  2: { // Gemini
    sign: 'Gemini / मिथुन',
    prakriti: { en: 'Vata (Air & Ether)', mr: 'वात (वायू आणि आकाश)', hi: 'वात (वायु एवं आकाश)', gu: 'વાત (વાયુ અને આકાશ)' },
    constitution: {
      en: 'Quick, adaptive but variable constitution. Nervous system sensitivity. Tendency toward anxiety and respiratory issues.',
      mr: 'जलद, अनुकूल पण परिवर्तनशील प्रकृती. मज्जासंस्था संवेदनशीलता. चिंता आणि श्वसन समस्यांची प्रवृत्ती.'
    },
    bodyParts: { en: 'Lungs, arms, hands, shoulders, nervous system', mr: 'फुफ्फुसे, बाहू, हात, खांदे, मज्जासंस्था' },
    diseases: [
      { en: 'Respiratory infections & bronchitis', mr: 'श्वसन संक्रमण व ब्रॉन्कायटिस' },
      { en: 'Anxiety & nervous disorders', mr: 'चिंता व मज्जा विकार' },
      { en: 'Shoulder & arm pain', mr: 'खांदे व बाहूंचे दुखणे' },
      { en: 'Insomnia (Vata aggravation)', mr: 'निद्रानाश (वात वाढ)' },
      { en: 'Skin disorders (dry type)', mr: 'त्वचा विकार (कोरडा प्रकार)' },
    ],
    fever: { en: 'Intermittent fevers that shift and change. Often linked to respiratory infections. Variable pattern.', mr: 'बदलणारे आणि अनियमित ताप. बहुतेकदा श्वसन संक्रमणाशी संबंधित. परिवर्तनशील नमुना.' },
    remedy: { en: 'Warm oils, grounding routines. Ashwagandha for nerves. Avoid cold and erratic schedules. Emerald stone.', mr: 'उबदार तेल, स्थिर दिनचर्या. मज्जांसाठी अश्वगंधा. थंड आणि अनियमित वेळापत्रक टाळा. पाचू रत्न.' },
  },
  3: { // Cancer
    sign: 'Cancer / कर्क',
    prakriti: { en: 'Kapha-Pitta (Water & Fire)', mr: 'कफ-पित्त (जल आणि अग्नी)', hi: 'कफ-पित्त (जल एवं अग्नि)', gu: 'કફ-પિત્ત (જળ અને અગ્નિ)' },
    constitution: {
      en: 'Nurturing, sensitive and fluid constitution. Strong immunity but prone to emotional eating. Digestive and lymphatic sensitivity.',
      mr: 'पोषण करणारी, संवेदनशील आणि तरल प्रकृती. मजबूत प्रतिकारशक्ती पण भावनिक खाण्याची प्रवृत्ती. पचन आणि लसीका संवेदनशीलता.'
    },
    bodyParts: { en: 'Chest, breasts, stomach, lymphatic system, uterus', mr: 'छाती, स्तन, पोट, लसीका तंत्र, गर्भाशय' },
    diseases: [
      { en: 'Digestive disorders & acidity', mr: 'पाचन विकार व आम्लपित्त' },
      { en: 'Hormonal imbalances', mr: 'संप्रेरक असंतुलन' },
      { en: 'Water retention & edema', mr: 'जलधारण व सूज' },
      { en: 'Breast-related conditions', mr: 'स्तनाशी संबंधित स्थिती' },
      { en: 'Anxiety & mood swings (Moon rules Cancer)', mr: 'चिंता व मूड बदल (चंद्र कर्कचा स्वामी)' },
    ],
    fever: { en: 'Fevers linked to stomach upset, infections or emotional stress. Fluctuating, often with chills.', mr: 'पोटाच्या तक्रारी, संक्रमण किंवा भावनिक ताणाशी संबंधित ताप. चढ-उतार, बहुतेकदा थंडी वाजते.' },
    remedy: { en: 'Emotional stability practices. Light, easy-to-digest food. Pearl or moonstone for emotional balance.', mr: 'भावनिक स्थिरतेचे सराव. हलके, सहज पचणारे अन्न. भावनिक संतुलनासाठी मोती किंवा मूनस्टोन.' },
  },
  4: { // Leo
    sign: 'Leo / सिंह',
    prakriti: { en: 'Pitta (Fire dominant)', mr: 'पित्त (अग्नी प्रधान)', hi: 'पित्त (अग्नि प्रधान)', gu: 'પિત્ત (અગ્નિ પ્રધાન)' },
    constitution: {
      en: 'Strong, vital and commanding constitution. High vitality. Heart and circulatory system is the key area. Very strong immunity.',
      mr: 'मजबूत, प्राणवान आणि प्रभावशाली प्रकृती. उच्च जीवनशक्ती. हृदय आणि रक्ताभिसरण संस्था हे मुख्य क्षेत्र. अत्यंत मजबूत प्रतिकारशक्ती.'
    },
    bodyParts: { en: 'Heart, spine, back, upper abdomen, blood circulation', mr: 'हृदय, पाठीचा कणा, पाठ, वरचे पोट, रक्ताभिसरण' },
    diseases: [
      { en: 'Heart problems & palpitations', mr: 'हृदयाच्या समस्या व धडधडणे' },
      { en: 'Back pain & spine issues', mr: 'पाठदुखी व पाठीच्या कण्याच्या समस्या' },
      { en: 'High blood pressure', mr: 'उच्च रक्तदाब' },
      { en: 'Blood disorders & anemia', mr: 'रक्त विकार व रक्तक्षय' },
      { en: 'Eye strain & vision issues', mr: 'डोळ्यांवर ताण व दृष्टी समस्या' },
    ],
    fever: { en: 'High Pitta fevers — intense, with redness and inflammation. Can be serious if Sun is afflicted.', mr: 'उच्च पित्त ताप — तीव्र, लालसरपणा आणि दाहासह. सूर्य पीडित असल्यास गंभीर होऊ शकतो.' },
    remedy: { en: 'Cooling diet, avoid overwork. Ruby enhances Sun strength. Regular heart check-ups recommended.', mr: 'थंड आहार, जास्त काम टाळा. माणिक सूर्याचे बळ वाढवतो. नियमित हृदय तपासण्या शिफारस केल्या जातात.' },
  },
  5: { // Virgo
    sign: 'Virgo / कन्या',
    prakriti: { en: 'Vata-Pitta (Earth & Fire)', mr: 'वात-पित्त (पृथ्वी आणि अग्नी)', hi: 'वात-पित्त (पृथ्वी एवं अग्नि)', gu: 'વાત-પિત્ત (પૃથ્વી અને અગ્નિ)' },
    constitution: {
      en: 'Analytical, precise and health-conscious constitution. Excellent digestive capacity when in balance. Tendency toward over-analysis and digestive sensitivity.',
      mr: 'विश्लेषणात्मक, अचूक आणि आरोग्य-सजग प्रकृती. संतुलनात असताना उत्कृष्ट पचनशक्ती. अति-विश्लेषण आणि पाचन संवेदनशीलतेची प्रवृत्ती.'
    },
    bodyParts: { en: 'Small intestine, digestive system, pancreas, nervous system, skin', mr: 'छोटे आतडे, पाचन तंत्र, स्वादुपिंड, मज्जासंस्था, त्वचा' },
    diseases: [
      { en: 'Irritable bowel syndrome (IBS)', mr: 'आंत्र विकार (IBS)' },
      { en: 'Food allergies & intolerances', mr: 'अन्न एलर्जी व असहिष्णुता' },
      { en: 'Anxiety and stress disorders', mr: 'चिंता व ताण विकार' },
      { en: 'Skin conditions (eczema, psoriasis)', mr: 'त्वचा विकार (एक्झिमा, सोरायसिस)' },
      { en: 'Malabsorption & nutritional deficiencies', mr: 'कुपोषण व पोषक तत्त्वांची कमतरता' },
    ],
    fever: { en: 'Fevers often linked to gut infections or food poisoning. Low-grade but lingering.', mr: 'ताप बहुतेकदा पोटाच्या संक्रमणाशी किंवा अन्न विषबाधेशी संबंधित. सौम्य पण दीर्घकाळ टिकतो.' },
    remedy: { en: 'Structured diet and meal times. Probiotics and digestive herbs (triphala). Emerald for Mercury strength.', mr: 'संरचित आहार आणि जेवणाच्या वेळा. प्रोबायोटिक्स आणि पाचक औषधी वनस्पती (त्रिफळा). बुधाच्या बळासाठी पाचू.' },
  },
  6: { // Libra
    sign: 'Libra / तुला',
    prakriti: { en: 'Vata (Air dominant)', mr: 'वात (वायू प्रधान)', hi: 'वात (वायु प्रधान)', gu: 'વાત (વાયુ પ્રધાન)' },
    constitution: {
      en: 'Balanced and harmonious constitution. Kidney and urinary system sensitivity. Prone to Vata imbalances when under stress.',
      mr: 'संतुलित आणि समरस प्रकृती. मूत्रपिंड आणि मूत्र तंत्र संवेदनशीलता. ताणाखाली वात असंतुलनाची प्रवृत्ती.'
    },
    bodyParts: { en: 'Kidneys, lower back, adrenal glands, skin, blood vessels', mr: 'मूत्रपिंड, कमरेचा खालचा भाग, अधिवृक्क ग्रंथी, त्वचा, रक्तवाहिन्या' },
    diseases: [
      { en: 'Kidney stones & urinary infections', mr: 'मूत्रपिंड खडे व मूत्र संक्रमण' },
      { en: 'Lower back pain', mr: 'कमरेच्या खालच्या भागात दुखणे' },
      { en: 'Skin disorders & rashes', mr: 'त्वचा विकार व पुरळ' },
      { en: 'Diabetes (susceptibility)', mr: 'मधुमेह (संवेदनशीलता)' },
      { en: 'Hormonal imbalance in women', mr: 'महिलांमध्ये संप्रेरक असंतुलन' },
    ],
    fever: { en: 'Fevers with urinary discomfort. Can manifest as typhoid-like symptoms. Often bilateral pain.', mr: 'मूत्र विकारासह ताप. विषमज्वरासारखी लक्षणे दिसू शकतात. बहुतेकदा दोन्ही बाजूंनी दुखणे.' },
    remedy: { en: 'Stay hydrated. Cranberry, coriander seeds for kidneys. Diamond for Venus strength. Avoid excessive sugar.', mr: 'पुरेसे पाणी प्या. मूत्रपिंडांसाठी क्रॅनबेरी, धणे दाणे. शुक्राच्या बळासाठी हिरा. जास्त साखर टाळा.' },
  },
  7: { // Scorpio
    sign: 'Scorpio / वृश्चिक',
    prakriti: { en: 'Kapha-Pitta (Water & Fire)', mr: 'कफ-पित्त (जल आणि अग्नी)', hi: 'कफ-पित्त (जल एवं अग्नि)', gu: 'કફ-પિત્ત (જળ અને અગ્નિ)' },
    constitution: {
      en: 'Intense, regenerative and powerful constitution. Strong healing ability. Reproductive system and elimination are key health areas.',
      mr: 'तीव्र, पुनरुत्पादक आणि शक्तिशाली प्रकृती. मजबूत बरे होण्याची क्षमता. पुनरुत्पादन संस्था आणि उत्सर्जन हे मुख्य आरोग्य क्षेत्र.'
    },
    bodyParts: { en: 'Reproductive organs, bladder, colon, rectum, pelvis', mr: 'पुनरुत्पादन अवयव, मूत्राशय, कोलन, गुदाशय, श्रोणि' },
    diseases: [
      { en: 'Reproductive system disorders', mr: 'पुनरुत्पादन संस्थेचे विकार' },
      { en: 'Urinary tract infections', mr: 'मूत्रमार्गाचे संक्रमण' },
      { en: 'Constipation & piles', mr: 'बद्धकोष्ठता व मूळव्याध' },
      { en: 'Chronic infections (Ketu influence)', mr: 'दीर्घकालीन संक्रमण (केतूचा प्रभाव)' },
      { en: 'Hidden or difficult-to-diagnose conditions', mr: 'लपलेल्या किंवा निदान करणे कठीण अवस्था' },
    ],
    fever: { en: 'Hidden fevers that appear suddenly. Can be typhoid or septic-type. Fevers related to infections.', mr: 'अचानक येणारे लपलेले ताप. विषमज्वर किंवा सेप्टिक प्रकारचे असू शकतात. संक्रमणाशी संबंधित ताप.' },
    remedy: { en: 'Detox regularly. Avoid suppression of natural urges. Coral/red coral for Mars. Meditation for emotional depth.',mr: 'नियमित डिटॉक्स करा. नैसर्गिक आवेग दाबणे टाळा. मंगळासाठी पोवळे. भावनिक खोलीसाठी ध्यान.' },
  },
  8: { // Sagittarius
    sign: 'Sagittarius / धनु',
    prakriti: { en: 'Pitta-Kapha (Fire & Water)', mr: 'पित्त-कफ (अग्नी आणि जल)', hi: 'पित्त-कफ (अग्नि एवं जल)', gu: 'પિત્ત-કફ (અગ્નિ અને જળ)' },
    constitution: {
      en: 'Expansive, optimistic and active constitution. Strong liver and thighs. Tendency toward overindulgence and liver stress.',
      mr: 'विस्तारशील, आशावादी आणि सक्रिय प्रकृती. मजबूत यकृत आणि मांड्या. अतिभोग आणि यकृत ताणाची प्रवृत्ती.'
    },
    bodyParts: { en: 'Hips, thighs, liver, sciatic nerve, arterial system', mr: 'कंबर, मांड्या, यकृत, सायटिक मज्जातंतू, धमनी तंत्र' },
    diseases: [
      { en: 'Liver disorders & jaundice', mr: 'यकृत विकार व कावीळ' },
      { en: 'Sciatic nerve pain', mr: 'सायटिक मज्जातंतू वेदना' },
      { en: 'Hip and thigh injuries', mr: 'कंबर आणि मांडी दुखापत' },
      { en: 'High cholesterol', mr: 'उच्च कोलेस्ट्रॉल' },
      { en: 'Weight gain (overindulgence)', mr: 'वजन वाढणे (अतिभोग)' },
    ],
    fever: { en: 'Fevers linked to liver infections or overheating. Bilious fevers. Jupiter affliction can cause jaundice.', mr: 'यकृत संक्रमण किंवा जास्त उष्णतेशी संबंधित ताप. पित्त ताप. गुरू पीडित असल्यास कावीळ होऊ शकते.' },
    remedy: { en: 'Moderate diet, avoid excess fats and alcohol. Yellow sapphire for Jupiter. Turmeric for liver health.', mr: 'मध्यम आहार, जास्त चरबी आणि मद्य टाळा. गुरूसाठी पुखराज. यकृताच्या आरोग्यासाठी हळद.' },
  },
  9: { // Capricorn
    sign: 'Capricorn / मकर',
    prakriti: { en: 'Vata-Kapha (Earth & Air)', mr: 'वात-कफ (पृथ्वी आणि वायू)', hi: 'वात-कफ (पृथ्वी एवं वायु)', gu: 'વાત-કફ (પૃથ્વી અને વાયુ)' },
    constitution: {
      en: 'Enduring, disciplined and structured constitution. Skeletal system and joints are key. Slow aging but prone to structural issues.',
      mr: 'टिकाऊ, शिस्तबद्ध आणि संरचित प्रकृती. सांगाडा तंत्र आणि सांधे हे मुख्य. हळू वृद्धत्व पण संरचनात्मक समस्यांची प्रवृत्ती.'
    },
    bodyParts: { en: 'Knees, bones, skeleton, joints, teeth, skin', mr: 'गुडघे, हाडे, सांगाडा, सांधे, दात, त्वचा' },
    diseases: [
      { en: 'Arthritis & joint pain', mr: 'संधिवात व सांधेदुखी' },
      { en: 'Knee problems', mr: 'गुडघ्याच्या समस्या' },
      { en: 'Osteoporosis & bone density issues', mr: 'ऑस्टिओपोरोसिस व हाडांची घनता' },
      { en: 'Skin dryness & eczema', mr: 'त्वचा कोरडेपणा व एक्झिमा' },
      { en: 'Dental problems', mr: 'दंत समस्या' },
    ],
    fever: { en: 'Low-grade, persistent fevers. Often linked to respiratory (cold) infections. Fevers with joint pain.', mr: 'सौम्य, सतत ताप. बहुतेकदा श्वसन (थंड) संक्रमणाशी संबंधित. सांधेदुखीसह ताप.' },
    remedy: { en: 'Regular exercise and calcium-rich diet. Blue sapphire for Saturn. Sesame oil massage for joints.', mr: 'नियमित व्यायाम आणि कॅल्शियम-समृद्ध आहार. शनीसाठी नीलम. सांध्यांसाठी तिळाच्या तेलाचा मालिश.' },
  },
  10: { // Aquarius
    sign: 'Aquarius / कुंभ',
    prakriti: { en: 'Vata (Air & Ether dominant)', mr: 'वात (वायू आणि आकाश प्रधान)', hi: 'वात (वायु एवं आकाश प्रधान)', gu: 'વાત (વાયુ અને આકાશ પ્રધાન)' },
    constitution: {
      en: 'Intellectual, innovative and unconventional constitution. Circulation and nervous system are key. Ankles and calves susceptible.',
      mr: 'बौद्धिक, नाविन्यपूर्ण आणि अपारंपरिक प्रकृती. परिसंचरण आणि मज्जासंस्था हे मुख्य. घोटे आणि पोटऱ्या संवेदनशील.'
    },
    bodyParts: { en: 'Ankles, calves, circulatory system, lymph nodes, nervous system', mr: 'घोटे, पोटऱ्या, परिसंचरण तंत्र, लसीका ग्रंथी, मज्जासंस्था' },
    diseases: [
      { en: 'Varicose veins & poor circulation', mr: 'वैरिकोज व्हेन्स व खराब रक्ताभिसरण' },
      { en: 'Neurological disorders', mr: 'मज्जारोग' },
      { en: 'Ankle sprains & leg injuries', mr: 'घोट्याला मुरगळणे व पायाला दुखापत' },
      { en: 'Autoimmune conditions (Rahu influence)', mr: 'स्वयंप्रतिकार स्थिती (राहूचा प्रभाव)' },
      { en: 'Erratic health patterns', mr: 'अनियमित आरोग्य नमुने' },
    ],
    fever: { en: 'Unusual or mysterious fevers. Can be linked to autoimmune responses. Irregular pattern.', mr: 'असामान्य किंवा रहस्यमय ताप. स्वयंप्रतिकार प्रतिक्रियांशी संबंधित असू शकतात. अनियमित नमुना.' },
    remedy: { en: 'Grounding practices, warm meals. Blue sapphire or amethyst. Avoid extreme cold. Regular leg exercise.', mr: 'स्थिर सराव, उबदार जेवण. नीलम किंवा जांभळा रत्न. अत्यंत थंडी टाळा. नियमित पाय व्यायाम.' },
  },
  11: { // Pisces
    sign: 'Pisces / मीन',
    prakriti: { en: 'Kapha (Water & Earth)', mr: 'कफ (जल आणि पृथ्वी)' },
    constitution: {
      en: 'Sensitive, empathetic and fluid constitution. Strong intuition but physically porous. Feet and lymphatic system are key areas.',
      mr: 'संवेदनशील, सहानुभूतीशील आणि तरल प्रकृती. मजबूत अंतर्ज्ञान पण शारीरिकदृष्ट्या सच्छिद्र. पाय आणि लसीका तंत्र हे मुख्य क्षेत्र.'
    },
    bodyParts: { en: 'Feet, toes, lymphatic system, immune system, endocrine glands', mr: 'पाय, पायाची बोटे, लसीका तंत्र, प्रतिकारशक्ती, अंतःस्रावी ग्रंथी' },
    diseases: [
      { en: 'Foot problems & fungal infections', mr: 'पायाच्या समस्या व बुरशीजन्य संक्रमण' },
      { en: 'Immune system weakness', mr: 'प्रतिकारशक्ती कमकुवतपणा' },
      { en: 'Lymphatic congestion', mr: 'लसीका अडथळा' },
      { en: 'Addiction susceptibility', mr: 'व्यसनाधीनतेची संवेदनशीलता' },
      { en: 'Depression & escapism (Neptune/Jupiter)', mr: 'नैराश्य व पळून जाण्याची प्रवृत्ती' },
    ],
    fever: { en: 'Fevers are often mysterious or hard to diagnose. Can be linked to viral infections. Slow recovery.', mr: 'ताप बहुतेकदा रहस्यमय किंवा निदान करणे कठीण. विषाणूजन्य संक्रमणाशी संबंधित असू शकतात. हळू बरे होणे.' },
    remedy: { en: 'Protect feet, avoid wet socks. Ashwagandha for immunity. Yellow sapphire for Jupiter. Spiritual practice helps greatly.', mr: 'पाय संरक्षित करा, ओले मोजे टाळा. प्रतिकारशक्तीसाठी अश्वगंधा. गुरूसाठी पुखराज. आध्यात्मिक सराव खूप मदत करतो.' },
  },
};

// ── Planet-specific health factors ────────────────────────────────────────
const PLANET_HEALTH = {
  Mars: {
    fever: { en: 'Mars strongly indicates fever, inflammation, accidents and surgical conditions. Especially active in fiery signs (Aries, Leo, Sagittarius) or the 1st, 6th, 8th houses.', mr: 'मंगळ ताप, दाह, अपघात आणि शस्त्रक्रिया स्थिती दर्शवतो. विशेषतः अग्नी राशींमध्ये (मेष, सिंह, धनु) किंवा १ला, ६वा, ८वा भावात सक्रिय.' },
    conditions: [
      { en: 'Acute fever & infections', mr: 'तीव्र ताप व संक्रमण' },
      { en: 'Blood disorders', mr: 'रक्त विकार' },
      { en: 'Accidents & cuts', mr: 'अपघात व कापणे' },
      { en: 'Inflammation & boils', mr: 'दाह व उकळे' },
    ],
  },
  Saturn: {
    conditions: [
      { en: 'Chronic & degenerative diseases', mr: 'दीर्घकालीन व क्षरण रोग' },
      { en: 'Bone & joint disorders', mr: 'हाडे व सांधे विकार' },
      { en: 'Nervous system ailments', mr: 'मज्जासंस्थेचे आजार' },
      { en: 'Depression & chronic fatigue', mr: 'नैराश्य व दीर्घकालीन थकवा' },
    ],
  },
  Rahu: {
    conditions: [
      { en: 'Mysterious/undiagnosed diseases', mr: 'रहस्यमय/निदान न होणारे रोग' },
      { en: 'Poisoning & allergies', mr: 'विषबाधा व एलर्जी' },
      { en: 'Skin diseases & tumors', mr: 'त्वचा रोग व गाठी' },
      { en: 'Mental confusion & phobias', mr: 'मानसिक गोंधळ व भीती' },
    ],
  },
  Ketu: {
    conditions: [
      { en: 'Infections & parasites', mr: 'संक्रमण व परजीवी' },
      { en: 'Chronic & mysterious conditions', mr: 'दीर्घकालीन व रहस्यमय अवस्था' },
      { en: 'Wounds that don\'t heal easily', mr: 'सहज न बरे होणाऱ्या जखमा' },
      { en: 'Spiritual/psychic disturbances', mr: 'आध्यात्मिक/मानसिक अडथळे' },
    ],
  },
  Moon: {
    conditions: [
      { en: 'Mental health & emotional disorders', mr: 'मानसिक आरोग्य व भावनिक विकार' },
      { en: 'Fluid imbalances & edema', mr: 'तरल असंतुलन व सूज' },
      { en: 'Hormonal fluctuations', mr: 'संप्रेरक चढ-उतार' },
      { en: 'Sleep disorders', mr: 'झोपेचे विकार' },
    ],
  },
};

/**
 * Main analysis function.
 * @param {object} report - full API report object
 * @returns {object} healthData for rendering
 */
export function analyzeHealth(report) {
  const { ascendant, planets, charts } = report;
  const ascIdx = ascendant?.sign_index ?? 0;
  const signHealth = SIGN_HEALTH[ascIdx];

  // 6th house data
  const sixth = charts?.D1_lagna?.find((h) => h.house === 6);
  const eighth = charts?.D1_lagna?.find((h) => h.house === 8);

  // Planets in 6th house → disease tendencies
  const sixthOccupants = sixth?.occupants || [];
  const eighthOccupants = eighth?.occupants || [];

  // Mars placement
  const marsData = planets?.Mars;
  const marsHouse = marsData?.house_from_lagna;
  const marsInBadHouse = [1, 4, 6, 7, 8, 12].includes(marsHouse);

  // Moon affliction
  const moonData = planets?.Moon;
  const saturnData = planets?.Saturn;
  const rahuData = planets?.Rahu;
  const ketuData = planets?.Ketu;

  // Collect all afflicting planets in 6th & 8th
  const diseaseIndicators = [];
  sixthOccupants.forEach((p) => {
    const ph = PLANET_HEALTH[p.planet];
    if (ph) diseaseIndicators.push({ planet: p.planet, house: 6, conditions: ph.conditions, isFeverPlanet: p.planet === 'Mars' });
  });
  eighthOccupants.forEach((p) => {
    const ph = PLANET_HEALTH[p.planet];
    if (ph) diseaseIndicators.push({ planet: p.planet, house: 8, conditions: ph.conditions, isFeverPlanet: p.planet === 'Mars' });
  });

  // Fever assessment
  const feverRisk = getFeverRisk(marsHouse, marsData, planets);

  // Mental health (Moon affliction)
  const mentalFactors = getMentalHealth(moonData, saturnData, rahuData, planets);

  return {
    signHealth,
    ascendantSign: ascendant?.sign,
    diseaseIndicators,
    feverRisk,
    mentalFactors,
    sixthHouseSign: sixth?.sign,
    eighthHouseSign: eighth?.sign,
    sixthOccupants,
    eighthOccupants,
    marsHouse,
    marsInBadHouse,
    marsData,
  };
}

function getFeverRisk(marsHouse, marsData, planets) {
  const sunHouse = planets?.Sun?.house_from_lagna;
  const inFlammableHouse = [1, 4, 6, 7, 8, 12].includes(marsHouse);
  const sunAfflicted = [6, 8, 12].includes(sunHouse);

  if (inFlammableHouse && marsData?.retrograde) {
    return {
      level: 'high',
      en: 'HIGH risk of fever. Retrograde Mars in a sensitive house indicates recurring, intense fevers and inflammatory conditions. The body may experience sudden temperature spikes. Take care during Mars dashas and during hot seasons.',
      mr: 'तापाचा उच्च धोका. संवेदनशील भावात वक्री मंगळ वारंवार, तीव्र ताप आणि दाहात्मक स्थिती दर्शवतो. शरीरात अचानक तापमान वाढू शकते. मंगळ दशेत आणि उन्हाळ्यात काळजी घ्या.',
    };
  }
  if (inFlammableHouse) {
    return {
      level: 'moderate',
      en: 'MODERATE fever tendency. Mars placed in a sensitive house increases susceptibility to acute fevers, blood disorders and inflammatory conditions. Fevers are usually short-lived but intense.',
      mr: 'मध्यम तापाची प्रवृत्ती. संवेदनशील भावात मंगळ तीव्र ताप, रक्त विकार आणि दाहात्मक स्थितींची संवेदनशीलता वाढवतो. ताप सहसा अल्पकालीन पण तीव्र असतो.',
    };
  }
  if (sunAfflicted) {
    return {
      level: 'mild',
      en: 'MILD fever tendency from Sun placement. Possible heart-related fevers or pitta imbalance. Take care with excessive heat and sun exposure.',
      mr: 'सूर्याच्या स्थानामुळे सौम्य तापाची प्रवृत्ती. हृदयाशी संबंधित ताप किंवा पित्त असंतुलनाची शक्यता. जास्त उष्णता आणि उन्हाशी संपर्क टाळा.',
    };
  }
  return {
    level: 'low',
    en: 'LOW fever risk. Mars is relatively well-placed. Fevers when they occur tend to be manageable and of short duration. General immune strength is good.',
    mr: 'कमी तापाचा धोका. मंगळ तुलनेने चांगल्या स्थितीत आहे. ताप येतो तेव्हा सहसा व्यवस्थापनीय आणि कमी कालावधीचा असतो. सामान्य प्रतिकारशक्ती चांगली आहे.',
  };
}

function getMentalHealth(moonData, saturnData, rahuData, planets) {
  const moonHouse = moonData?.house_from_lagna;
  const moonSign = moonData?.sign_index;
  const saturnHouse = saturnData?.house_from_lagna;
  const rahuHouse = rahuData?.house_from_lagna;

  const concerns = [];

  // Moon in 6th, 8th or 12th → emotional challenges
  if ([6, 8, 12].includes(moonHouse)) {
    concerns.push({
      en: 'Moon in the 6th/8th/12th house indicates emotional vulnerability, mood swings and possible anxiety or depression tendencies. Requires conscious mental self-care.',
      mr: 'चंद्र ६व्या/८व्या/१२व्या भावात असल्यास भावनिक संवेदनशीलता, मूड बदल आणि चिंता किंवा नैराश्याची संभाव्य प्रवृत्ती दर्शवतो.',
    });
  }

  // Rahu on Moon → mental anxiety
  if (rahuHouse === moonHouse) {
    concerns.push({
      en: 'Rahu conjunct or close to Moon amplifies mental restlessness, overthinking and phobias. Grounding practices are essential.',
      mr: 'राहू चंद्राशी युत किंवा जवळ असल्यास मानसिक अस्वस्थता, अतिविचार आणि भीतींना वाढवतो. स्थिर सराव आवश्यक आहे.',
    });
  }

  // Saturn on Moon → depression
  if (saturnHouse === moonHouse) {
    concerns.push({
      en: 'Saturn with Moon can bring heaviness, melancholy, loneliness and chronic stress. Consistent sleep and routine are protective.',
      mr: 'शनी चंद्रासोबत असल्यास जडपणा, खिन्नता, एकटेपणा आणि दीर्घकालीन ताण येऊ शकतो. सुसंगत झोप आणि दिनचर्या संरक्षक आहेत.',
    });
  }

  if (concerns.length === 0) {
    concerns.push({
      en: 'Moon is relatively well-placed indicating stable emotional health, good intuition and mental resilience. Maintain regular sleep cycles and close family bonds.',
      mr: 'चंद्र तुलनेने चांगल्या स्थितीत असल्याने स्थिर भावनिक आरोग्य, चांगले अंतर्ज्ञान आणि मानसिक लवचिकता दर्शवतो. नियमित झोपेच्या चक्र आणि जवळच्या कुटुंब बंधांची देखभाल करा.',
    });
  }

  return concerns;
}

export const FEVER_LEVEL_COLORS = {
  high: { bg: 'var(--color-vermilion-soft)', border: 'var(--color-vermilion)', text: 'var(--color-vermilion)' },
  moderate: { bg: 'rgba(245, 166, 35, 0.12)', border: 'var(--color-gold-bright)', text: '#C8720A' },
  mild: { bg: 'rgba(43, 87, 151, 0.08)', border: '#2B5797', text: '#2B5797' },
  low: { bg: 'var(--color-jade-soft)', border: 'var(--color-jade)', text: 'var(--color-jade)' },
};
