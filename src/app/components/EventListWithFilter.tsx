"use client";

import { useState } from "react";
import Link from "next/link";

type Event = {
  id: number;
  location: string;
  capacity: number;
  categoryId: number;
  category: { name: string };
  organizer: { userName: string };
  _count: { participations: number };
};

type Category = {
  id: number;
  name: string;
};

export default function EventListWithFilter({
  categories,
  events,
}: {
  categories: Category[];
  events: Event[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const filteredEvents = selectedCategoryId
    ? events.filter((event) => event.categoryId === Number(selectedCategoryId))
    : events;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {selectedCategoryId && (
          <button
            onClick={() => setSelectedCategoryId("")}
            className="text-blue-600 hover:underline text-sm"
          >
            条件をクリア
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {filteredEvents.map((event) => (
          <li key={event.id}>
            <Link
              href={`/participant/${event.id}`}
              className="block border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300"
            >
              <p className="text-gray-900">場所: {event.location}</p>
              <p className="text-gray-600 text-sm">カテゴリー: {event.category.name}</p>
              <p className="text-gray-600 text-sm">主催者: {event.organizer.userName}</p>
              <p className="text-gray-600 text-sm">
                参加人数: {event._count.participations}/{event.capacity}人
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}