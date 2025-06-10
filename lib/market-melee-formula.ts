/**
 * Market Melee™ - Core Algorithm Formula
 * © Your Name 2024 - All Rights Reserved
 *
 * This file contains the proprietary algorithm for the Market Melee™ system,
 * which translates market data into boxing game mechanics.
 *
 * CONFIDENTIAL AND PROPRIETARY
 * Unauthorized copying or distribution of this file is strictly prohibited.
 */

import type { CandlestickData } from "./types"

// Modify the Solana attack calculation to prevent first-round knockouts
/**
 * Special attack calculation for Solana based on price
 * Implements the Solana program logic with balance adjustments
 */
export function calculateSolanaAttack(price: number): number {
  // Significantly reduced attack power to prevent first-round knockouts
  if (price < 150.0) {
    return 200 // Reduced from 500 to 200 for Fury mode
  }
  return 100 // Reduced from 250 to 100 for base attack
}

// Mock implementations or imports for missing functions
function calculateMomentum(candle: CandlestickData, previousCandles: CandlestickData[]): number {
  // Replace with actual implementation
  return 0.5
}

function calculateVolumeImpact(candle: CandlestickData, previousCandles: CandlestickData[]): number {
  // Replace with actual implementation
  return 0.3
}

function calculateTrendStrength(candle: CandlestickData, previousCandles: CandlestickData[]): number {
  // Replace with actual implementation
  return 0.6
}

function calculateDefensePower(
  percentChange: number,
  volatility: number,
  momentum: number,
  volumeImpact: number,
): number {
  // Replace with actual implementation
  return 0.4
}

function calculateSpecialMoveChance(trendStrength: number, volatility: number, volumeImpact: number): number {
  // Replace with actual implementation
  return 0.2
}

// Modify the marketMeleeFormula function to include the special Solana calculation
/**
 * The Market Melee™ Formula - Core Algorithm
 *
 * This algorithm translates market data into game mechanics using a proprietary
 * formula that considers multiple factors including volatility, momentum,
 * trend direction, and volume patterns.
 */
export function marketMeleeFormula(candle: CandlestickData, previousCandles: CandlestickData[], fighterId?: string) {
  // Step 1: Calculate base metrics
  const percentChange = ((candle.close - candle.open) / candle.open) * 100
  const volatility = ((candle.high - candle.low) / candle.low) * 100

  // Step 2: Calculate momentum (proprietary formula)
  const momentum = calculateMomentum(candle, previousCandles)

  // Step 3: Calculate volume impact
  const volumeImpact = calculateVolumeImpact(candle, previousCandles)

  // Step 4: Calculate trend strength
  const trendStrength = calculateTrendStrength(candle, previousCandles)

  // Step 5: Apply the Market Melee™ Formula (proprietary algorithm)
  const attackPower = calculateAttackPower(percentChange, volatility, momentum, volumeImpact, fighterId, candle.close)
  const defensePower = calculateDefensePower(percentChange, volatility, momentum, volumeImpact)
  const specialMoveChance = calculateSpecialMoveChance(trendStrength, volatility, volumeImpact)

  // Step 6: Determine boxing action based on calculated metrics
  const action = determineBoxingAction(
    percentChange,
    volatility,
    momentum,
    trendStrength,
    attackPower,
    defensePower,
    specialMoveChance,
    fighterId,
    candle.close,
  )

  // Check for Solana Fury Mode
  const isFuryMode = fighterId === "solana" && candle.close < 150.0

  return {
    percentChange,
    volatility,
    momentum,
    volumeImpact,
    trendStrength,
    attackPower,
    defensePower,
    specialMoveChance,
    action,
    isPositive: candle.close > candle.open,
    isBullish: candle.close > candle.open && trendStrength > 0.7,
    isBearish: candle.close < candle.open && trendStrength > 0.7,
    isFuryMode, // Add the fury mode flag
    volume: candle.volume, // Add volume for point calculation
  }
}

/**
 * Calculate attack power based on market metrics
 * Now includes special handling for Solana with balance adjustments
 */
function calculateAttackPower(
  percentChange: number,
  volatility: number,
  momentum: number,
  volumeImpact: number,
  fighterId?: string,
  price?: number,
): number {
  // Special case for Solana with reduced power
  if (fighterId === "solana" && price !== undefined) {
    const solanaAttack = calculateSolanaAttack(price)
    // Scale to 0-1 range for consistency with other fighters
    return solanaAttack / 1000
  }

  // Special case for Bitcoin to balance against Solana
  if (fighterId === "bitcoin") {
    // Give Bitcoin slightly higher defense against Solana
    const bitcoinBonus = 0.1 // 10% bonus
    return Math.min(1, calculateBaseAttackPower(percentChange, volatility, momentum, volumeImpact) + bitcoinBonus)
  }

  // Default calculation for other fighters
  return Math.min(1, calculateBaseAttackPower(percentChange, volatility, momentum, volumeImpact))
}

// In the calculateBaseAttackPower function, reduce the overall damage
function calculateBaseAttackPower(
  percentChange: number,
  volatility: number,
  momentum: number,
  volumeImpact: number,
): number {
  // Positive momentum and percent change increase attack power
  const momentumFactor = momentum > 0 ? momentum / 200 : 0 // Reduced from /100 to /200
  const changeFactor = percentChange > 0 ? percentChange / 20 : 0 // Reduced from /10 to /20

  // Volatility always adds to attack power
  const volatilityFactor = volatility / 40 // Reduced from /20 to /40

  // Volume impact amplifies the effect
  const baseAttackPower = (momentumFactor + changeFactor + volatilityFactor) / 3
  return Math.min(0.5, baseAttackPower * (1 + volumeImpact)) // Reduced max from 1 to 0.5
}

/**
 * Determine boxing action based on calculated metrics
 * Now includes special handling for Solana's Fury Mode
 * And includes Nintendo Punch-Out style moves
 */
function determineBoxingAction(
  percentChange: number,
  volatility: number,
  momentum: number,
  trendStrength: number,
  attackPower: number,
  defensePower: number,
  specialMoveChance: number,
  fighterId?: string,
  price?: number,
): string {
  // Special case for Solana in Fury Mode
  if (fighterId === "solana" && price !== undefined && price < 150.0) {
    // In Fury Mode, Solana has a high chance of using uppercut
    if (Math.random() > 0.3) {
      return "uppercut" // Fury mode special move
    }
  }

  // Special moves (require high special move chance)
  if (specialMoveChance > 0.7) {
    if (attackPower > defensePower && momentum > 0) {
      return "uppercut" // Strong attack special move
    } else if (defensePower > attackPower && momentum < 0) {
      return "dodge" // Evasive defense
    }
  }

  // Nintendo Punch-Out style move selection
  const movePool = []

  // Add moves to the pool based on market conditions
  if (attackPower > 0.6) {
    // Strong attack conditions
    movePool.push("uppercut", "uppercut", "hook") // Higher chance for powerful moves
  } else if (attackPower > 0.3) {
    // Medium attack conditions
    movePool.push("jab", "jab", "hook", "hook") // Balanced moves
  } else if (defensePower > 0.6) {
    // Strong defense conditions
    movePool.push("dodge", "dodge", "block") // Higher chance for defensive moves
  } else if (defensePower > 0.3) {
    // Medium defense conditions
    movePool.push("dodge", "jab") // Mix of defense and quick attacks
  } else {
    // Default conditions
    movePool.push("jab", "hook", "dodge", "idle") // Balanced mix
  }

  // Randomly select a move from the pool
  const randomIndex = Math.floor(Math.random() * movePool.length)
  return movePool[randomIndex]
}
