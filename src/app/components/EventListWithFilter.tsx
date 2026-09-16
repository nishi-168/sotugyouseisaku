// これまでのファイルと違い、ブラウザ側で動くコンポーネントであることを宣言している
// useStateを使いたかったから
// participant/page.tsx（親）がDBからデータをもらってきておりすでにeventsという配列の中にはカテゴリ名は含まれている
"use client";

import { useState } from "react";
import Link from "next/link";

// EventとCategoryがどんな形をしているのかTSに教えている型
// Prismaを使っていないため改めてここで教えておく必要がある
type Event = {
  id: number;
  name: string;
  location: string;
  capacity: number;
  categoryId: number;
  category: { name: string };
  organizer: { userName: string };
  _count: { participations: number };
};

type Category = {
  id: number;
  name: string;
};

// ２つのproposを受け取っている　awaitのような非同期DB接続をしていないからasyncはいらない
export default function EventListWithFilter({
  categories,
  events,
}: {
  categories: Category[];
  events: Event[];
}) {

    // useStateで扱う初期値の設定　ページを開いた直後は何のカテゴリーも選ばれていない状態にするので空文字
  const [selectedCategoryId, setSelectedCategoryId] = useState("");


//   今選ばれているカテゴリーIDに応じて表示すべきイベントを絞り込んでいる
// filterの中はそのイベントのカテゴリーIDが、選ばれているカテゴリーIDと一致するかを1件ずつ確認している
// Number()で変換しているのは、<select>から渡ってくる値が文字列だから
// eventsはこのpage.tsxで渡されている情報でそれを並べているだけだからDB接続をしていない
  const filteredEvents = selectedCategoryId
    ? events.filter((event) => event.categoryId === Number(selectedCategoryId))
    : events;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <select
        // defaultValueは最初だけこの値にするというブラウザ側の管理
        // valueは常にこの変数の値と完全に一致させ続けるというReactの管理
        // 今回はuseStateで扱っている値だけを表示している
          value={selectedCategoryId}
        //   プルダウンが選ばれるとonChangeが発火する。そうするとstateを更新する関数で値を更新する
        // Reactが自動的に画面を再描画しfilterdEventsによってイベントを絞り込み一覧が変化する
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {/* プルダウンで表示するカテゴリー名 */}
          <option value="">すべてのカテゴリ</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {/* カテゴリーが選ばれている時だけ条件クリアボタンを表示している */}
        {selectedCategoryId && (
          <button
        //   ボタンが押されると""空文字になり初期値に戻る
            onClick={() => setSelectedCategoryId("")}
            className="text-blue-600 hover:underline text-sm"
          >
            条件をクリア
          </button>
        )}
      </div>

        {/* 絞り込み後の一覧を表示する部分 */}
      <ul className="space-y-3">
        {filteredEvents.map((event) => (
          <li key={event.id}>
            <Link
              href={`/participant/${event.id}`}
              className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300"
            >
              <h2 className="text-gray-900">・{event.name}</h2>
              <p className="text-gray-900 text-base">場所: {event.location}</p>
              <p className="text-gray-600 text-sm">カテゴリー: {event.category.name}</p>
              <p className="text-gray-600 text-sm">主催者: {event.organizer.userName}</p>
              <p className="text-gray-600 text-sm">
                参加人数: {event._count.participations}/{event.capacity}人
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}