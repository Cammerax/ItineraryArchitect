import CustomRequestForm from "@/components/CustomRequestForm";
import { MessageSquare, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export default function RequestPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Request a Custom Itinerary</h1>
            <p className="text-stone-500 text-sm">Built specifically for your trip, your style, your pace</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> We are not a travel agency. Submitting this form does not book any travel.
              We will create a detailed planning guide — all bookings remain your responsibility.
            </p>
          </div>
          <CustomRequestForm />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-800 mb-3">How Custom Requests Work</h3>
            <div className="space-y-3">
              {[
                { icon: MessageSquare, label: "Submit your request", desc: "Tell us your destination, dates, and interests" },
                { icon: Clock, label: "We create your plan", desc: "We build a detailed day-by-day itinerary for you" },
                { icon: CheckCircle2, label: "Review & purchase", desc: "Receive a personalized quote and purchase your guide" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{label}</p>
                    <p className="text-xs text-stone-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              Custom itineraries are priced based on complexity and destination.
              Typical response time is 2–5 business days. We do not handle any bookings,
              visa applications, or travel insurance — this is a planning guide only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
