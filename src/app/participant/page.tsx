// 開発中にDB接続が増えてしまう問題の解決策　一箇所で作ったインスタンスを使い回している
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// ホームページのコンポーネント　awaitを使うためのasyncをつけている
// イベント一覧ページではParamsを受け取っていなかったが、今回更新が成功した時に
// イベント一覧ページに飛ぶようにしたのでイベント一覧ページで更新が成功したメッセージを表示させたかった
export default async function ParticipantHomePage({
    searchParams,
  }: {
    searchParams: Promise <{ updated?: string; categoryId: string }>;
  }) {
    const { updated  ,categoryId } = await searchParams;

    const categories = await prisma.category.findMany({
        orderBy: { id: "asc" },
    });
  
    // EventテーブルをfindManyで全権取得する　ホーム画面には登録されている全イベントを表示させたいから　awaitはDBから全データを取得するまで待つ
    const events = await prisma.event.findMany({
        // whereを追加　findManyが最初から開催中のイベントだけを取得するようになり、中止されたイベントは参加者タブには表示されなくなる
        where: { status: "active",
            ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        },
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

    // 申込期限間近
    const upcomingDeadlineEvents = await prisma.event.findMany({
        where: {
            status: "active",
            // 申込期限が今この瞬間より後という条件　gte はgreater than or equal　以上という意味
            // これがないと申込期限が過ぎてしまった古いイベントまで締め切り間近として出て来てしまう
            deadline: { gte: new Date() },
        },
        include: {
            category: true,
            _count: {
                select: { participations: true },
            },
        },
        // 申し込み期限が近い順に並べている
        orderBy: {
            deadline:"asc",
        },
        // 上位5件
        take: 5,
    });

    // 新着イベントの表示
    const newEvents = await prisma.event.findMany({
        where: {status: "active"},
        include: {
            category: true,
            _count: {
                select: { participations: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 3,
    });

    return (
        <div>
            <h1>イベント一覧</h1>
            {updated === "true" && <p>アカウント情報を更新しました</p>}
            {/* divではなくsectionという１つの意味のあるまとまりとすることでCSSなどが当てやすくなる */}
                <section>
                    <h2>締め切り間近！！</h2>
                    <ul>
                        {upcomingDeadlineEvents.map((event) => (
                            <li key={event.id}>
                                <Link href={`/participant/${event.id}`}>
                                    <p>{event.name}</p>
                                    <p>申込期限: {event.deadline.toLocaleString()}</p>
                                </Link>
                            </li>
                        ) )}
                    </ul>
                </section>

                <section>
                    <h2>新着イベント!!</h2>
                    <ul>
                        {/* さっき作ったクエリから.mapで取得して表示させている */}
                    {newEvents.map((event) => (
                        <li key={event.id}>
                        <Link href={`/participant/${event.id}`}>
                            <p>{event.name}</p>
                            <p>カテゴリー: {event.category.name}</p>
                        </Link>
                        </li>
                    ))}
                    </ul>
                </section>
                    {/* 区切り線 */}
                <hr />

                <form method="GET">
                    <select name="categoryId" defaultValue={categoryId ?? ""}>
                    <option value="">すべてのカテゴリ</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                        {category.name}
                        </option>
                    ))}
                    </select>
                    <button type="submit">検索</button>
                    <Link href="/participant">条件をクリア</Link>
                </form>

            <ul>
                {/* イベントのリストを表示　配列のデータを繰り返し表示したいとき */}
                {events.map((event) => (
                    // 各liタグにユニークな目印をつけるためにkey属性をつける
                    <li key={event.id}>
                      <Link href={`/participant/${event.id}`}>
                        <p>イベント名: {event.name}</p>
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