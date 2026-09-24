// ログアウト機能
// このファイルの関数がサーバー側だけで動く処理であることの宣言
// ブラウザ側からDBを操作したりCookieの操作はできないためサーバー側でこれらを実行したのち
// ブラウザ側に返すという特別な扱いをする宣言
// "use server"


// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// // 引数がないのは今のログイン世帯をログアウト状態にするというCookieの情報だけで献血しているから
// export async function logout() {
//     const cookieStore = await cookies();
//     // ブラウザに保存されているuserIdというcookieを削除している
//     cookieStore.delete("userId");
//     // ログアウト後はログイン画面に戻している
//     redirect("/login");
// }

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  cookieStore.delete("sessionId");
  redirect("/login");
}

