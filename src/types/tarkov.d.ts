// =====================
// Item Types
// =====================

export interface Item {
  id: string;
  name: string;
  shortName: string;
  normalizedName: string;
  image512pxLink: string;
  inspectImageLink: string;
  wikiLink: string;
  types: string[];
  width: number;
  height: number;
  weight: number;
}

export interface ItemAttribute {
  type: string;
  name: string;
  value: string;
}

export interface ItemRequirement {
  item: {
    id: string;
    name: string;
    shortName: string;
    iconLink: string;
  };
  count: number;
  quantity: number;
  attributes?: ItemAttribute[];
}

// =====================
// Hideout Types
// =====================

export interface StationLevelRequirement {
  station: {
    id: string;
    name: string;
  };
  level: number;
}

export interface SkillRequirement {
  name: string;
  level: number;
}

export interface TraderRequirement {
  trader: {
    id: string;
    name: string;
  };
  level: number;
}

export interface HideoutLevel {
  id: string;
  level: number;
  constructionTime: number;
  description: string;
  itemRequirements: ItemRequirement[];
  stationLevelRequirements: StationLevelRequirement[];
  skillRequirements: SkillRequirement[];
  traderRequirements: TraderRequirement[];
}

export interface HideoutStation {
  id: string;
  name: string;
  normalizedName: string;
  levels: HideoutLevel[];
}

// =====================
// Task Types
// =====================

export interface TaskMap {
  id: string;
  name: string;
  normalizedName?: string;
}

export interface TaskTrader {
  id: string;
  name: string;
}

export interface TaskRequirement {
  task: {
    id: string;
    name: string;
  };
  status: string[];
}

export interface TraderLevelRequirement {
  trader: {
    id: string;
    name: string;
  };
  level: number;
}

// Task Objective Types
export interface TaskObjectiveBase {
  id: string;
  type: string;
  description: string;
  optional: boolean;
  maps: TaskMap[];
}

export interface TaskObjectiveItem extends TaskObjectiveBase {
  type: "giveItem" | "findItem" | "plantItem";
  item: { id: string; name: string; shortName: string };
  count: number;
  foundInRaid: boolean;
  dogTagLevel: number | null;
  maxDurability: number | null;
  minDurability: number | null;
}

export interface TaskObjectiveMark extends TaskObjectiveBase {
  type: "mark";
  markerItem: { id: string; name: string };
}

export interface TaskObjectiveShoot extends TaskObjectiveBase {
  type: "shoot";
  target: string;
  count: number;
  shotType: string;
  zoneNames: string[];
  bodyParts: string[];
  usingWeapon: { id: string; name: string }[] | null;
  usingWeaponMods: { id: string; name: string }[] | null;
  wearing: { id: string; name: string }[][] | null;
  notWearing: { id: string; name: string }[] | null;
  distance: { compareMethod: string; value: number } | null;
  playerHealthEffect: { bodyParts: string[]; effects: string[] } | null;
  enemyHealthEffect: { bodyParts: string[]; effects: string[] } | null;
}

export interface TaskObjectiveBuildItem extends TaskObjectiveBase {
  type: "buildWeapon";
  item: { id: string; name: string };
  containsAll: { id: string; name: string }[];
  containsOne: { id: string; name: string }[];
}

export interface TaskObjectiveExperience extends TaskObjectiveBase {
  type: "experience";
  healthEffect: { bodyParts: string[]; effects: string[] } | null;
}

export interface TaskObjectiveExtract extends TaskObjectiveBase {
  type: "extract";
  exitStatus: string[];
  exitName: string | null;
}

export interface TaskObjectivePlayerLevel extends TaskObjectiveBase {
  type: "playerLevel";
  playerLevel: number;
}

export interface TaskObjectiveQuestItem extends TaskObjectiveBase {
  type: "giveQuestItem" | "findQuestItem" | "plantQuestItem";
  questItem: { id: string; name: string };
  count: number;
}

