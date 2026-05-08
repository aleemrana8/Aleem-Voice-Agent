import json
from openai import AsyncOpenAI
from typing import List, Dict, Optional
from fastapi import HTTPException
from app.core.config import settings
from loguru import logger

SYSTEM_PROMPT = """You are the AI receptionist for Aleem EHR Hospital. Your name is Aleem Voice Agent.

You help patients with:
1. Booking new appointments
2. Rescheduling existing appointments
3. Cancelling appointments
4. Checking doctor availability
5. General hospital inquiries

RULES:
- Always be polite, professional, and empathetic
- Verify patient identity before making any changes (ask for phone number and date of birth)
- When booking, confirm: doctor name, date, time slot, and reason
- When rescheduling, confirm the original appointment details first
- When cancelling, confirm the appointment and ask for the reason
- If you're unsure, ask clarifying questions
- Keep responses concise and natural for voice conversation (2-3 sentences max)
- Never share other patients' information
- If the patient has an emergency, advise them to call 911 or go to the ER
- Use the provided function tools to perform actions when needed

Start each call by greeting the patient and asking how you can help them today."""

# OpenAI function definitions for the voice agent
AGENT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "verify_patient",
            "description": "Verify a patient's identity using their phone number and date of birth",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone": {
                        "type": "string",
                        "description": "Patient's phone number",
                    },
                    "date_of_birth": {
                        "type": "string",
                        "description": "Patient's date of birth in YYYY-MM-DD format",
                    },
                },
                "required": ["phone", "date_of_birth"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Check available appointment slots for a doctor on a specific date",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "string",
                        "description": "Doctor's employee ID (e.g. DOC001)",
                    },
                    "date": {
                        "type": "string",
                        "description": "Date to check in YYYY-MM-DD format",
                    },
                },
                "required": ["doctor_id", "date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Book a new appointment for a verified patient",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_id": {
                        "type": "string",
                        "description": "Patient's ID (e.g. PAT-XXXXXXXX)",
                    },
                    "doctor_id": {
                        "type": "string",
                        "description": "Doctor's employee ID",
                    },
                    "date": {
                        "type": "string",
                        "description": "Appointment date YYYY-MM-DD",
                    },
                    "time_slot": {
                        "type": "string",
                        "description": "Time slot HH:MM (e.g. 10:00)",
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for the visit",
                    },
                },
                "required": ["patient_id", "doctor_id", "date", "time_slot"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "reschedule_appointment",
            "description": "Reschedule an existing appointment to a new date/time",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {
                        "type": "string",
                        "description": "The appointment ID to reschedule",
                    },
                    "new_date": {
                        "type": "string",
                        "description": "New date YYYY-MM-DD",
                    },
                    "new_time_slot": {
                        "type": "string",
                        "description": "New time slot HH:MM",
                    },
                },
                "required": ["appointment_id", "new_date", "new_time_slot"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_appointment",
            "description": "Cancel an existing appointment",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {
                        "type": "string",
                        "description": "The appointment ID to cancel",
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for cancellation",
                    },
                },
                "required": ["appointment_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_doctors",
            "description": "List available doctors, optionally filtered by specialization",
            "parameters": {
                "type": "object",
                "properties": {
                    "specialization": {
                        "type": "string",
                        "description": "Filter by specialization (e.g. Cardiology, Pediatrics)",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_appointments",
            "description": "Get all appointments for a patient",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_id": {
                        "type": "string",
                        "description": "Patient's ID",
                    },
                },
                "required": ["patient_id"],
            },
        },
    },
]


