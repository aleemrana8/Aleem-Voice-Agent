"""
Intent Extraction Service
=========================
Uses LLM ONLY for Natural Language Understanding (intent + entity extraction).
NO business logic in prompts. Returns structured JSON for the workflow engine.
"""

import json
from typing import Optional
from loguru import logger
from openai import AsyncOpenAI
from app.core.config import settings


INTENT_EXTRACTION_PROMPT = """You are a hospital receptionist NLU system for Aleem Hospital.
Your ONLY job is to extract the patient's intent and entities from their speech.

Return ONLY valid JSON in this exact format:
{
  "intent": "<one of the 12 intents below>",
  "entities": {
    "first_name": "<first name if spelled/mentioned, null otherwise>",
    "last_name": "<last name if spelled/mentioned, null otherwise>",
    "spelled_text": "<if patient spells letters one by one, assemble into a word, null otherwise>",
    "provider": "<doctor name if mentioned, null otherwise>",
    "location": "<Islamabad or Multan if mentioned, null otherwise>",
    "date": "<YYYY-MM-DD if date mentioned, null otherwise>",
    "time_preference": "<HH:MM in 24h format if time mentioned, null otherwise>",
    "patient_name": "<full patient name if mentioned, null otherwise>",
    "phone": "<phone number if mentioned, null otherwise>",
    "date_of_birth": "<YYYY-MM-DD if DOB mentioned, null otherwise>",
    "appointment_id": "<appointment ID if mentioned, null otherwise>",
    "patient_type": "<'existing' or 'new' if patient indicates, null otherwise>",
    "reason": "<reason if mentioned, null otherwise>"
  },
  "confirmed": <true if patient clearly says yes/confirm/correct, false if no/cancel/wrong/change, null if unclear>
}

Valid intents (12):
1. book_appointment — wants to schedule a new appointment
2. reschedule_appointment — wants to change existing appointment date/time
3. cancel_appointment — wants to cancel an existing appointment
4. check_availability — wants to check available slots/times
5. verify_patient — wants to verify their identity
6. register_new_patient — wants to register as a new patient
7. repeat_information — asks to repeat what was just said
8. change_slot — wants a different time slot (during booking)
9. change_date — wants a different date (during booking)
10. change_provider — wants a different doctor (during booking)
11. change_location — wants a different location (during booking)
12. human_handoff — wants to talk to a real person

Context:
- Hospital: Aleem Hospital
- Doctors: Dr Aleem (DOC001, Islamabad & Multan), Dr Mohsin (DOC002, Islamabad), Dr Zain (DOC003, Multan)
- Locations: Islamabad, Multan
- Working hours: 3 PM to 12 AM (15:00-00:00), Break: 8-9 PM
- Today's date will be provided in the conversation

Rules:
- If patient spells out letters (e.g. "A-L-E-E-M" or "A L E E M"), assemble into "spelled_text": "Aleem"
- Convert relative dates (tomorrow, next Monday) to YYYY-MM-DD
- Convert times to 24h format (5 PM → 17:00)
- Convert DOB to YYYY-MM-DD format
- Match doctor names even with partial/misspelled names
- "existing" patient_type if they say yes/existing/old patient; "new" if first time/new/register
- Return null for entities not mentioned
- NEVER make up data. Only extract what the patient actually said.
"""


