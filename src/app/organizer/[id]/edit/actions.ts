"use server"


import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as yup from "yup";

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
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
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

  if (event.organizerId !== Number(userId)) {
    redirect(`/organizer?message=${encodeURIComponent("自分が主催するイベントのみ編集できます")}`);
  }

  const rawData ={
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    eventDatetime: formData.get("eventDatetime") as string,
    capacity: formData.get("capacity") as string,
    description: formData.get("description") as string,
    categoryId: formData.get("categoryId") as string,
    deadline: formData.get("deadline") as string,
  };

  let validatedData;

  try {
    validatedData = await eventSchema.validate(rawData);
  } catch (e) {
    if (e instanceof yup.ValidationError) {
        redirect(`/organizer/${eventId}/edit?message=${encodeURIComponent(e.message)}`);
    }
    throw e;
  }

  if (validatedData.deadline > validatedData.eventDatetime) {
    redirect(
        `/organizer/${eventId}/edit?message=${encodeURIComponent("申込期限は開催日より前に設定してください")}`
    );
  }
//   登録フォームとは違いupdateを行なっている
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