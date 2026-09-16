// ホーム画面のイベント一覧ページ
// 開発中にDB接続が増えてしまう問題の解決策　一箇所で作ったインスタンスを使い回している
import Link from "next/link";
import { prisma } from "@/lib/prisma";
// イベント一覧の表示とカテゴリーによる絞り込みを担当しているコンポーネントをインポート
import EventListWithFilter from "../components/EventListWithFilter";

// ホームページのコンポーネント　awaitを使うためのasyncをつけている
// これらはDBからデータが返ってくるのを待つ必要がある
// イベント一覧ページではParamsを受け取っていなかったが、今回更新が成功した時に
// イベント一覧ページに飛ぶようにしたのでイベント一覧ページで更新が成功したメッセージを表示させたかった

export default async function ParticipantHomePage({
    searchParams,
  }: {
    searchParams: Promise <{ updated?: string; }>;
  }) {
    const { updated } = await searchParams;
    // Caregoryテーブルからカテゴリーを全部取得している　1件ではなく全部必要だからfindMany
    const categories = await prisma.category.findMany({
        orderBy: { id: "asc" },
    });
  
    // EventテーブルをfindManyで全権取得する　ホーム画面には登録されている全イベントを表示させたいから　awaitはDBから全データを取得するまで待つ
    const events = await prisma.event.findMany({
    // whereを追加　findManyが最初から開催中のイベントだけを取得するようになり、中止されたイベントは参加者タブには表示されなくなる
    // events.filter()などで絞るのではなくてそもそも必要ないデータは持って来させないようにしている
        where: { status: "active" },
        // Eventテーブルに紐づいている外部テーブルのデータも一緒に取得するinclude 数字ではなくて日本語で表示したいから
        include: {
            category: true,
            organizer: true,
            // イベントごとの参加人数を取得している
            _count: {
                select: {participations: true},
            },
        },
        // イベントの作成日が新しい順に並び替える　？締切間近に変えてもいいかな
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
        // 上位4件
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

    // ここでは３回DB検索をしている
    // それぞれ目的が違うデータなので最初に全部DBから撮ってきて分けるよりもDBから取得するデータを分けた方がイメージしやすかった

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">イベント一覧</h1>
            {/* searchParamsから撮ってきた値が updatedだった場合trueになる */}
            {updated === "true" &&
                <p className="bg-green-50 text-green-700 border border-green-200 rounded px-3 py-2 mb-6">
                    アカウント情報を更新しました
                </p>}
            {/* divではなくsectionという１つの意味のあるまとまりとすることでCSSなどが当てやすくなる */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">締め切り間近！！</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 締め切り間近イベントを画面に表示している */}
                        {upcomingDeadlineEvents.map((event) => (
                            // Reactでリストを表示するときにそれぞれの要素を識別するためのキー
                            <li key={event.id}>
                                {/* 詳細ページへのリンク */}
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
                        {/* 新着イベントを表示している */}
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

            {/* カテゴリでの絞り込みと一覧表示は、ブラウザ側(useState)で完結させるためEventListWithFilterに任せる */}
            {/* ここでは先ほどDBから取得した　categories,eventsを子コンポーネントに渡している */}
            {/* ここで絞り込み処理をさせないのはカテゴリの絞り込みと一覧表示はブラウザ側useStateで完結させるという設計 */}
            <EventListWithFilter categories={categories} events={events} />
        </div>
    );
}