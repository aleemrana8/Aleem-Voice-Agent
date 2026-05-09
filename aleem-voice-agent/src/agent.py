import logging
import textwrap
import os
import httpx
from datetime import datetime

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    inference,
    room_io,
)
from livekit.plugins import silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
API_BASE = f"{BACKEND_URL}/api/v1/public"


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            llm=inference.LLM(model="openai/gpt-4o"),
            instructions=textwrap.dedent(
                """\
                You are the AI voice receptionist for Aleem Hospital, a modern healthcare facility with branches in Islamabad and Multan, Pakistan.

                # Your role
                You help patients book, reschedule, and cancel appointments with our doctors. You are professional, warm, and efficient.

                # Doctors available
                - Doctor Aleem Rehman (DOC001): Senior Physician and Founder, General Medicine. Available at both Islamabad and Multan.
                - Doctor Mohsin Khan (DOC002): General Physician, based in Islamabad.
                - Doctor Zain Abbas (DOC003): General Physician, based in Multan.

                # Schedule
                All doctors are available Monday through Sunday, 3 PM to 12 AM (midnight), with a break from 8 PM to 9 PM.
                Each appointment slot is 30 minutes.

                # Output rules
                - Respond in plain text only. Never use JSON, markdown, lists, tables, code, or emojis.
                - Keep replies brief: one to three sentences. Ask one question at a time.
                - Spell out numbers, phone numbers, and dates naturally.
                - Speak in a warm, professional tone appropriate for a hospital receptionist.

                # Booking flow
                1. Ask which doctor they'd like to see (or suggest one based on location).
                2. Ask for their preferred date.
                3. Use the check_availability tool to find open slots, then offer options.
                4. Ask for the patient's full name and phone number.
                5. Use the book_appointment tool to confirm.
                6. Summarize the booking clearly.

                # Cancellation / Rescheduling
                - For cancellations or rescheduling, collect the appointment details and assist accordingly.

                # Important
                - Always use the tools to check real availability before suggesting times.
                - If no slots are available, suggest the next day or another doctor.
                - The hospital phone number is plus 92, 440, 684, 8838.
                - For emergencies, advise calling emergency services immediately.
                """
            ),
        )

    @function_tool
    async def check_availability(
        self, context: RunContext, doctor_id: str, date: str
    ):
        """Check available appointment slots for a doctor on a given date.

        Args:
            doctor_id: The doctor's ID. Use DOC001 for Dr. Aleem, DOC002 for Dr. Mohsin, DOC003 for Dr. Zain.
            date: The date to check in YYYY-MM-DD format (e.g. 2026-05-10).
        """
        logger.info(f"Checking availability for {doctor_id} on {date}")
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(
                    f"{API_BASE}/availability",
                    json={"doctor_id": doctor_id, "date": date},
                )
                resp.raise_for_status()
                data = resp.json()
                slots = data.get("available_slots", [])
                doctor_name = data.get("doctor", doctor_id)
                if not slots:
                    return f"No available slots for {doctor_name} on {date}. The doctor may not be working that day."
                return f"{doctor_name} has {len(slots)} available slots on {date}: {', '.join(slots)}."
        except Exception as e:
            logger.error(f"Availability check failed: {e}")
            return "Sorry, I could not check availability right now. Please try again."

    @function_tool
    async def book_appointment(
        self,
        context: RunContext,
        doctor_id: str,
        date: str,
        time_slot: str,
        patient_name: str,
        patient_phone: str,
        reason: str = "",
    ):
        """Book an appointment for a patient.

        Args:
            doctor_id: The doctor's ID. Use DOC001 for Dr. Aleem, DOC002 for Dr. Mohsin, DOC003 for Dr. Zain.
            date: Appointment date in YYYY-MM-DD format.
            time_slot: The time slot in HH:MM format (24-hour, e.g. 15:00).
            patient_name: The full name of the patient.
            patient_phone: The patient's phone number (e.g. +923001234567).
            reason: Optional reason for the visit.
        """
        logger.info(
            f"Booking: {patient_name} with {doctor_id} on {date} at {time_slot}"
        )
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    f"{API_BASE}/book",
                    json={
                        "doctor_id": doctor_id,
                        "date": date,
                        "time_slot": time_slot,
                        "patient_name": patient_name,
                        "patient_phone": patient_phone,
                        "reason": reason,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                appt_id = data.get("appointment_id", "")
                return (
                    f"Appointment confirmed! ID: {appt_id}. "
                    f"{data.get('patient_name', patient_name)} with {data.get('doctor_name', doctor_id)} "
                    f"on {data.get('date', date)} at {data.get('time_slot', time_slot)}."
                )
        except httpx.HTTPStatusError as e:
            detail = "Booking failed"
            try:
                detail = e.response.json().get("detail", detail)
            except Exception:
                pass
            logger.error(f"Booking failed: {detail}")
            return f"Sorry, I couldn't book that appointment: {detail}"
        except Exception as e:
            logger.error(f"Booking error: {e}")
            return "Sorry, something went wrong while booking. Please try again."

    @function_tool
    async def get_doctors(self, context: RunContext):
        """Get the list of available doctors and their details."""
        logger.info("Fetching doctors list")
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"{API_BASE}/doctors")
                resp.raise_for_status()
                doctors = resp.json()
                lines = []
                for d in doctors:
                    locs = ", ".join(d.get("locations", []))
                    lines.append(
                        f"{d['name']} ({d['doctor_id']}), {d['specialization']}, at {locs}"
                    )
                return "Available doctors: " + ". ".join(lines) + "."
        except Exception as e:
            logger.error(f"Failed to fetch doctors: {e}")
            return "Sorry, I could not retrieve the doctor list right now."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="aleem-hospital-agent")
async def aleem_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    session = AgentSession(
        stt=inference.STT(model="deepgram/nova-3", language="multi"),
        tts=inference.TTS(
            model="cartesia/sonic-3", voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    await session.start(
        agent=Assistant(),
        room=ctx.room,
    )


if __name__ == "__main__":
    cli.run_app(server)

    cli.run_app(server)
