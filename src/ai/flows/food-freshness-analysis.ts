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
  freshnessAssessment: z
    .string()
    .describe('The AI assessment of the food freshness.'),
  disclaimerNeeded: z
    .boolean()
    .describe(
      'Whether a disclaimer about the limitations of the freshness check tool is needed.'
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
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an AI assistant specializing in assessing food freshness based on images and descriptions.

You will receive a description of the food and a photo.  Based on these, assess the freshness of the food item. Provide a concise assessment.

You should make a determination as to whether a disclaimer is needed.  If the image quality is poor, or the food is of a type that is difficult to assess based on appearance alone, you should set the disclaimerNeeded field to true.  Otherwise, you should set it to false.

Description: {{{foodDescription}}}
Photo: {{media url=foodPhotoDataUri}}

Output the assessment and whether a disclaimer is needed in JSON format.
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
