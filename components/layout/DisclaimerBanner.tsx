import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="bg-sage-50 border-b border-sage-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-sage-600 flex-shrink-0" />
        <p className="text-xs text-sage-800">
          <strong>Important:</strong> The Itinerary Architect is not a travel agency. We provide planning guides only — no bookings, flights, or reservations are made on your behalf.
        </p>
      </div>
    </div>
  );
}
