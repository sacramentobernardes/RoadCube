// Confere se a ordem da trilha em curriculum.ts é a mesma da tabela `lessons`,
// que o banco usa para decidir quais lições estão desbloqueadas.
// Uso: npm run verify:lessons
import { readdirSync, readFileSync } from "node:fs";

const curriculum = readFileSync("src/data/curriculum.ts", "utf8");
const soon = new Set([...curriculum.matchAll(/id: "(m\d-[\w-]+)",(?:(?!\n {6}\},).)*?comingSoon: true/gs)].map((m) => m[1]));
const app = [...curriculum.matchAll(/(?:id: |algLesson\(\s*)"(m\d-[\w-]+)"/g)].map((m) => m[1]).filter((id) => !soon.has(id));

// As migrations rodam em ordem; uma posição definida depois substitui a anterior.
const sql = readdirSync("supabase/migrations").sort().map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");
const positions = new Map<string, number>();
for (const insert of sql.matchAll(/insert into public\.lessons[^;]*;/g)) {
  for (const [, id, position] of insert[0].matchAll(/\('(m\d-[\w-]+)', (\d+)\)/g)) positions.set(id, Number(position));
}
const db = [...positions].sort((a, b) => a[1] - b[1]).map(([id]) => id);
const taken = new Set(positions.values());
if (taken.size !== positions.size) {
  console.error("Duas lições ficaram com a mesma posição na tabela lessons.");
  process.exit(1);
}

if (app.join() !== db.join()) {
  console.error(`A trilha e a tabela lessons divergem.\ncurriculum: ${app.join(" ")}\nbanco:      ${db.join(" ")}`);
  process.exit(1);
}
console.log(`${app.length} lições na mesma ordem`);
