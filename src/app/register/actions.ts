"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as yup from "yup";
// ブラウザのバリデーションを超えてサーバーに来たデータをチェックするバリデーション
const registerSchema = yup.object({
    // trim()は前後の空白を除去している
  userName: yup.string().trim().required("名前を入力してください"),
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
// Dateで表から選ばせる形式もあったが、1900年代だととてつもなくめんどくさいから
// 各の入力欄で受け取るように設定した
export async function registerUser(formData: FormData) {
  const birthYear = formData.get("birthYear") as string;
  const birthMonth = formData.get("birthMonth") as string;
  const birthDay = formData.get("birthDay") as string;
// padStart(2, "0")これは１桁の入力でも　09みたいに２文字に統一するもの
  const birthDateString =
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
      : "";

// フォームから送られてきたバラバラの値を１つのオブジェクトにまとめている部分
// この後のtry catchに渡すための準備
  const rawData = {
    userName: formData.get("userName") as string,
    birthDate: birthDateString,
    phoneNumber: formData.get("phoneNumber") as string,
    email: formData.get("email") as string,
  };

  let validatedData;
// yupの.validate()は、チェックに引っかかった項目があるとValidationErrorを発生させます。
// それをcatchで受け止め、e instanceof yup.ValidationErrorで「本当にバリデーションのエラーか」を確認した上で、
// そのエラーメッセージ(e.message)をURLに載せて登録画面に戻しています。もし別の種類のエラー(DB接続エラーなど)であれば、
// throw eでそのまま外に投げ直し、隠さないようにしています。
  try {
    validatedData = await registerSchema.validate(rawData);
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      redirect(`/register?message=${encodeURIComponent(e.message)}`);
    }
    throw e;
  }
// yupのバリデーションを通ったあと、DBの中を見てそのメールアドレスが既に登録されていないか、別途チェックしている
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    redirect(`/register?message=${encodeURIComponent("このメールアドレスは既に登録されています")}`);
  }
// 全てのチェックを通過したらUserレコードを作成し
  const user = await prisma.user.create({
    data: {
      userName: validatedData.userName,
      birthDate: validatedData.birthDate,
      phoneNumber: validatedData.phoneNumber,
      email: validatedData.email,
    },
  });
// そのままCookieにuseridをセットしている
// そのままイベント一覧にいきログイン状態を保持している
  const cookieStore = await cookies();
  cookieStore.set("userId", user.id.toString());

  redirect("/participant");
}