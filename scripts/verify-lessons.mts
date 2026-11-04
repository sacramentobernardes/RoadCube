// Confere se a ordem da trilha em curriculum.ts é a mesma da tabela `lessons`,
// que o banco usa para decidir quais lições estão desbloqueadas.
// Uso: npm run verify:lessons
import { readdirSync, readFileSync } from "node:fs";

const curriculum = readFileSync("src/data/curriculum.ts", "utf8");
const soon = new Set([...curriculum.matchAll(/id: "(m\d-[\w-]+)",(?:(?!\n {6}\},).)*?comingSoon: true/gs)].map((m) => m[1]));
const app = [...curriculum.matchAll(/(?:id: |algLesson\(\s*)"(m\d-[\w-]+)"/g)].map((m) => m[1]).filter((id) => !soon.has(id));

const sql = readdirSync("supabase/migrations").map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");
const block = sql.slice(sql.indexOf("insert into public.lessons"));
const db = [...block.slice(0, block.indexOf(";")).matchAll(/\('(m\d-[\w-]+)', (\d+)\)/g)]
  .sort((a, b) => Number(a[2]) - Number(b[2]))
  .map((m) => m[1]);

if (app.join() !== db.join()) {
  console.error(`A trilha e a tabela lessons divergem.\ncurriculum: ${app.join(" ")}\nbanco:      ${db.join(" ")}`);
  process.exit(1);
}
console.log(`${app.length} lições na mesma ordem`);
