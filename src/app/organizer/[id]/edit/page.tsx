import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { updateEvent } from "./actions";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

// この関数はDate型のデータを決まった書式に変換して渡す関数
// defaultValueにはDate型のオブジェクトをそのまま渡すことができないから
// datetime-localが要求する形式は日付や時間が２桁で表記される必要がある　１桁の場合認識してくれない
function toDatetimeLocal(date: Date) {
    // pad関数は7を07として渡すやつ　前も似たようなのが出てきた
    // n.toString()：数値を文字列に変換。.padStart()今回は文字列の長さが２になるように０で調整する
    const pad = (n: number) => n.toString().padStart(2, "0");
    // 西暦を取得　月を取得＋１　日を取得　T：日付と時刻を区切る　これはdatetime-local形式で決められた記号　時間　分を取得
    return `${date.getFullYear()}-${pad(date.getMonth() +1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// id部分と？以降を受け取っている　どのイベントを編集するか、エラーが起きていないかの両方の情報が必要
export default async function EditEventpage({
    params,
    searchParams,
}: {
    params: Promise<{ id:string }>;
    searchParams: Promise<{ message?: string }>;
}) {
    const { id } = await params;
    const { message } = await searchParams;

    const user = await getCurrentUser();

    if (!user) {
      redirect("/login");
    }

    const event = await prisma.event.findUnique({
        where: { id: Number(id) },
    });

    if (!event) {
        notFound();
    }

    if (event.organizerId !== user.id) {
        redirect(`/organizer?message=${encodeURIComponent("自分が主催するイベントのみ編集できます")}`);
    }

    // カテゴリーのプルダウンに表示する選択肢を取得している
    const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    });

    // updateEvent関数にあらかじめevent.idを持たせた関数を作っている
    const updateEventWithId = updateEvent.bind(null, event.id);

    // 新規作成フォームとほとんど同じだがdefaultValue={event.name}などの今DBに保存されている値を、あらかじめ入力欄に表示しておく
    // これによって変更したい部分だけ変えれば済むようになる
    return (
    <div className="max-w-md mx-auto px-4 py-10">
        <Link href="/organizer" className="text-blue-600 hover:underline text-sm">
          ← 主催イベント一覧に戻る
        </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">イベント編集</h1>
      {message && <p className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 mb-4">
        {decodeURIComponent(message)}</p>}
      <form action={updateEventWithId} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">イベント名</label>
          <input type="text" name="name" defaultValue={event.name} required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">場所</label>
          <input type="text" name="location" defaultValue={event.location} required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">開催日時</label>
          <input
            type="datetime-local"
            name="eventDatetime"
            // toDatetimeLocalを「通してから渡すことで正しく認識できる形にする
            defaultValue={toDatetimeLocal(event.eventDatetime)}
            required
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">募集人数</label>
          <input type="number" name="capacity" defaultValue={event.capacity} min="1" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">詳細</label>
          {/* 任意項目 */}
          <textarea name="description" defaultValue={event.description ?? ""} rows={4} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">カテゴリ</label>
          <select name="categoryId" defaultValue={event.categoryId} required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">申込期限</label>
          <input
            type="datetime-local"
            name="deadline"
            defaultValue={toDatetimeLocal(event.deadline)}
            required
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">更新する</button>
      </form>
    </div>
  );

}