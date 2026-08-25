/**
 * Astrological helpers for planetary dignity and classifications.
 * Each classification entry includes `en` and `mr` fields.
 */

// Sign indices: 0: Aries, 1: Taurus, 2: Gemini, 3: Cancer, 4: Leo, 5: Virgo,
// 6: Libra, 7: Scorpio, 8: Sagittarius, 9: Capricorn, 10: Aquarius, 11: Pisces

const PLANET_DIGNITIES = {
  Sun:     { own: [4],     exalted: 0,  debilitated: 6,  friends: [3, 8, 11],      enemies: [1, 5, 6, 9, 10] },
  Moon:    { own: [3],     exalted: 1,  debilitated: 7,  friends: [0, 2, 4, 5, 7], enemies: [] },
  Mars:    { own: [0, 7],  exalted: 9,  debilitated: 3,  friends: [3, 4, 8, 11],   enemies: [2, 5] },
  Mercury: { own: [2, 5],  exalted: 5,  debilitated: 11, friends: [4, 6, 9, 10],   enemies: [3] },
  Jupiter: { own: [8, 11], exalted: 3,  debilitated: 9,  friends: [0, 3, 4, 7],    enemies: [2, 5, 6] },
  Venus:   { own: [1, 6],  exalted: 11, debilitated: 5,  friends: [2, 5, 9, 10],   enemies: [3, 4] },
  Saturn:  { own: [9, 10], exalted: 6,  debilitated: 0,  friends: [2, 5, 6],       enemies: [0, 3, 4, 7] },
  Rahu:    { own: [],      exalted: 1,  debilitated: 7,  friends: [],               enemies: [] },
  Ketu:    { own: [],      exalted: 7,  debilitated: 1,  friends: [],               enemies: [] },
};

export function getPlanetaryDignity(planetName, signIndex) {
  const dig = PLANET_DIGNITIES[planetName];
  if (!dig) return 'Neutral';
  if (dig.exalted    === signIndex) return 'Exalted';
  if (dig.debilitated=== signIndex) return 'Debilitated';
  if (dig.own.includes(signIndex))     return 'Own Sign';
  if (dig.friends.includes(signIndex)) return 'Friendly';
  if (dig.enemies.includes(signIndex)) return 'Enemy Sign';
  return 'Neutral';
}

export const CLASSIFICATION_INFO = {
  varna: {
    Brahmin:   { en: { meaning: 'Intellectual / Spiritual',  element: 'Water signs' }, mr: { meaning: 'बौद्धिक / आध्यात्मिक', element: 'जल राशी' } },
    Kshatriya: { en: { meaning: 'Leader / Protector',        element: 'Fire signs'  }, mr: { meaning: 'नेता / रक्षक',          element: 'अग्नी राशी' } },
    Vaishya:   { en: { meaning: 'Trader / Commerce',         element: 'Air signs'   }, mr: { meaning: 'व्यापारी / वाणिज्य',    element: 'वायू राशी' } },
    Shudra:    { en: { meaning: 'Service / Skilled labor',   element: 'Earth signs' }, mr: { meaning: 'सेवा / कुशल श्रम',      element: 'पृथ्वी राशी' } },
  },
  gana: {
    Deva:      { en: { meaning: 'Divine / Gentle / Peaceful',          temperament: 'Sattvic'  }, mr: { meaning: 'दैवी / सौम्य / शांत',          temperament: 'सात्त्विक' } },
    Manushya:  { en: { meaning: 'Human / Balanced / Practical',        temperament: 'Rajasic'  }, mr: { meaning: 'मानवी / संतुलित / व्यावहारिक',  temperament: 'राजसिक' } },
    Rakshasa:  { en: { meaning: 'Dynamic / Aggressive / Independent',  temperament: 'Tamasic'  }, mr: { meaning: 'गतिमान / आक्रमक / स्वतंत्र',   temperament: 'तामसिक' } },
  },
  nadi: {
    'Aadi (Vata)':   { en: { constitution: 'Air & Ether (Vata)',     position: 'Beginning' }, mr: { constitution: 'वायू आणि आकाश (वात)',    position: 'प्रारंभ' } },
    'Madhya (Pitta)':{ en: { constitution: 'Fire & Water (Pitta)',   position: 'Middle'    }, mr: { constitution: 'अग्नी आणि जल (पित्त)',    position: 'मध्य' } },
    'Antya (Kapha)': { en: { constitution: 'Earth & Water (Kapha)',  position: 'End'       }, mr: { constitution: 'पृथ्वी आणि जल (कफ)',      position: 'अंत' } },
  },
};
export const RASI_LIST = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export function getSignIndex(signName) {
  if (!signName) return -1;
  const clean = signName.split(' ')[0].trim().toLowerCase();
  return RASI_LIST.findIndex((s) => s.toLowerCase() === clean);
}

/**
 * Computes quick Sade Sati status for a Moon sign against current Saturn transit (Pisces/Meena).
 */
export function getSadeSatiBadge(moonSign) {
  const moonIdx = getSignIndex(moonSign);
  if (moonIdx === -1) return null;

  // Current Saturn in sidereal Pisces (index 11)
  const saturnSignIdx = 11;
  const prev = (moonIdx - 1 + 12) % 12;
  const nxt  = (moonIdx + 1) % 12;
  const houseFromMoon = (saturnSignIdx - moonIdx + 12) % 12 + 1;

  if (saturnSignIdx === moonIdx) {
    return { active: true, label: 'Sade Sati · Peak (P2)', type: 'danger' };
  } else if (saturnSignIdx === prev) {
    return { active: true, label: 'Sade Sati · Rising (P1)', type: 'warning' };
  } else if (saturnSignIdx === nxt) {
    return { active: true, label: 'Sade Sati · Setting (P3)', type: 'info' };
  } else if (houseFromMoon === 4 || houseFromMoon === 8) {
    return { active: true, label: `Dhaiya (H${houseFromMoon})`, type: 'caution' };
  }
  return { active: false, label: 'Transits Clear', type: 'clear' };
}
