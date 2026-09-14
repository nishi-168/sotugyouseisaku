import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { updateEvent } from "./actions";
import Link from "next/link";


// この関数はDate型のデータを決まった書式に変換して渡す関数
// defaultValueにはDateがアタのオブジェクトをそのまま渡すことができないから
function toDatetimeLocal(date: Date) {
    // pad関数は7を07として渡すやつ　前も似たようなのが出てきた
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() +1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditEventpage({
    params,
    searchParams,
}: {
    params: Promise<{ id:string }>;
    searchParams: Promise<{ message?: string }>;
}) {
    const { id } = await params;
    const { message } = await searchParams;

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        redirect("/login");
    }

    const event = await prisma.event.findUnique({
        where: { id: Number(id) },
    });

    if (!event) {
        notFound();
    }

    if (event.organizerId !== Number(userId)) {
        redirect(`/organizer?message=${encodeURIComponent("自分が主催するイベントのみ編集できます")}`);
    }

    const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    });

    // updateEvent関数にあらかじめevent.idを持たせた関数を作っている？
    const updateEventWithId = updateEvent.bind(null, event.id);

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
        <button type="submit">更新する</button>
      </form>
    </div>
  );

}