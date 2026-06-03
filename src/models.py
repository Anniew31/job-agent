from pydantic import BaseModel, field_validator
from typing import Optional, Literal

def validate_not_empty(v: str) -> str:
    if not v.strip():
        raise ValueError("field can't be empty")
    return v

def validate_date_format(v: str) -> str:
    if len(v.strip()) != 7 or v.strip().find("/") != 2:
        raise ValueError("date has to be in MM/YYYY format")
    return v

def validate_bullets(v: list[str]) -> list[str]:
    if len(v) == 0:
        raise ValueError("there has to be at least one bullet point")
    for bullet in v:
        if len(bullet) < 10:
            raise ValueError("each bullet has to be at least 10 characters")
    return v

def validate_gpa(v: Optional[float]) -> Optional[float]:
    if v is None:
        return None
    if v > 4.3 or v < 0.0:
        raise ValueError("gpa has to be between 0.0 and 4.3")
    return v

def validate_grad_year(v: int) -> int:
    if v > 2050 or v < 1950:
        raise ValueError("graduation year has to be between 1950 and 2050")
    return v

def validate_email(v: str) -> str:
    at_index = v.find('@')
    dot_index = v.find('.')
    if at_index == -1 or at_index > dot_index:
        raise ValueError("has to be a valid email format")
    return v

def validate_positioning(v: str) -> str:
    if len(v.split()) < 10:
        raise ValueError("has to be at least 10 words")
    return v

def validate_list_not_empty(v: list) -> list:
    if len(v) == 0:
        raise ValueError("needs at least one item")
    return v

def validate_salary(v: int) -> int:
    if v <= 0:
        raise ValueError("salary has to be positive")
    return v

class Website(BaseModel):
    label: str
    url: str
 
    @field_validator("label", "url")
    def _not_empty(cls, v):
        return validate_not_empty(v)
 

class WorkExperience(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    bullets: list[str]

    @field_validator("company", "position")
    def _not_empty(cls, v):
        return validate_not_empty(v)

    @field_validator("start_date")
    def _start_date(cls, v):
        return validate_date_format(v)

    @field_validator("end_date")
    def _end_date(cls, v):
        if v is None:
            return None
        return validate_date_format(v)

    @field_validator("bullets")
    def _bullets(cls, v):
        return validate_bullets(v)

class Project(BaseModel):
    name: str
    tech_stack: Optional[str] = None
    date: Optional[str] = None
    bullets: list[str]

    @field_validator("name")
    def _not_empty(cls, v):
        return validate_not_empty(v)

    @field_validator("bullets")
    def _bullets(cls, v):
        return validate_bullets(v)

class Education(BaseModel):
    school: str
    degree: str
    major: str
    gpa: Optional[float] = None
    location: Optional[str] = None
    grad_year: int

    @field_validator("school", "degree", "major")
    def _not_empty(cls, v):
        return validate_not_empty(v)

    @field_validator("gpa")
    def _gpa(cls, v):
        return validate_gpa(v)

    @field_validator("grad_year")
    def _grad_year(cls, v):
        return validate_grad_year(v)


class Profile(BaseModel):
    name: str
    email: str
    location: str
    phone: Optional[str] = None
    websites: list[Website] = []
    positioning: str

    education: list[Education]
    experience: list[WorkExperience] = []
    projects: list[Project] = []

    skills: dict[str, list[str]]
    target_roles: list[str]

    role_type: Literal["internship", "fulltime", "either"]
    work_preference: Literal["remote", "onsite", "hybrid", "any"]

    salary_floor: int
    salary_type: Literal["hourly", "annual"]

    deal_breakers: list[str] = []

    @field_validator("email")
    def _email(cls, v):
        return validate_email(v)

    @field_validator("positioning")
    def _positioning(cls, v):
        return validate_positioning(v)

    @field_validator("target_roles")
    def _list_not_empty(cls, v):
        return validate_list_not_empty(v)

    @field_validator("salary_floor")
    def _salary(cls, v):
        return validate_salary(v)