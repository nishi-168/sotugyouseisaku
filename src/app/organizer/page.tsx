import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrganizerPage() {
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
        <div>
            <h1>主催イベント一覧</h1>
            <Link href="/organizer/new">新しいイベントを作成する</Link>
            <ul>
                {events.map((event) => (
                <li key={event.id}>
                    <Link href={`/participant/${event.id}`}>
                        <p>{event.name}</p>
                        <p>カテゴリー: {event.category.name}</p>
                        <p>
                            参加人数: {event._count.participations}/{event.capacity}人
                        </p>
                    </Link>
                    {/* 編集ページの追加 */}
                    <Link href={`/organizer/${event.id}/edit`}>編集する</Link>
                </li>
                ))}
            </ul>
        </div>
    );
}