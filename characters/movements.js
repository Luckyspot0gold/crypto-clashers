import type { TechnicalIndicators } from "./crypto-data"

export interface BoxingMove {
 name: string
 type: "attack" | "defense" | "combo"
 power: number
 speed: number
 description: string
 educationalNote: string
}

export class BoxingMoveCalculator {
 calculateMove(indicators: TechnicalIndicators): BoxingMove {
   const { rsi, macd, candlestick } = indicators

   // RSI-based moves
   if (rsi > 70) {
     return {
       name: "Overbought Uppercut",
       type: "attack",
       power: Math.min(95, rsi),
       speed: 100 - rsi,
       description: "A powerful uppercut when the market is overbought!",
       educationalNote: "RSI above 70 indicates overbought conditions - price might reverse down",
     }
   }

   if (rsi < 30) {
     return {
       name: "Oversold Counter",
       type: "defense",
       power: 30 + (30 - rsi),
       speed: rsi + 20,
       description: "Defensive stance in oversold territory",
       educationalNote: "RSI below 30 indicates oversold conditions - price might bounce up",
     }
   }

   // MACD-based moves
   if (macd.histogram > 0 && macd.macd > macd.signal) {
     return {
       name: "Bullish Cross Combo",
       type: "combo",
       power: Math.abs(macd.histogram) * 10,
       speed: 70,
       description: "Explosive combo as MACD crosses above signal!",
       educationalNote: "MACD bullish crossover suggests upward momentum",
     }
   }

   if (macd.histogram < 0 && macd.macd < macd.signal) {
     return {
       name: "Bearish Slam",
       type: "attack",
       power: Math.abs(macd.histogram) * 15,
       speed: 50,
       description: "Heavy downward strike as bears take control",
       educationalNote: "MACD bearish crossover suggests downward momentum",
     }
   }

   // Candlestick pattern moves
   if (candlestick.pattern === "bullish") {
     return {
       name: "Green Candle Jab",
       type: "attack",
       power: 60,
       speed: 80,
       description: "Quick jabs as bulls push higher",
       educationalNote: "Bullish candlestick patterns indicate buying pressure",
     }
   }

   if (candlestick.pattern === "bearish") {
     return {
       name: "Red Candle Hook",
       type: "attack",
       power: 65,
       speed: 75,
       description: "Devastating hook as bears dominate",
       educationalNote: "Bearish candlestick patterns indicate selling pressure",
     }
   }

   // Default neutral move
   return {
     name: "Sideways Shuffle",
     type: "defense",
     power: 30,
     speed: 60,
     description: "Cautious movement in uncertain market",
     educationalNote: "Neutral indicators suggest market consolidation",
   }
 }
}

export const boxingMoveCalculator = new BoxingMoveCalculator()

