// getRankはアカウントページにランクを表示させるため
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateAccount } from "./actions";
import { getRank } from "@/lib/rank";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";


// 内容やページレイアウトは新規登録とほぼ同じ
// 今回はフォームに既に登録してある情報を表示している
export default async function AccountPage({
    searchParams,
}: {
    // エラーメッセージと成功したかどうかを受け取っている
    searchParams: Promise<{ message?: string; success?: string}>;
}) {
    const { message, success } = await searchParams;

    const user = await getCurrentUser();

    if (!user) {
    redirect("/login");
    }

    // 自分が参加したイベント一覧を作るにはEventではなく、Participationで探す必要がある
    // Eventテーブルには誰が参加したかの情報がないから
    // ParticipationテーブルにはuserIdとeventIdが対応していて、そこから詳細情報も一緒に取って来ている
    const participations = await prisma.participation.findMany({
        where: { userId: user.id },
        include: {
            event: true,
        },
        orderBy: { appliedAt: "desc" },
    });

    return(
        
        <div className="max-w-md mx-auto px-4 py-10">
            <Link href="/participant" className="text-blue-600 hover:underline text-sm">
            ← イベント一覧に戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">アカウント情報</h1>
            {message && <p className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 mb-4">{decodeURIComponent(message)}</p>}
            {success === "true" && <p className="bg-green-50 text-green-700 border border-green-200 rounded px-3 py-2 mb-4">
                更新しました
                </p>}
            <form action={updateAccount}  className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-700 mb-1">名前</label>
                    {/* defaultValueでuser.userNameという既に入っている値を取ってきている
                    この値は最初の一回めだけ設定されればよく、useStateのように画面がわで常に値を管理するわけではない */}
                    <input type="text" name="userName" defaultValue={user.userName} required
                     className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />    
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">生年月日</label>
                    <div className="flex items-center gap-2">
                    <input type="number"
                            name="birthYear"
                            defaultValue={user.birthDate.getFullYear()} 
                            min="1900"
                            max="2050"
                            required
                            className="border border-gray-300 rounded px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            月
                            <input
                            type="number"
                            name="birthDay"
                            defaultValue={user.birthDate.getDate()}
                            min="1"
                            max="31"
                            required
                            className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            日
                            </div>
                </div>
                <div>
                    <label className="block text-sm text-gray-700 mb-1">電話番号</label>
                    <input type="tel" name="phoneNumber" defaultValue={user.phoneNumber} required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label  className="block text-sm text-gray-700 mb-1">メールアドレス</label>
                    <input type="email" name="email" defaultValue={user.email} required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
                    更新する
                </button>
            </form>
            {/* 更新ページ兼アカウント情報ページのため、新規登録フォームと違い参加主催回数を表示 */}
            <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-gray-700">
            主催ランク: <span className="font-semibold">{getRank(user.hostedCount)}</span>(主催{user.hostedCount}回)
            </p>
            <p className="text-gray-700">
            参加ランク: <span className="font-semibold">{getRank(user.participationCount)}</span>(参加{user.participationCount}回)
            </p>
            </div>

        
            <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-8">参加履歴</h2>
                <ul className="space-y-2">
                    {/* findManyで複数件取得してるので配列判定 */}
                {participations.map((participation) => (
                    // Reactが判定しやすいようにKeyをつける
                    <li key={participation.id}>
                    <Link href={`/participant/${participation.event.id}`}className="block border border-gray-200 rounded-lg p-3 bg-white hover:border-blue-300">
                        {participation.event.name}
                        {/* statusがcancelledであれば中止をイベント名の隣につける */}
                        {participation.event.status === "cancelled" && (<span className="text-red-600 ml-2">(中止)</span>)}
                    </Link>
                    </li>
                ))}
                </ul>
        </div>
    );
}