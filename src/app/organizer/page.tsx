import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrganizerPage({
    searchParams,
    }: {
    searchParams: Promise<{ cancelled?: string }>;
    }) {
    const { cancelled } = await searchParams;
    
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
            <Link href="/participant">← イベント一覧に戻る</Link>
            <h1>主催イベント一覧</h1>
            {cancelled === "true" && <p>イベントを中止しました</p>}
            <Link href="/organizer/new">新しいイベントを作成する</Link>
            <ul>
                {events.map((event) => (
                <li key={event.id}>
                    <Link href={`/participant/${event.id}`}>
                        <p>{event.name}
                            {/* statusの値によってイベントの横に中止済みという表示を追加するか切り替えています */}
                            {event.status === "cancelled" && "(中止済み)"}
                        </p>
                        <p>カテゴリー: {event.category.name}</p>
                        <p>
                            参加人数: {event._count.participations}/{event.capacity}人
                        </p>
                    </Link>
                    {/* 編集ページの追加・中止ページの追加　statusがactiveの時のみ押せるようにしている */}
                    {event.status === "active" && (
                        <>
                            <Link href={`/organizer/${event.id}/edit`}>編集する</Link>
                            <Link href={`/organizer/${event.id}/cancel`}>中止する</Link>
                        </>
                        )}
                </li>
                ))}
            </ul>
        </div>
    );
}