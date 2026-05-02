import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, Document } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/utils";
import { ItineraryPDF } from "@/components/itinerary/ItineraryPDF";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const itinerary = await prisma.itinerary.findUnique({
    where: { id },
    include: {
      location: true,
      category: true,
      days: {
        include: { activities: { orderBy: { order: "asc" } } },
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  if (!itinerary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const highlights = parseJson<string[]>(itinerary.highlights, []);
  const includes   = parseJson<string[]>(itinerary.includes,   []);
  const excludes   = parseJson<string[]>(itinerary.excludes,   []);

  const element = React.createElement(ItineraryPDF, { itinerary, highlights, includes, excludes });
  const buffer = await renderToBuffer(
    element as React.ReactElement<React.ComponentProps<typeof Document>>
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${itinerary.slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
