import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function getSessionId(request: Request) {
  const header = request.headers.get("x-session-id");
  return header ?? "guest-session";
}

async function ensureSession(sessionId: string) {
  let session = await prisma.session.findUnique({ where: { token: sessionId } });
  if (!session) {
    session = await prisma.session.create({ data: { token: sessionId } });
  }
  return session;
}

export async function GET(request: Request) {
  const sessionId = getSessionId(request);
  const session = await ensureSession(sessionId);
  const items = await prisma.wishlistItem.findMany({
    where: { sessionId: session.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const sessionId = getSessionId(request);
  const session = await ensureSession(sessionId);
  const body = await request.json();
  const productId = body.productId as string | undefined;

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { sessionId_productId: { sessionId: session.id, productId } },
  });

  if (!existing) {
    await prisma.wishlistItem.create({ data: { sessionId: session.id, productId } });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const sessionId = getSessionId(request);
  const session = await ensureSession(sessionId);
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  await prisma.wishlistItem.deleteMany({ where: { productId, sessionId: session.id } });
  return NextResponse.json({ ok: true });
}
