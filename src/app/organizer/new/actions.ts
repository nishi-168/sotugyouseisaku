"use server";


import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as yup from "yup";
import { getCurrentUser } from "@/lib/session";

// バリデーションの定義
const eventSchema = yup.object({
  name: yup.string().required("イベント名を入力してください"),
  location: yup.string().required("場所を入力してください"),
  eventDatetime: yup
    .date()
    .typeError("開催日を正しく入力してください")
    .min(new Date(),"開催日は現在時刻より後の日時にしてください")
    .required("開催日を入力してください"),
  capacity: yup
    .number()
    .typeError("募集人数は数字で入力してください")
    .min(1, "募集人数を入力してください")
    .required("募集人数を入力してください"),
  description: yup.string(),
  categoryId: yup
    .number()
    .typeError("カテゴリを選択してください")
    .required("カテゴリを選択してください"),
  deadline: yup
    .date()
    .typeError("申込期限を正しく入力してください")
    .min(new Date(), "申込期限は現在より後の日時にしてください")
    .required("申込期限を入力してください"),
});


export async function createEvent(formData: FormData) {
    // イベント作成では未ログイン状態は許容せず、誰が作ったかがわかる必要があるため
    // CookieからuserIdを受け取って誰がログインしているかユーザーを確認している
    const user = await getCurrentUser();

    if (!user) {
    redirect("/login");
    }

    // フォームから送られてきた７項目を１つのオブジェクトにまとめている
    // capacityなどの数値である項目も一旦文字列にして、後でyupのNumber()が自動的に行ってくれる
    const rawData = {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        eventDatetime: formData.get("eventDatetime") as string,
        capacity: formData.get("capacity") as string,
        description: formData.get("description") as string,
        categoryId: formData.get("categoryId") as string,
        deadline: formData.get("deadline") as string,
    };

    let validatedData ;

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
    // ここでは$transactionを採用した　参加登録が失敗したが　レコードの回数が＋されないように
    // $transactionは配列の中に入れた処理を順番に実行しそれぞれの結果を配列として返す
    // 分割代入でeventを受け取っているのは更新後のuser.updateはこの後のコードで使わないから
    const [event] = await prisma.$transaction([
        prisma.event.create({
        data: {
            name: validatedData.name,
            location: validatedData.location,
            eventDatetime: validatedData.eventDatetime,
            capacity: validatedData.capacity,
            // 詳細は書かなくてもいいのでから文字ならnullを使う
            description: validatedData.description || null,
            categoryId: validatedData.categoryId,
            deadline: validatedData.deadline,
            organizerId: user.id,
        },
    }),
    // レコードを作ったら主催者回数を１増やす
     prisma.user.update({
        where: { id : user.id },
        data: {hostedCount: {increment: 1} },
    }),
    ])


    // ここでeventは使うので分割代入でeventという変数名で受け取る必要があった
    redirect(`/participant/${event.id}?created=true`);
    
}