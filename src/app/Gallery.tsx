"use client";

import Link from "next/link";
import { useState } from "react";
import { TEMPLATES } from "@/lib/templates";

export default function Gallery() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = query ? TEMPLATES.filter((t) => t.name.toLowerCase().includes(query)) : TEMPLATES;

  return (
    <>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search templates… (drake, gru, buttons)"
        className="mb-6 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
      />
      {list.length === 0 && <p className="text-sm text-zinc-500">No template matches “{q}”.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {list.map((t) => (
          <Link key={t.id} href={`/t/${t.slug}`} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-500">
            <div className="flex aspect-square items-center justify-center bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.file} alt={t.name} loading="lazy" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-[11px] tabular-nums text-zinc-500">#{t.rank}</span>
              <span className="truncate text-sm">{t.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
