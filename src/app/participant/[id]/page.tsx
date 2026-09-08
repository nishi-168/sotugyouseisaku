// [id]というフォルダを挟むことで可変の値となり、URLのparticipant/idの部分を受け取ることができるようになる
// ルートパラメーター

import { prisma } from "@/lib/prisma";
// 404を出すための関数
import { notFound } from "next/navigation";

// ルートパラメーターを受け取る関数
export default async function EventDetailPage({
    params,
}: {
    // params:URLの[id]の部分の値を取り出す書き方　idは文字列として受け取る
    params: Promise<{ id: string }>;
}) {
    // paramsがPromiseとして渡される仕様のためawaitが必要
    const { id } = await params;
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

    return (
        <div>
            <h1>{event.name}</h1>
            <p>場所: {event.location}</p>
            {/* toLocaleString()は日付をローカルの形式に変換するメソッド */}
            <p>日時: {event.eventDatetime.toLocaleString()}</p>
            <p>カテゴリー: {event.category.name}</p>
            <p>主催者: {event.organizer.userName}</p>
            <p>詳細: {event.description}</p>
            <p>申込期限: {event.deadline.toLocaleString()}</p>
            <p>参加人数: {event._count.participations}/{event.capacity}人</p>
        </div>
    );
}