# EFT攻略サイト構築 - 完全実装プロンプト

以下の仕様に従って、Escape from Tarkov攻略サイトをNext.jsで構築してください。

## 技術スタック

- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui (推奨)
- **データ管理**: JSON形式のローカルファイル
- **外部API**: Tarkov.dev GraphQL API (https://api.tarkov.dev/graphql)

---

## プロジェクト構造

```
/
├── app/
│   ├── dashboard/
│   ├── tasks/
│   ├── hideout/
│   ├── story/
│   ├── guides/
│   └── settings/
├── components/
│   ├── ui/
│   ├── tasks/
│   ├── hideout/
│   └── common/
├── data/
│   ├── snapshots/
│   │   ├── items/
│   │   ├── tasks/
│   │   ├── hideout/
│   │   └── traders/
│   ├── item.json
│   ├── task.json
│   ├── hideout.json
│   └── trader.json
├── scripts/
│   ├── fetch-data.ts
│   ├── fetch-items.ts
│   ├── fetch-tasks.ts
│   ├── fetch-hideout.ts
│   └── fetch-traders.ts
├── lib/
│   ├── graphql/
│   │   └── queries.ts
│   ├── storage/
│   │   └── progress.ts
│   └── utils/
└── types/
    └── tarkov.d.ts
```

---

## 1. データ管理システム

### 1.1 スナップショット管理

各データタイプに対して以下の構造でファイルを保存:

```
/data/snapshots/items/item-20250215.json
/data/snapshots/tasks/task-20250215.json
/data/snapshots/hideout/hideout-20250215.json
/data/snapshots/traders/trader-20250215.json
```

本データ:
```
/data/item.json
/data/task.json
/data/hideout.json
/data/trader.json
```

### 1.2 データ取得スクリプト仕様

#### レート制限対策

- 60 requests/minuteの制限を考慮
- リクエスト間に1秒のディレイを挿入
- バッチ処理で複数データを効率的に取得
- エラー発生時は指数バックオフで再試行

#### 実装すべきスクリプト

**`/scripts/fetch-data.ts`** (メインスクリプト)

```typescript
// 実行コマンド
// npm run fetch:all - 全データ取得
// npm run fetch:items - アイテムのみ
// npm run fetch:tasks - タスクのみ
// npm run fetch:hideout - ハイドアウトのみ
// npm run fetch:traders - トレーダーのみ

// 機能要件:
// 1. 引数に応じて特定のデータタイプのみ取得可能
// 2. 取得したデータを本データとスナップショットの両方に保存
// 3. スナップショットファイル名には日付を含める (YYYYMMDD形式)
// 4. レート制限を考慮し、リクエスト間に適切な遅延を挿入
// 5. エラー発生時はログ出力し、処理を継続
// 6. 取得成功時はサマリーを表示 (取得件数、所要時間など)
```

**`/scripts/rollback-data.ts`** (ロールバックスクリプト)

```typescript
// 実行コマンド
// npm run rollback:tasks -- --date=20250214

// 機能要件:
// 1. 指定された日付のスナップショットから本データを復元
// 2. 日付を指定しない場合は最新のスナップショットから復元
// 3. 復元前に確認プロンプトを表示
```

---

## 2. Tarkov.dev GraphQL API 実装

### 2.1 GraphQLクライアント設定

**`/lib/graphql/client.ts`**

```typescript
// 機能要件:
// 1. GraphQLクライアントの初期化
// 2. レート制限の実装 (60 requests/minute)
// 3. リトライロジック (最大3回、指数バックオフ)
// 4. エラーハンドリングとログ出力
```

### 2.2 GraphQLクエリ定義

**`/lib/graphql/queries.ts`**

以下の4つのクエリを実装してください:

#### Items Query

```graphql
query GetItems {
  items(lang: ja) {
    id
    name
    shortName
    normalizedName
    image512pxLink
    inspectImageLink
    wikiLink
    types
    width
    height
    weight
  }
}
```

#### Tasks Query

```graphql
query GetTasks {
  tasks(lang: ja) {
    id
    name
    normalizedName
    trader {
      id
      name
    }
    map {
      id
      name
      normalizedName
    }
    experience
    minPlayerLevel
    kappaRequired
    lightkeeperRequired
    taskRequirements {
      task {
        id
        name
      }
      status
    }
    traderLevelRequirements {
      trader {
        id
        name
      }
      level
    }
    objectives {
      id
      type
      description
      optional
      maps {
        id
        name
      }
      ... on TaskObjectiveItem {
        item {
          id
          name
          shortName
        }
        count
        foundInRaid
        dogTagLevel
        maxDurability
        minDurability
      }
      ... on TaskObjectiveMark {
        markerItem {
          id
          name
        }
      }
      ... on TaskObjectiveShoot {
        target
        count
        shotType
        zoneNames
        bodyParts
        usingWeapon {
          id
          name
        }
        usingWeaponMods {
          id
          name
        }
        wearing {
          id
          name
        }
        notWearing {
          id
          name
        }
        distance {
          compareMethod
          value
        }
        playerHealthEffect {
          bodyParts
          effects
        }
        enemyHealthEffect {
          bodyParts
          effects
        }
      }
      ... on TaskObjectiveBuildItem {
        item {
          id
          name
        }
        containsAll {
          id
          name
        }
        containsOne {
          id
          name
        }
      }
      ... on TaskObjectiveExperience {
        healthEffect {
          bodyParts
          effects
        }
      }
      ... on TaskObjectiveExtract {
        exitStatus
        exitName
      }
      ... on TaskObjectivePlayerLevel {
        playerLevel
      }
      ... on TaskObjectiveQuestItem {
        questItem {
          id
          name
        }
        count
      }
      ... on TaskObjectiveSkill {
        skillLevel {
          name
          level
        }
      }
      ... on TaskObjectiveTaskStatus {
        task {
          id
          name
        }
        status
      }
      ... on TaskObjectiveTraderLevel {
        trader {
          id
          name
        }
        level
      }
    }
    startRewards {
      traderStanding {
        trader {
          id
          name
        }
        standing
      }
      traderUnlock {
        id
        name
      }
      items {
        item {
          id
          name
        }
        count
        attributes {
          name
          value
        }
      }
      offerUnlock {
        trader {
          id
          name
        }
        level
        item {
          id
          name
        }
      }
      skillLevelReward {
        name
        level
      }
      craftUnlock {
        id
        station {
          id
          name
        }
        level
      }
    }
    finishRewards {
      traderStanding {
        trader {
          id
          name
        }
        standing
      }
      traderUnlock {
        id
        name
      }
      items {
        item {
          id
          name
        }
        count
        attributes {
          name
          value
        }
      }
      offerUnlock {
        trader {
          id
          name
        }
        level
        item {
          id
          name
        }
      }
      skillLevelReward {
        name
        level
      }
      craftUnlock {
        id
        station {
          id
          name
        }
        level
      }
    }
    factionName
    neededKeys {
      keys {
        id
        name
      }
      map {
        id
        name
      }
    }
  }
}
```

#### Hideout Stations Query

```graphql
query GetHideoutWithFIRRequirements {
  hideoutStations(lang: ja) {
    id
    name
    normalizedName
    levels {
      id
      level
      constructionTime
      description
      itemRequirements {
        item {
          id
          name
          shortName
          iconLink
        }
        count
        quantity
        attributes {
          type
          name
          value
        }
      }
      stationLevelRequirements {
        station {
          id
          name
        }
        level
      }
      skillRequirements {
        name
        level
      }
      traderRequirements {
        trader {
          id
          name
        }
        level
      }
    }
  }
}
```

#### Traders Query

```graphql
query GetTraders {
  traders(lang: ja) {
    id
    name
    normalizedName
    description
    currency {
      name
    }
    resetTime
    discount
    levels {
      level
      requiredPlayerLevel
      requiredReputation
      requiredCommerce
      insuranceRate
      repairCostMultiplier
      payRate
    }
  }
}
```

### 2.3 FIR判定について

Hideout Stations APIの`itemRequirements`に含まれる`attributes`配列に、FIR（Found in Raid）が必要かどうかの情報が含まれています。

**FIRの判定方法**:

```typescript
// attributes配列の中に、以下の条件を満たす要素があればFIR必須
{
  name: 'foundInRaid',
  value: 'true' // または '1'
}
```

**コンポーネント内での使用例**:

```typescript
const isFIR = requirement.attributes?.some(
  (attr) => attr.name === 'foundInRaid' && attr.value === 'true'
);
```

attributesフィールドから直接判定できるため、専用のヘルパー関数は不要です。

---

## 3. 型定義

**`/types/tarkov.d.ts`**

```typescript
// アイテム型定義
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

// 属性型定義
export interface ItemAttribute {
  type: string;
  name: string;
  value: string;
}

// アイテム要件型定義
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

// ステーションレベル要件型定義
export interface StationLevelRequirement {
  station: {
    id: string;
    name: string;
  };
  level: number;
}

// スキル要件型定義
export interface SkillRequirement {
  name: string;
  level: number;
}

// トレーダー要件型定義
export interface TraderRequirement {
  trader: {
    id: string;
    name: string;
  };
  level: number;
}

// ハイドアウトレベル型定義
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

// ハイドアウトステーション型定義
export interface HideoutStation {
  id: string;
  name: string;
  normalizedName: string;
  levels: HideoutLevel[];
}
```

---

## 4. ページ実装仕様

### 4.1 共通レイアウト

**サイドバーナビゲーション**:
- ダッシュボード
- タスク
- ハイドアウト
- ストーリータスク (WIP)
- 攻略情報 (WIP)
- 設定

**ヘッダー**:
- サイトロゴ
- 検索バー (グローバル検索)
- ダークモード切り替え

### 4.2 ダッシュボード (`/dashboard`)

**表示コンテンツ**:

1. **タスク進捗サマリー**
   - 全体進捗率 (円グラフ)
   - トレーダー別進捗 (横棒グラフ)
   - 最近完了したタスク (最大5件)

2. **ハイドアウト進捗サマリー**
   - 全ステーション完成度 (プログレスバー)
   - 建設可能なアップグレード通知

3. **統計情報**
   - 総プレイ時間 (推定)
   - 完了タスク数 / 総タスク数
   - ハイドアウト完成度パーセンテージ

4. **クイックアクション**
   - 次に取り組むべきタスクの提案
   - 必要なアイテムのリスト

### 4.3 タスクページ (`/tasks`)

#### タスクリスト画面

**フィルター機能**:
- トレーダー別 (Prapor, Therapist, Fence, Skier, Peacekeeper, Mechanic, Ragman, Jaeger, Lightkeeper)
- マップ別
- 完了状態 (All, 完了, 未完了, 進行中)
- KAPPA必須タスクのみ表示
- Lightkeeper必須タスクのみ表示

**ソート機能**:
- 名前 (昇順/降順)
- レベル要求 (昇順/降順)
- 経験値報酬 (降順)

**タスクカード表示**:

```
┌─────────────────────────────────────┐
│ [完了チェックボックス]              │
│ タスク名 (英語)                     │
│ タスク説明 (日本語)                 │
│                                     │
│ トレーダー: Prapor | レベル: 5     │
│ 経験値: +5000 XP                   │
│                                     │
│ [詳細を見る]                        │
└─────────────────────────────────────┘
```

**モーダル内容** (タスククリック時):
- タスク名 (英語)
- タスク説明 (日本語)
- 必要レベル
- 前提タスク (クリック可能リンク)
- トレーダーレベル要求

**Objectives (目標)**:
- 目標タイプに応じたアイコン表示
- 目標説明 (日本語)
- FIR (Found in Raid) 必須の場合はバッジ表示
- 各目標の個別完了チェックボックス
- 必要アイテムの画像とリンク

**Rewards (報酬)**:
- 経験値
- トレーダー評判
- アイテム報酬 (画像付き)
- アンロック要素

**必要なキー情報**:
- マップごとの必要キーリスト
- キーの画像とリンク

#### タスクチャート画面

**機能要件**:
- タスクの依存関係をグラフで可視化
- トレーダーごとに色分け
- 完了済みタスクはグレーアウト
- ノードクリックでタスク詳細モーダル表示
- ズーム・パン機能
- フィルター適用時はグラフも更新

**推奨ライブラリ**: React Flow または D3.js

### 4.4 ハイドアウトページ (`/hideout`)

**ステーション一覧表示**:

```
┌─────────────────────────────────────┐
│ Vents (換気)                        │
│ Level 1 [完了] Level 2 [進行中]    │
│                                     │
│ 必要アイテム:                       │
│ - Metal spare parts x3 (FIR)       │
│ - Bolts x5                          │
│                                     │
│ 必要スキル:                         │
│ なし                                │
│                                     │
│ 前提条件:                           │
│ - Lavatory Level 1                 │
│                                     │
│ ボーナス:                           │
│ - スタミナ回復 +10%                │
│                                     │
│ [レベル2を完了にする]               │
└─────────────────────────────────────┘
```

**表示要素**:
- ステーション名: 英語 (日本語)
- レベルごとのタブ表示
- 必要アイテム (FIRバッジ付き)
- 必要ステーションレベル
- 必要スキルレベル
- 必要トレーダーレベル
- 建設時間
- 提供ボーナス
- レベル完了チェックボックス

**FIR表示コンポーネント例**:

```typescript
import { ItemRequirement } from '@/types/tarkov';
import { Badge } from '@/components/ui/badge';

interface ItemRequirementCardProps {
  requirement: ItemRequirement;
}

export function ItemRequirementCard({ requirement }: ItemRequirementCardProps) {
  // attributesから直接FIR判定
  const isFIR = requirement.attributes?.some(
    (attr) => attr.name === 'foundInRaid' && attr.value === 'true'
  );

  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
      {/* アイテム画像 */}
      <img
        src={requirement.item.iconLink}
        alt={requirement.item.name}
        className="w-12 h-12 object-contain"
      />

      {/* アイテム情報 */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{requirement.item.name}</span>
          {isFIR && (
            <Badge variant="destructive" className="text-xs">
              FIR
            </Badge>
          )}
        </div>
        <span className="text-sm text-text-secondary">
          {requirement.item.shortName}
        </span>
      </div>

      {/* 必要数 */}
      <div className="text-right">
        <span className="text-lg font-bold">×{requirement.count}</span>
      </div>
    </div>
  );
}
```

**フィルター**:
- 建設可能
- 未完了
- 完了済み

### 4.5 ストーリータスク (`/story`) - WIP

**表示内容**:

```
┌─────────────────────────────────────┐
│                                     │
│         🚧 Coming Soon 🚧           │
│                                     │
│   ストーリータスクページは         │
│   現在開発中です                   │
│                                     │
└─────────────────────────────────────┘
```

### 4.6 攻略情報 (`/guides`) - WIP

**表示内容**:

```
┌─────────────────────────────────────┐
│                                     │
│         🚧 Coming Soon 🚧           │
│                                     │
│   攻略情報ページは                 │
│   現在開発中です                   │
│                                     │
└─────────────────────────────────────┘
```

### 4.7 設定ページ (`/settings`)

**機能**:

1. **進捗データ管理**
   - 「すべての進捗をリセット」ボタン
   - 確認ダイアログ: "本当にすべての進捗をリセットしますか? この操作は取り消せません。"
   - リセット実行後は成功メッセージ表示

2. **データバックアップ** (将来実装用プレースホルダー)
   - 「進捗データをエクスポート」ボタン (無効化)
   - 「進捗データをインポート」ボタン (無効化)
   - "この機能は近日公開予定です" のツールチップ

3. **表示設定**
   - ダークモード切り替え
   - 言語選択 (日本語固定、将来対応用)

4. **データ更新**
   - 「最新データを取得」ボタン (手動でAPIからデータ再取得)
   - 最終更新日時表示

---

## 5. 進捗管理システム

### 5.1 LocalStorage構造

**`/lib/storage/progress.ts`**

```typescript
interface ProgressData {
  version: string; // データバージョン管理用
  lastUpdated: string; // ISO 8601形式
  tasks: {
    [taskId: string]: {
      completed: boolean;
      completedAt?: string; // ISO 8601形式
      objectives: {
        [objectiveId: string]: {
          completed: boolean;
          progress?: number; // 進捗度 (0-100)
        };
      };
    };
  };
  hideout: {
    [stationId: string]: {
      [level: number]: {
        completed: boolean;
        completedAt?: string;
      };
    };
  };
  stats: {
    totalPlayTime: number; // 秒単位
    tasksCompleted: number;
    hideoutCompletionPercent: number;
  };
}
```

### 5.2 進捗管理関数

実装すべき関数:
- `getProgress()`: 進捗データ取得
- `saveProgress(data: ProgressData)`: 進捗データ保存
- `resetProgress()`: 進捗データリセット
- `completeTask(taskId: string)`: タスク完了
- `completeObjective(taskId: string, objectiveId: string)`: 目標完了
- `completeHideoutLevel(stationId: string, level: number)`: ハイドアウトレベル完了
- `getTaskProgress(taskId: string)`: 特定タスクの進捗取得
- `calculateStats()`: 統計情報再計算

---

## 6. UI/UXの詳細要件

### 6.1 カラースキーム (ダークモード基準)

```css
/* プライマリカラー */
--primary: #d4a574; /* タルコフのゴールド */
--primary-dark: #b8935f;

/* 背景 */
--background: #1a1a1a;
--surface: #2a2a2a;
--surface-elevated: #3a3a3a;

/* テキスト */
--text-primary: #e0e0e0;
--text-secondary: #a0a0a0;

/* アクセント */
--accent-success: #4caf50;
--accent-warning: #ff9800;
--accent-danger: #f44336;
--accent-info: #2196f3;

/* トレーダー別カラー */
--trader-prapor: #8b4513;
--trader-therapist: #9c27b0;
--trader-fence: #607d8b;
--trader-skier: #00bcd4;
--trader-peacekeeper: #4caf50;
--trader-mechanic: #ff5722;
--trader-ragman: #ffc107;
--trader-jaeger: #795548;
--trader-lightkeeper: #ffeb3b;
```

### 6.2 レスポンシブブレークポイント

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 6.3 アクセシビリティ

- すべてのインタラクティブ要素にキーボードナビゲーション対応
- ARIA属性の適切な使用
- カラーコントラスト比 WCAG AA準拠
- フォーカスインジケーターの明確な表示

### 6.4 ローディング・エラー状態

- データ読み込み中: スケルトンスクリーン表示
- エラー発生時: エラーメッセージと再試行ボタン
- 空状態: "データがありません" メッセージと導線表示

---

## 7. パッケージと依存関係

**必須パッケージ**:

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@tanstack/react-query": "^5.0.0",
    "graphql": "^16.8.0",
    "graphql-request": "^6.1.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^latest",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**推奨追加パッケージ**:
- `recharts`: グラフ表示用
- `react-flow` または `d3`: タスクチャート用
- `sonner`: トースト通知用
- `cmdk`: コマンドパレット用 (検索機能)

---

## 8. package.json スクリプト

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "fetch:all": "tsx scripts/fetch-data.ts --all",
    "fetch:items": "tsx scripts/fetch-data.ts --items",
    "fetch:tasks": "tsx scripts/fetch-data.ts --tasks",
    "fetch:hideout": "tsx scripts/fetch-data.ts --hideout",
    "fetch:traders": "tsx scripts/fetch-data.ts --traders",
    "rollback": "tsx scripts/rollback-data.ts"
  }
}
```

---

## 9. データ取得スクリプト実装例

**`/scripts/fetch-hideout.ts`**

```typescript
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { request } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'https://api.tarkov.dev/graphql';
const DATA_DIR = join(process.cwd(), 'data');
const SNAPSHOTS_DIR = join(DATA_DIR, 'snapshots', 'hideout');