export interface TaskObjectiveSkill extends TaskObjectiveBase {
  type: "skill";
  skillLevel: { name: string; level: number };
}

export interface TaskObjectiveTaskStatus extends TaskObjectiveBase {
  type: "taskStatus";
  task: { id: string; name: string };
  status: string[];
}

export interface TaskObjectiveTraderLevel extends TaskObjectiveBase {
  type: "traderLevel";
  trader: { id: string; name: string };
  level: number;
}

export type TaskObjective =
  | TaskObjectiveItem
  | TaskObjectiveMark
  | TaskObjectiveShoot
  | TaskObjectiveBuildItem
  | TaskObjectiveExperience
  | TaskObjectiveExtract
  | TaskObjectivePlayerLevel
  | TaskObjectiveQuestItem
  | TaskObjectiveSkill
  | TaskObjectiveTaskStatus
  | TaskObjectiveTraderLevel
  | TaskObjectiveBase;

// Reward Types
export interface RewardItem {
  item: { id: string; name: string };
  count: number;
  attributes: { name: string; value: string }[];
}

export interface TraderStanding {
  trader: { id: string; name: string };
  standing: number;
}

export interface OfferUnlock {
  trader: { id: string; name: string };
  level: number;
  item: { id: string; name: string };
}

export interface SkillLevelReward {
  name: string;
  level: number;
}

export interface CraftUnlock {
  id: string;
  station: { id: string; name: string };
  level: number;
}

export interface TaskRewards {
  traderStanding: TraderStanding[];
  traderUnlock: { id: string; name: string }[];
  items: RewardItem[];
  offerUnlock: OfferUnlock[];
  skillLevelReward: SkillLevelReward[];
  craftUnlock: CraftUnlock[];
}

export interface NeededKey {
  keys: { id: string; name: string }[];
  map: { id: string; name: string } | null;
}

export interface Task {
  id: string;
  name: string;
  normalizedName: string;
  trader: TaskTrader;
  map: TaskMap | null;
  experience: number;
  minPlayerLevel: number;
  kappaRequired: boolean;
  lightkeeperRequired: boolean;
  taskRequirements: TaskRequirement[];
  traderLevelRequirements: TraderLevelRequirement[];
  objectives: TaskObjective[];
  startRewards: TaskRewards;
  finishRewards: TaskRewards;
  factionName: string;
  neededKeys: NeededKey[];
}

// =====================
// Trader Types
// =====================

export interface TraderLevel {
  level: number;
  requiredPlayerLevel: number;
  requiredReputation: number;
  requiredCommerce: number;
  insuranceRate: number | null;
  repairCostMultiplier: number | null;
  payRate: number;
}

export interface Trader {
  id: string;
  name: string;
  normalizedName: string;
  description: string;
  currency: { name: string };
  resetTime: string | null;
  discount: number;
  levels: TraderLevel[];
}

// =====================
// Progress Types
// =====================

export interface ObjectiveProgress {
  completed: boolean;
  progress?: number;
}

export interface TaskProgress {
  completed: boolean;
  completedAt?: string;
  objectives: {
    [objectiveId: string]: ObjectiveProgress;
  };
}

export interface HideoutLevelProgress {
  completed: boolean;
  completedAt?: string;
}

export interface ProgressData {
  version: string;
  lastUpdated: string;
  tasks: {
    [taskId: string]: TaskProgress;
  };
  hideout: {
    [stationId: string]: {
      [level: number]: HideoutLevelProgress;
    };
  };
  // key: "${itemId}-fir" or "${itemId}-nofir"
  hideoutItems: {
    [key: string]: number;
  };
  stats: {
    totalPlayTime: number;
    tasksCompleted: number;
    hideoutCompletionPercent: number;
  };
}

// =====================
// API Response Types
// =====================

export interface ItemsResponse {
  items: Item[];
}

export interface TasksResponse {
  tasks: Task[];
}

export interface HideoutResponse {
  hideoutStations: HideoutStation[];
}

export interface TradersResponse {
  traders: Trader[];
}
