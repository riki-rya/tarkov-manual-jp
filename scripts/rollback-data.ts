import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";

const DATA_DIR = join(process.cwd(), "data");

const DATA_TYPES = ["items", "tasks", "hideout", "traders"] as const;
type DataType = (typeof DATA_TYPES)[number];

const FILE_NAMES: Record<DataType, string> = {
  items: "item",
  tasks: "task",
  hideout: "hideout",
  traders: "trader",
};

function getSnapshots(dataType: DataType): string[] {
  const snapshotsDir = join(DATA_DIR, "snapshots", dataType);
  if (!existsSync(snapshotsDir)) return [];
  return readdirSync(snapshotsDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();
}

function askConfirmation(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

async function rollback(dataType: DataType, date?: string) {
  const snapshotsDir = join(DATA_DIR, "snapshots", dataType);
  const fileName = FILE_NAMES[dataType];

  let snapshotFile: string;
  if (date) {
    snapshotFile = `${fileName}-${date}.json`;
  } else {
    const snapshots = getSnapshots(dataType);
    if (snapshots.length === 0) {
      console.error(`❌ No snapshots found for ${dataType}`);
      return;
    }
    snapshotFile = snapshots[0];
  }

  const snapshotPath = join(snapshotsDir, snapshotFile);
  if (!existsSync(snapshotPath)) {
    console.error(`❌ Snapshot not found: ${snapshotPath}`);
    return;
  }

  const confirmed = await askConfirmation(
    `Restore ${dataType} from ${snapshotFile}?`
  );
  if (!confirmed) {
    console.log("Cancelled.");
    return;
  }

  const data = readFileSync(snapshotPath, "utf-8");
  const mainFilePath = join(DATA_DIR, `${fileName}.json`);
  writeFileSync(mainFilePath, data, "utf-8");
  console.log(`✅ Restored ${dataType} from ${snapshotFile}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dateArg = args.find((a) => a.startsWith("--date="));
  const date = dateArg?.split("=")[1];

  const dataTypes = DATA_TYPES.filter((dt) =>
    args.some((a) => a === `--${dt}`)
  );

  if (dataTypes.length === 0) {
    console.log("Usage: npm run rollback -- --tasks --date=20250215");
    console.log("Available types: --items, --tasks, --hideout, --traders");
    return;
  }

  for (const dt of dataTypes) {
    await rollback(dt, date);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
