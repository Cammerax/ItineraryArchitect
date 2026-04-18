import { NextRequest, NextResponse } from "next/server";
import { findNearestAirports, generateFlights, MAJOR_AIRPORTS } from "@/lib/airports";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { originLat, originLon, destCode, tripStartDate, includeRedEye } = body;

  if (!originLat || !originLon || !destCode || !tripStartDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const nearestAirports = findNearestAirports(originLat, originLon, 3);
  const destAirport = MAJOR_AIRPORTS.find((a) => a.code === destCode);

  if (!destAirport) {
    return NextResponse.json({ error: "Destination airport not found" }, { status: 404 });
  }

  const flights = nearestAirports.flatMap((origin) =>
    generateFlights(origin.code, destCode, tripStartDate, includeRedEye ?? true).map((f) => ({
      ...f,
      originAirport: origin,
    }))
  );

  flights.sort((a, b) => a.price - b.price);

  return NextResponse.json({
    nearestAirports,
    destAirport,
    flights: flights.slice(0, 12),
  });
}