const GET_HIDEOUT_QUERY = `
  query GetHideoutWithFIRRequirements {
    hideoutStations(lang: ja) {
      id
      name
      normalizedName
      levels {
        id
        level
        constructionTime
        description
        itemRequirements {
          item {
            id
            name
            shortName
            iconLink
          }
          count
          quantity
          attributes {
            type
            name
            value
          }
        }
        stationLevelRequirements {
          station {
            id
            name
          }
          level
        }
        skillRequirements {
          name
          level
        }
        traderRequirements {
          trader {
            id
            name
          }
          level
        }
      }
    }
  }
`;

async function fetchHideoutData() {
  console.log('🏠 Fetching hideout data from Tarkov.dev API...');

  try {
    const data = await request(GRAPHQL_ENDPOINT, GET_HIDEOUT_QUERY);

    // ディレクトリ作成
    mkdirSync(SNAPSHOTS_DIR, { recursive: true });

    // 日付フォーマット (YYYYMMDD)
    const dateString = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');

    // 本データを保存
    const mainFilePath = join(DATA_DIR, 'hideout.json');
    writeFileSync(mainFilePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Saved main data: ${mainFilePath}`);

    // スナップショットを保存
    const snapshotFilePath = join(
      SNAPSHOTS_DIR,
      `hideout-${dateString}.json`
    );
    writeFileSync(snapshotFilePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`📸 Saved snapshot: ${snapshotFilePath}`);

    // FIR必須アイテムの統計を表示
    const stations = data.hideoutStations || [];
    let totalFIRItems = 0;

    stations.forEach((station: any) => {
      station.levels.forEach((level: any) => {
        const firItems = level.itemRequirements?.filter((req: any) =>
          req.attributes?.some(
            (attr: any) =>
              attr.name === 'foundInRaid' &&
              (attr.value === 'true' || attr.value === '1')
          )
        );
        totalFIRItems += firItems?.length || 0;
      });
    });

    console.log(`\n📊 Summary:`);
    console.log(`  - Total stations: ${stations.length}`);
    console.log(`  - Total FIR requirements: ${totalFIRItems}`);
  } catch (error) {
    console.error('❌ Error fetching hideout data:', error);
    process.exit(1);
  }
}

fetchHideoutData();
```

---

## 10. 実装優先順位

### Phase 1: 基礎構築
1. プロジェクト初期化とディレクトリ構造作成
2. GraphQLクライアントとクエリ実装
3. データ取得スクリプト実装
4. 進捗管理システム実装

### Phase 2: コア機能
1. タスクリストページ (モーダル含む)
2. ハイドアウトページ
3. ダッシュボードページ

### Phase 3: 拡張機能
1. タスクチャート
2. 検索機能
3. フィルター/ソート機能

### Phase 4: 仕上げ
1. 設定ページ
2. WIPページ
3. UI/UX改善
4. パフォーマンス最適化

---

## 11. 注意事項とベストプラクティス

1. **レート制限の厳守**: API呼び出しは必ず60 requests/minute以下に抑える
2. **エラーハンドリング**: すべての外部API呼び出しに適切なエラーハンドリングを実装
3. **型安全性**: TypeScriptの型定義を徹底し、`any`の使用を避ける
4. **パフォーマンス**: 大量データの表示には仮想スクロールを検討
5. **セキュリティ**: ユーザー入力は必ずバリデーション
6. **アクセシビリティ**: すべてのUIコンポーネントでキーボード操作をサポート
7. **コード品質**: ESLintとPrettierでコードスタイル統一

---

## 12. 将来の拡張案 (実装不要)

- マップビューア機能
- アイテム検索・フィルター
- トレーダーバーター最適化計算機
- クラフト収益計算機
- 価格トラッキング機能
- ユーザーアカウント・クラウド同期

---

上記の仕様に基づいて、完全に動作するEFT攻略サイトを段階的に構築してください。実装は**Phase 1から順番に進め**、各フェーズ完了後に動作確認を行ってください。

コードは**TypeScript + Next.js App Router**を使用し、モダンなReactのベストプラクティス(Server Components、Client Componentsの適切な使い分け、React Hooksの効果的な活用)に従ってください。
