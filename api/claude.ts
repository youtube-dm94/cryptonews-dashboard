import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // POST 요청만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vercel 환경변수에서 API 키 읽기 (외부에 절대 노출 안됨)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Anthropic 응답을 그대로 클라이언트에 전달
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Anthropic API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
