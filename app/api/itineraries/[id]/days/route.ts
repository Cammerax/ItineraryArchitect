import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await prisma.day.deleteMany({ where: { itineraryId: id } });

  for (const day of body.days) {
    const createdDay = await prisma.day.create({
      data: {
        itineraryId: id,
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description,
      },
    });

    for (const activity of day.activities || []) {
      await prisma.activity.create({
        data: {
          dayId: createdDay.id,
          startTime: activity.startTime,
          endTime: activity.endTime,
          title: activity.title,
          description: activity.description,
          location: activity.location,
          type: activity.type,
          tips: activity.tips,
          order: activity.order,
        },
      });
    }
  }

  const updated = await prisma.itinerary.findUnique({
    where: { id },
    include: {
      days: { include: { activities: { orderBy: { order: "asc" } } }, orderBy: { dayNumber: "asc" } },
    },
  });

  return NextResponse.json(updated);
}
