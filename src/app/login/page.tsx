import Link from "next/link";
import { loginByEmail } from "./actions";
// ログインページの部分
export default async function LoginPage({
    searchParams,
}: {
    // URLのクエリパラメータを受け取っている　？以降の部分を扱う仕組み
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div className="max-w-md mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">ログインページ</h1>
            {/* errorがnot foundだったら下記の文章を表示する */}
            {error === "notfound" && (
                <p  className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 mb-4">
                    該当ユーザーが見つかりませんでした
                </p>
            )}
            {/* フォームが送信されたらloginByEmailがそのまま呼ばれる */}
            <form action={loginByEmail}  className="space-y-4">
                {/* requiredは未入力を許容しない */}
                <input type="email" name="email" placeholder="メールアドレス" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
                    ログイン
                </button>
            </form>
                <p  className="text-gray-600 text-sm mt-4">
                    初めての方は<Link href="/register"  className="text-blue-600 hover:underline">
                    →こちら←
                    </Link>から登録してください
                </p>
            
        </div>
    );
}