// 主催者が自分のイベントを中止する処理
// 正確にはログインユーザーがそのイベントの主催者本人であることを確認した上で、イベントを物理削除せず中止状態に更新する処理
// Cookieの確認　DBの更新　イベントの中止　これらはサーバー側で実行する必要がある
"use server";

import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";


// eventIdはどのイベントを中止するか　formDataはフォームから送信されたデータ　今回フォームから送られてくるのはcancelReason＝中止理由
export async function cancelEvent(eventId: number, formData: FormData) {
    
    // Cookieからログインユーザーを取得
    const cookieStore = await cookies();
    // 今この中止操作をしているのは誰なのかを確認
    const userId = cookieStore.get("userId")?.value;

    // ログインしていなけてばログインページにリダイレクトする
    if(!userId) {
        redirect("/login");
    }

    // 中止しようとしているイベントが本当に存在するか　eventIdは一意なのでfindUnique
    const event = await prisma.event.findUnique({
        where : {id: eventId},
    });

    if(!event) {
        notFound();
    }
    // 編集機能と同じ考えで自分のイベントだけ注視できる
    // 権限チェック　Cookieから取得したuserIdを数字にしている
    if (event.organizerId !== Number(userId)) {
        // リダイレクトの際エラーメッセージも送る
        redirect(`/organizer?message=${encodeURIComponent("自分が主催するイベントのみ中止できます")}`);
    }

    // formDataからもらったcancelReasonという値を取得している
    // cancelReasonという名前の項目を探してその値をgetしている
    const cancelReason = formData.get("cancelReason") as string;

    // deleteではなくupdateを使う
    // 主催者側はイベントを中止にすることができる（削除）
    // 削除と言いながらもデータは残して参加者側が中止になったことを把握できるようにしたいからupdateを使う
    // 関連データも残る（論理削除）
        await prisma.event.update({
        where: { id: eventId },
        data: {
        status: "cancelled",
        // 中止理由はなくてもOK
        cancelReason: cancelReason || null,
        },
    });

    redirect("/organizer?cancelled=true");
}