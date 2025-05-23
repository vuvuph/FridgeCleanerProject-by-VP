import { getGroqApiKey } from './util.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: getGroqApiKey() });

export async function generateRecipe(ingredients: string): Promise<string> {
  const chatCompletion = await getGroqChatCompletionRecipe(ingredients);
  const recipe = chatCompletion.choices[0]?.message?.content;
  if (!recipe) {
    throw new Error('No recipe was generated by the model.');
  }
  return recipe.trim();
}

async function getGroqChatCompletionRecipe(ingredients: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Generate a unique and detailed recipe based on the following ingredients. 
          The response should include: 
          - Title 
          - Description 
          - Ingredients list 
          - Step-by-step instructions.
          
          Please return a valid JSON object in the following format:
          {
            "title": string,
            "description": string,
            "ingredients": [{ "name": string, "quantity": string }],
            "instructions": [string]
          }
          Do not split strings into multiple quoted parts — each instruction should be a single string.
          No Markdown formatting, no explanation — return only raw, parsable JSON.
          All strings must be wrapped in double quotes, and arrays/objects must have proper commas and brackets.

          Always put quantities in quotes (e.g. "1/2", "to taste").`,
      },
      {
        role: 'user',
        content: `Create a recipe using the following ingredients: ${ingredients}`,
      },
    ],
    model: "llama3-8b-8192",
    temperature: 0.7,
    max_completion_tokens: 2048,
    top_p: 1,
    stream: false,
    stop: null,
  });
}