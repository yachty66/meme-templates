# Meme Templates

The 100 most popular meme templates on Imgflip, with a simple editor. Pick a template, type your text, drag it into place, and download a clean PNG. There is no watermark: the blank templates are stored in this repo and the text is drawn in the browser.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Edit a meme

Each template has as many text boxes as the meme usually needs. Drag a box to move it, and drag its green handle to make it wider. Each box has its own size, colour, outline and caps setting. Download PNG saves the meme at the template's full resolution. Copy image puts it on the clipboard, ready to paste into a post.

## Refresh the templates

The list comes from Imgflip's public API, which returns its current top 100.

```bash
node scripts/fetch-templates.mjs
```

This downloads the blank images into `public/templates` and rewrites `src/lib/templates.json`.

Most templates are stills from films, TV and stock photos. Use them for memes, not for ads.
