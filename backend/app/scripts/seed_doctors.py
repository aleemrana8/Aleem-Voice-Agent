"""
Seed script for Aleem Hospital doctors.
Run: python -m app.scripts.seed_doctors
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models import ALL_DOCUMENT_MODELS
from app.models.doctor import Doctor, DaySchedule, BreakTime


DOCTORS = [
    {
        "employee_id": "DOC001",
        "full_name": "Dr Aleem",
        "specialization": "General Medicine",
        "phone": "+923001234501",
        "email": "dr.aleem@aleemhospital.com",
        "qualification": "MBBS, FCPS",
        "experience_years": 15,
        "consultation_fee": 2000.0,
    },
    {
        "employee_id": "DOC002",
        "full_name": "Dr Mohsin",
        "specialization": "General Medicine",
        "phone": "+923001234502",
        "email": "dr.mohsin@aleemhospital.com",
        "qualification": "MBBS, MD",
        "experience_years": 10,
        "consultation_fee": 1500.0,
    },
    {
        "employee_id": "DOC003",
        "full_name": "Dr Zain",
        "specialization": "General Medicine",
        "phone": "+923001234503",
        "email": "dr.zain@aleemhospital.com",
        "qualification": "MBBS, MRCP",
        "experience_years": 8,
        "consultation_fee": 1500.0,
    },
]

# Hospital schedule: 3 PM to 12 AM daily, Break 8 PM - 9 PM, 30 min slots
WEEKLY_SCHEDULE = {
    day: DaySchedule(
        start="15:00",
        end="00:00",
        slot_duration=30,
        breaks=[
            BreakTime(start="20:00", end="21:00", label="Evening Break"),
        ],
    )
    for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}

# Locations for each doctor
LOCATIONS = {
    "DOC001": "Islamabad",
    "DOC002": "Islamabad",
    "DOC003": "Multan",
}


async def seed():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    await init_beanie(
        database=client[settings.MONGO_DB_NAME],
        document_models=ALL_DOCUMENT_MODELS,
    )

    for doc_data in DOCTORS:
        existing = await Doctor.find_one(Doctor.employee_id == doc_data["employee_id"])
        if existing:
            # Update schedule if needed
            existing.schedule = WEEKLY_SCHEDULE
            await existing.save()
            print(f"✓ Updated: {doc_data['full_name']} ({doc_data['employee_id']})")
        else:
            doctor = Doctor(
                **doc_data,
                schedule=WEEKLY_SCHEDULE,
            )
            await doctor.insert()
            print(f"✓ Created: {doc_data['full_name']} ({doc_data['employee_id']})")

    print(f"\n{'='*50}")
    print("Doctor seeding complete!")
    print(f"Hospital: Aleem Hospital")
    print(f"Locations: Islamabad, Multan")
    print(f"Hours: 3 PM → 12 AM")
    print(f"Break: 8 PM → 9 PM")
    print(f"Slot: 30 minutes")
    print(f"{'='*50}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
