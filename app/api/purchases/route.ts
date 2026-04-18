import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: {
      itinerary: {
        include: {
          location: true,
          category: true,
          days: { include: { activities: { orderBy: { order: "asc" } } }, orderBy: { dayNumber: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(purchases);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();

  const itinerary = await prisma.itinerary.findUnique({ where: { id: body.itineraryId } });
  if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.purchase.findFirst({
    where: { userId, itineraryId: body.itineraryId },
  });
  if (existing) return NextResponse.json({ error: "Already purchased" }, { status: 400 });

  const purchase = await prisma.purchase.create({
    data: { userId, itineraryId: body.itineraryId, amount: itinerary.price },
  });
  return NextResponse.json(purchase);
}
