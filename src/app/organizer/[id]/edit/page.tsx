import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { updateEvent } from "./actions";

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
    <div>
      <h1>イベント編集</h1>
      {message && <p>{decodeURIComponent(message)}</p>}
      <form action={updateEventWithId}>
        <div>
          <label>イベント名</label>
          <input type="text" name="name" defaultValue={event.name} required />
        </div>
        <div>
          <label>場所</label>
          <input type="text" name="location" defaultValue={event.location} required />
        </div>
        <div>
          <label>開催日時</label>
          <input
            type="datetime-local"
            name="eventDatetime"
            defaultValue={toDatetimeLocal(event.eventDatetime)}
            required
          />
        </div>
        <div>
          <label>募集人数</label>
          <input type="number" name="capacity" defaultValue={event.capacity} min="1" required />
        </div>
        <div>
          <label>詳細</label>
          {/* 任意項目 */}
          <textarea name="description" defaultValue={event.description ?? ""} />
        </div>
        <div>
          <label>カテゴリ</label>
          <select name="categoryId" defaultValue={event.categoryId} required>
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>申込期限</label>
          <input
            type="datetime-local"
            name="deadline"
            defaultValue={toDatetimeLocal(event.deadline)}
            required
          />
        </div>
        <button type="submit">更新する</button>
      </form>
    </div>
  );

}