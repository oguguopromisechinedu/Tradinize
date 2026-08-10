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
  const orders = await prisma.order.findMany({
    where: { sessionId: session.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
