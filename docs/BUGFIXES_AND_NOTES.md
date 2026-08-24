# Kundali Application — Bug Fixes & Technical Notes

## Session Date: 2026-08-24

This document tracks fixes and refinements made to the calculation engine, profile management, and UI workflows.

---

## 1. Gender Retention on Form Input (Stale Closure Fix)

* **Symptoms:** Selecting a gender (`♂ Male` / `♀ Female`) and subsequently editing or typing in the Name input cleared the selected gender back to empty.
* **Root Cause:** In `kundali_frontend/src/components/BirthDetailsForm.jsx`, `handleNameInput` and `handlePlaceInput` were wrapped in `useCallback(..., [])` with an empty dependency array. This caused `update('name', raw)` to execute against the initial `value` state snapshot (where `gender` was `""`), overwriting recent state updates.
* **Fix:** Replaced stale `useCallback` closures with fresh, direct functions that preserve all existing fields in `value`.

---

## 2. Gender Display in Kundali Report & Headers

* **Symptoms:** The selected gender was not shown in the generated Kundali report header or meta information.
* **Root Cause:** `KundaliPage.jsx` did not attach `gender` to the client-side `report` object, and `KundaliReport.jsx` lacked a gender badge next to the person's name.
* **Fix:**
  - `KundaliPage.jsx`: Attached `data.gender = personData.gender` to the report object.
  - `KundaliReport.jsx`: Added `.gender-badge` (`♂ Male` in blue / `♀ Female` in pink) prominently in the report header and metadata strip.

---

## 3. Streamlined Profile Saving (No Repeated Gender Prompts)

* **Symptoms:** After generating a Kundali, clicking "Save to Profiles" opened a form that asked the user to re-select their gender.
* **Root Cause:** `SaveProfileButton.jsx` initialized gender only once at component mount without syncing when props changed, and forced a generic picker.
* **Fix:**
  - Synced `gender` state using `useEffect` on `propGender`.
  - When gender is already provided in the form, `SaveProfileButton` displays the pre-selected gender badge and provides a 1-click confirm with relationship tag selection (`Self`, `Family`, `Friend`, `Partner`, `Client`).

---

## 4. Profile Update & Persistence (CHECK Constraint Protection)

* **Symptoms:** Modifying and updating a saved profile caused the profile update to fail or disappear from filtered lists.
* **Root Cause:** Due to the stale closure bug, editing the name resulted in `gender: ""` being sent in the `PATCH /api/v1/profiles/{id}` request. SQLite threw an `IntegrityError` (`CHECK constraint failed: gender IN ('male', 'female')`).
* **Fix:**
  - `BirthDetailsForm.jsx`: Fallback to `value.gender || savedSnapshot.gender || 'male'` before sending update payloads.
  - `main.py` (`patch_profile`): Sanitized update payload to ignore empty string values (`v != ""`), preventing constraint violations on partial updates.
  - `BirthDetailsForm.jsx`: Added a visual success banner (`✓ Profile updated successfully in database!`).

---

## 5. Astrological Standard: Mangal Dosha 5-House Rule (Parashari)

* **Symptoms:** Chart with Mars in Sagittarius (House 2 from Scorpio Lagna) was classified as `Primary Manglik`.
* **Astrological Analysis:**
  - **Standard Parashara / North Indian / Maharashtra Rule:** Mangal Dosha occurs **only** when Mars is in houses **`1, 4, 7, 8, 12`** from Lagna, Moon, or Venus (*"Lagne vyaye cha patale jamitre chashtame kuje"*).
  - **South Indian (Kerala/Tamil) Rule:** Also adds house **`2`** (*Kutumba Sthana*), checking houses `1, 2, 4, 7, 8, 12`.
* **Fix:** Changed default `MANGLIK_MODE` in `astro_engine.py` from `SOUTH` to `STANDARD` (`{1, 4, 7, 8, 12}`). Mars in House 2 is now correctly evaluated as **Not Manglik**, and the Papa Samyam score is appropriately balanced.

---

## 6. Report Tab Architecture (Phase 3)

The Kundali Report layout was refactored from a single long scroll into a structured 5-tab workspace:
1. **Overview (🪐):** Vital stats (Lagna, Moon, Nakshatra, Ayanamsha), Varna/Gana/Nadi classification, 12-house summary strip, D1 Lagna chart.
2. **Planets (☿):** Full planetary positions table (with retrogrades, degrees, nakshatras, dignities) and interactive chart selector (D1 / D9 / Chandra / All).
3. **Dasha (⏳):** Vimshottari Mahadasha timeline with currently active period highlighted.
4. **Doshas (⚖️):** Complete Mangal Dosha analysis, Papa Samyam mathematical breakdown table, and Kaal Sarp Yoga detection.
5. **Health (🌿):** Ayurvedic constitution (*Prakriti*), organ sensitivities, fever/inflammation indicators, and 6th/8th house health tendencies.
