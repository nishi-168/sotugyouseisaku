import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { cancelEvent } from "./actions";
import Link from "next/link";

export default async function CancelEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: Number(id) },
  });

  if (!event) {
    notFound();
  }

  if (event.organizerId !== Number(userId)) {
    redirect(`/organizer?message=${encodeURIComponent("自分が主催するイベントのみ中止できます")}`);
  }

  const cancelEventWithId = cancelEvent.bind(null, event.id);

  return (
    <div>
      <Link href="/organizer">← 主催イベント一覧に戻る</Link>
      <h1>イベントを中止する</h1>
      <p>「{event.name}」を中止します。この操作は取り消せません。</p>
      <form action={cancelEventWithId}>
        <div>
          <label>中止理由(参加者に表示されます)</label>
          <textarea name="cancelReason" />
        </div>
        <button type="submit">中止を確定する</button>
      </form>
    </div>
  );
}