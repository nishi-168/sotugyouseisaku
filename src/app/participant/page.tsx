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
        take: 4,
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
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">イベント一覧</h1>
            {updated === "true" &&
                <p className="bg-green-50 text-green-700 border border-green-200 rounded px-3 py-2 mb-6">
                    アカウント情報を更新しました
                </p>}
            {/* divではなくsectionという１つの意味のあるまとまりとすることでCSSなどが当てやすくなる */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">締め切り間近！！</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {upcomingDeadlineEvents.map((event) => (
                            <li key={event.id}>
                                <Link href={`/participant/${event.id}`}
                                    className="block border border-orange-200 bg-orange-50 rounded-lg p-3 hover:border-orange-400">
                                    <p className="font-medium text-gray-900">{event.name}</p>
                                    <p className="text-sm text-orange-700">申込期限: {event.deadline.toLocaleString()}</p>
                                </Link>
                            </li>
                        ) )}
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">新着イベント!!</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* さっき作ったクエリから.mapで取得して表示させている */}
                    {newEvents.map((event) => (
                        <li key={event.id}>
                        <Link href={`/participant/${event.id}`} className="block border border-blue-200 bg-blue-50 rounded-lg p-3 hover:border-blue-400">
                            <p className="font-medium text-gray-900">{event.name}</p>
                            <p className="text-sm text-blue-700">カテゴリー: {event.category.name}</p>
                        </Link>
                        </li>
                    ))}
                    </ul>
                </section>
                    {/* 区切り線 */}
                <hr className="border-gray-200 mb-6" />

                <form method="GET" className="flex items-center gap-3 mb-6">
                    <select name="categoryId" defaultValue={categoryId ?? ""} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">すべてのカテゴリ</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                        {category.name}
                        </option>
                    ))}
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        検索
                    </button>
                    <Link href="/participant" className="text-blue-600 hover:underline text-sm">
                        条件をクリア
                    </Link>
                </form>

            <ul className="space-y-3">
                {/* イベントのリストを表示　配列のデータを繰り返し表示したいとき */}
                {events.map((event) => (
                    // 各liタグにユニークな目印をつけるためにkey属性をつける
                    <li key={event.id}>
                      <Link href={`/participant/${event.id}`} 
                        className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300">
                        <p className="text-gray-900">イベント名: {event.name}</p>
                        <p className="text-gray-600 text-sm">場所: {event.location}</p>
                        <p className="text-gray-600 text-sm">カテゴリー: {event.category.name}</p>
                        <p className="text-gray-600 text-sm">主催者: {event.organizer.userName}</p>
                        <p className="text-gray-600 text-sm">参加人数: {event._count.participations}/{event.capacity}人</p>
                      </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}