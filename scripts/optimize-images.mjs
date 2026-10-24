import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(root, "src/assets/images");
const thumbnailsRoot = path.join(root, "src/assets/thumbnails");
const optimizedRoot = path.join(root, "src/assets/optimized");
const ogImagePath = path.join(root, "public/og-image.jpg");

const THUMBNAIL_WIDTH = 720;
const THUMBNAIL_QUALITY = 72;
const FULL_MAX_SIZE = 1800;
const FULL_QUALITY = 80;

async function* walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

async function isUpToDate(source, output) {
  try {
    const [sourceStat, outputStat] = await Promise.all([
      stat(source),
      stat(output),
    ]);
    return outputStat.mtimeMs >= sourceStat.mtimeMs;
  } catch {
    return false;
  }
}

async function generate(source, output, transform) {
  if (await isUpToDate(source, output)) {
    return false;
  }

  await mkdir(path.dirname(output), { recursive: true });
  await transform(sharp(source).rotate()).toFile(output);
  return true;
}

async function main() {
  const files = [];
  for await (const file of walk(sourceRoot)) {
    if (/\.(jpe?g|png)$/i.test(file)) {
      files.push(file);
    }
  }

  let generated = 0;

  for (const source of files) {
    const relative = path.relative(sourceRoot, source);
    const parsed = path.parse(relative);
    const outputName = `${parsed.name}.webp`;
    const thumbnailOutput = path.join(thumbnailsRoot, parsed.dir, outputName);
    const optimizedOutput = path.join(optimizedRoot, parsed.dir, outputName);

    const thumbnailCreated = await generate(
      source,
      thumbnailOutput,
      (image) =>
        image
          .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
          .webp({ quality: THUMBNAIL_QUALITY, effort: 5 }),
    );

    const optimizedCreated = await generate(
      source,
      optimizedOutput,
      (image) =>
        image
          .resize({
            width: FULL_MAX_SIZE,
            height: FULL_MAX_SIZE,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: FULL_QUALITY, effort: 5 }),
    );

    generated += Number(thumbnailCreated) + Number(optimizedCreated);
  }

  const ogSource = path.join(
    sourceRoot,
    "commission",
    "Social Media Marketing Poster.png",
  );
  try {
    await stat(ogSource);
    await generate(ogSource, ogImagePath, (image) =>
      image
        .resize(1200, 630, { fit: "cover", position: "attention" })
        .jpeg({ quality: 82, mozjpeg: true }),
    );
  } catch {
    // Optional social-share image: skip if the source artwork is missing.
  }

  console.log(
    `Image optimization complete: ${generated} file${generated === 1 ? "" : "s"} generated from ${files.length} source image${files.length === 1 ? "" : "s"}.`,
  );
}

main().catch((error) => {
  console.error("Image optimization failed:", error);
  process.exitCode = 1;
});
