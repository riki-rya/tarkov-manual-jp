import type { HideoutStation } from "@/types/tarkov";
import hideoutData from "../../../data/hideout.json";

export function getStations(): HideoutStation[] {
  return hideoutData.hideoutStations as HideoutStation[];
}
