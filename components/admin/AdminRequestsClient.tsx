"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { parseJson } from "@/lib/utils";

interface Request {
  id: string;
  name: string;
  email: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  activities: string;
  budget: string;
  notes: string | null;
  status: string;
  createdAt: Date;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  reviewing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

export default function AdminRequestsClient({ requests: initial }: { requests: Request[] }) {
  const [requests, setRequests] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests((r) => r.map((req) => req.id === id ? { ...req, status } : req));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Custom Requests</h1>
        <p className="text-stone-500 text-sm">{requests.length} total requests</p>
      </div>

      <div className="space-y-3">
        {requests.map((req) => {
          const activities = parseJson<string[]>(req.activities, []);
          const isExpanded = expanded === req.id;
          return (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : req.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{req.destination}</p>
                      <p className="text-sm text-stone-500">{req.name} · {req.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[req.status] || "bg-stone-100 text-stone-600"}`}>
                      {req.status}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-stone-100 p-4 bg-stone-50 space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm text-stone-700">
                        <Calendar className="h-4 w-4 text-amber-500" />
                        <span>{req.startDate} → {req.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-700">
                        <Users className="h-4 w-4 text-amber-500" />
                        <span>{req.travelers} traveler{req.travelers !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-700">
                        <DollarSign className="h-4 w-4 text-amber-500" />
                        <span>{req.budget}</span>
                      </div>
                    </div>

                    {activities.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-stone-500 uppercase mb-1">Requested Activities</p>
                        <div className="flex flex-wrap gap-1">
                          {activities.map((a, i) => (
                            <Badge key={i} variant="secondary">{a}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {req.notes && (
                      <div>
                        <p className="text-xs font-semibold text-stone-500 uppercase mb-1">Notes</p>
                        <p className="text-sm text-stone-700 bg-white rounded-lg p-3 border border-stone-200">{req.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <p className="text-xs text-stone-500 mr-2">Update status:</p>
                      {["pending", "reviewing", "completed"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(req.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-colors ${
                            req.status === s
                              ? STATUS_COLORS[s]
                              : "border-stone-200 text-stone-500 hover:border-amber-400"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {requests.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <MessageSquare className="h-12 w-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No custom requests yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
