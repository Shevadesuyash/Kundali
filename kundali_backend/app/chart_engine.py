"""
app/chart_engine.py
--------------------
Builds JSON-friendly house-wise chart layouts (Module B). Rather than
rendering a matplotlib image (which is heavy for Lambda and not needed
per spec), we output structured data: for each of the 12 houses, which
sign occupies it and which planets sit there. A frontend (web/mobile)
can render this into a North Indian or South Indian chart box layout
using this data directly.
"""
from __future__ import annotations

from typing import Dict, List

from app.astro_engine import RASI_NAMES, VedicAstrologyEngine

PLANET_ABBR = {
    "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
    "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke",
}


def _build_house_chart(asc_sign_idx: int, planets: Dict[str, Dict],
                        sign_key: str = "sign_index") -> List[Dict]:
    """
    Whole-sign house chart: House 1 = Ascendant's sign, House 2 = next
    sign, etc. Returns a list of 12 house dicts in order (house 1..12).
    """
    houses = []
    for house_num in range(1, 13):
        sign_idx = (asc_sign_idx + house_num - 1) % 12
        occupants = [
            {"planet": name, "abbr": PLANET_ABBR.get(name, name[:2]),
             "degree_str": data["degree_str"], "retrograde": data.get("retrograde", False)}
            for name, data in planets.items()
            if data[sign_key] == sign_idx
        ]
        houses.append({
            "house": house_num,
            "sign_index": sign_idx,
            "sign": RASI_NAMES[sign_idx],
            "occupants": occupants,
        })
    return houses


class ChartEngine:
    """Produces D1 (Lagna), Rashi (Moon-anchored) and D9 (Navamsha) charts."""

    def __init__(self, engine: VedicAstrologyEngine):
        self.engine = engine

    def build_d1_lagna_chart(self, technical_profile: Dict) -> List[Dict]:
        asc_sign_idx = technical_profile["ascendant"]["sign_index"]
        return _build_house_chart(asc_sign_idx, technical_profile["planets"])

    def build_rashi_chart(self, technical_profile: Dict) -> List[Dict]:
        """Moon-anchored chart: House 1 = Moon's sign."""
        moon_sign_idx = technical_profile["moon_sign_index"]
        return _build_house_chart(moon_sign_idx, technical_profile["planets"])

    def build_d9_navamsa_chart(self, technical_profile: Dict) -> List[Dict]:
        """
        D9 chart. Every planet (and the Ascendant) gets re-mapped into
        its Navamsa sign, then a fresh whole-sign chart is built using
        the Navamsa Ascendant as House 1.
        """
        asc = technical_profile["ascendant"]
        navamsa_planets: Dict[str, Dict] = {}
        for name, data in technical_profile["planets"].items():
            d9_sign = self.engine.navamsa_sign_index(
                data["sign_index"], data["degree_in_sign"]
            )
            navamsa_planets[name] = {
                **data,
                "navamsa_sign_index": d9_sign,
            }

        d9_asc_sign = self.engine.navamsa_sign_index(
            asc["sign_index"], asc["degree_in_sign"]
        )
        return _build_house_chart(d9_asc_sign, navamsa_planets, sign_key="navamsa_sign_index")

    def build_all_charts(self, technical_profile: Dict) -> Dict:
        return {
            "D1_lagna": self.build_d1_lagna_chart(technical_profile),
            "rashi_moon_chart": self.build_rashi_chart(technical_profile),
            "D9_navamsa": self.build_d9_navamsa_chart(technical_profile),
        }
