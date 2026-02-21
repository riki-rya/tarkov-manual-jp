export const GET_ITEMS = `
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
`;

export const GET_TASKS = `
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
`;

export const GET_HIDEOUT = `
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

export const GET_TRADERS = `
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
`;
