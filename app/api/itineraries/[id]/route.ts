import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itinerary = await prisma.itinerary.findUnique({
    where: { id },
    include: {
      location: true,
      category: true,
      days: { include: { activities: { orderBy: { order: "asc" } } }, orderBy: { dayNumber: "asc" } },
    },
  });
  if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(itinerary);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const itinerary = await prisma.itinerary.update({
    where: { id },
    data: {
      title: body.title,
      slug: slugify(body.title),
      summary: body.summary,
      highlights: JSON.stringify(body.highlights || []),
      includes: JSON.stringify(body.includes || []),
      excludes: JSON.stringify(body.excludes || []),
      price: parseFloat(body.price),
      duration: parseInt(body.duration),
      locationId: body.locationId,
      categoryId: body.categoryId,
      images: JSON.stringify(body.images || []),
      published: body.published ?? false,
    },
    include: { location: true, category: true },
  });

  await prisma.location.update({
    where: { id: body.locationId },
    data: { hasItinerary: true },
  });

  return NextResponse.json(itinerary);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const itinerary = await prisma.itinerary.update({
    where: { id },
    data: { published: body.published },
  });
  return NextResponse.json(itinerary);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.itinerary.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
