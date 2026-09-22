// worker.js
// Deploy this as a Cloudflare Worker. It keeps your Anthropic API key secret
// and returns a prioritized task recommendation to the Deadline Pilot frontend.

export default {
  async fetch(request, env) {
    // Allow the browser to call this worker (adjust origin later if you want to lock it down)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const { tasks } = await request.json();

      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return new Response(JSON.stringify({ error: "No tasks provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const taskList = tasks
        .map(t => `- "${t.name}": due ${t.deadline}, estimated ${t.effort}h`)
        .join("\n");

      const prompt = `You are a student's task prioritization assistant. Given this list of open tasks:

${taskList}

Today's date is ${new Date().toISOString().slice(0, 10)}.

Pick the ONE task the student should focus on right now, and explain why in one short sentence (under 25 words). Respond with ONLY valid JSON, no markdown, no preamble, in exactly this shape:
{"taskName": "...", "hours": <number>, "reason": "..."}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Anthropic API error (${response.status}): ${data.error?.message || JSON.stringify(data)}`);
      }

      const textBlock = data.content?.find(c => c.type === "text");

      if (!textBlock) {
        throw new Error("No text response from model");
      }

      const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
