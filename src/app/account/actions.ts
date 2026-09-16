"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as yup from "yup";

// 更新時のバリデーションを決めている部分　未来の日付もここでチェックするようにした
const accountSchema = yup.object({
  userName: yup.string().required("名前を入力してください"),
  birthDate: yup
    .date()
    .typeError("生年月日を正しく入力してください")
    .max(new Date(), "未来の日付は登録できません")
    .required("生年月日を入力してください"),
  phoneNumber: yup
    .string()
    .matches(/^0\d{1,4}-?\d{1,4}-?\d{4}$/, "電話番号の形式が正しくありません(例: 090-1234-5678)")
    .required("電話番号を入力してください"),
  email: yup
    .string()
    .email("メールアドレスの形式が正しくありません")
    .required("メールアドレスを入力してください"),
});

export async function updateAccount(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

//   日付文字列に組み立てる処理
  const birthYear = formData.get("birthYear") as string;
  const birthMonth = formData.get("birthMonth") as string;
  const birthDay = formData.get("birthDay") as string;

//   ３つを１つのオブジェクトにまとめている
  const birthDateString =
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
      : "";

    //   フォームから送られてきた４つの値を１つのオブジェクトにまとめている部分
  const rawData = {
    userName: formData.get("userName") as string,
    birthDate: birthDateString,
    phoneNumber: formData.get("phoneNumber") as string,
    email: formData.get("email") as string,
  };

  let validatedData;

  try {
    validatedData = await accountSchema.validate(rawData);
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      redirect(`/account?message=${encodeURIComponent(e.message)}`);
    }
    throw e;
  }

  // 自分以外のメールアドレス重複チェック
  // 新規登録の際はfindUniqueになっていたがそのまま使うとメールアドレスを変更しない場合に
  // 自分のメールアドレスでも重複として判定されてしまうのを避けるため
  const existingUser = await prisma.user.findFirst({
    where: {
      email: validatedData.email,
      // この条件をつけることで自分以外のuser.idが使っていないかだけを見ることができ
      // メールアドレスを変更しない場合にもエラーを出さずに更新できる
      NOT: { id: Number(userId) },
    },
  });
// 重複が見つかった場合のエラー
  if (existingUser) {
    redirect(`/account?message=${encodeURIComponent("このメールアドレスは他のユーザーが使用しています")}`);
  }

  // またCookieは新しく変更しない。アカウント情報を更新しても本人であることは変わらないため
  // Cookie関連のコードには触れていない
  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      userName: validatedData.userName,
      birthDate: validatedData.birthDate,
      phoneNumber: validatedData.phoneNumber,
      email: validatedData.email,
    },
  });

  // 更新するを押したあとイベント一覧ページに飛ぶように変更
  // 更新が成功していたらイベント一覧
  redirect("/participant?success=true");
}