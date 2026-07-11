import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "verify_certificate",
  title: "Verify certificate",
  description: "Verify a DTEN certificate by enrollment ID (starts with DTEN-).",
  inputSchema: { enrollment_id: z.string().min(3).describe("Enrollment ID, e.g. DTEN-XXXX.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ enrollment_id }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("certificates")
      .select("enrollment_id,student_name,course,type,issued_date,issued_by,description")
      .eq("enrollment_id", enrollment_id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data || data.length === 0) {
      return {
        content: [{ type: "text", text: `No certificate found for ${enrollment_id}.` }],
        structuredContent: { valid: false, certificates: [] },
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { valid: true, certificates: data },
    };
  },
});
