// このファイルの中身全体をサーバー側でだけ実行される処理として扱うための宣言
// メールアドレスをDBで検索したり、クッキーを書き込んだりする所りは、ブラウザ側では実行できないから、
// サーバー側でだけ動く関数としてフォームの送信先として直接使えるようにしている
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// メールアドレスでログインするための関数
export async function loginByEmail(formData: FormData) {
    // FormDataの中から　name="email"の値を取り出そうとしている as stringは文字列として扱ってください
    const email = formData.get("email") as string;
    // 入力されたメールアドレスと一致するユーザーをUserテーブルから探している　emailはUniqueをつけているので1件だけ見つかることが保証されている
    const user = await prisma.user.findUnique({ where: {email}});

    // なかったらエラー情報つきのURLに戻している
    if(!user) {
        redirect("/login?error=notfound");
    }
    // 見つかったユーザーID（数字）を文字列に変換してクッキーに保存している　クッキーはブラウザ側で保持されるので、次回以降のアクセス時にユーザーIDを使ってログイン状態を維持できる
    // cookieはブラウザに保存しておける小さな情報　あとでも取得できるので別ページに行っても情報を保持しておける
    // await　があるのはcookies()が非同期関数だから　cookieを取得し終わってからcookieStoreに入れている
    // cookieStore は「Cookieを保存する場所」というより、Cookieを読み書きするための窓口（操作するためのオブジェクト
    const cookieStore = await cookies();
    // userIdという名前でユーザーIDをクッキーに保存している
    // cookieStore.get("userId")こんな感じで取り出す
    cookieStore.set("userId", user.id.toString());
    // ログインが成功したらイベント一覧画面に移動させている　redirect ブラウザをparticipantに移動させて表示する
    redirect("/participant");
}