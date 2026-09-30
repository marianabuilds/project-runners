import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { addMessage } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  if (!text?.trim()) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  addMessage("chat", "agent", text.trim());
  const res = runAgent(text, "chat");
  addMessage("chat", "bot", res.reply);
  return NextResponse.json(res);
}
