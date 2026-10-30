"use client";

import { Anton } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { defaultBoxes, drawMeme, layoutBox, type TextBox } from "@/lib/render";
import type { Template } from "@/lib/templates";

const anton = Anton({ weight: "400", subsets: ["latin"] });
const FONT = anton.style.fontFamily;

let measureCtx: CanvasRenderingContext2D | null = null;
function measure() {
  if (typeof document === "undefined") return null;
  measureCtx ??= document.createElement("canvas").getContext("2d");
  return measureCtx;
}

type Drag = { i: number; mode: "move" | "resize"; startX: number; startY: number; box: TextBox };

export default function Editor({ template: t }: { template: Template }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fontReady, setFontReady] = useState(false);
  const [boxes, setBoxes] = useState<TextBox[]>(() => defaultBoxes(t.boxes));
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = t.file;
    document.fonts.load(`48px ${FONT}`).then(() => setFontReady(true));
  }, [t.file]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && img) drawMeme(ctx, img, boxes, FONT);
  }, [img, boxes, fontReady]);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const rect = stageRef.current!.getBoundingClientRect();
      const dx = (e.clientX - drag.startX) / rect.width;
      const dy = (e.clientY - drag.startY) / rect.height;
      setBoxes((bs) =>
        bs.map((b, i) => {
          if (i !== drag.i) return b;
          if (drag.mode === "resize") return { ...b, w: Math.min(1 - b.x, Math.max(0.1, drag.box.w + dx)) };
          return { ...b, x: Math.min(1 - b.w, Math.max(0, drag.box.x + dx)), y: Math.min(0.98, Math.max(-0.02, drag.box.y + dy)) };
        }),
      );
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag]);

  const update = (i: number, patch: Partial<TextBox>) => setBoxes((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const startDrag = (e: React.PointerEvent, i: number, mode: Drag["mode"]) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(i);
    setDrag({ i, mode, startX: e.clientX, startY: e.clientY, box: boxes[i] });
  };

  const toBlob = () => new Promise<Blob>((resolve) => canvasRef.current!.toBlob((b) => resolve(b!), "image/png"));
  const download = async () => {
    const url = URL.createObjectURL(await toBlob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.slug}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": toBlob() })]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const ctx = measure();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex justify-center">
        <div ref={stageRef} className="relative w-full max-w-[720px] touch-none select-none" style={{ aspectRatio: `${t.width} / ${t.height}` }}>
          <canvas ref={canvasRef} width={t.width} height={t.height} className="absolute inset-0 h-full w-full rounded-lg" />
          {ctx &&
            boxes.map((b, i) => {
              const h = layoutBox(ctx, b, t.width, FONT).height / t.height;
              return (
                <div
                  key={i}
                  onPointerDown={(e) => startDrag(e, i, "move")}
                  className={`absolute cursor-move rounded border-2 border-dashed ${i === active ? "border-lime-400" : "border-white/40 hover:border-white/80"}`}
                  style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${h * 100}%` }}
                >
                  {!b.text && <span className="absolute inset-0 flex items-center justify-center text-xs text-white/70 drop-shadow">Text {i + 1}</span>}
                  <span
                    onPointerDown={(e) => startDrag(e, i, "resize")}
                    className="absolute -right-1.5 top-1/2 h-5 w-2.5 -translate-y-1/2 cursor-ew-resize rounded-sm bg-lime-400"
                  />
                </div>
              );
            })}
        </div>
      </div>

      <aside className="space-y-3">
        {boxes.map((b, i) => (
          <div key={i} onFocus={() => setActive(i)} className={`rounded-xl border p-3 ${i === active ? "border-lime-400/50 bg-zinc-900" : "border-zinc-800 bg-zinc-900/50"}`}>
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Text {i + 1}</span>
              <button onClick={() => setBoxes((bs) => bs.filter((_, j) => j !== i))} className="hover:text-red-300">
                Remove
              </button>
            </div>
            <textarea
              value={b.text}
              onChange={(e) => update(i, { text: e.target.value })}
              rows={2}
              placeholder="Type here…"
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <label className="flex items-center gap-2">
                Size
                <input type="range" min={0.025} max={0.16} step={0.005} value={b.size} onChange={(e) => update(i, { size: +e.target.value })} className="w-24 accent-lime-400" />
              </label>
              <button onClick={() => update(i, { color: b.color === "white" ? "black" : "white" })} className="rounded border border-zinc-700 px-2 py-0.5">
                {b.color === "white" ? "White" : "Black"}
              </button>
              <button onClick={() => update(i, { outline: !b.outline })} className={`rounded border px-2 py-0.5 ${b.outline ? "border-zinc-500 text-zinc-200" : "border-zinc-800"}`}>
                Outline
              </button>
              <button onClick={() => update(i, { caps: !b.caps })} className={`rounded border px-2 py-0.5 ${b.caps ? "border-zinc-500 text-zinc-200" : "border-zinc-800"}`}>
                CAPS
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            setBoxes((bs) => [...bs, { ...defaultBoxes(1)[0], y: 0.45 }]);
            setActive(boxes.length);
          }}
          className="w-full rounded-xl border border-dashed border-zinc-700 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
        >
          + Add text
        </button>
        <p className="text-xs text-zinc-500">Drag a box to move it. Drag the green handle to make it wider.</p>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button onClick={download} disabled={!img} className="rounded-xl bg-lime-400 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50">
            Download PNG
          </button>
          <button onClick={copy} disabled={!img} className="rounded-xl border border-zinc-700 py-2.5 text-sm hover:border-zinc-500 disabled:opacity-50">
            {copied ? "Copied!" : "Copy image"}
          </button>
        </div>
        <a href={t.file} download className="block text-center text-xs text-zinc-500 hover:text-zinc-300">
          Download blank template
        </a>
      </aside>
    </div>
  );
}
