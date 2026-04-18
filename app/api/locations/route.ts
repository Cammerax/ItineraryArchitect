import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const continent = searchParams.get("continent");
  const parentId = searchParams.get("parentId");
  const hasItinerary = searchParams.get("hasItinerary");

  const locations = await prisma.location.findMany({
    where: {
      ...(continent && { continent }),
      ...(parentId === "null" ? { parentId: null } : parentId ? { parentId } : {}),
      ...(hasItinerary === "true" && { hasItinerary: true }),
    },
    include: { children: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const location = await prisma.location.create({
    data: {
      name: body.name,
      slug: body.slug || slugify(body.name),
      continent: body.continent,
      country: body.country,
      state: body.state,
      city: body.city,
      parentId: body.parentId || null,
      mapCode: body.mapCode,
    },
  });
  return NextResponse.json(location);
}
