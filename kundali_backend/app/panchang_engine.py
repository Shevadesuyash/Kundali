"""
app/panchang_engine.py
----------------------
Classical Vedic Panchang (Five Limbs) & Muhurta Calculation Engine.
Computes Tithi, Vara, Nakshatra, Yoga, Karana, Sunrise/Sunset, Brahma Muhurta,
Abhijit, Rahu Kaal, Yamaganda, Gulika, Day/Night Choghadiya, and Daily Devotional Guidance.
"""
from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional, Tuple

import pytz
import swisseph as swe

TITHI_NAMES = [
    "Pratipada (1)", "Dwitiya (2)", "Tritiya (3)", "Chaturthi (4)",
    "Panchami (5)", "Shashthi (6)", "Saptami (7)", "Ashtami (8)",
    "Navami (9)", "Dashami (10)", "Ekadashi (11)", "Dwadashi (12)",
    "Trayodashi (13)", "Chaturdashi (14)", "Purnima (15 - Full Moon)",
    "Pratipada (1)", "Dwitiya (2)", "Tritiya (3)", "Chaturthi (4)",
    "Panchami (5)", "Shashthi (6)", "Saptami (7)", "Ashtami (8)",
    "Navami (9)", "Dashami (10)", "Ekadashi (11)", "Dwadashi (12)",
    "Trayodashi (13)", "Chaturdashi (14)", "Amavasya (30 - New Moon)",
]

VARA_NAMES = [
    ("Sunday", "Ravivar", "Sun (Surya)", "Lord Surya", "Om Hram Hrim Hraum Sah Suryaya Namah (ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः)", "Ruby/Red items, Surya Namaskar, Gayatri Mantra"),
    ("Monday", "Somavar", "Moon (Chandra)", "Lord Shiva & Chandra Dev", "Om Namah Shivaya (ॐ नमः शिवाय) · Om Som Somaya Namah", "White flowers, milk, meditation, Shiva Abhishek"),
    ("Tuesday", "Mangalvar", "Mars (Mangal)", "Lord Hanuman & Kartikeya", "Om Hanumate Namah (ॐ हनुमते नमः)", "Hanuman Chalisa, red flowers, charity of jaggery"),
    ("Wednesday", "Budhavar", "Mercury (Budha)", "Lord Ganesha & Budha Dev", "Om Gam Ganapataye Namah (ॐ गं गणपतये नमः)", "Durva grass to Ganesha, green moong donation"),
    ("Thursday", "Guruvar", "Jupiter (Brihaspati)", "Lord Vishnu & Brihaspati", "Om Namo Bhagavate Vasudevaya (ॐ नमो भगवते वासुदेवाय)", "Yellow sweets, Vishnu Sahasranama, respect teachers"),
    ("Friday", "Shukravar", "Venus (Shukra)", "Goddess Mahalakshmi", "Om Shrim Mahalakshmyai Namah (ॐ श्रीं महालक्ष्मै नमः)", "Lotus flowers, kheer, Lakshmi Stotram, fragrant oils"),
    ("Saturday", "Shanivar", "Saturn (Shani)", "Lord Shani & Hanuman", "Om Sham Shanaishcharaya Namah (ॐ शं शनैश्चराय नमः)", "Mustard oil lamp, Hanuman Chalisa, charity to needy"),
]

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

