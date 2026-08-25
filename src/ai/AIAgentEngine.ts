import OpenAI from "openai";

export class AIAgentEngine {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generates a PostgreSQL query using the provided compact DDL context.
   */
  async generateSQL(userPrompt: string, compactDDL: string): Promise<string> {
    const systemPrompt = `
You are a Principal Database Administrator and PostgreSQL expert.
Translate the user's natural language request into a valid, optimized PostgreSQL query.

Database Schema (Compact DDL):
${compactDDL}

Rules:
1. Standardize query output: ONLY return the raw SQL inside a \`\`\`sql ... \`\`\` code block.
2. Rely strictly on tables and columns defined in the schema above.
3. Respect foreign key constraints and primary keys when constructing JOIN statements.
4. Default to read-only queries unless explicitly instructed otherwise by the user.
5. Do NOT include explanatory text, conversation, or preamble.
`;

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawContent = response.choices[0]?.message?.content || "";
    return this.extractSQL(rawContent);
  }

  /**
   * Extracts clean SQL code from standard markdown block responses.
   */
  private extractSQL(rawResponse: string): string {
    const match = rawResponse.match(/```sql\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return rawResponse.replace(/```/g, "").trim();
  }
}
