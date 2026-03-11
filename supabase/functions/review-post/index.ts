import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CRISIS_PATTERNS = [
  /\b(suicid|self.harm|kill myself|end my life|want to die)\b/i,
  /\b(gusto ko nang mamatay|gusto ko nang mawala|wala na akong dahilan)\b/i,
  /\b(ayaw ko na mabuhay|pagod na ako sa buhay)\b/i,
];

const VIOLENT_INTENT_PATTERNS = [
  /\b(i will kill|i will hurt|i will destroy)\b/i,
  /\b(papatayin|sasaktan|gigibain|patayin kita)\b/i,
  /\b(you will die|you will pay|magsisi ka)\b/i,
  /\b(bomb|bomba|explosive)\b.{0,30}\b(plant|place|detonate|lagay|sumabog)\b/i,
];

const PROFANITY_PATTERNS = [
  /\b(putang ina|puta|gago|tangina|leche|hindot|pokpok)\b/i,
  /\b(fuck|shit|asshole|bitch|bastard)\b/i,
];

function containsPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const message = body?.message ?? "";

  if (containsPattern(message, CRISIS_PATTERNS)) {
    return new Response(
      JSON.stringify({ allowed: false, reason: "crisis" }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  if (containsPattern(message, VIOLENT_INTENT_PATTERNS)) {
    return new Response(
      JSON.stringify({ allowed: false, reason: "violent_intent" }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  if (containsPattern(message, PROFANITY_PATTERNS)) {
    return new Response(
      JSON.stringify({ allowed: false, reason: "profanity" }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ allowed: true }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
});
