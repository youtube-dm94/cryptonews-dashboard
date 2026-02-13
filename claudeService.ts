import { LanguageCode, LanguageNames, NewsItem } from "./types";

// Claude API response types
interface ContentBlock {
  type: "text" | "tool_use" | "tool_result";
  text?: string;
}

interface ApiResponse {
  content: ContentBlock[];
}

export const fetchCryptoNewsForLanguage = async (
  language: LanguageCode,
  targetDate: string
): Promise<NewsItem[]> => {
  const languageName = LanguageNames[language];

  const prompt = `
${targetDate} 날짜 기준으로 ${languageName} 언어를 사용하는 국가의 현지 언론사에서 발행한 암호화폐 뉴스 기사 3개를 검색해줘.

조건:
- 반드시 ${languageName} 언어로 작성된 기사여야 함
- 반드시 해당 국가의 현지 언론사 기사여야 함 (번역 서비스 X)
- 암호화폐 / 가상자산 관련 기사

각 기사에 대해 아래 형식으로 정확하게 응답해줘. 다른 텍스트 없이 JSON 배열만 반환:

[
  {
    "headlineOriginal": "원문 헤드라인 (${languageName}어)",
    "headlineEnglish": "English translation of headline",
    "link": "https://실제기사URL",
    "source": "언론사명"
  }
]

기사를 찾지 못했다면 빈 배열 [] 만 반환해줘.`;

  try {
    // Vercel 배포 환경에서는 /api/claude 호출
    const endpoint = "/api/claude";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1500,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          },
        ],
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    const textBlock = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text || "")
      .join("");

    if (!textBlock.trim()) {
      return [];
    }

    const cleaned = textBlock
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn(`No JSON array found for ${language}`);
      return [];
    }

    const parsed: Array<{
      headlineOriginal: string;
      headlineEnglish: string;
      link: string;
      source: string;
    }> = JSON.parse(jsonMatch[0]);

    return parsed.slice(0, 3).map((item, idx) => ({
      id: `${language}-${idx}-${targetDate}`,
      date: targetDate,
      language,
      headlineOriginal: item.headlineOriginal || "제목 없음",
      headlineEnglish: item.headlineEnglish || "Translation unavailable",
      link: item.link || "#",
      source: item.source || "Unknown Source",
    }));
  } catch (error) {
    console.error(`Error fetching news for ${language} on ${targetDate}:`, error);
    return [];
  }
};
