"use server"


import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as yup from "yup";

// createEventで使っていたスキーマと全く同じ内容
// 新規作成と編集では全く同じルールで問題ないから
// 同じ内容ならここだけ切り出してimportすればよかったかも
const eventSchema = yup.object({
  name: yup.string().required("イベント名を入力してください"),
  location: yup.string().required("場所を入力してください"),
  eventDatetime: yup
    .date()
    .typeError("開催日を正しく入力してください")
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
    .required("申込期限を入力してください"),
});

// createEventにはなかったeventIdという引数を追加している
// どのイベントを更新するかという情報が必要なため
// formDataにはどのイベントかという情報は含まれていないから
export async function updateEvent(eventId: number, formData: FormData) {
    const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
//   編集しようとしているイベントが存在する確認し、そのイベントの主催者が今ログインしている本人かどうかを確認している
// URLを直接アクセスしようとすると理論上は誰でもアクセスできてしまうためpageだけではなく実際に更新処理を行なっている
// このファイルでもチェックしている
  const event = await prisma.event.findUnique({
    where: { id:eventId },
  });

  if(!event) {
    notFound();
  }

  if (event.organizerId !== user.id) {
    redirect(`/organizer?message=${encodeURIComponent("自分が主催するイベントのみ編集できます")}`);
  }

  // フォームから送られてきた各項目の値を、１つのオブジェクトにまとめている
  // 新規作成の時と同じ形
  const rawData ={
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    eventDatetime: formData.get("eventDatetime") as string,
    capacity: formData.get("capacity") as string,
    description: formData.get("description") as string,
    categoryId: formData.get("categoryId") as string,
    deadline: formData.get("deadline") as string,
  };

  // validatedDataという名前の変数をあらかじめ作っておく
  // この後のtry catchで実際に値を入れている
  // ここで定義しておかないとvalidateDataがtryの中でしか扱えなくなってしまう
  // constだと二度と中身を変えられない箱になってしまうので空の箱のままになってしまうが、
  // 最初は空、そのあとで一回だけ値を入れるという使い方をしたいから後から値を入れられるletを使っている
  let validatedData;

// 新規作成と同じyupでバリデーションを行いエラーがあれば編集ページにエラーメッセージ付きで戻している
// 新規作成と違う部分はリダイレクト先が${eventId}というどのイベントの編集画面に戻すかも指定している
  try {
    validatedData = await eventSchema.validate(rawData);
    // （e）catchで受け取ったエラー情報　
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      // encodeURIComponentはURLの中に文字列を安全に埋め込める形に変換するための標準機能
      // URL構造を壊さないようにするもの
        redirect(`/organizer/${eventId}/edit?message=${encodeURIComponent(e.message)}`);
    }
    throw e;
  }

  // 新規作成の時と同じ理由でyupだけでは複数項目のチェックがしづらいため個別で条件式を書いている
  // yupで.test()という書き方もあったがthis.parantという複雑な書き方だったので
  // ここだけであればifで書いても労力にならないし、読む人も理解しやすそうだった
  if (validatedData.deadline > validatedData.eventDatetime) {
    redirect(
        `/organizer/${eventId}/edit?message=${encodeURIComponent("申込期限は開催日より前に設定してください")}`
    );
  }
//   登録フォームとは違いupdateを行なっている
// organaizerIdの設定はない　新規登録ではなく編集者が誰なのかは最初から決まっていて変わることがない
  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: validatedData.name,
      location: validatedData.location,
      eventDatetime: validatedData.eventDatetime,
      capacity: validatedData.capacity,
      description: validatedData.description || null,
      categoryId: validatedData.categoryId,
      deadline: validatedData.deadline,
    },
  });

  redirect(`/participant/${eventId}?updated=true`);
}