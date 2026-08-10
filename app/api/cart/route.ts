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
  const items = await prisma.cartItem.findMany({
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
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { sessionId_productId: { sessionId: session.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { sessionId: session.id, productId, quantity },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const sessionId = getSessionId(request);
  const session = await ensureSession(sessionId);
  const body = await request.json();
  const id = body.id as string | undefined;
  const quantity = Number(body.quantity ?? 1);

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id, sessionId: session.id } });
    return NextResponse.json({ ok: true });
  }

  await prisma.cartItem.update({ where: { id, sessionId: session.id }, data: { quantity } });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const sessionId = getSessionId(request);
  const session = await ensureSession(sessionId);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.cartItem.deleteMany({ where: { id, sessionId: session.id } });
  return NextResponse.json({ ok: true });
}
