import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "docs");
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".webmanifest":"application/manifest+json; charset=utf-8" };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    let path = join(root, safe === "/" ? "index.html" : safe);
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
    response.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream", "Cache-Control":"no-store" });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404, { "Content-Type":"text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(4173, "127.0.0.1", () => console.log("Preview: http://127.0.0.1:4173"));

