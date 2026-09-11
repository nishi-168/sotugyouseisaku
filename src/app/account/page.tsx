import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { updateAccount } from "./actions";
import { getRank } from "@/lib/rank";
import Link from "next/link";


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

    // 自分が参加したイベント一覧を作るにはEventではなく、Participationで探す必要がある
    // Eventテーブルには誰が参加したかの情報がないから
    // ParticipationテーブルにはuserIdとeventIdが対応しておりそこかた詳細情報も一緒に取って来ている
    const participations = await prisma.participation.findMany({
        where: { userId: Number(userId) },
        include: {
            event: true,
        },
        orderBy: { appliedAt: "desc" },
    });

    return(
        
        <div>
            <Link href="/participant">← イベント一覧に戻る</Link>
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
            <p>
            主催ランク: {getRank(user.hostedCount)}(主催{user.hostedCount}回)
            </p>
            <p>
            参加ランク: {getRank(user.participationCount)}(参加{user.participationCount}回)
            </p>

            <h2>参加履歴</h2>
                <ul>
                {participations.map((participation) => (
                    <li key={participation.id}>
                    <Link href={`/participant/${participation.event.id}`}>
                        {participation.event.name}
                        {/* statusがcancwelledであれば中止をイベント名の隣につける */}
                        {participation.event.status === "cancelled" && "(中止)"}
                    </Link>
                    </li>
                ))}
                </ul>
        </div>
    );
}