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
    <div className="max-w-md mx-auto px-4 py-10">
      <Link href="/organizer" className="text-blue-600 hover:underline text-sm">
        ← 主催イベント一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-4">イベントを中止する</h1>
      <p className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 mb-4">
        「{event.name}」を中止します。この操作は取り消せません。
      </p>
      <form action={cancelEventWithId} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            中止理由(参加者に表示されます)
          </label>
          <textarea name="cancelReason" rows={4} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="text-red-500 px-4 py-2 rounded w-full hover:bg-red-700">
            中止を確定する
        </button>
      </form>
    </div>
  );
}