"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as yup from "yup";

// バリデーションの定義
const eventSchema = yup.object({
    name: yup.string().trim().required("イベント名を入力してください"),
    location: yup.string().required("場所を入力してください"),
    eventDatetime:yup
        .date()
        .typeError("開催日を正しく入力してください")
        .required("開催日を入力してください"),
    capacity: yup
        .number()
        .typeError("募集人数は数字で入力してください")
        .min(1,"募集人数を入力してください")
        .required("募集人数を入力してください"),
    description: yup.string(),
    categoryId: yup
        .number()
        .typeError("カテゴリを選択してください")
        .required("カテゴリを選択してください"),
    deadline: yup
        .date()
        .typeError("申込期限を正しく入力してください")
        .required("申込期限を入力してください"),
});


export async function createEvent(formData: FormData) {
    // イベント作成では未ログイン状態は許容せず、誰が作ったかがわかる必要があるため
    // CookieからuserIdを受け取って誰がログインしているかユーザーを確認している
    const cookieStore = await cookies ();
    const userId = cookieStore.get("userId")?.value;
    // もしログインしていなかったらloginに戻す
    if (!userId) {
        redirect("/login");
    }

    const rawData = {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        eventDatetime: formData.get("eventDatetime") as string,
        capacity: formData.get("capacity") as string,
        description: formData.get("description") as string,
        categoryId: formData.get("categoryId") as string,
        deadline: formData.get("deadline") as string,
    };

    let validatedData 
    try {
        validatedData = await eventSchema.validate(rawData);
    } catch (e) {
        if (e instanceof yup.ValidationError) {
            redirect(`/organizer/new?message=${encodeURIComponent(e.message)}`);
        }
        throw e;
    }
    // yupだけでは２つの日付項目を比較するチェックが書きにくいので、別でこの条件を確認　？オリジナルのバリデーション見たいのあった気がするので確認
    if (validatedData.deadline > validatedData.eventDatetime) {
        redirect(
            `/organizer/new?message=${encodeURIComponent("申込期限は開催日より前に設定してください")}`
        );
    }
    // バリデーションを通過したデータでEventレコードを作成
    const event = await prisma.event.create({
        data: {
            name: validatedData.name,
            location: validatedData.location,
            eventDatetime: validatedData.eventDatetime,
            capacity: validatedData.capacity,
            // 詳細は書かなくてもいいのでから文字ならnullを使う
            description: validatedData.description || null,
            categoryId: validatedData.categoryId,
            deadline: validatedData.deadline,
            organizerId: Number(userId),
        },
    });
    // レコードを作ったら主催者回数を１増やす
    await prisma.user.update({
        where: { id : Number(userId) },
        data: {hostedCount: {increment: 1} },
    });

    redirect(`/participant/${event.id}?created=true`);
    
}