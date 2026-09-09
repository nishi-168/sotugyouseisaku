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
        <div>
            <h1>ログインページ</h1>
            {/* errorがnot foundだったら下記の文章を表示する */}
            {error === "notfound" && (
                <p>該当ユーザーが見つかりませんでした</p>
            )}
            {/* フォームが送信されたらloginByEmailがそのまま呼ばれる */}
            <form action={loginByEmail}>
                {/* requiredは未入力を許容しない */}
                <input type="email" name="email" placeholder="メールアドレス" required />
                <button type="submit">ログイン</button>
            </form>
                <p>
                    初めての方は<Link href="/register">→こちら←</Link>から登録してください
                </p>
            
        </div>
    );
}