import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { addMessage, getMessages } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ messages: getMessages("whatsapp") });
}

// Simulator payload: { from, text }. Kept close to a WhatsApp Cloud API message so a real
// webhook can later map `entry[].changes[].value.messages[]` onto this handler.
export async function POST(req: Request) {
  const { text } = (await req.json()) as { from?: string; text?: string };
  if (!text?.trim()) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  addMessage("whatsapp", "agent", text.trim());
  const res = runAgent(text, "whatsapp");
  addMessage("whatsapp", "bot", res.reply);
  return NextResponse.json({ ...res, messages: getMessages("whatsapp") });
}
