// Shared text layout so the live preview and the downloaded PNG are identical.

export type TextBox = {
  text: string;
  x: number; // left edge, fraction of image width
  y: number; // top edge, fraction of image height
  w: number; // width, fraction of image width
  size: number; // font size, fraction of image width
  color: "white" | "black";
  outline: boolean;
  caps: boolean;
};

export function defaultBoxes(count: number): TextBox[] {
  const n = Math.max(1, count);
  return Array.from({ length: n }, (_, i) => ({
    text: "",
    x: 0.05,
    y: n === 1 ? 0.04 : n === 2 ? (i === 0 ? 0.04 : 0.8) : (i / n) * 0.9 + 0.03,
    w: 0.9,
    size: n > 3 ? 0.055 : 0.075,
    color: "white",
    outline: true,
    caps: true,
  }));
}

export function layoutBox(ctx: CanvasRenderingContext2D, box: TextBox, W: number, font: string) {
  const px = Math.max(8, box.size * W);
  ctx.font = `${px}px ${font}`;
  const maxW = box.w * W;
  const text = box.caps ? box.text.toUpperCase() : box.text;
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxW && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  const lineH = px * 1.12;
  return { px, lines, lineH, height: Math.max(lineH, lines.length * lineH) };
}

export function drawMeme(ctx: CanvasRenderingContext2D, img: HTMLImageElement, boxes: TextBox[], font: string) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineJoin = "round";
  for (const box of boxes) {
    if (!box.text.trim()) continue;
    const { px, lines, lineH } = layoutBox(ctx, box, W, font);
    const cx = (box.x + box.w / 2) * W;
    lines.forEach((line, i) => {
      const y = box.y * H + i * lineH;
      if (box.outline) {
        ctx.strokeStyle = box.color === "white" ? "black" : "white";
        ctx.lineWidth = Math.max(2, px / 7);
        ctx.strokeText(line, cx, y);
      }
      ctx.fillStyle = box.color;
      ctx.fillText(line, cx, y);
    });
  }
}
