import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import Editor from "./Editor";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTemplate((await params).slug);
  return { title: t ? `${t.name} meme template` : "Meme template" };
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTemplate((await params).slug);
  if (!t) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
        ← All templates
      </Link>
      <h1 className="mb-5 mt-2 text-2xl font-semibold tracking-tight">{t.name}</h1>
      <Editor template={t} />
    </div>
  );
}