YOGA_NAMES = [
    ("Vishkambha", "Inauspicious", "Precaution recommended for starting major journeys"),
    ("Priti", "Auspicious", "Fosters mutual affection, harmony, and friendship"),
    ("Ayushman", "Auspicious", "Promotes longevity, good health, and vitality"),
    ("Saubhagya", "Auspicious", "Brings good fortune, marital bliss, and prosperity"),
    ("Shobhana", "Auspicious", "Enhances beauty, artistic pursuits, and celebratory ceremonies"),
    ("Atiganda", "Inauspicious", "Obstacles in initial phase; requires careful focus"),
    ("Sukarma", "Auspicious", "Excellent for noble deeds, starting business, and charity"),
    ("Dhriti", "Auspicious", "Bestows patience, stability, and enduring results"),
    ("Shula", "Inauspicious", "Sharp disagreements possible; avoid contentious debates"),
    ("Ganda", "Inauspicious", "Caution with investments and signing contracts"),
    ("Vriddhi", "Auspicious", "Continuous growth, financial expansion, and learning"),
    ("Dhruva", "Auspicious", "Fixed, lasting stability; foundation stones, long-term assets"),
    ("Vyaghata", "Inauspicious", "Sudden changes; avoid hazardous physical activities"),
    ("Harshana", "Auspicious", "Joyful outcomes, celebratory events, and social harmony"),
    ("Vajra", "Inauspicious", "Sharp intensity; avoid legal disputes"),
    ("Siddhi", "Auspicious", "Accomplishment of goals, mastery, and success"),
    ("Vyatipata", "Inauspicious", "Highly intense; spiritual prayers and meditation recommended"),
    ("Variyan", "Auspicious", "Luxury, comfort, and sensory fulfillment"),
    ("Parigha", "Inauspicious", "Barriers or delays; review plans carefully"),
    ("Shiva", "Auspicious", "Highly sacred, divine grace, spiritual elevation"),
    ("Siddha", "Auspicious", "Fulfillment of desires, divine blessings, and siddhi"),
    ("Sadhya", "Auspicious", "Achievable success through focused effort"),
    ("Shubha", "Auspicious", "Pure beneficence, peace, and righteous work"),
    ("Shukla", "Auspicious", "Bright purity, mental clarity, and new beginnings"),
    ("Brahma", "Auspicious", "Higher knowledge, scholarly study, and Vedic rituals"),
    ("Indra", "Auspicious", "Leadership, administrative victory, and prestige"),
    ("Vaidhriti", "Inauspicious", "Caution in worldly dealings; ideal for solitary spiritual study"),
]

KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
]

# Choghadiya orders for Day (starting from day lord)
DAY_CHOGHADIYA_ORDER = {
    0: ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],  # Sunday
    1: ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"],  # Monday
    2: ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],    # Tuesday
    3: ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"],   # Wednesday
    4: ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"],  # Thursday
    5: ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"],   # Friday
    6: ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"],   # Saturday
}

CHOGHADIYA_INFO = {
    "Amrit": {"type": "Best", "nature": "Auspicious", "label": "अमृत", "desc": "Supreme nectar — ideal for all auspicious beginnings, medicine, journeys."},
    "Shubh": {"type": "Good", "nature": "Auspicious", "label": "शुभ", "desc": "Auspicious — excellent for ceremonies, investments, marriage, education."},
    "Labh":  {"type": "Gain", "nature": "Auspicious", "label": "लाभ", "desc": "Profitable — ideal for commercial dealings, contracts, starting new work."},
    "Char":  {"type": "Neutral", "nature": "Neutral", "label": "चल", "desc": "Movable — suitable for travel, vehicles, changing place, dynamic activity."},
    "Rog":   {"type": "Bad", "nature": "Inauspicious", "label": "रोग", "desc": "Disease/Debility — avoid starting new work or medical surgery."},
    "Kaal":  {"type": "Loss", "nature": "Inauspicious", "label": "काल", "desc": "Adverse — ruled by Saturn; avoid financial speculation and partnerships."},
    "Udveg": {"type": "Anxiety", "nature": "Inauspicious", "label": "उद्वेग", "desc": "Anxiety — ruled by Sun; avoid conflict with authorities and loans."},
}

# Rahu, Yamaganda, Gulika day-part fractions (0-indexed 8 parts of daytime)
RAHU_KAAL_PARTS = [7, 1, 6, 4, 5, 3, 2]     # Sun=8th(7), Mon=2nd(1), Tue=7th(6), Wed=5th(4), Thu=6th(5), Fri=4th(3), Sat=3rd(2)
YAMAGANDA_PARTS = [4, 3, 2, 1, 0, 6, 5]     # Sun=5th, Mon=4th, Tue=3rd, Wed=2nd, Thu=1st, Fri=7th, Sat=6th
GULIKA_PARTS    = [6, 5, 4, 3, 2, 1, 0]     # Sun=7th, Mon=6th, Tue=5th, Wed=4th, Thu=3rd, Fri=2nd, Sat=1st


