import { NextResponse } from "next/server";
import { addBuyer, addEvent, addTask, createDeal, setStage, setTaskStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

// Dashboard-side writes (task toggles, stage, forms). Every write is logged with source "dashboard"
// and mirrored to the WhatsApp thread by the store.
export async function POST(req: Request) {
  const b = await req.json();
  switch (b.type) {
    case "task-status":
      return NextResponse.json(setTaskStatus(b.id, b.status, "dashboard"));
    case "task-add":
      return NextResponse.json(addTask({ dealId: b.dealId, title: b.title, assignee: b.assignee, dueDate: b.dueDate }, "dashboard"));
    case "event-add":
      return NextResponse.json(addEvent({ dealId: b.dealId, name: b.name, date: b.date, type: b.eventType }, "dashboard"));
    case "stage":
      return NextResponse.json(setStage(b.dealId, b.stage, "dashboard"));
    case "buyer-add":
      return NextResponse.json(addBuyer(b.dealId, { name: b.name, email: b.email, phone: b.phone, role: b.role }, "dashboard"));
    case "deal-create":
      return NextResponse.json(createDeal({ kind: b.kind, address: b.address, pricePen: b.pricePen, listingPricePen: b.listingPricePen, targetCloseDate: b.targetCloseDate, sellerName: b.sellerName, buyers: b.buyers }, "dashboard"));
    default:
      return NextResponse.json({ error: "Tipo desconocido" }, { status: 400 });
  }
}
