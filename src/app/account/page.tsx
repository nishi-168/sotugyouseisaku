import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { updateAccount } from "./actions";

// 内容やページレイアウトは新規登録とほぼ同じ
// 今回はフォームに既に登録してある情報を表示している
export default async function AccountPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; success?: string}>;
}) {
    const { message, success } = await searchParams;

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
    });

    if (!user) {
        notFound();
    }

    return(
        <div>
            <h1>アカウント情報</h1>
            {message && <p>{decodeURIComponent(message)}</p>}
            {success === "true" && <p>更新しました</p>}
            <form action={updateAccount}>
                <div>
                    <label>名前</label>
                    {/* defaultValueでuser.userNameという既に入っている値を取ってきている
                    この値は最初の一回めだけ設定されればよく、useStateのように画面がわで常に値を管理するわけではない */}
                    <input type="text" name="userName" defaultValue={user.userName} required />    
                </div>
                <div>
                    <label>生年月日</label>
                    <input type="number"
                            name="birthYear"
                            defaultValue={user.birthDate.getFullYear()} 
                            min="1900"
                            max="2050"
                            required
                            />
                            年
                            <input
                            type="number"
                            name="birthMonth"
                            // JSでは０から１１で値を管理しているため人間の感覚に合わせるため＋１
                            defaultValue={user.birthDate.getMonth() + 1}
                            min="1"
                            max="12"
                            required
                            />
                            月
                            <input
                            type="number"
                            name="birthDay"
                            defaultValue={user.birthDate.getDate()}
                            min="1"
                            max="31"
                            required
                            />
                            日
                </div>
                <div>
                    <label>電話番号</label>
                    <input type="tel" name="phoneNumber" defaultValue={user.phoneNumber} required />
                </div>
                <div>
                    <label>メールアドレス</label>
                    <input type="email" name="email" defaultValue={user.email} required />
                </div>
                <button type="submit">更新する</button>
            </form>
            {/* 更新ページ兼アカウント情報ページのため、新規登録フォームと違い参加主催回数を表示 */}
            <p>主催回数: {user.hostedCount}回</p>
            <p>参加回数: {user.participationCount}回</p>
        </div>
    );
}