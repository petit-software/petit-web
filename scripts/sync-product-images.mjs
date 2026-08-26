import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const contentRoot = path.join(projectRoot, "content", "products");
const publicRoot = path.join(projectRoot, "public", "products");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);

function findCoverImage(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).find((entry) => {
    if (!entry.isFile()) return false;

    const extension = path.extname(entry.name).toLowerCase();
    const basename = path.basename(entry.name, extension).toLowerCase();
    return basename === "cover" && imageExtensions.has(extension);
  })?.name;
}

function filesAreEqual(source, destination) {
  if (!fs.existsSync(destination)) return false;

  const sourceStat = fs.statSync(source);
  const destinationStat = fs.statSync(destination);
  if (sourceStat.size !== destinationStat.size) return false;

  return fs.readFileSync(source).equals(fs.readFileSync(destination));
}

let copied = 0;

for (const entry of fs.readdirSync(contentRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const sourceDirectory = path.join(contentRoot, entry.name);
  const cover = findCoverImage(sourceDirectory);
  if (!cover) continue;

  const source = path.join(sourceDirectory, cover);
  const destinationDirectory = path.join(publicRoot, entry.name);
  const destination = path.join(destinationDirectory, cover);
  if (filesAreEqual(source, destination)) continue;

  fs.mkdirSync(destinationDirectory, { recursive: true });
  fs.copyFileSync(source, destination);
  copied += 1;
}

console.log(
  copied === 0
    ? "Product images are already up to date."
    : `Synced ${copied} product image${copied === 1 ? "" : "s"}.`,
);
