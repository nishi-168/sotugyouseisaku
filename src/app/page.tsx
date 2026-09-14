// このファイルはpnpm.devをした時、http://localhost:3000にアクセスしたときに表示されるページ
// Next.jsが提供しているredirect機能　別のURLへ移動させる機能をimportしている
import { redirect } from "next/navigation";

// ページコンポーネントの定義　RootPageという関数
// Next.jsのApp Routerではapp/page.tsxのdefault exportがそのページのURLとして使われる
export default function RootPage() {
  // 初期はログインしていない状態だが
  // ログイン状態に関わらずイベント一覧ページを見ることができる

  // pnpm devをしたらRoot Page関数が働く
  // Root Page関数の中は/participantにリダイレクトする
  // アプリのトップページとしてparticioantを表示させたいから
  // participant、login、registerなどを同階層のコンポーネントにしたかった
  // これを介さないと他の機能がparticipantの配下になってしまうと想定と変わってしまうから
    redirect("/participant");
}
