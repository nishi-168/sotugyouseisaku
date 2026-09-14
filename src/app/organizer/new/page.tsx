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
        <div className="max-w-md mx-auto px-4 py-10">
            <Link href="/organizer" className="text-blue-600 hover:underline text-sm">
                ← 主催イベント一覧に戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">
                イベント新規作成
            </h1>
            {message && <p className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 mb-4">
                {decodeURIComponent(message)}</p>}
            <form action={createEvent} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-700 mb-1">イベント名</label>
                    <input type="text" name="name" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">場所</label>
                    <input type="text" name="location" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">開催日時</label>
                    <input type="datetime-local" name="eventDatetime" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">募集人数</label>
                    <input type="number" name="capacity" min="1" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">詳細</label>
                    <textarea name="description" rows={4} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">カテゴリ</label>
                    <select name="categoryId" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                    <input type="datetime-local" name="deadline" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
                    投稿する
                </button>
            </form>
        </div>
    );
}