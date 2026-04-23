import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..");
const schemaPath = path.join(backendRoot, "prisma", "schema.prisma");

async function getJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const nextPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getJsFiles(nextPath);
      }

      return nextPath.endsWith(".js") ? [nextPath] : [];
    })
  );

  return nested.flat();
}

function parseModelNames(schemaSource) {
  return [...schemaSource.matchAll(/^model\s+([A-Za-z_][A-Za-z0-9_]*)\s+\{/gm)].map(
    (match) => match[1]
  );
}

const schemaSource = await readFile(schemaPath, "utf8");
const modelNames = parseModelNames(schemaSource);
const sourceFiles = (await getJsFiles(__dirname)).filter(
  (filePath) => !filePath.endsWith("runSchemaAudit.js")
);
const sources = await Promise.all(
  sourceFiles.map(async (filePath) => ({
    filePath,
    source: await readFile(filePath, "utf8"),
  }))
);

const usage = modelNames.map((modelName) => {
  const marker = `prisma.${modelName}`;
  const hits = sources
    .filter(({ source }) => source.includes(marker))
    .map(({ filePath }) => path.relative(backendRoot, filePath));

  return {
    model: modelName,
    references: hits.length,
    files: hits,
  };
});

console.log("\nPrisma model usage audit\n");

for (const item of usage) {
  console.log(`- ${item.model}: ${item.references} direct reference(s)`);
  for (const filePath of item.files) {
    console.log(`  ${filePath}`);
  }
}

const candidates = usage.filter((item) => item.references === 0);

console.log("\nCandidates for manual DB cleanup review:");

if (!candidates.length) {
  console.log("None");
} else {
  for (const item of candidates) {
    console.log(`- ${item.model}`);
  }
}

console.log(
  "\nNote: zero direct Prisma queries does not automatically mean a table is safe to drop. Review relations, seeds, and raw SQL first."
);
