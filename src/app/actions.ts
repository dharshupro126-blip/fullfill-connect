'use server';

import {
  analyzeFoodFreshness,
  type FoodFreshnessInput,
  type FoodFreshnessOutput,
} from '@/ai/flows/food-freshness-analysis';

export async function getFoodFreshnessAnalysis(
  input: FoodFreshnessInput
): Promise<FoodFreshnessOutput> {
  try {
    const result = await analyzeFoodFreshness(input);
    return result;
  } catch (error) {
    console.error('Error analyzing food freshness:', error);
    // In a real app, you'd want more robust error handling and logging.
    return {
      isEdible: false,
      freshnessScore: 0,
      estimatedShelfLife: 'N/A',
      assessmentSummary: 'An error occurred during analysis. Please try again.',
      disclaimerNeeded: true,
    };
  }
}