class PanchangEngine:
    """Computes full Vedic Panchang, Muhurtas, Choghadiya, and daily guidance."""

    @classmethod
    def get_panchang(
        cls,
        target_date: Optional[datetime.date] = None,
        lat: float = 18.5204,
        lon: float = 73.8567,
        timezone_str: str = "Asia/Kolkata",
    ) -> Dict[str, Any]:
        """
        Calculate complete Panchang parameters for a given date and location.
        """
        if target_date is None:
            tz = pytz.timezone(timezone_str)
            target_date = datetime.datetime.now(tz).date()

        tz = pytz.timezone(timezone_str)
        local_noon = tz.localize(datetime.datetime(
            target_date.year, target_date.month, target_date.day, 12, 0, 0
        ))
        utc_noon = local_noon.astimezone(pytz.utc)

        jd_noon = swe.julday(
            utc_noon.year, utc_noon.month, utc_noon.day,
            utc_noon.hour + utc_noon.minute / 60.0,
        )

        swe.set_sid_mode(swe.SIDM_LAHIRI)
        flags = swe.FLG_SIDEREAL | swe.FLG_SPEED

        # Sun and Moon sidereal coordinates
        sun_res, _  = swe.calc_ut(jd_noon, swe.SUN, flags)
        moon_res, _ = swe.calc_ut(jd_noon, swe.MOON, flags)

        sun_lon  = sun_res[0] % 360.0
        moon_lon = moon_res[0] % 360.0

        # ── 1. Tithi ──────────────────────────────────────────────────────
        diff_deg = (moon_lon - sun_lon + 360.0) % 360.0
        tithi_idx = int(diff_deg // 12.0)  # 0 to 29
        tithi_number = (tithi_idx % 15) + 1
        is_shukla = tithi_idx < 15
        paksha = "Shukla Paksha (Waxing Moon)" if is_shukla else "Krishna Paksha (Waning Moon)"
        tithi_name = TITHI_NAMES[tithi_idx]
        tithi_percent = round(((diff_deg % 12.0) / 12.0) * 100, 1)

        # ── 2. Vara (Weekday) ─────────────────────────────────────────────
        # Python weekday: 0=Monday, ..., 6=Sunday. Vedic: 0=Sunday, 1=Monday...
        py_weekday = target_date.weekday()
        vedic_weekday = (py_weekday + 1) % 7
        vara_en, vara_sa, day_lord, deity, mantra, rituals = VARA_NAMES[vedic_weekday]

        # ── 3. Nakshatra ──────────────────────────────────────────────────
        nak_span = 360.0 / 27.0
        nak_idx = int(moon_lon // nak_span)  # 0 to 26
        pada = int((moon_lon % nak_span) / (nak_span / 4.0)) + 1
        nakshatra_name = NAKSHATRA_NAMES[nak_idx]
        nak_percent = round(((moon_lon % nak_span) / nak_span) * 100, 1)

        # ── 4. Yoga ───────────────────────────────────────────────────────
        sum_deg = (sun_lon + moon_lon) % 360.0
        yoga_idx = int(sum_deg // nak_span)  # 0 to 26
        yoga_name, yoga_quality, yoga_desc = YOGA_NAMES[yoga_idx]

        # ── 5. Karana ─────────────────────────────────────────────────────
        half_tithi = int(diff_deg // 6.0)  # 0 to 59
        if half_tithi == 0:
            karana_name = "Kimstughna"
        elif half_tithi >= 57:
            fixed_map = {57: "Shakuni", 58: "Chatushpada", 59: "Naga"}
            karana_name = fixed_map.get(half_tithi, "Naga")
        else:
            movable_idx = (half_tithi - 1) % 7
            karana_name = KARANA_NAMES[movable_idx]

        # ── 6. Sunrise / Sunset / Muhurtas (Swiss Ephemeris exact) ─────────
        jd_midnight = swe.julday(target_date.year, target_date.month, target_date.day, 0.0)
        geopos = (float(lon), float(lat), 0.0)

        try:
            _, tret_rise = swe.rise_trans(jd_midnight, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, geopos)
            _, tret_set  = swe.rise_trans(jd_midnight, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, geopos)

            def jd_to_tz_dt(jd_val: float) -> datetime.datetime:
                y, m, d, h_dec = swe.revjul(jd_val)
                hour = int(h_dec)
                min_dec = (h_dec - hour) * 60.0
                minute = int(min_dec)
                sec = int(round((min_dec - minute) * 60.0))
                if sec >= 60:
                    sec = 0
                    minute += 1
                if minute >= 60:
                    minute = 0
                    hour += 1
                dt_utc = datetime.datetime(y, m, d, hour, minute, sec, tzinfo=pytz.utc)
                return dt_utc.astimezone(tz)

            sunrise_dt = jd_to_tz_dt(tret_rise[0])
            sunset_dt  = jd_to_tz_dt(tret_set[0])
        except Exception:
            # Fallback in case of extreme polar latitudes
            sunrise_dt = tz.localize(datetime.datetime(target_date.year, target_date.month, target_date.day, 6, 15))
            sunset_dt  = tz.localize(datetime.datetime(target_date.year, target_date.month, target_date.day, 18, 30))

        day_duration_sec = max((sunset_dt - sunrise_dt).total_seconds(), 3600.0)
        part_sec = day_duration_sec / 8.0

        def part_time(part_idx: int) -> Tuple[str, str]:
            start_t = sunrise_dt + datetime.timedelta(seconds=part_idx * part_sec)
            end_t   = start_t + datetime.timedelta(seconds=part_sec)
            return start_t.strftime("%I:%M %p"), end_t.strftime("%I:%M %p")

        # Inauspicious Kaals
        rahu_start, rahu_end = part_time(RAHU_KAAL_PARTS[vedic_weekday])
        yamaganda_start, yamaganda_end = part_time(YAMAGANDA_PARTS[vedic_weekday])
        gulika_start, gulika_end = part_time(GULIKA_PARTS[vedic_weekday])

        # Auspicious Muhurtas
        brahma_start = (sunrise_dt - datetime.timedelta(minutes=96)).strftime("%I:%M %p")
        brahma_end   = (sunrise_dt - datetime.timedelta(minutes=48)).strftime("%I:%M %p")
        midday = sunrise_dt + datetime.timedelta(seconds=day_duration_sec / 2.0)
        abhijit_start = (midday - datetime.timedelta(minutes=24)).strftime("%I:%M %p")
        abhijit_end   = (midday + datetime.timedelta(minutes=24)).strftime("%I:%M %p")

        # ── 7. Daytime Choghadiya Slots ───────────────────────────────────
        day_order = DAY_CHOGHADIYA_ORDER.get(vedic_weekday, DAY_CHOGHADIYA_ORDER[0])
        choghadiya_slots = []
        for i, ch_name in enumerate(day_order):
            s_str, e_str = part_time(i)
            info = CHOGHADIYA_INFO.get(ch_name, {})
            choghadiya_slots.append({
                "slot_number": i + 1,
                "name": ch_name,
                "label": info.get("label", ch_name),
                "type": info.get("type", "Neutral"),
                "nature": info.get("nature", "Neutral"),
                "start_time": s_str,
                "end_time": e_str,
                "description": info.get("desc", ""),
            })

        return {
            "date": target_date.strftime("%Y-%m-%d"),
            "formatted_date": target_date.strftime("%A, %d %B %Y"),
            "location": {"lat": lat, "lon": lon, "timezone": timezone_str},
            "five_limbs": {
                "tithi": {
                    "name": tithi_name,
                    "paksha": paksha,
                    "number": tithi_number,
                    "percent_completed": tithi_percent,
                },
                "vara": {
                    "english": vara_en,
                    "sanskrit": vara_sa,
                    "day_lord": day_lord,
                },
                "nakshatra": {
                    "name": nakshatra_name,
                    "pada": pada,
                    "percent_completed": nak_percent,
                },
                "yoga": {
                    "name": yoga_name,
                    "quality": yoga_quality,
                    "description": yoga_desc,
                },
                "karana": {
                    "name": karana_name,
                },
            },
            "sun_moon_timings": {
                "sunrise": sunrise_dt.strftime("%I:%M %p"),
                "sunset": sunset_dt.strftime("%I:%M %p"),
                "sun_sign": NAKSHATRA_NAMES[int(sun_lon // nak_span)],
                "moon_sign": NAKSHATRA_NAMES[int(moon_lon // nak_span)],
            },
            "auspicious_timings": {
                "brahma_muhurta": f"{brahma_start} – {brahma_end}",
                "abhijit_muhurta": f"{abhijit_start} – {abhijit_end}",
            },
            "inauspicious_timings": {
                "rahu_kaal": f"{rahu_start} – {rahu_end}",
                "yamaganda": f"{yamaganda_start} – {yamaganda_end}",
                "gulika_kaal": f"{gulika_start} – {gulika_end}",
            },
            "devotional_guidance": {
                "ruling_deity": deity,
                "daily_mantra": mantra,
                "recommended_rituals": rituals,
            },
            "choghadiya_day": choghadiya_slots,
        }
