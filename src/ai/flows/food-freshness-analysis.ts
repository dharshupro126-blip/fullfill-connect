'use server';
/**
 * @fileOverview Implements the AI freshness check for food items using an image.
 *
 * - analyzeFoodFreshness - Analyzes the freshness of a food item from an image.
 * - FoodFreshnessInput - The input type for the analyzeFoodFreshness function.
 * - FoodFreshnessOutput - The return type for the analyzeFoodFreshness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FoodFreshnessInputSchema = z.object({
  foodPhotoDataUri: z
    .string()
    .describe(
      "A photo of the food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  foodDescription: z.string().describe('The description of the food item.'),
});
export type FoodFreshnessInput = z.infer<typeof FoodFreshnessInputSchema>;

const FoodFreshnessOutputSchema = z.object({
  isEdible: z.boolean().describe('A flag indicating if the food is likely safe to eat.'),
  freshnessScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A numerical score from 0 (spoiled) to 100 (peak freshness).'),
  estimatedShelfLife: z
    .string()
    .describe('The estimated remaining shelf life, e.g., "2-3 days" or "Consume immediately".'),
  assessmentSummary: z
    .string()
    .describe('A concise, human-readable summary of the freshness assessment.'),
  disclaimerNeeded: z
    .boolean()
    .describe(
      'Whether a disclaimer about the limitations of the freshness check tool is needed due to poor image quality or other factors.'
    ),
});
export type FoodFreshnessOutput = z.infer<typeof FoodFreshnessOutputSchema>;

export async function analyzeFoodFreshness(
  input: FoodFreshnessInput
): Promise<FoodFreshnessOutput> {
  return foodFreshnessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodFreshnessPrompt',
  input: {schema: FoodFreshnessInputSchema},
  output: {schema: FoodFreshnessOutputSchema},
  config: {
    model: 'gemini-vision-pro', // Intentionally incorrect model name
  },
  prompt: `You are an AI assistant specializing in assessing food freshness from images and descriptions for a food donation platform. Your goal is to provide a detailed and structured analysis.

You will receive a description of a food item and a photo. Based on these, you must evaluate its quality and freshness.

Your output must be a JSON object with the following fields:
- isEdible: A boolean. True if the food appears safe to eat, false otherwise.
- freshnessScore: An integer between 0 and 100, where 100 is peak freshness and 0 is completely spoiled.
- estimatedShelfLife: A string estimating the remaining shelf life (e.g., "1 day", "2-3 days", "Up to a week", "Consume immediately").
- assessmentSummary: A brief, one-sentence summary of your findings (e.g., "Appears fresh with no visible signs of spoilage.").
- disclaimerNeeded: A boolean. Set to true if the image quality is poor, the item is difficult to assess visually (e.g., canned goods), or if you have any uncertainty. Otherwise, set it to false.

Analyze the provided food item now.

Description: {{{foodDescription}}}
Photo: {{media url=foodPhotoDataUri}}
`,
});

const foodFreshnessFlow = ai.defineFlow(
  {
    name: 'foodFreshnessFlow',
    inputSchema: FoodFreshnessInputSchema,
    outputSchema: FoodFreshnessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
