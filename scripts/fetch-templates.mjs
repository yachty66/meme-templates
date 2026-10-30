// Downloads Imgflip's top 100 blank templates into public/templates and writes src/lib/templates.json.
// Run: node scripts/fetch-templates.mjs
import { writeFile, mkdir } from "node:fs/promises";

const res = await fetch("https://api.imgflip.com/get_memes");
const { success, data } = await res.json();
if (!success) throw new Error("Imgflip API failed");

await mkdir("public/templates", { recursive: true });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const out = [];
for (const [i, m] of data.memes.entries()) {
  const ext = m.url.split(".").pop();
  const file = `${slug(m.name)}.${ext}`;
  const img = await fetch(m.url);
  if (!img.ok) throw new Error(`Failed ${m.url}`);
  await writeFile(`public/templates/${file}`, Buffer.from(await img.arrayBuffer()));
  out.push({ id: m.id, rank: i + 1, name: m.name, slug: slug(m.name), file: `/templates/${file}`, width: m.width, height: m.height, boxes: m.box_count });
  process.stdout.write(".");
}
await writeFile("src/lib/templates.json", JSON.stringify(out, null, 2) + "\n");
console.log(`\nSaved ${out.length} templates`);
