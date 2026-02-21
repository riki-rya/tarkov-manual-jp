import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { request } from "graphql-request";
import { GET_HIDEOUT } from "../src/lib/graphql/queries";

const ENDPOINT = "https://api.tarkov.dev/graphql";
const DATA_DIR = join(process.cwd(), "data");
const SNAPSHOTS_DIR = join(DATA_DIR, "snapshots", "hideout");

export async function fetchHideout() {
  console.log("🏠 Fetching hideout data from Tarkov.dev API...");
  const start = Date.now();

  const data = await request<{ hideoutStations: Array<{ levels: Array<{ itemRequirements?: Array<{ attributes?: Array<{ name: string; value: string }> }> }> }> }>(
    ENDPOINT,
    GET_HIDEOUT
  );

  mkdirSync(SNAPSHOTS_DIR, { recursive: true });

  const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const mainFilePath = join(DATA_DIR, "hideout.json");
  writeFileSync(mainFilePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✅ Saved main data: ${mainFilePath}`);

  const snapshotFilePath = join(SNAPSHOTS_DIR, `hideout-${dateString}.json`);
  writeFileSync(snapshotFilePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  📸 Saved snapshot: ${snapshotFilePath}`);

  const stations = data.hideoutStations || [];
  let totalFIRItems = 0;
  stations.forEach((station) => {
    station.levels.forEach((level) => {
      const firItems = level.itemRequirements?.filter((req) =>
        req.attributes?.some(
          (attr) =>
            attr.name === "foundInRaid" &&
            (attr.value === "true" || attr.value === "1")
        )
      );
      totalFIRItems += firItems?.length || 0;
    });
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `  📊 Hideout: ${stations.length} stations, ${totalFIRItems} FIR requirements fetched in ${elapsed}s`
  );

  return data;
}
