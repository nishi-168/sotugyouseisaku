// [id]というフォルダを挟むことで可変の値となり、URLのparticipant/idの部分を受け取ることができるようになる
// ルートパラメーター

import { prisma } from "@/lib/prisma";
// 404を出すための関数
import { notFound } from "next/navigation";

import { cookies } from "next/headers";
import { participate } from "./actions";
import Link from "next/link";

// ルートパラメーターを受け取る関数
export default async function EventDetailPage({
    params,
    searchParams,
}: {
    // params:URLの[id]の部分の値を取り出す書き方　idは文字列として受け取る
    params: Promise<{ id: string }>;
    // クエリパラメータを受けっとっている　成功したか、どんなエラーかという結果をURLに載せてこのページに伝える必要がある
    searchParams: Promise<{ error?: string; success?: string}>;
}) {
    // paramsがPromiseとして渡される仕様のためawaitが必要
    const { id } = await params;
    // ここあとで調べて
    const { error,success } = await searchParams;
    // 今回は特定の１件だけ欲しいのでfindUniqueを使う
    const event = await prisma.event.findUnique({
        // ルートパラメーターのidは文字列として受け取るため、Numberで数値に変換している
        where: { id: Number(id) },
        // ここからはincludeで外部テーブルのデータも一緒に取得するためのもの
        include: {
            category: true,
            organizer: true,
            // 関連テーブルのデータそのものではなく、関連テーブルの件数だけを取得する
            // Eventに参加人数のカラムを持たせないのでここで計算して参加人数を表示させたいから
            _count: {
                // イベントの件数を取得するために参加テーブルの件数を取得する
                select: { participations: true },
            },
        },
    });
    // もしクリックしたeventが存在しなかった場合はnotFound()を呼び出して404ページを表示する
    if (!event) {
        notFound();
    }
// cookieから今この画面を見ている人が誰かを読み取っている
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    // ログイン済みかつそのIDがこのイベントの主催者と一致するか
    const isOrganizer = userId && event.organizerId === Number(userId);
    // 現在の参加人数が定員に達しているかどうかを判断する
    const isFull = event._count.participations >= event.capacity;

    return (
        <div>
            <Link href="/participant">← イベント一覧に戻る</Link>
            <h1>{event.name}</h1>
            <p>場所: {event.location}</p>
            {/* toLocaleString()は日付をローカルの形式に変換するメソッド */}
            <p>日時: {event.eventDatetime.toLocaleString()}</p>
            <p>カテゴリー: {event.category.name}</p>
            <p>主催者: {event.organizer.userName}</p>
            <p>詳細: {event.description}</p>
            <p>申込期限: {event.deadline.toLocaleString()}</p>
            <p>参加人数: {event._count.participations}/{event.capacity}人</p>

            {/* 成功・エラー時の表示文 */}
            {success === "true" && <p>申込みが完了しました</p>}
            {error === "full" && <p>このイベントは満員です</p>}
            {error === "already" && <p>既にこのイベントに参加登録済みです</p>}
            {error === "organizer" && <p>主催したイベントです</p>}
            {/* 主催者かどうか */}
            {isOrganizer ? (
                <p>自分が主催するイベントです</p>
            ):(
                // 主催者じゃない場合、actions.tsのparticipate 関数が呼ばれる。 bindはこの関数が呼ばれるときにevent.idを固定でセットしておく意味
                <form action={participate.bind(null,event.id)}>
                    <button type="submit" disabled={isFull}>
                        {isFull ? "満員です" : "参加"}
                    </button>
                </form>
            )}
        </div>
    );
}