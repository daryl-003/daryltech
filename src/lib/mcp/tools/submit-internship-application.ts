import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "submit_internship_application",
  title: "Submit internship application",
  description: "Submit an internship application to Daryl Tech Educational Network.",
  inputSchema: {
    full_name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().max(30).optional(),
    track: z.string().min(2).describe("Desired internship track (e.g. Web Development)."),
    experience_level: z.string().describe("Beginner, Intermediate, or Advanced."),
    portfolio_url: z.string().url().optional(),
    motivation: z.string().min(20).max(1500).describe("Why you want this internship."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("internship_applications")
      .insert(input)
      .select("id,created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Application submitted. Reference: ${data.id}` }],
      structuredContent: { application_id: data.id, created_at: data.created_at },
    };
  },
});
