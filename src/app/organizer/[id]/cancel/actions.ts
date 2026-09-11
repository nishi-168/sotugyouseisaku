"use server";

import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";


export async function cancelEvent(eventId: number, formData: FormData) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if(!userId) {
        redirect("/login");
    }

    const event = await prisma.event.findUnique({
        where : {id: eventId},
    });

    if(!event) {
        notFound();
    }
    // 編集機能と同じ考えで自分のイベントだけ注視できる
    if (event.organizerId !== Number(userId)) {
        redirect(`/organizer?message=${encodeURIComponent("自分が主催するイベントのみ中止できます")}`);
    }

    const cancelReason = formData.get("cancelReason") as string;

    // deleteではなくupdateを使う
    // 主催者側はイベントを中止にすることができる（削除）
    // 削除と言いながらもデータは残して参加者側が中止になったことを把握できるようにしたいからupdateを使う
    // 関連データも残る（論理削除）
        await prisma.event.update({
        where: { id: eventId },
        data: {
        status: "cancelled",
        cancelReason: cancelReason || null,
        },
    });

    redirect("/organizer?cancelled=true");
}