export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT & CONFIG
// ─────────────────────────────────────────────────────────────────────────────

// ✅ Helper function to lazily initialize Supabase ONLY at runtime
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OLLAMA_MODEL  = 'llama3';
const HISTORY_LIMIT = 8;                               // last N messages
const PRODUCT_LIMIT = 5;                               // max products to return

// ─────────────────────────────────────────────────────────────────────────────
// STOP WORDS (Hindi + English) – for keyword extraction
// ─────────────────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  // Hindi / Hinglish
  'kya','hai','chahiye','mujhe','available','dikhao','batao','under','price',
  'me','mein','se','ko','ka','ki','ke','ek','do','aur','ya','par','bhi','toh',
  'nahi','haan','yeh','woh','koi','sab','abhi','kitna','kitne','kahan','kaun',
  'kyun','kaise','lekin','phir','sirf','apna','mera','tera','unka','inke',
  'kuch','bahut','accha','theek','bas','kaafi','bilkul','zaroor','matlab',
  // English
  'the','a','an','is','are','was','were','be','been','being',
  'i','me','my','you','your','we','our','they','their',
  'in','on','at','to','for','of','with','by','from','about',
  'have','has','had','can','will','would','could','should',
  'what','which','who','where','when','how','why','any','some',
  'get','give','tell','help','want','need','looking','search','find','show',
  // Generic phone words (too broad to search)
  'phone','mobile','smartphone','device','handset','set',
  // 2-char stop words (now needed since we allow length >= 2)
  'is','it','if','as','or','so','do','go','no','up','be','ok','hi','he','she',
  'ka','ki','ke','se','ko','me','ya','wo','ye','ab','to','hi',
]);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }
interface Product {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  city: string;
  condition: string;
  storage: string;
  ram?: string;
  color?: string;
  images?: string[];   
}
interface HistoryRow { role: string; content: string; }

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE DETECTION (Hindi / English)
// ─────────────────────────────────────────────────────────────────────────────
function detectLanguage(message: string): 'hindi' | 'english' {
  const msg = message.toLowerCase();
  const hindiMarkers = [
    'hai','kya','mujhe','chahiye','bhai','yaar','nahi','haan','accha','theek',
    'mein','se','ko','ka','ki','ke','toh','aur','ya','par','bhi','abhi',
    'karo','karo','batao','dikhao','lena','bechna','kitna','kaisa','kaun',
    'kahan','kyun','kaise','lekin','sirf','apna','mera','tera','wala','wali',
    'sab','kuch','bahut','bilkul','zaroor','matlab','phir','agar','jab',
  ];
  const hindiCount = hindiMarkers.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(msg)).length;
  return hindiCount >= 2 ? 'hindi' : 'english';
}

// ─────────────────────────────────────────────────────────────────────────────
// INTENT DETECTION (9 intents + 'other')
// ─────────────────────────────────────────────────────────────────────────────
type Intent = 'greeting' | 'product_search' | 'sell_help' | 'buy_help' |
              'safety_question' | 'urgent' | 'about_buyzze' |
              'funny_chitchat' | 'off_topic' | 'frustrated' | 'other';

function detectIntent(message: string): Intent {
  const msg = message.toLowerCase().trim();
  const words = msg.split(/\s+/);

  if (words.length <= 3 && /^(hi+|hello|hey+|hii+|namaste|helo|yo|sup|hlo|kya haal|kaisa|wassup|hows|how are)\b/.test(msg))
    return 'greeting';

  if (/\\b(buyzze|buyzze\\.in|website|platform|app|kya hai|what is|about|ke baare)\\b/.test(msg) &&
      !/\\b(phone|brand|model|price)\\b/.test(msg))
    return 'about_buyzze';

  if (/\\b(becho|bechna|sell|listing|list|daalo|post|upload|apna phone|mera phone bechna)\\b/.test(msg))
    return 'sell_help';

  if (/\\b(kaise khareedu|kaise le|how to buy|purchase kaise|order|delivery)\\b/.test(msg))
    return 'buy_help';

  if (/\\b(safe|scam|fraud|fake|trust|real|genuine|imei|verify|dhoka)\\b/.test(msg))
    return 'safety_question';

  if (/\\b(kaam nahi|nahi chal|problem|issue|error|dikkat|frustrated|ugh|wtf|bekar|bakwaas)\\b/.test(msg))
    return 'frustrated';

  if (/\\b(urgent|jaldi|asap|aaj chahiye|abhi chahiye|immediately|today)\\b/.test(msg))
    return 'urgent';

  if (/\\b(joke|funny|haha|lol|meme|bored|timepass|pagal|ullu|bakwas|roast)\\b/.test(msg))
    return 'funny_chitchat';

  if (/\\b(cricket|politics|news|weather|movie|song|recipe|homework|study|exam|gf|bf|love)\\b/.test(msg))
    return 'off_topic';

  if (/\\b(chahiye|dikhao|show|dhundo|stock|price|kitna|under|budget|khareed|lena|available|iphone|samsung|oneplus|xiaomi|redmi|vivo|oppo|realme|pixel|motorola|nothing|poco|nokia)\\b/.test(msg))
    return 'product_search';

  return 'other';
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD EXTRACTOR
// ─────────────────────────────────────────────────────────────────────────────
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\\w\\s]/g, ' ')
    .split(/\\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))  
    .slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT SEARCH (RAG) 
