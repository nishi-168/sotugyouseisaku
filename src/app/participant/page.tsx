// 開発中にDB接続が増えてしまう問題の解決策　一箇所で作ったインスタンスを使い回している
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// ホームページのコンポーネント　awaitを使うためのasyncをつけている
export default async function ParticipantHomePage() {
    // EventテーブルをfindManyで全権取得する　ホーム画面には登録されている全イベントを表示させたいから　awaitはDBから全データを取得するまで待つ
    const events = await prisma.event.findMany({
        // Eventテーブルに紐づいている外部テーブルのデータも一緒に取得するinclude 数字ではなくて日本語で表示したいから
        include: {
            category: true,
            organizer: true,
            _count: {
                select: {participations: true},
            },
        },
        // イベントの作成びが新しい順に並び替える　？締切間近に変えてもいいかな
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div>
            <h1>イベント一覧</h1>
            <ul>
                {/* イベントのリストを表示　配列のデータを繰り返し表示したいとき */}
                {events.map((event) => (
                    // 各liタグにユニークな目印をつけるためにkey属性をつける
                    <li key={event.id}>
                      <Link href={`/participant/${event.id}`}>
                        <p>場所: {event.location}</p>
                        <p>カテゴリー: {event.category.name}</p>
                        <p>主催者: {event.organizer.userName}</p>
                        <p>参加人数: {event._count.participations}/{event.capacity}人</p>
                      </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}