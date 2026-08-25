import { Link } from 'react-router-dom';
import ChartGrid from '../components/ChartGrid';
import { useLang } from '../context/LanguageContext';
import './HomePage.css';

// Static illustrative chart for hero decoration
const SAMPLE_HOUSES = Array.from({ length: 12 }, (_, i) => ({
  house: i + 1,
  sign_index: i,
  occupants: [],
}));
SAMPLE_HOUSES[1].occupants = [{ planet: 'Moon',    abbr: 'Mo', retrograde: false }];
SAMPLE_HOUSES[4].occupants = [{ planet: 'Jupiter', abbr: 'Ju', retrograde: false }];
SAMPLE_HOUSES[6].occupants = [{ planet: 'Saturn',  abbr: 'Sa', retrograde: true }];
SAMPLE_HOUSES[9].occupants = [
  { planet: 'Sun',     abbr: 'Su', retrograde: false },
  { planet: 'Mercury', abbr: 'Me', retrograde: false },
];

const HERO = {
  en: {
    eyebrow: 'Sidereal · Lahiri Ayanamsha · Swiss Ephemeris',
    headline: 'Read the sky at the\nmoment you were born.',
    sub: 'Generate a complete Vedic Kundali from an exact birth time and place, or run a full Ashtakoot Guna Milan compatibility check between two charts — 36 points, eight kootas, one clear verdict.',
    cta1: 'Generate a Kundali',
    cta2: 'Check compatibility',
    how: 'How it works',
    s1h: 'Enter exact birth details',
    s1d: 'Date, time to the minute, and birthplace coordinates — precision here changes the Ascendant and house placements.',
    s2h: 'Swiss Ephemeris computes the chart',
    s2d: 'Sidereal planetary longitudes, Lahiri Ayanamsha, Rashi, Nakshatra, Pada, and whole-sign houses.',
    s3h: 'Read the verdict',
    s3d: 'An individual profile with Manglik status, or a full Guna Milan scorecard for two people.',
  },
  mr: {
    eyebrow: 'नाक्षत्रिक · लाहिरी अयनांश · स्विस एफेमेरिस',
    headline: 'जन्माच्या क्षणी\nआकाश वाचा.',
    sub: 'अचूक जन्म वेळ आणि स्थानावरून संपूर्ण वैदिक कुंडली काढा, किंवा दोन कुंडल्यांमधील पूर्ण अष्टकूट गुण मिलन सुसंगतता तपासा — ३६ गुण, आठ कूट, एक स्पष्ट निर्णय.',
    cta1: 'कुंडली काढा',
    cta2: 'सुसंगतता तपासा',
    how: 'हे कसे कार्य करते',
    s1h: 'अचूक जन्म तपशील द्या',
    s1d: 'तारीख, मिनिटापर्यंत वेळ आणि जन्मस्थानाचे निर्देशांक — येथील अचूकता लग्न आणि भावांची स्थिती बदलते.',
    s2h: 'स्विस एफेमेरिस कुंडली काढतो',
    s2d: 'नाक्षत्रिक ग्रहांचे रेखांश, लाहिरी अयनांश, राशी, नक्षत्र, पाद आणि संपूर्ण-राशी भाव.',
    s3h: 'निर्णय वाचा',
    s3d: 'मंगळ दोष स्थितीसह वैयक्तिक प्रोफाइल, किंवा दोन व्यक्तींसाठी पूर्ण गुण मिलन स्कोरकार्ड.',
  },
};

export default function HomePage() {
  const { lang } = useLang();
  const c = HERO[lang];

  return (
    <main>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">{c.eyebrow}</p>
            <h1 className="hero__headline">
              {c.headline.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h1>
            <p className="hero__sub">{c.sub}</p>
            <div className="hero__actions">
              <Link to="/kundali" className="btn btn--primary">{c.cta1}</Link>
              <Link to="/match"   className="btn btn--ghost">{c.cta2}</Link>
              <Link to="/panchang" className="btn btn--ghost">📿 Daily Panchang</Link>
            </div>
          </div>
          <div className="hero__chart">
            <ChartGrid houses={SAMPLE_HOUSES} title="Rāśi" ascendantSignIndex={1} />
          </div>
        </div>
      </section>

      <section className="how">
        <div className="container">
          <p className="eyebrow">{c.how}</p>
          <ol className="how__steps">
            <li>
              <span className="how__num mono">01</span>
              <div><h3>{c.s1h}</h3><p>{c.s1d}</p></div>
            </li>
            <li>
              <span className="how__num mono">02</span>
              <div><h3>{c.s2h}</h3><p>{c.s2d}</p></div>
            </li>
            <li>
              <span className="how__num mono">03</span>
              <div><h3>{c.s3h}</h3><p>{c.s3d}</p></div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
