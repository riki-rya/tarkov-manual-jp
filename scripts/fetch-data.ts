import { fetchItems } from "./fetch-items";
import { fetchTasks } from "./fetch-tasks";
import { fetchHideout } from "./fetch-hideout";
import { fetchTraders } from "./fetch-traders";

const DELAY_BETWEEN_REQUESTS = 1500; // 1.5s between different data types

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const fetchAll = args.includes("--all") || args.length === 0;
  const fetchItemsFlag = fetchAll || args.includes("--items");
  const fetchTasksFlag = fetchAll || args.includes("--tasks");
  const fetchHideoutFlag = fetchAll || args.includes("--hideout");
  const fetchTradersFlag = fetchAll || args.includes("--traders");

  console.log("=== EFT Data Fetch Script ===\n");
  const totalStart = Date.now();
  let successCount = 0;
  let failCount = 0;

  if (fetchItemsFlag) {
    try {
      await fetchItems();
      successCount++;
    } catch (error) {
      console.error("❌ Failed to fetch items:", error);
      failCount++;
    }
    if (fetchTasksFlag || fetchHideoutFlag || fetchTradersFlag) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  if (fetchTasksFlag) {
    try {
      await fetchTasks();
      successCount++;
    } catch (error) {
      console.error("❌ Failed to fetch tasks:", error);
      failCount++;
    }
    if (fetchHideoutFlag || fetchTradersFlag) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  if (fetchHideoutFlag) {
    try {
      await fetchHideout();
      successCount++;
    } catch (error) {
      console.error("❌ Failed to fetch hideout:", error);
      failCount++;
    }
    if (fetchTradersFlag) {
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  if (fetchTradersFlag) {
    try {
      await fetchTraders();
      successCount++;
    } catch (error) {
      console.error("❌ Failed to fetch traders:", error);
      failCount++;
    }
  }

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log("\n=== Summary ===");
  console.log(`  ✅ Success: ${successCount}`);
  if (failCount > 0) {
    console.log(`  ❌ Failed: ${failCount}`);
  }
  console.log(`  ⏱️  Total time: ${totalElapsed}s`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
