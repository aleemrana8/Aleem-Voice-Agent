"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCallLogs, getCallTranscript } from "@/lib/api";
import { Phone, Clock, MessageSquare } from "lucide-react";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);
  const [transcriptCallId, setTranscriptCallId] = useState<string | null>(null);

  useEffect(() => {
    getCallLogs()
      .then(setCalls)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const viewTranscript = async (callId: string) => {
    if (transcriptCallId === callId) {
      setSelectedTranscript(null);
      setTranscriptCallId(null);
      return;
    }
    try {
      const data = await getCallTranscript(callId);
      setSelectedTranscript(data);
      setTranscriptCallId(callId);
    } catch {
      alert("Transcript not found");
    }
  };

  const statusColor: Record<string, "default" | "success" | "warning" | "destructive"> = {
    in_progress: "warning",
    completed: "success",
    failed: "destructive",
    dropped: "destructive",
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Call Logs</h1>
        <p className="text-muted-foreground">View AI voice agent call history and transcripts</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : calls.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No call logs yet. Calls will appear here when patients call the AI receptionist.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div key={call.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {call.patient_name || call.caller_phone}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(call.duration_seconds)}
                          </span>
                          {call.intent && (
                            <Badge variant="outline" className="text-xs">
                              {call.intent}
                            </Badge>
                          )}
                        </div>
                        {call.summary && (
                          <p className="mt-1 text-xs text-muted-foreground">{call.summary}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColor[call.status] || "default"}>
                        {call.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewTranscript(call.call_id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Transcript
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transcript */}
              {transcriptCallId === call.call_id && selectedTranscript && (
                <Card className="ml-6 mt-2 border-l-4 border-l-primary">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Conversation Transcript</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedTranscript.entries?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No transcript entries</p>
                    ) : (
                      selectedTranscript.entries?.map((entry: any, idx: number) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-2 text-sm ${
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
