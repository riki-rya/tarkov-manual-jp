export const TRADER_COLORS: Record<string, string> = {
  Prapor: "bg-trader-prapor",
  Therapist: "bg-trader-therapist",
  Fence: "bg-trader-fence",
  Skier: "bg-trader-skier",
  Peacekeeper: "bg-trader-peacekeeper",
  Mechanic: "bg-trader-mechanic",
  Ragman: "bg-trader-ragman",
  Jaeger: "bg-trader-jaeger",
  Lightkeeper: "bg-trader-lightkeeper",
  // Japanese names
  "プラポール": "bg-trader-prapor",
  "セラピスト": "bg-trader-therapist",
  "フェンス": "bg-trader-fence",
  "スキヤー": "bg-trader-skier",
  "ピースキーパー": "bg-trader-peacekeeper",
  "メカニック": "bg-trader-mechanic",
  "ラグマン": "bg-trader-ragman",
  "イェーガー": "bg-trader-jaeger",
  "ライトキーパー": "bg-trader-lightkeeper",
  "Ref": "bg-trader-ref",
};

export const TRADER_TEXT_COLORS: Record<string, string> = {
  Prapor: "text-trader-prapor",
  Therapist: "text-trader-therapist",
  Fence: "text-trader-fence",
  Skier: "text-trader-skier",
  Peacekeeper: "text-trader-peacekeeper",
  Mechanic: "text-trader-mechanic",
  Ragman: "text-trader-ragman",
  Jaeger: "text-trader-jaeger",
  Lightkeeper: "text-trader-lightkeeper",
  "プラポール": "text-trader-prapor",
  "セラピスト": "text-trader-therapist",
  "フェンス": "text-trader-fence",
  "スキヤー": "text-trader-skier",
  "ピースキーパー": "text-trader-peacekeeper",
  "メカニック": "text-trader-mechanic",
  "ラグマン": "text-trader-ragman",
  "イェーガー": "text-trader-jaeger",
  "ライトキーパー": "text-trader-lightkeeper",
  "Ref": "text-trader-ref",
};

export const TRADER_BORDER_COLORS: Record<string, string> = {
  Prapor: "border-trader-prapor",
  Therapist: "border-trader-therapist",
  Fence: "border-trader-fence",
  Skier: "border-trader-skier",
  Peacekeeper: "border-trader-peacekeeper",
  Mechanic: "border-trader-mechanic",
  Ragman: "border-trader-ragman",
  Jaeger: "border-trader-jaeger",
  Lightkeeper: "border-trader-lightkeeper",
  "プラポール": "border-trader-prapor",
  "セラピスト": "border-trader-therapist",
  "フェンス": "border-trader-fence",
  "スキヤー": "border-trader-skier",
  "ピースキーパー": "border-trader-peacekeeper",
  "メカニック": "border-trader-mechanic",
  "ラグマン": "border-trader-ragman",
  "イェーガー": "border-trader-jaeger",
  "ライトキーパー": "border-trader-lightkeeper",
  "Ref": "border-trader-ref",
};

export function getTraderColor(traderName: string): string {
  return TRADER_COLORS[traderName] || "bg-muted";
}

export function getTraderTextColor(traderName: string): string {
  return TRADER_TEXT_COLORS[traderName] || "text-muted-foreground";
}

export function getTraderBorderColor(traderName: string): string {
  return TRADER_BORDER_COLORS[traderName] || "border-muted";
}