class LLMService:
    """OpenAI GPT-4o powered LLM service with function calling."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.conversation_history: Dict[str, List[Dict]] = {}

    async def chat(
        self,
        call_id: str,
        user_message: str,
        system_prompt: str = SYSTEM_PROMPT,
    ) -> str:
        # Initialize conversation if new
        if call_id not in self.conversation_history:
            self.conversation_history[call_id] = [
                {"role": "system", "content": system_prompt}
            ]

        # Add user message
        self.conversation_history[call_id].append(
            {"role": "user", "content": user_message}
        )

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=self.conversation_history[call_id],
                tools=AGENT_TOOLS,
                tool_choice="auto",
                temperature=0.7,
                max_tokens=500,
            )

            message = response.choices[0].message

            # Handle function calls
            if message.tool_calls:
                # Add assistant message with tool calls
                self.conversation_history[call_id].append(message.model_dump())

                # Execute each function call
                for tool_call in message.tool_calls:
                    fn_name = tool_call.function.name
                    fn_args = json.loads(tool_call.function.arguments)
                    logger.info(f"Function call: {fn_name}({fn_args})")

                    result = await self._execute_function(fn_name, fn_args)

                    # Add tool result to conversation
                    self.conversation_history[call_id].append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": json.dumps(result),
                        }
                    )

                # Get final response after function execution
                followup = await self.client.chat.completions.create(
                    model=self.model,
                    messages=self.conversation_history[call_id],
                    temperature=0.7,
                    max_tokens=500,
                )
                assistant_message = followup.choices[0].message.content

            else:
                assistant_message = message.content

            # Store assistant response
            self.conversation_history[call_id].append(
                {"role": "assistant", "content": assistant_message}
            )

            return assistant_message

        except Exception as e:
            logger.error(f"OpenAI LLM error for call {call_id}: {e}")
            return "I apologize, I'm having trouble processing your request. Could you please repeat that?"

    async def _execute_function(self, name: str, args: dict) -> dict:
        """Execute an agent function and return the result."""
        try:
            if name == "verify_patient":
                return await self._fn_verify_patient(**args)
            elif name == "check_availability":
                return await self._fn_check_availability(**args)
            elif name == "book_appointment":
                return await self._fn_book_appointment(**args)
            elif name == "reschedule_appointment":
                return await self._fn_reschedule_appointment(**args)
            elif name == "cancel_appointment":
                return await self._fn_cancel_appointment(**args)
            elif name == "list_doctors":
                return await self._fn_list_doctors(**args)
            elif name == "get_patient_appointments":
                return await self._fn_get_patient_appointments(**args)
            else:
                return {"error": f"Unknown function: {name}"}
        except Exception as e:
            logger.error(f"Function execution error {name}: {e}")
            return {"error": str(e)}

    async def _fn_verify_patient(self, phone: str, date_of_birth: str) -> dict:
        from app.models.patient import Patient

        patient = await Patient.find_one(Patient.phone == phone)
        if not patient:
            return {"verified": False, "error": "Patient not found with this phone number"}
        if patient.date_of_birth != date_of_birth:
            return {"verified": False, "error": "Date of birth does not match"}
        patient.is_verified = True
        await patient.save()
        return {
            "verified": True,
            "patient_id": patient.patient_id,
            "full_name": patient.full_name,
        }

    async def _fn_check_availability(self, doctor_id: str, date: str) -> dict:
        from app.services.appointment_service import appointment_service

        try:
            result = await appointment_service.get_availability(doctor_id, date)
            return {
                "doctor": result.doctor_name,
                "date": result.date,
                "available_slots": [s.time for s in result.slots if s.available],
                "is_working_day": result.is_working_day,
                "message": result.message or "",
            }
        except Exception as e:
            return {"error": str(e)}

    async def _fn_book_appointment(
        self, patient_id: str, doctor_id: str, date: str, time_slot: str, reason: str = ""
    ) -> dict:
        from app.services.appointment_service import appointment_service

        try:
            appt = await appointment_service.book(
                patient_id=patient_id,
                doctor_id=doctor_id,
                appt_date=date,
                time_slot=time_slot,
                reason=reason,
                booked_via="voice",
                call_id=None,
            )
            return {
                "success": True,
                "appointment_id": appt.appointment_id,
                "patient_name": appt.patient_name,
                "doctor_name": appt.doctor_name,
                "date": appt.date,
                "time_slot": appt.time_slot,
            }
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}

    async def _fn_reschedule_appointment(
        self, appointment_id: str, new_date: str, new_time_slot: str
    ) -> dict:
        from app.services.appointment_service import appointment_service

        try:
            appt = await appointment_service.reschedule(
                appointment_id=appointment_id,
                new_date=new_date,
                new_time_slot=new_time_slot,
            )
            return {
                "success": True,
                "new_date": appt.date,
                "new_time": appt.time_slot,
            }
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}

    async def _fn_cancel_appointment(self, appointment_id: str, reason: str = "") -> dict:
        from app.services.appointment_service import appointment_service

        try:
            appt = await appointment_service.cancel(
                appointment_id=appointment_id,
                reason=reason or "Cancelled via voice agent",
            )
            return {"success": True, "cancelled_appointment": appt.appointment_id}
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}

    async def _fn_list_doctors(self, specialization: str = "") -> dict:
        from app.models.doctor import Doctor

        query = {"is_active": True}
        if specialization:
            query["specialization"] = {"$regex": specialization, "$options": "i"}
        doctors = await Doctor.find(query).to_list()
        return {
            "doctors": [
                {
                    "employee_id": d.employee_id,
                    "name": d.full_name,
                    "specialization": d.specialization,
                }
                for d in doctors
            ]
        }

    async def _fn_get_patient_appointments(self, patient_id: str) -> dict:
        from app.services.appointment_service import appointment_service

        try:
            items, _ = await appointment_service.get_patient_appointments(
                patient_id, upcoming_only=True, limit=20
            )
            return {
                "appointments": [
                    {
                        "id": a.appointment_id,
                        "doctor": a.doctor_name,
                        "date": a.date,
                        "time": a.time_slot,
                        "status": a.status.value if hasattr(a.status, "value") else a.status,
                        "reason": a.reason or "",
                    }
                    for a in items
                ]
            }
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}

    def get_history(self, call_id: str) -> List[Dict]:
        return self.conversation_history.get(call_id, [])

    def clear_history(self, call_id: str):
        self.conversation_history.pop(call_id, None)


# Singleton
llm_service = LLMService()
