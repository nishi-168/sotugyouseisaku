"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as yup from "yup";
// 更新時のバリデーションを決めている部分
const accountSchema = yup.object({
  userName: yup.string().required("名前を入力してください"),
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

  const birthYear = formData.get("birthYear") as string;
  const birthMonth = formData.get("birthMonth") as string;
  const birthDay = formData.get("birthDay") as string;

  const birthDateString =
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
      : "";

  const rawData = {
        userName: formData.get("userName") as string,
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

    const birthDateObj = new Date(birthDateString);
    if (isNaN(birthDateObj.getTime()) || birthDateObj > new Date()) {
        redirect(`/account?message=${encodeURIComponent("生年月日を正しく入力してください")}`);
    }

    // 自分以外のメールアドレス重複チェック
    // 新規登録の際はfindUniqueになっていたがそいのまま使うとメールアドレスは変更したくない場合に
    // 自分のメールアドレスでも寿福として判定されてしまう
    const existingUser = await prisma.user.findFirst({
        where: {
        email: validatedData.email,
            // この条件をつけることで自分以外のuser.Idが使ってないかだけ見ることができ
            // メールアドレスは変更しない場合にもエラーを出さずに更新できる
        NOT: { id: Number(userId) },
        },
    });

    // またCookieは新しく変更しない。アカウント情報を更新しても本人であることは変わらないため
    // Cookie関連のコードには触れていない


    if(existingUser) {
        redirect(`/account?message=${encodeURIComponent("このメールアドレスは他のユーザーが使用しています")}`);
    }

    await prisma.user.update({
        where: { id: Number(userId) },
        data: {
            userName: validatedData.userName,
            birthDate: birthDateObj,
            phoneNumber: validatedData.phoneNumber,
            email: validatedData.email,
        },
    });
// 更新するを押したあとイベント一覧ページに飛ぶように変更
// 更新があった場合成功していたらイベント一覧
    redirect("/participant?success=true");

}