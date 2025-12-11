'use server';
/**
 * @fileOverview Generates the standard folio text automatically from a short user summary using AI.
 *
 * - generateFolioContent - A function that handles the folio content generation process.
 * - GenerateFolioContentInput - The input type for the generateFolioContent function.
 * - GenerateFolioContentOutput - The return type for the generateFolioContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFolioContentInputSchema = z.object({
  summary: z.string().describe('A short summary of the folio content.'),
});
export type GenerateFolioContentInput = z.infer<typeof GenerateFolioContentInputSchema>;

const GenerateFolioContentOutputSchema = z.object({
  folioContent: z.string().describe('The generated folio content.'),
});
export type GenerateFolioContentOutput = z.infer<typeof GenerateFolioContentOutputSchema>;

export async function generateFolioContent(input: GenerateFolioContentInput): Promise<GenerateFolioContentOutput> {
  return generateFolioContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFolioContentPrompt',
  input: {schema: GenerateFolioContentInputSchema},
  output: {schema: GenerateFolioContentOutputSchema},
  prompt: `You are an expert in generating standard folio text based on a user-provided summary.

  The folio should include a formal introduction, a clear statement of the subject, and a closing remark.
  The folio should use professional and respectful language.

  Generate the folio content based on the following summary:
  {{summary}}`,
});

const generateFolioContentFlow = ai.defineFlow(
  {
    name: 'generateFolioContentFlow',
    inputSchema: GenerateFolioContentInputSchema,
    outputSchema: GenerateFolioContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
