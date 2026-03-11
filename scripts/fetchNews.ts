import { createClient } from '@supabase/supabase-js';

// .env.local 에서 로드
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1/messages';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LanguageNames: Record<string, string> = {
  RU: 'Russian', CN: 'Chinese', JP: 'Japanese', KR: 'Korean',
  ES: 'Spanish', PT: 'Portuguese', TR: 'Turkish', EN: 'English',
  VN: 'Vietnamese', AR: 'Arabic', EU: 'European (German/French)',
};

const targetDate = process.argv[2] || new Date().toISOString().split('T')[0];

async function fetchNewsForLanguage(language: string, date: string) {
  const languageName = LanguageNames[language];
  const prompt = `
${date} 날짜 기준으로 ${languageName} 언어를 사용하는 국가의 현지 언론사에서 발행한 암호화폐 뉴스 기사 3개를 검색해줘.

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

  const response = await fetch(ANTHROPIC_BASE_URL, {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const textBlock = data.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text || '')
    .join('');

  if (!textBlock.trim()) return [];

  const cleaned = textBlock.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.slice(0, 3).map((item: any, idx: number) => ({
    id: `${language}-${idx}-${date}`,
    date,
    language,
    headline_original: item.headlineOriginal || '제목 없음',
    headline_english: item.headlineEnglish || 'Translation unavailable',
    link: item.link || '#',
    source: item.source || 'Unknown Source',
  }));
}

async function main() {
  console.log(`Fetching news for ${targetDate}...`);
  const languages = Object.keys(LanguageNames);
  const allNews: any[] = [];

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];
    try {
      console.log(`[${i + 1}/${languages.length}] Fetching ${lang}...`);
      const news = await fetchNewsForLanguage(lang, targetDate);
      allNews.push(...news);
      console.log(`  ✓ ${news.length} articles`);
    } catch (error) {
      console.error(`  ✗ Failed for ${lang}:`, error);
    }

    if (i < languages.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (allNews.length > 0) {
    const { error } = await supabase.from('news_items').upsert(allNews);
    if (error) {
      console.error('Supabase save error:', error);
    } else {
      console.log(`\nDone. Saved ${allNews.length} articles to Supabase.`);
    }
  } else {
    console.log('\nNo articles fetched.');
  }
}

main();
