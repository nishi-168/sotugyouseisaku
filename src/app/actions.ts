// このファイルの関数がサーバー側だけで動く処理であることの宣言
"use server"


import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
    const cookieStore = await cookies();
    // ブラウザに保存されているuserIdというcookieを削除している
    cookieStore.delete("userId");
    // ログアウト後はログイン画面に戻している
    redirect("/login");
}

