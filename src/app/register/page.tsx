import { registerUser } from "./actions";

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>;
}) {
    const { message } = await searchParams;
    // 基本バリデーションはブラウザ側でやってくれる　に段階チェック用
    return (
        <div>
      <h1>新規登録</h1>
      {/* サーバー側で弾かれたエラーメッセージを表示する場所 */}
      {message && <p>{decodeURIComponent(message)}</p>}
      <form action={registerUser}>
        <div>
          <label>名前</label>
          <input type="text" name="userName" required />
        </div>
        <div>
          <label>生年月日</label>
         <input 
            type="number" 
            name="birthYear" 
            placeholder="年(例: 2000)" 
            min="1900"
            max="2050"
            required
             />
            年
         <input
            type="number"
            name="birthMonth"
            placeholder="月"
            min="1"
            max="12"
            required
          />
          月
         <input
            type="number"
            name="birthDay"
            placeholder="日"
            min="1"
            max="31"
            required
          />
          日
        </div>
        <div>
          <label>電話番号</label>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="例：090-1234-5678"
            required
          />
        </div>
        <div>
          <label>メールアドレス</label>
          <input type="email" name="email" required />
        </div>
        <button type="submit">登録する</button>
      </form>
    </div>
    );
}