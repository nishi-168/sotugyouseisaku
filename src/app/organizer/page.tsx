import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrganizerPage({
    searchParams,
    }: {
    searchParams: Promise<{ cancelled?: string; message?: string }>;
    }) {
    const { cancelled , message } = await searchParams;
    
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if(!userId) {
        redirect("/login");
    }

    // 参加者タブでの一覧ページと似た取り方をしているが、今回は自分が主催したイベントだけ表示させたいのでorganizerIdを貰ってきている
    const events = await prisma.event.findMany({
        where: {organizerId: Number(userId) },
        include: {
            category: true,
            _count: {
                select: { participations: true },
            },
        },
        orderBy: {createdAt: "desc" },
    });
    // ここから主催者タブのページ
    return(
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href="/participant" className="text-blue-600 hover:underline text-sm">
                ← イベント一覧に戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-4">
                主催イベント一覧
            </h1>
            {cancelled === "true" && (<p className="bg-green-50 text-green-700 border border-green-200 rounded px-3 py-2 mb-4">
                イベントを中止しました</p>
                )}
            {message && (
        <p className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 mb-4">
          {decodeURIComponent(message)}
        </p>
      )}
            <Link href="/organizer/new"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6">
                新しいイベントを作成する
            </Link>
            <ul className="space-y-3">
                {events.map((event) => (
                <li key={event.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <Link href={`/participant/${event.id}`}>
                        <p className="text-gray-900 font-medium">{event.name}
                            {/* statusの値によってイベントの横に中止済みという表示を追加するか切り替えています */}
                            {event.status === "cancelled" && (
                                <span className="text-red-600 ml-2 text-sm">
                                    (中止済み)
                                </span>
                            )}
                        </p>
                        <p className="text-gray-600 text-sm">カテゴリー: {event.category.name}</p>
                        <p className="text-gray-600 text-sm">
                            参加人数: {event._count.participations}/{event.capacity}人
                        </p>
                    </Link>
                    {/* 編集ページの追加・中止ページの追加　statusがactiveの時のみ押せるようにしている */}
                    {event.status === "active" && (
                        <div className="flex gap-4 mt-2">
                            <Link href={`/organizer/${event.id}/edit`} className="text-blue-600 hover:underline text-sm">
                                編集する
                            </Link>
                            <Link href={`/organizer/${event.id}/cancel`} className="text-red-600 hover:underline text-sm">
                                中止する
                            </Link>
                        </div>
                        )}
                </li>
                ))}
            </ul>
        </div>
    );
}