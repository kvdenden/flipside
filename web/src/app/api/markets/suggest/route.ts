import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const PredictionMarket = z
  .object({
    title: z.string().describe("The title of the prediction market."),
    description: z.string().describe("A detailed description of the prediction market."),
    expiration_date: z.string().describe("The expiration date of the market."),
    pair_name: z.string().describe("A memorable name for the yes/no outcome token pair."),
    pair_symbol: z.string().describe("A short, memorable symbol prefix for the token pair."),
  })
  .strict();

const SYSTEM_PROMPT = `
  You are a helpful assistant that refines prediction statements into clear, measurable formats for a prediction market platform. Your responses must follow this structure:

  **Title**: A clear, specific question based on the prediction statement.

  **Description**: Essential details for clarity, listing criteria for a yes/no outcome. 
  - The description should include:
    - How the market will resolve to "yes" and "no."
    - Specific sources (if applicable) that will determine the outcome.
    - Any fallback criteria or expiration rules if the outcome is not clear by the expiration date.

  **Expiration Date**: A realistic date in ISO 8601 format with UTC time (e.g., "2025-01-20T00:00:00Z") after which the market will be invalid if unresolved.

  **Pair Name**: A memorable name for the yes/no outcome token pair (e.g., "Trump 2024").

  **Pair Symbol**: A short, memorable symbol prefix for the token pair (e.g., "TRUMP").

  Example Input: "Donald Trump will become the next president."

  Example Output:
  - **Title**: "Will Donald Trump be elected as the next U.S. president?"
  - **Description**: This market will resolve to "yes" if Donald J. Trump wins the 2024 U.S. presidential election, based on official announcements by the Associated Press, Fox News, and NBC. All three sources must call the race for Trump. If they have not called the race for the same candidate by January 20, 2025, this market will resolve based on who is inaugurated on that date.
  - **Expiration Date**: "2025-01-20T00:00:00Z"
  - **Pair Name**: "President Trump 2024"
  - **Pair Symbol**: "TRUMP2024"
`;

export async function POST(req: NextRequest) {
  try {
    const { prediction } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Refine the following prediction statement into a structured prediction market: "${prediction}".`,
        },
      ],
      response_format: zodResponseFormat(PredictionMarket, "prediction_market"),
    });

    // Extract the completion details
    const resultContent = completion.choices[0]?.message.content;

    // Check for empty or null response
    if (!resultContent) {
      console.warn("Empty response received.");
      return NextResponse.json({ error: "The prediction could not be processed" }, { status: 400 });
    }

    // Parse and validate the structured response
    const result = JSON.parse(resultContent);
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
