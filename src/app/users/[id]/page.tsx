// 他のユーザーの公開プロフィールを、誰でも閲覧することができるページ
// イベント詳細ページの主催者名を押すとこれを閲覧できる
// accountに載せている情報とは別のものを表示させている

// DBとやりとりするPrisma Clientを読み込んでいる
import { prisma } from "@/lib/prisma";
// Next.jsが用意している404ページを表示するための関数を使えるようにしている
import { notFound } from "next/navigation";
// ページ遷移用の特別なリンクコンポーネント　LINKを使うことでページ全体を再読み込みせずに画面を切り替えることができる
import Link from "next/link";
// lib/rank.tsで定義した、回数からランク名を判定する関数を読み込んでいる　
import { getRank } from "@/lib/rank";

// 中心となるコンポーネント　awaitを使ってDBからデータを取得する必要があるためasync
export default async function UserPublicPage({
    // このコンポーネントが受け取るpropsの１つであるparamsを受け取り、その型を定義している
    params,
}: {
    // idフォルダのURLパラメータは現行バージョンではPromiseとして渡される
  params: Promise<{ id: string }>;
}) {
    // paramsというPromiseの中身をawaitで取り出してその中のidという値だけを取り出している
  const { id } = await params;

//   Userテーブルから指定されたIDに一致する一件のユーザーを検索している
// ユーザーを１人だけ表示したいため、主キーのような一意に決まる条件で1件だけ取得している
  const user = await prisma.user.findUnique({
    // URLから受け取ったidは文字列だがDBは数字なので変換している
    where: { id: Number(id) },
  });

//   もしユーザーが見つからなければ404のページを表示させる
// 想定外の動作になるのを防ぐため
  if (!user) {
    notFound();
  }

//Eventテーブルから、主催者がこのページを見ているユーザーであるかつ、まだ中止されていないというイベントを検索する 
  const hostedEvents = await prisma.event.findMany({
    where: {
      organizerId: Number(id),
    //   すでに中止されたイベントはこれからの参加者に見せる必要はないから
      status: "active",
    },
    // 検索したEventそれぞれについて関連するカテゴリー名と参加人数を取得している
    // イベントテーブルにはcategoryIdしか持っていないため
    include: {
      category: true,
      _count: {
        select: { participations: true },
      },
    },
    // 作成日が新しい順に並び替えている
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Link href="/participant" className="text-blue-600 hover:underline text-sm">
        ← イベント一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-2">
        {user.userName}さん
      </h1>
      <p className="text-gray-600 mb-6">
        {/* spanで囲んでいるのはランク名だけ強調して表示したいから */}
        主催ランク: <span className="font-semibold">{getRank(user.hostedCount)}</span>
        (主催{user.hostedCount}回)
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        募集中のイベント
      </h2>
      {/* 募集中のイベントが0件だった場合表示する文章 */}
      {hostedEvents.length === 0 ? (
        <p className="text-gray-500">現在募集中のイベントはありません</p>
      ): (
        // 1件以上あればこっち
        <ul className="space-y-3">
            {/* 取得したイベントの配列を1件ずつli に表示 */}
          {hostedEvents.map((event) => (
            // 繰り返し表示される各要素にKeyをつけている　event.idは一意であるから
            <li key={event.id}>
              <Link
                href={`/participant/${event.id}`}
                // blockを指定することでカードのように幅いっぱいに広がるようになっている
                className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300"
              >
                <p className="text-gray-900">{event.name}</p>
                <p className="text-gray-600 text-sm">カテゴリー: {event.category.name}</p>
                <p className="text-gray-600 text-sm">
                    {/* includeで計算しておいた現在のparticipationの件数を表示している */}
                  参加人数: {event._count.participations}/{event.capacity}人
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}