class IntentExtractor:
    """Extracts structured intent + entities from patient speech using LLM."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def extract(
        self,
        utterance: str,
        current_state: str = "",
        context_hint: str = "",
    ) -> dict:
        """
        Extract intent and entities from patient utterance.
        Returns structured dict ready for workflow engine consumption.
        """
        from datetime import date

        messages = [
            {"role": "system", "content": INTENT_EXTRACTION_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Today's date: {date.today().isoformat()}\n"
                    f"Current conversation state: {current_state}\n"
                    f"Context: {context_hint}\n\n"
                    f"Patient said: \"{utterance}\"\n\n"
                    "Extract intent and entities as JSON:"
                ),
            },
        ]

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.1,
                max_tokens=300,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            result = json.loads(content)

            # Validate structure
            if "intent" not in result:
                result["intent"] = "unknown"
            if "entities" not in result:
                result["entities"] = {}

            logger.debug(f"[NLU] Extracted: intent={result['intent']} entities={result['entities']}")
            return result

        except json.JSONDecodeError as e:
            logger.error(f"[NLU] JSON parse error: {e}")
            return {"intent": "unknown", "entities": {}, "confirmed": None}
        except Exception as e:
            logger.error(f"[NLU] Extraction failed: {e}")
            return {"intent": "unknown", "entities": {}, "confirmed": None}

    async def extract_confirmation(self, utterance: str) -> Optional[bool]:
        """Quick check if utterance is a yes/no confirmation."""
        positive = {"yes", "yeah", "yep", "sure", "ok", "okay", "confirm", "correct", "right", "haan", "ji", "theek", "absolutely", "definitely"}
        negative = {"no", "nope", "cancel", "don't", "nahi", "na", "wrong", "change", "not", "incorrect"}

        lower = utterance.lower().strip()
        words = set(lower.split())

        if words & positive:
            return True
        if words & negative:
            return False
        return None

    async def extract_patient_type(self, utterance: str) -> Optional[str]:
        """Determine if patient said existing or new."""
        lower = utterance.lower().strip()
        existing_words = {"existing", "yes", "old", "already", "registered", "before", "haan", "returning"}
        new_words = {"new", "first", "no", "never", "nahi", "register"}

        words = set(lower.split())
        if words & existing_words:
            return "existing"
        if words & new_words:
            return "new"
        return None

    async def extract_spelled_name(self, utterance: str) -> Optional[str]:
        """
        Extract a name from spelled-out letters.
        E.g., "A L E E M" or "A-L-E-E-M" → "Aleem"
        """
        import re
        lower = utterance.strip()

        # Pattern: single letters separated by spaces, dashes, or dots
        letters = re.findall(r'\b([A-Za-z])\b', lower)
        if len(letters) >= 2:
            return "".join(letters).title()

        # Check for dash or dot separated
        parts = re.split(r'[-.\s]+', lower)
        if all(len(p) == 1 and p.isalpha() for p in parts) and len(parts) >= 2:
            return "".join(parts).title()

        return None

    async def extract_time_slot(self, utterance: str, available_slots: list[str]) -> Optional[str]:
        """Extract a time slot from utterance, matching against available options."""
        lower = utterance.lower()

        time_mappings = {
            "3": "15:00", "3 pm": "15:00", "3pm": "15:00",
            "3:30": "15:30", "3:30 pm": "15:30",
            "4": "16:00", "4 pm": "16:00", "4pm": "16:00",
            "4:30": "16:30", "4:30 pm": "16:30",
            "5": "17:00", "5 pm": "17:00", "5pm": "17:00",
            "5:30": "17:30", "5:30 pm": "17:30",
            "6": "18:00", "6 pm": "18:00", "6pm": "18:00",
            "6:30": "18:30", "6:30 pm": "18:30",
            "7": "19:00", "7 pm": "19:00", "7pm": "19:00",
            "7:30": "19:30", "7:30 pm": "19:30",
            "8": "20:00", "8 pm": "20:00", "8pm": "20:00",
            "9": "21:00", "9 pm": "21:00", "9pm": "21:00",
            "9:30": "21:30", "9:30 pm": "21:30",
            "10": "22:00", "10 pm": "22:00", "10pm": "22:00",
            "10:30": "22:30", "10:30 pm": "22:30",
            "11": "23:00", "11 pm": "23:00", "11pm": "23:00",
            "11:30": "23:30", "11:30 pm": "23:30",
        }

        for phrase, slot in time_mappings.items():
            if phrase in lower and slot in available_slots:
                return slot

        for slot in available_slots:
            if slot in lower:
                return slot

        return None


# Singleton
intent_extractor = IntentExtractor()
