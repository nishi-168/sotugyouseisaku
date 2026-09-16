"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
// yupを使えるようにしている
import * as yup from "yup";

// ブラウザのバリデーションを超えてサーバーに来たデータをチェックするバリデーション
// オブジェクトとして１つにまとめることで後から把握しやすくなる
const registerSchema = yup.object({

    // user.nameはstring型で、trim()は前後の空白を除去している。　requiredはから出ないことをチェックしている
  userName: yup.string().trim().required("名前を入力してください"),
  birthDate: yup
  // 日付として解釈できるかのチェック
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

// フォームが送信された時に呼ばれる関数　(formData: FormData)はServer Actionがフォームのactionに直接指定された時に
// Next.jsが自動的にフォームの入力内容をこの形で渡してくれるということ
// フォームで受け取った値を都営出している　as string ではこれは文字列として扱う
// FormData型はJSが標準で用意しているフォームのデータをまとめて使う型
// get()などの入力補完やエラーの事前検出などをしてくれる
export async function registerUser(formData: FormData) {
  const birthYear = formData.get("birthYear") as string;
  const birthMonth = formData.get("birthMonth") as string;
  const birthDay = formData.get("birthDay") as string;

// padStart(2, "0")これは１桁の入力でも　09みたいに２文字に統一するもの
  const birthDateString =
  // ３つの値が全てtrueなら日付文字列に組み立てる
    birthYear && birthMonth && birthDay
      ? `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
      : "";

// フォームから送られてきたバラバラの値を１つのオブジェクトにまとめている部分
// この後のtry catchに渡すための準備
// birtDateだけ直前で組み立てた値を使っている
  const rawData = {
    userName: formData.get("userName") as string,
    birthDate: birthDateString,
    phoneNumber: formData.get("phoneNumber") as string,
    email: formData.get("email") as string,
  };

  // これからtryの中で値を代入する変数を宣言している
  // letなのはtry５でもこの変数を使うためで、try後に変数が固定化されてしまうとtryの外からは変数が見えなくなってしまうから
  let validatedData;

// yupの.validate()は、チェックに引っかかった項目があるとValidationErrorを発生させます。
// それをcatchで受け止め、e instanceof yup.ValidationErrorで「本当にバリデーションのエラーか」を確認した上で、
// そのエラーメッセージ(e.message)をURLに載せて登録画面に戻しています。もし別の種類のエラー(DB接続エラーなど)であれば、
// throw eでそのまま外に投げ直し、隠さないようにしています。

// registerSchema.validate(rawData)でチェックが成功すれば結果をvalidateDataに代入する
// もし失敗するとcatchで受け取りエラーを返す
  try {
    validatedData = await registerSchema.validate(rawData);
  } catch (e) {
    // もしエラーが指定したyup バイデーションであればエラー内容を返す
    if (e instanceof yup.ValidationError) {
      // encodeURIComponentは日本画や記号を含むメッセージをURLとして安全な形に変換している
      redirect(`/register?message=${encodeURIComponent(e.message)}`);
    }
    // もし予期しないエラーであればそのままエラーを投げる
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
// ここで使っているvalidatedDataはすでにエラーチェック済みの安全なデータをDBに送っている
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