import fs from "node:fs";
import path from "node:path";

const source = path.resolve(process.argv[2] || "src");
const production = "https://images.clothingloop.org";
const extensions = new Set([".ts", ".tsx", ".astro", ".js", ".jsx", ".css", ".html", ".svg"]);

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(filename);
    else if (entry.name === "image_proxy.ts") {
      // Restored database values still contain the original production hostname.
      fs.writeFileSync(filename, `export default function OriginalImageToProxy(
  image: string | null | undefined,
  opts: string,
): string | null | undefined {
  if (!image) return image;
  for (const prefix of ["${production}/original/", "/images/original/"]) {
    if (image.startsWith(prefix)) return \`/images/\${opts}/\${image.slice(prefix.length)}\`;
  }
  return image.startsWith("${production}/")
    ? "/images" + image.slice(${production.length})
    : image;
}
`);
    } else if (extensions.has(path.extname(filename)) && !entry.name.includes(".test.")) {
      const text = fs.readFileSync(filename, "utf8");
      if (text.includes(production)) fs.writeFileSync(filename, text.replaceAll(production, "/images"));
    }
  }
}

visit(source);
