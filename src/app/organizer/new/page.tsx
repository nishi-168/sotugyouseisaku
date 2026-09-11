import { prisma } from "@/lib/prisma";
import { createEvent } from "./actions";
import Link from "next/link";

// ユーザー登録と同じ
// createEventがバリデーションエラーの際にmessageを受け取ることができるようになっている
export default async function NewEventPage({
    searchParams,
}: {
    // バリデーションエラーがない場合もあるので？
    searchParams: Promise<{ message?: string}>;
}) {
    const { message } = await searchParams;
    // カテゴリーのプルダウンに関するところ
    // カテゴリーテーブルに登録した順番で表示するため、こちらでコードを書き換える必要がない
    const categories = await prisma.category.findMany({
        orderBy: {id: "asc"},
    });

    return(
        <div>
            <Link href="/participant">← イベント一覧に戻る</Link>
            <h1>イベント新規作成</h1>
            {message && <p>{decodeURIComponent(message)}</p>}
            <form action={createEvent}>
                <div>
                    <label>イベント名</label>
                    <input type="text" name="name" required  />
                </div>
                <div>
                    <label>場所</label>
                    <input type="text" name="location" required />
                </div>
                <div>
                    <label>開催日時</label>
                    <input type="datetime-local" name="eventDatetime" required />
                </div>
                <div>
                    <label>募集人数</label>
                    <input type="number" name="capacity" min="1" required />
                </div>
                <div>
                    <label>詳細</label>
                    <textarea name="description" />
                </div>
                <div>
                    <label>カテゴリ</label>
                    <select name="categoryId" required>
                        {categories.map((category) => (

                        
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>申込期限</label>
                    <input type="datetime-local" name="deadline" required />
                </div>
                <button type="submit">投稿する</button>
            </form>
        </div>
    );
}