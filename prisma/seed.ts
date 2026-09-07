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
            organizerId: users[0].id, // 田中太郎
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