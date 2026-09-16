// actions.tsで作ったregisterUser関数を読み込んでいる
import { registerUser } from "./actions";
import Link from "next/link";

// seaechParamsはURLの？以降の部分（クエリパラメータ）を受け取る引数を用意している
export default async function RegisterPage({
  // 今回このページには[id]のような可変するものがないからsearchPaarams
    searchParams,
}: {
  // searchParamsはURLに含まれる情報　例(?message=名前を入力してくださいのような部分)を受け取って,messageという変数に取り出す
  // 実際にエラー文を表示しているのはmessage
    searchParams: Promise<{ message?: string }>;
}) {
  // searchParamsというPromiseの中身をawaitで取り出し、messageの値だけを取り出している
    const { message } = await searchParams;
    // 基本バリデーションはブラウザ側でやってくれる　に段階チェック用
    return (
      <div  className="max-w-md mx-auto px-4 py-10">
            <Link href="/login"  className="text-blue-600 hover:underline text-sm">
            ← ログイン画面に戻る
            </Link>
          <h1  className="text-2xl font-bold text-gray-900 mt-2 mb-6">新規登録</h1>
          {/* サーバー側で弾かれたエラーメッセージを表示する場所 */}
          {message && <p  className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 mb-4">
                        {/* actions.ts側でURLように変更されていたメッセージを、元の読める日本語の文字列に戻している
                        エンコードとデコードは必ずセットで使う */}
                          {decodeURIComponent(message)}
                      </p>}
                      {/* action={registerUser}によってフォームが送信されるとactions.tsのregister関数が呼ばれる */}
          <form action={registerUser}  className="space-y-4">
            <div>
              <label  className="block text-sm text-gray-700 mb-1">名前</label>
              <input type="text" name="userName" required className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label  className="block text-sm text-gray-700 mb-1">生年月日</label>
              <div  className="flex items-center gap-2">
                {/* 分けた理由：input type="date" にすると古い生年月日を選ぶ際に大変だったので直接打ち込めるようにした*/}
            <input 
                type="number" 
                name="birthYear" 
                placeholder="年(例: 2000)" 
                min="1900"
                max="2050"
                required
                className="border border-gray-300 rounded px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                年
            <input
                type="number"
                name="birthMonth"
                placeholder="月"
                min="1"
                max="12"
                required
                className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                
              />
              月
            <input
                type="number"
                name="birthDay"
                placeholder="日"
                min="1"
                max="31"
                required
                className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              日
              </div>
            </div>
            <div>
              <label  className="block text-sm text-gray-700 mb-1">電話番号</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="例：090-1234-5678"
                required
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">メールアドレス</label>
              <input type="email" name="email" required 
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
              登録する
            </button>
          </form>
      </div>
    );
}