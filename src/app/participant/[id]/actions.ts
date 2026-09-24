// "use server";


// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { prisma } from "@/lib/prisma";

// // 他ではフォーム全体のデータをまとめて受け取る形だったが、participateはeventIdという数値を１つだけ受け取っている
// export async function participate (eventId: number) {
//     // 
//     const cookieStore = await cookies();
//     // cookieからuserIdを読み取る
//     const userId = cookieStore.get ("userId")?.value;
//     // もしcookieにuserIdが保存されていない（未ログイン状態なら）ログインページに飛ばす
//     if(!userId) {
//         redirect("/login");
//     }

//     // 引数で渡されたeventIdを使ってそのイベントを一件だけfindUniqueで取得する
//     const event = await prisma.event.findUnique({
//         where: { id: eventId },
//         include: {
//             // 現在の参加人数も一緒に取得している
//             _count: {
//                 select: { participations: true },
//             },
//         },
//     });
//     // もしイベントが存在しなければエラー
//     if (!event) {
//     redirect(`/participant/${eventId}?error=notfound`);}

//     // 取得した主催者IDとcookieから読み取った参加しようとしている人のIDを比較している
//     // cookieから受け取ると文字列なので数字に変換している
//     if (event.organizerId === Number(userId)) {
//         // 主催者と参加者が一致していた場合クエリパラメータをつけて詳細ページに戻す
//     redirect(`/participant/${eventId}?error=organizer`);}

//     // 今何人登録しているのかとそのイベントのキャパを比較している
//     // page.tsx側でdisabeledをしているが、サーバー側で不正なアクセスをされる可能性を排除
//     if (event._count.participations >= event.capacity) {
//         // 満員だった場合クエリパラメータをつけて詳細ページに戻す
//     redirect(`/participant/${eventId}?error=full`);}

//     // userIdとeventIdの組み合わせに一意性の制約を設定していないのでfindUniqueが使えない
//     // 複数条件で検索することができるfindFirstを使ってすでに同じ組み合わせのparticipationが存在するか
//     // 確認している
//     const existingParticipation = await prisma.participation.findFirst({
//         where: {
//             userId: Number(userId),
//             eventId: eventId,
//         },
//     });

//     // 参加登録してあったら?error=alreadyというエラーをつけてイベントの詳細ページに戻る
//     if (existingParticipation) {
//         redirect(`/participant/${eventId}?error=already`);
//     }

//     // 上の二つどちらにも当てはまらない場合こっちに進む
//     // 配列になっているのはバラバラの処理ではなくどちらも一塊の処理として実行しているから
//     // $transactionで包むことで、両方が成功するか、両方とも実行されないという保証
//     // もし$transactionを使わないと参加登録はされたのに、参加カウントはされてないと言った矛盾が生じる
//     await prisma.$transaction([
//         // Participationテーブルに新しい行を作成している　userIdとeventIdをセットのしてこのユーザーがこのイベントに参加したという情報を渡している
//         prisma.participation.create({
//             data: {
//                 userId: Number(userId),
//                 eventId: eventId,
//             },
//         }),
//         // Userテーブルの中でidとuserIdと一致する行を探してその人の参加回数を１足す
//         prisma.user.update({
//             where: { id: Number(userId) },
//             data: { participationCount: { increment: 1 } },
//         }),
//     ]);

//     redirect(`/participant/${eventId}?success=true`);
// }


// "use server";

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { prisma } from "@/lib/prisma";
// import { Prisma } from "@/generated/prisma/client";

// export async function participate(eventId: number) {
//   const cookieStore = await cookies();
//   const userId = cookieStore.get("userId")?.value;

//   if (!userId) {
//     redirect("/login");
//   }

//   const event = await prisma.event.findUnique({
//     where: { id: eventId },
//   });

//   if (!event) {
//     redirect(`/participant/${eventId}?error=notfound`);
//   }

//   if (event.organizerId === Number(userId)) {
//     redirect(`/participant/${eventId}?error=organizer`);
//   }

//    //   transaction全体をtry catchで囲んだ
//    // @@unique制約に違反するデータを保存しようとすると、Prismaがエラーを投げるようになるから
//    // このエラーを放置しておくとユーザーには意味不明なエラー画面が表示される
//   try {
//     // 配列を渡す形から、関数を渡す形にした。配列だとまとめて実行するだけになるので、条件によって処理を中断するような分岐を挟むことができない
//     // 関数ならifなどを使ってチェックしてから登録するという流れにすることができる
//     await prisma.$transaction(async (tx) => {
//       const currentCount = await tx.participation.count({
//         where: { eventId },
//       });

//       if (currentCount >= event.capacity) {
//         throw new Error("FULL");
//       }

//       const existing = await tx.participation.findFirst({
//         where: {
//           userId: Number(userId),
//           eventId: eventId,
//         },
//       });

//       if (existing) {
//         throw new Error("ALREADY");
//       }

//       await tx.participation.create({
//         data: {
//           userId: Number(userId),
//           eventId: eventId,
//         },
//       });

//       await tx.user.update({
//         where: { id: Number(userId) },
//         data: { participationCount: { increment: 1 } },
//       });
//     });
//   } catch (e) {
//     if (e instanceof Error && e.message === "FULL") {
//       redirect(`/participant/${eventId}?error=full`);
//     }
//     if (e instanceof Error && e.message === "ALREADY") {
//       redirect(`/participant/${eventId}?error=already`);
//     }
//     // 発生したエラーが、Prismaが検知した既知のエラーでありかつそのエラーコードがP2002(一意制約違反)であるかを確認
//     // P2002という数字はPrismaが定めている固有のエラーコードで@@uniqueなおで指定した制約に違反したときに、必ずこのコードが返ってくる
//     // もし2002以外の予期しない別のエラーが発生した時に誤ったメッセージを出してしまうのを避けて、重複が原因のエラーだけをユーザーにわかりやすく表示するため
//     if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
//       redirect(`/participant/${eventId}?error=already`);
//     }
//     throw e;
//   }

//   redirect(`/participant/${eventId}?success=true`);
// }

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Prisma } from "@/generated/prisma/client";

export async function participate(eventId: number) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    redirect(`/participant/${eventId}?error=notfound`);
  }

  if (event.organizerId === user.id) {
    redirect(`/participant/${eventId}?error=organizer`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const currentCount = await tx.participation.count({
        where: { eventId },
      });

      if (currentCount >= event.capacity) {
        throw new Error("FULL");
      }

      const existing = await tx.participation.findFirst({
        where: {
          userId: user.id,
          eventId: eventId,
        },
      });

      if (existing) {
        throw new Error("ALREADY");
      }

      await tx.participation.create({
        data: {
          userId: user.id,
          eventId: eventId,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { participationCount: { increment: 1 } },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FULL") {
      redirect(`/participant/${eventId}?error=full`);
    }
    if (e instanceof Error && e.message === "ALREADY") {
      redirect(`/participant/${eventId}?error=already`);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(`/participant/${eventId}?error=already`);
    }
    throw e;
  }

  redirect(`/participant/${eventId}?success=true`);
}