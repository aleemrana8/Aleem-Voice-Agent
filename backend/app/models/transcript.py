"""
VoiceTranscript document model.
Stores the full conversation transcript for each voice call,
with speaker attribution, timestamps, and confidence scores.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from beanie import Document, Indexed, before_event, Replace
from pydantic import BaseModel, Field

from app.models.enums import Speaker


# ── Embedded Entry ──────────────────────────────────
class TranscriptEntry(BaseModel):
    """A single utterance in the conversation."""
    entry_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:8])
    speaker: Speaker
    text: str = Field(..., min_length=1, max_length=5000)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="STT confidence")
    tool_name: Optional[str] = Field(None, description="Function call name if agent action")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Document ────────────────────────────────────────
class Transcript(Document):
    transcript_id: str = Field(
        default_factory=lambda: f"TRN-{uuid.uuid4().hex[:8].upper()}"
    )
    call_id: Indexed(str, unique=True)
    entries: List[TranscriptEntry] = Field(default_factory=list)
    word_count: int = Field(0, ge=0)
    language: str = Field(default="en", max_length=5)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def add_entry(self, speaker: Speaker, text: str, confidence: float = None, tool_name: str = None):
        """Append a new entry and update word count."""
        entry = TranscriptEntry(
            speaker=speaker,
            text=text,
            confidence=confidence,
            tool_name=tool_name,
        )
        self.entries.append(entry)
        self.word_count = sum(len(e.text.split()) for e in self.entries)
        self.updated_at = datetime.now(timezone.utc)

    @property
    def entry_count(self) -> int:
        return len(self.entries)

    @property
    def agent_entries(self) -> List[TranscriptEntry]:
        return [e for e in self.entries if e.speaker == Speaker.AGENT]

    @property
    def patient_entries(self) -> List[TranscriptEntry]:
        return [e for e in self.entries if e.speaker == Speaker.PATIENT]

    @before_event(Replace)
    def recalculate(self):
        self.word_count = sum(len(e.text.split()) for e in self.entries)
        self.updated_at = datetime.now(timezone.utc)

    class Settings:
        name = "transcripts"
        indexes = [
            "created_at",
        ]


# ── Response Schema ─────────────────────────────────
class TranscriptResponse(BaseModel):
    id: str
    transcript_id: str
    call_id: str
    entries: List[TranscriptEntry]
    entry_count: int
    word_count: int
    language: str
    created_at: datetime

    @classmethod
    def from_doc(cls, t: "Transcript") -> "TranscriptResponse":
        return cls(
            id=str(t.id),
            transcript_id=t.transcript_id,
            call_id=t.call_id,
            entries=t.entries,
            entry_count=t.entry_count,
            word_count=t.word_count,
            language=t.language,
            created_at=t.created_at,
        )
