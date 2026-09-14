import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });




async function main() {


    await prisma.participation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();


    const categories = await Promise.all(
        ["飲み会","音楽","スポーツ","ゲーム","その他"].map((name) =>
            prisma.category.create({ data: {name}})
        )
    );

    const users = await Promise.all([
        prisma.user.create({
            data:{
                userName: "西皓輔",
                birthDate: new Date("2003-07-11"),
                phoneNumber: "070-1234-5678",
                email: "kouske.nishi@example.com"
            },
        }),
        prisma.user.create({
            data:{
                userName: "田中太郎",
                birthDate: new Date("2006-07-12"),
                phoneNumber: "070-8765-4321",
                email: "taro.tanaka@example.com"
            },
        }),
        prisma.user.create({
            data:{
                userName: "one ok rock公式",
                birthDate: new Date("2007-04-25"),
                phoneNumber: "070-0109-6900",
                email: "oneokrock@example.com"
            },
        }),

        prisma.user.create({
            data: {
                userName: "佐藤花子",
                birthDate: new Date("1998-02-14"),
                phoneNumber: "080-1111-2222",
                email: "hanako.sato@example.com",
            },
        }),
        prisma.user.create({
        data: {
                userName: "鈴木一郎",
                birthDate: new Date("1990-11-03"),
                phoneNumber: "080-3333-4444",
                email: "ichiro.suzuki@example.com",
            },
        }),
        prisma.user.create({
        data: {
                userName: "高橋美咲",
                birthDate: new Date("2000-09-21"),
                phoneNumber: "090-5555-6666",
                email: "misaki.takahashi@example.com",
            },
        }),
        prisma.user.create({
        data: {
                userName: "渡辺健太",
                birthDate: new Date("1995-03-08"),
                phoneNumber: "090-7777-8888",
                email: "kenta.watanabe@example.com",
            },
        }),
        prisma.user.create({
        data: {
                userName: "伊藤あかり",
                birthDate: new Date("2001-12-30"),
                phoneNumber: "080-9999-0000",
                email: "akari.ito@example.com",
            },
        }),
        prisma.user.create({
        data: {
                userName: "山本ボードゲーム同好会",
                birthDate: new Date("1999-06-17"),
                phoneNumber: "070-2222-3333",
                email: "yamamoto.bg@example.com",
            },
        }),
        prisma.user.create({
        data: {
                userName: "中村サッカークラブ",
                birthDate: new Date("1988-08-08"),
                phoneNumber: "070-4444-5555",
                email: "nakamura.fc@example.com",
            },
        }),
    ]);


    const event1 = await prisma.event.create({
        data: {
            name: "研修お疲れ様飲み会",
            location: "渋谷区居酒屋〇〇",
            eventDatetime: new Date("2026-01-15T19:00:00"),
            capacity: 10,
            description: "気軽に飲みましょう!",
            categoryId: categories[0].id, // 飲み会
            deadline: new Date("2026-01-10T23:59:59"),
            organizerId: users[1].id, // 田中太郎
        },
    });

    const event2 = await prisma.event.create({
        data: {
            name: "one ok rockドームツアー2026",
            location: "東京ドーム",
            eventDatetime: new Date("2026-04-25T18:00:00"),
            capacity: 50000,
            description: "one ok rockのライブに行こう!",
            categoryId: categories [1].id, // 音楽
            deadline: new Date("2026-04-20T23:59:59"),
            organizerId: users[2].id, // one ok rock公式
        },
    });

    const event3 = await prisma.event.create({
      data: {
        name: "初心者フットサル大会",
        location: "都内スポーツセンター",
        eventDatetime: new Date("2026-10-05T13:00:00"),
        capacity: 20,
        description: "経験不問、みんなで楽しくやりましょう",
        categoryId: categories[2].id, // スポーツ
        deadline: new Date("2026-09-28T23:59:59"),
        organizerId: users[9].id, // 中村サッカークラブ
      },
    });

    const event4 = await prisma.event.create({
      data: {
        name: "ボードゲーム交流会",
        location: "新宿ボードゲームカフェ",
        eventDatetime: new Date("2026-09-20T14:00:00"),
        capacity: 12,
        description: "初めての方も大歓迎です",
        categoryId: categories[3].id, // ゲーム
        deadline: new Date("2026-09-18T23:59:59"),
        organizerId: users[8].id, // 山本ボードゲーム同好会
      },
    });

    const event5 = await prisma.event.create({
      data: {
        name: "近所の公園清掃ボランティア",
        location: "二子玉川公園",
        eventDatetime: new Date("2026-09-27T09:00:00"),
        capacity: 30,
        description: "地域のみんなできれいにしましょう",
        categoryId: categories[4].id, // その他
        deadline: new Date("2026-09-25T23:59:59"),
        organizerId: users[4].id, // 鈴木一郎
      },
    });

    const event6 = await prisma.event.create({
      data: {
        name: "女子会ディナー",
        location: "恵比寿イタリアン〇〇",
        eventDatetime: new Date("2026-10-10T18:30:00"),
        capacity: 6,
        description: "美味しいご飯とおしゃべりを楽しみましょう",
        categoryId: categories[0].id, // 飲み会
        deadline: new Date("2026-10-08T23:59:59"),
        organizerId: users[3].id, // 佐藤花子
      },
    });

    const event7 = await prisma.event.create({
      data: {
        name: "弾き語りライブナイト",
        location: "下北沢ライブハウス",
        eventDatetime: new Date("2026-11-02T19:30:00"),
        capacity: 50,
        description: "アコースティックな夜をお楽しみください",
        categoryId: categories[1].id, // 音楽
        deadline: new Date("2026-10-30T23:59:59"),
        organizerId: users[6].id, // 渡辺健太
      },
    });

    const event8 = await prisma.event.create({
      data: {
        name: "朝活ランニングサークル",
        location: "皇居周辺",
        eventDatetime: new Date("2026-09-21T06:30:00"),
        capacity: 15,
        description: "無理のないペースでみんなで走りましょう",
        categoryId: categories[2].id, // スポーツ
        deadline: new Date("2026-09-19T23:59:59"),
        organizerId: users[5].id, // 高橋美咲
      },
    });

    const event9 = await prisma.event.create({
      data: {
        name: "対戦格闘ゲーム大会",
        location: "秋葉原ゲームセンター",
        eventDatetime: new Date("2026-10-18T13:00:00"),
        capacity: 32,
        description: "トーナメント形式で優勝を目指そう",
        categoryId: categories[3].id, // ゲーム
        deadline: new Date("2026-10-15T23:59:59"),
        organizerId: users[0].id, // 西皓輔
      },
    });

    const event10 = await prisma.event.create({
      data: {
        name: "読書会:今月のおすすめ本を語る",
        location: "代官山カフェ",
        eventDatetime: new Date("2026-09-30T15:00:00"),
        capacity: 8,
        description: "ジャンル問わず、好きな本について語りましょう",
        categoryId: categories[4].id, // その他
        deadline: new Date("2026-09-28T23:59:59"),
        organizerId: users[7].id, // 伊藤あかり
      },
    });


    
    await prisma.participation.create({
        data: {
            userId: users[1].id,
            eventId: event1.id
        },
    });

    await prisma.participation.create({
        data: {
            userId: users[0].id,
            eventId: event2.id
        },
    });


// 主催回数・参加回数を、実際のデータをもとに集計して反映する
for (const user of users) {
  const hostedCount = await prisma.event.count({
    where: { organizerId: user.id },
  });
  const participationCount = await prisma.participation.count({
    where: { userId: user.id },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { hostedCount, participationCount },
  });
}

console.log("シード値投入完了");
    console.log("シード値投入完了")
}


main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

