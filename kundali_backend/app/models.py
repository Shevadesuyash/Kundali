"""
app/models.py
--------------
Domain model (Person) used by the astrology engine, plus Pydantic
request/response schemas used by the FastAPI layer.
"""
from __future__ import annotations

import datetime
from typing import Any, Dict, List, Literal, Optional

import pytz
from pydantic import BaseModel, Field, field_validator, model_validator


# --------------------------------------------------------------------------
# Domain model
# --------------------------------------------------------------------------
class Person:
    """
    Data model representing a person for astrological calculations.
    Holds their name, exact birth time, and birth coordinates, and
    pre-computes the UTC datetime needed by the Swiss Ephemeris.
    """

    def __init__(
        self,
        name: str,
        year: int,
        month: int,
        day: int,
        hour: int,
        minute: int,
        lat: float,
        lon: float,
        timezone_str: str = "Asia/Kolkata",
        second: int = 0,
    ):
        self.name = name
        self.year = year
        self.month = month
        self.day = day
        self.hour = hour
        self.minute = minute
        self.second = second
        self.lat = lat
        self.lon = lon
        self.timezone_str = timezone_str

        try:
            local_tz = pytz.timezone(timezone_str)
        except pytz.UnknownTimeZoneError as exc:
            raise ValueError(f"Unknown timezone: {timezone_str}") from exc

        local_dt = datetime.datetime(year, month, day, hour, minute, second)
        self.utc_dt = local_tz.localize(local_dt).astimezone(pytz.utc)

    def display_info(self) -> str:
        time_str = f"{self.hour:02d}:{self.minute:02d}:{self.second:02d}" if self.second else f"{self.hour:02d}:{self.minute:02d}"
        return (
            f"Profile: {self.name} | DOB: {self.day}-{self.month}-{self.year} "
            f"| Time: {time_str} | "
            f"Coordinates: {self.lat}, {self.lon}"
        )

    def __repr__(self) -> str:
        return f"<Person {self.name} {self.utc_dt.isoformat()}>"


# --------------------------------------------------------------------------
# API schemas (Pydantic v2)
# --------------------------------------------------------------------------
class BirthDetails(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(..., ge=0, le=59)
    second: int = Field(default=0, ge=0, le=59)
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    timezone_str: str = Field(default="Asia/Kolkata")

    @field_validator("name", mode="before")
    @classmethod
    def strip_and_validate_name(cls, v):
        """Strip whitespace and reject pure-whitespace names (ISSUE-017)."""
        if isinstance(v, str):
            v = v.strip()
        if not v:
            raise ValueError("Name must not be empty or whitespace-only.")
        return v

    @model_validator(mode="after")
    def validate_calendar_date(self) -> "BirthDetails":
        """Cross-field validation: reject invalid calendar dates like Feb 30, Feb 29 on non-leap years (ISSUE-007)."""
        try:
            datetime.date(self.year, self.month, self.day)
        except ValueError as exc:
            raise ValueError(f"Invalid calendar date: {exc}") from exc
        return self

    def to_person(self) -> Person:
        return Person(
            self.name, self.year, self.month, self.day,
            self.hour, self.minute, self.lat, self.lon, self.timezone_str,
            second=self.second,
        )


class KundaliRequest(BaseModel):
    person: BirthDetails
    include_ai_reading: bool = False
    language: Optional[str] = "en"


class MatchRequest(BaseModel):
    boy: BirthDetails
    girl: BirthDetails
    include_ai_reading: bool = False
    language: Optional[str] = "en"


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


# ---------------------------------------------------------------------------
# Profile schemas
# ---------------------------------------------------------------------------

# Valid relationship tags for saved profiles
VALID_TAGS = {"self", "family", "friend", "partner", "client"}


class SaveProfileRequest(BaseModel):
    person: BirthDetails
    gender: Literal["male", "female"]
    birth_place: Optional[str] = None
    tag: Optional[str] = "self"
    user_id: Optional[str] = None


class ProfileSummary(BaseModel):
    id: int
    user_id: Optional[str] = None
    name: str
    gender: str
    birth_place: Optional[str] = None
    year: int
    month: int
    day: int
    moon_sign: Optional[str] = None
    nakshatra: Optional[str] = None
    lagna: Optional[str] = None
    is_manglik: bool
    active_dasha: Optional[str] = None
    tag: Optional[str] = None
    created_at: str


class ProfileDetail(ProfileSummary):
    hour: int
    minute: int
    lat: float
    lon: float
    timezone_str: str


class MatchSavedRequest(BaseModel):
    boy_id: int
    girl_id: int
    include_ai_reading: bool = False
    language: Optional[str] = "en"


class BulkMatchRequest(BaseModel):
    anchor_profile_id: int
    candidate_ids: Optional[List[int]] = None  # None = match against ALL opposite-gender profiles


class AIChatRequest(BaseModel):
    report: Dict[str, Any]
    question: str
    language: Optional[str] = "en"
    user_id: Optional[str] = None


class VarshapalRequest(BaseModel):
    person: BirthDetails
    target_year: int


class ProfileListResponse(BaseModel):
    profiles: List[ProfileSummary]
    total: int
    page: int
    per_page: int


# Lightweight typeahead result (minimal fields for auto-fill)
class ProfileTypeahead(BaseModel):
    id: int
    name: str
    gender: str
    year: int
    month: int
    day: int
    hour: int
    minute: int
    lat: float
    lon: float
    timezone_str: str
    birth_place: Optional[str] = None
    lagna: Optional[str] = None
    moon_sign: Optional[str] = None