// ─────────────────────────────────────────────────────────────────────────────
async function searchProducts(message: string, intent: Intent): Promise<{
  products: Product[];
  searchedButEmpty: boolean;
}> {
  const noSearchIntents: Intent[] = [
    'greeting', 'sell_help', 'buy_help', 'about_buyzze',
    'frustrated', 'funny_chitchat', 'off_topic'
  ];
  if (noSearchIntents.includes(intent)) {
    return { products: [], searchedButEmpty: false };
  }

  try {
    const priceMatch = message.match(
      /(?:under|below|se kam|budget|max|upto|within)\\s*(?:rs\\.?|₹)?\\s*(\\d[\\d,]*(?:k|000)?)\\b/i
    );
    let maxPrice: number | null = null;
    if (priceMatch) {
      const raw = priceMatch[1].replace(/,/g, '').replace(/k$/i, '000');
      maxPrice = parseInt(raw, 10);
      if (!isNaN(maxPrice) && maxPrice < 1000) maxPrice *= 1000; 
    }

    const keywords = extractKeywords(message);

    if (keywords.length === 0 && !maxPrice) {
      return { products: [], searchedButEmpty: false };
    }

    const supabase = getSupabase(); // ✅ Correct runtime initialization

    let query = supabase
      .from('products')
      .select('id, title, brand, model, price, city, condition, storage, ram, color, images')
      .order('created_at', { ascending: false })
      .limit(PRODUCT_LIMIT);

    if (keywords.length > 0) {
      const orClauses = keywords.map(kw =>
        `title.ilike.%${kw}%,brand.ilike.%${kw}%,model.ilike.%${kw}%,city.ilike.%${kw}%`
      ).join(',');
      query = query.or(orClauses);
    }

    if (maxPrice) query = query.lte('price', maxPrice);

    const { data, error } = await query;
    if (error) {
      console.error('[DB]', error.message);
      return { products: [], searchedButEmpty: true };
    }

    const products = (data as Product[]) || [];
    return {
      products,
      searchedButEmpty: products.length === 0,
    };
  } catch (e) {
    console.error('[Search crash]', e);
    return { products: [], searchedButEmpty: false };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────
function formatProducts(products: Product[]): string {
  return products.map((p, i) => {
    const parts = [
      `${i + 1}. ${p.title}`,
      `Brand: ${p.brand}`,
      `Model: ${p.model}`,
      `Price: ₹${p.price?.toLocaleString('en-IN')}`,
      `Condition: ${p.condition}`,
      `Storage: ${p.storage}${p.ram ? ` / RAM: ${p.ram}` : ''}`,
      p.color ? `Color: ${p.color}` : null,
      `City: ${p.city}`,
    ].filter(Boolean);
    return parts.join(' | ');
  }).join('\\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// HALLUCINATION VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────
function validateResponse(
  aiText: string,
  products: Product[],
  searchedButEmpty: boolean,
  intent: Intent,
  lang: 'hindi' | 'english',
): string {
  if (intent !== 'product_search' && intent !== 'other') return aiText;
  if (!searchedButEmpty && products.length === 0) return aiText;

  const allowedTerms = new Set<string>();
  products.forEach(p => {
    if (p.brand) allowedTerms.add(p.brand.toLowerCase());
    if (p.model) allowedTerms.add(p.model.toLowerCase());
    p.title?.toLowerCase().split(/\\s+/).forEach(w => w.length > 2 && allowedTerms.add(w));
  });

  const phoneModelPattern = /\\b(iphone\\s*\\d+|galaxy\\s*[a-z]\\d+|oneplus\\s*\\d+|redmi\\s*\\d+|poco\\s*[a-z]\\d+|pixel\\s*\\d+|note\\s*\\d+|pro\\s*max|ultra|fold|flip)\\b/gi;

  if (searchedButEmpty) {
    const mentionedModels = aiText.match(phoneModelPattern);
    if (mentionedModels && mentionedModels.length > 0) {
      return lang === 'hindi'
        ? '📭 Ye model/brand abhi BuYzze pe available nahi hai. Doosre phones dekhne ke liye homepage pe browse karo!'
        : '📭 This model/brand is not available on BuYzze right now. Browse the homepage to explore other phones!';
    }
  }

  return aiText;
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH CHAT HISTORY
// ─────────────────────────────────────────────────────────────────────────────
async function fetchHistory(userId: string, sessionId: string): Promise<ChatMessage[]> {
  try {
    const supabase = getSupabase(); // ✅ Correct runtime initialization
    const { data } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT);

    if (!data) return [];
    return (data as HistoryRow[]).reverse().map(r => ({
      role: (r.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: r.content,
    }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE MESSAGE 
// ─────────────────────────────────────────────────────────────────────────────
function saveMsg(userId: string, sessionId: string, role: 'user' | 'ai', content: string) {
  const supabase = getSupabase(); // ✅ Correct runtime initialization
  supabase
    .from('chat_history')
    .insert([{ user_id: String(userId), session_id: sessionId, role, content }])
    .then(({ error }) => { if (error) console.error('[Save]', error.message); });
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD SYSTEM PROMPT 
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(
  intent: Intent,
  lang: 'hindi' | 'english',
  productContext: string,
  searchedButEmpty: boolean,
  isShortMessage: boolean,
): string {
  const langRule = lang === 'hindi'
    ? `🗣️ LANGUAGE: User Hindi/Hinglish mein baat kar raha hai. TU SIRF HINDI/HINGLISH MEIN REPLY KAREGA. Angrezi mat bolna.`
    : `🗣️ LANGUAGE: User is speaking in English. YOU WILL REPLY ONLY IN ENGLISH. Do not mix Hindi.`;

  const lengthRule = isShortMessage
    ? `📏 LENGTH: User ka message bahut chhota hai. Tera reply MAX 2 lines hona chahiye.`
    : `📏 LENGTH: Utna hi bol jitna zaruri hai. Padding, filler, unnecessary lines — ZERO.`;

  const groundingRule = `
🔒 GROUNDING RULE — THIS IS YOUR MOST IMPORTANT INSTRUCTION. READ CAREFULLY:
- You are a DATABASE READER, not a phone encyclopedia.
- You have ZERO knowledge about phones. You only know what is in LIVE INVENTORY below.
- If LIVE INVENTORY is empty or has no matches: say ONLY "Ye available nahi hai" — NOTHING ELSE.
- DO NOT mention any phone name, model number, brand, spec, or price from your training.
- DO NOT say things like "aap iPhone 13 dekh sakte ho" or "Samsung Galaxy A54 try karo" unless it is EXPLICITLY listed in LIVE INVENTORY below.
- DO NOT offer alternatives from your training knowledge. If not in inventory = does not exist for you.
- IMAGINE: You are a new employee who has never heard of any phone brand. You only read from the inventory list given to you. That is your only source of truth.
- VIOLATION OF THIS RULE = giving wrong info to a real customer = serious mistake.`;

  let inventorySection: string;
  if (productContext) {
    inventorySection = `\\n📦 LIVE INVENTORY (SIRF INHI PHONES KE BAARE MEIN BAAT KARO):\\n${productContext}`;
  } else if (searchedButEmpty) {
    inventorySection = `\\n📦 LIVE INVENTORY: Is query se koi bhi phone match nahi hua BuYzze database mein. Clearly batao ki ye model/brand abhi available nahi hai. Koi bahar ka data mat do.`;
  } else {
    inventorySection = `\\n📦 LIVE INVENTORY: Is conversation mein koi product search nahi hua.`;
  }

  const intentInstruction: Record<Intent, string> = {
    greeting: lang === 'hindi'
      ? `User ne greet kiya hai. Warm, chill reply do — 1-2 lines. Apna naam batao (ZzE AI). Thoda funny bhi ho sakta hai.`
      : `User greeted you. Give a warm, short reply — 1-2 lines. Mention your name (ZzE AI). Can be slightly funny.`,

    product_search: lang === 'hindi'
      ? `User phone dhundh raha hai. SIRF inventory wale phones batao. Agar nahi mila — clearly batao "ye available nahi hai". Apni taraf se kuch mat jodhna.`
      : `User is searching for a phone. Show ONLY phones from inventory. If not found — clearly say "not available". Do not add anything from your own knowledge.`,

    sell_help: lang === 'hindi'
      ? `User phone bechna chahta hai. Short steps do: 1) Login karo 2) Sell page pe jao 3) Details bharo 4) Photos upload karo 5) Live ho jaayega. Max 5 steps.`
      : `User wants to sell a phone. Give short steps: 1) Login 2) Go to Sell page 3) Fill details 4) Upload photos 5) Goes live. Max 5 steps.`,

    buy_help: lang === 'hindi'
      ? `User ko buying process samjhani hai. Short mein batao: browse karo, filter lagao, seller se chat karo, mil ke deal karo.`
      : `Explain buying process briefly: browse listings, apply filters, chat with seller, meet and deal.`,

    safety_question: lang === 'hindi'
      ? `User safety ke baare mein pooch raha hai. Seedha helpful tips do: public jagah milo, IMEI check karo, pehle test karo, advance payment avoid karo.`
      : `User asked about safety. Give direct tips: meet in public, check IMEI, test before paying, avoid advance payment.`,

    about_buyzze: lang === 'hindi'
      ? `BuYzze.in ke baare mein batao — India ka used smartphone marketplace. Short mein: kya kar sakte ho, kaise kaam karta hai.`
      : `Tell about BuYzze.in — India's used smartphone marketplace. Briefly: what you can do, how it works.`,

    frustrated: lang === 'hindi'
      ? `User frustrated lag raha hai. Calm raho, empathetic bano. Problem seedha address karo — no fluff, no lecture.`
      : `User seems frustrated. Stay calm and empathetic. Address the problem directly — no fluff.`,

    urgent: lang === 'hindi'
      ? `User ko jaldi chahiye. Sabse relevant option seedha do — no intro, no padding.`
      : `User needs something urgently. Give the most relevant option directly — no intro, no padding.`,

    funny_chitchat: lang === 'hindi'
      ? `User thoda timepass karna chahta hai. Ek smart, funny reply do — 1-2 lines. Phir gently phone topic pe le aao.`
      : `User wants to have a fun chat. Give a smart, funny reply — 1-2 lines. Then gently bring it back to phones.`,

    off_topic: lang === 'hindi'
      ? `User ne off-topic cheez pucha hai. Politely aur funny way mein redirect karo: "Main toh bas phones ka expert hoon 😄"`
      : `User asked something off-topic. Politely and humorously redirect: "I'm just a phone expert 😄"`,

    other: lang === 'hindi'
      ? `Samjho kya puchha hai aur seedha helpful answer do. BuYzze context mein raho.`
      : `Understand what was asked and give a direct helpful answer. Stay in BuYzze context.`,
  };

  return `Tu hai ZzE AI — BuYzze.in ka official AI assistant.
BuYzze.in ek Indian used smartphone marketplace hai jahan log phones khareedte aur bechte hain.

${langRule}

${lengthRule}

${groundingRule}

## ABHI KA KAAM
${intentInstruction[intent]}

## PERSONALITY
- Smart, friendly, thoda funny — jaise ek tech-savvy dost
- Emojis use kar jab natural lage: 📱 💰 ✅ ❌ 🔥 💡 📍 😄 👍
- Kabhi mat bol: "Maaf kijiyega", "I apologize", "As an AI", "Certainly!", "Great question!", "Of course!"
- Ek hi baar baat karo — repeat mat karo same info ko
${inventorySection}

## BUYZZE.IN INFO
- Platform: Used smartphones buy/sell — India
- Domain: BuYzze.in (buyzze.in)
- Brands: Apple, Samsung, OnePlus, Xiaomi/Redmi, Vivo, Oppo, Realme, Google Pixel, Motorola, Nothing
- Conditions: Like New / Good / Fair / Poor
- Features: Real-time seller chat, brand filter, city filter, favorites, reviews

## HARD LIMITS
- Kisi bhi phone ka naam/model/price apni training se MAT batana — sirf inventory se
- Off-topic (politics/news/entertainment/personal): Gently redirect to phones
- Payment/transaction: "Ye mujhse nahi hoga — seller se directly baat karo"
- Kuch genuinely unknown: Clearly bol do "Ye mujhe nahi pata"`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST HANDLER (main entry)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // ✅ Fetch process.env variables safely at runtime inside the handler
  const OLLAMA_URL = process.env.OLLAMA_NGROK_URL!;

  // 1. Parse request
  let message: string, userId: string, sessionId: string;
  try {
    const body = await req.json();
    message   = (body.message   || '').toString().trim();
    userId    = (body.userId    || 'anonymous').toString();
    sessionId = (body.sessionId || 'default').toString();

    if (!message) {
      return NextResponse.json({ response: 'Kuch toh likho! 😄' });
    }
  } catch {
    return NextResponse.json({ response: 'Request format galat hai.' }, { status: 400 });
  }

  // 2. Analyse message
  const intent      = detectIntent(message);
  const lang        = detectLanguage(message);
  const isShort     = message.trim().split(/\\s+/).length <= 4;

  // 3. Parallel ops: save user msg, fetch history, search products
  const [, history, searchResult] = await Promise.all([
    (async () => saveMsg(userId, sessionId, 'user', message))(),
    fetchHistory(userId, sessionId),
    searchProducts(message, intent),
  ]);

  const { products, searchedButEmpty } = searchResult;

  // 4. Build system prompt with current context
  const systemPrompt = buildSystemPrompt(
    intent,
    lang,
    products.length > 0 ? formatProducts(products) : '',
    searchedButEmpty,
    isShort,
  );

  // 5. Prepare messages for Ollama (system + history + current user)
  const ollamaMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6),   
    { role: 'user', content: message },
  ];

  // 6. Call Ollama with timeout and error handling
  let aiText = '';
  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 28000);

    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature:
            intent === 'greeting' || intent === 'funny_chitchat' ? 0.85 :
            intent === 'product_search' || intent === 'safety_question' ? 0.55 : 0.70,
          top_p:          0.88,
          repeat_penalty: 1.2,
          num_predict:    isShort ? 80 : 300,
          stop: ['<|eot_id|>', '<|end_of_text|>'],
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const rawText = await res.text();
    if (!res.ok) throw new Error(`HTTP_${res.status}`);

    if (rawText.trimStart().startsWith('<')) throw new Error('NGROK_HTML');

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error('JSON_PARSE_FAIL');
    }

    const content = (parsed?.message as { content?: string })?.content?.trim();
    if (!content) throw new Error('EMPTY_RESPONSE');

    aiText = content;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);

    const errorReplies: Record<string, string> = {
      NGROK_HTML:      lang === 'hindi' ? '⚠️ Ngrok tunnel mein gadbad hai ya Ollama band hai. Check karo!' : '⚠️ Ngrok tunnel issue or Ollama is offline. Please check!',
      JSON_PARSE_FAIL: lang === 'hindi' ? '🔄 AI response parse nahi hua. Dobara try karo.' : '🔄 Could not parse AI response. Please try again.',
      EMPTY_RESPONSE:  lang === 'hindi' ? '🤔 AI kuch bol nahi paya. Phir se poochho!' : '🤔 AI had nothing to say. Try asking again!',
    };

    if (errMsg.includes('abort') || errMsg.includes('timeout')) {
      aiText = lang === 'hindi' ? '⏱️ AI thoda slow hai aaj. Ek baar aur try karo!' : '⏱️ AI is a bit slow right now. Try once more!';
    } else if (errMsg.includes('ECONNREFUSED') || errMsg.includes('fetch failed')) {
      aiText = lang === 'hindi' ? '🔌 Ollama se connect nahi ho raha. `ollama serve` run karo!' : '🔌 Cannot connect to Ollama. Run `ollama serve`!';
    } else {
      aiText = errorReplies[errMsg] || (lang === 'hindi' ? '🔄 Kuch gadbad ho gayi. Refresh karo!' : '🔄 Something went wrong. Please refresh!');
    }

    console.error('[AI Error]', errMsg);
  }

  // 7. HALLUCINATION CHECK — Code-level hard block
  aiText = validateResponse(aiText, products, searchedButEmpty, intent, lang);

  // 8. Save AI reply (non‑blocking)
  saveMsg(userId, sessionId, 'ai', aiText);

  // 9. Return response + products (for UI cards in BuyzzeChat)
  return NextResponse.json({
    response: aiText,
    products: products.length > 0 ? products : [],
  });
}