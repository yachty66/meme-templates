import Gallery from "./Gallery";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Meme Templates</h1>
        <p className="mt-1 text-sm text-zinc-400">The 100 most popular templates on Imgflip. Pick one, add text, download a clean PNG. No watermark.</p>
      </header>
      <Gallery />
    </div>
  );
}
