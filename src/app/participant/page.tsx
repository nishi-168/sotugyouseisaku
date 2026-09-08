import { prisma } from "@/lib/prisma";

export default async function ParticipantHomePage() {
    const events = await prisma.event.findMany({
        include: {
            category: true,
            organizer: true,
            _count: {
                select: {participations: true},
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div>
            <h1>イベント一覧</h1>
            <ul>
                {events.map((event) => (
                    <li key={event.id}>
                        <p>場所: {event.location}</p>
                        <p>カテゴリー: {event.category.name}</p>
                        <p>主催者: {event.organizer.userName}</p>
                        <p>参加人数: {event._count.participations}/{event.capacity}人</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}