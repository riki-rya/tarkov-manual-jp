import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { request } from "graphql-request";
import { GET_TASKS } from "../src/lib/graphql/queries";

const ENDPOINT = "https://api.tarkov.dev/graphql";
const DATA_DIR = join(process.cwd(), "data");
const SNAPSHOTS_DIR = join(DATA_DIR, "snapshots", "tasks");

export async function fetchTasks() {
  console.log("📋 Fetching tasks data from Tarkov.dev API...");
  const start = Date.now();

  const data = await request<{ tasks: unknown[] }>(ENDPOINT, GET_TASKS);

  mkdirSync(SNAPSHOTS_DIR, { recursive: true });

  const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const mainFilePath = join(DATA_DIR, "task.json");
  writeFileSync(mainFilePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✅ Saved main data: ${mainFilePath}`);

  const snapshotFilePath = join(SNAPSHOTS_DIR, `task-${dateString}.json`);
  writeFileSync(snapshotFilePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  📸 Saved snapshot: ${snapshotFilePath}`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  📊 Tasks: ${data.tasks.length} tasks fetched in ${elapsed}s`);

  return data;
}
