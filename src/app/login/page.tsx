import { loginByEmail } from "./actions";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div>
            <h1>ログインページ</h1>
            {error === "notfound" && (
                <p>該当ユーザーが見つかりませんでした</p>
            )}
            <form action={loginByEmail}>
                <input type="email" name="email" placeholder="メールアドレス" required />
                <button type="submit">ログイン</button>
            </form>
        </div>
    );
}