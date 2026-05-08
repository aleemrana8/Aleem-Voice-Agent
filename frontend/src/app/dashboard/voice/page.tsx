"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

export default function VoiceAgentPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [transcript, setTranscript] = useState<{ speaker: string; text: string }[]>([]);

  const startCall = async () => {
    setCallStatus("connecting");
    // In production, this connects to LiveKit + Pipecat
    setTimeout(() => {
      setCallStatus("active");
      setIsConnected(true);
      setTranscript([
        {
          speaker: "agent",
          text: "Hello! Welcome to Aleem EHR Hospital. I'm your AI receptionist. How can I help you today?",
        },
      ]);
    }, 2000);
  };

  const endCall = () => {
    setCallStatus("ended");
    setIsConnected(false);
    setTranscript((prev) => [
      ...prev,
      { speaker: "agent", text: "Thank you for calling Aleem EHR. Have a great day!" },
    ]);
  };

  const simulatePatientSpeech = () => {
    const messages = [
      "I'd like to book an appointment with Dr. Sarah Ahmed",
      "Yes, my phone number is +1234567890",
      "My date of birth is 1990-05-15",
      "Tomorrow at 10 AM would be great",
      "It's for a general checkup",
    ];
    const idx = transcript.filter((t) => t.speaker === "patient").length;
    if (idx < messages.length) {
      setTranscript((prev) => [
        ...prev,
        { speaker: "patient", text: messages[idx] },
        {
          speaker: "agent",
          text: idx === 0
            ? "I'd be happy to help you book an appointment with Dr. Sarah Ahmed. Could you please provide me with your phone number for verification?"
            : idx === 1
            ? "Thank you. For security, could you also confirm your date of birth?"
            : idx === 2
            ? "You're verified. Dr. Sarah Ahmed is available tomorrow. What time works best for you? Available slots: 09:00, 09:30, 10:00, 10:30, 11:00."
            : idx === 3
            ? "10:00 AM works. What's the reason for your visit?"
            : "Your appointment with Dr. Sarah Ahmed is confirmed for tomorrow at 10:00 AM for a general checkup. Is there anything else I can help you with?",
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voice Agent</h1>
        <p className="text-muted-foreground">
          Test the Aleem Voice Agent AI receptionist
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Call Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Call Controls</CardTitle>
            <CardDescription>
              Simulate a patient call to the AI receptionist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              {callStatus === "idle" || callStatus === "ended" ? (
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16"
                  onClick={startCall}
                >
                  <Phone className="h-6 w-6" />
                </Button>
              ) : callStatus === "connecting" ? (
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 animate-pulse"
                  disabled
                >
                  <Phone className="h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="lg"
                    className="rounded-full h-14 w-14"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full h-16 w-16"
                    onClick={endCall}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            <div className="text-center">
              <Badge
                variant={
                  callStatus === "active"
                    ? "success"
                    : callStatus === "connecting"
                    ? "warning"
                    : "default"
                }
              >
                {callStatus === "idle"
                  ? "Ready"
                  : callStatus === "connecting"
                  ? "Connecting..."
                  : callStatus === "active"
                  ? "Call Active"
                  : "Call Ended"}
              </Badge>
            </div>

            {callStatus === "active" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={simulatePatientSpeech}
              >
                Simulate Patient Response
              </Button>
            )}

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">Voice Pipeline</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>1. Audio In → LiveKit → Whisper.cpp (STT)</p>
                <p>2. Text → OpenAI GPT-4o (LLM + Function Calling)</p>
                <p>3. Response → Coqui TTS → Audio Out</p>
                <p>4. Pipeline orchestrated by Pipecat AI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Transcript */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Live Transcript</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[500px] space-y-3">
            {transcript.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Start a call to see the live transcript
              </p>
            ) : (
              transcript.map((entry, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 text-sm ${
                    entry.speaker === "agent"
                      ? "bg-primary/10 ml-4"
                      : "bg-muted mr-4"
                  }`}
                >
                  <p className="text-xs font-medium capitalize text-muted-foreground mb-1">
                    {entry.speaker === "agent" ? "🤖 Aleem Agent" : "👤 Patient"}
                  </p>
                  <p>{entry.text}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
