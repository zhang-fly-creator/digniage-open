const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 30000;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
};

const EMPTY_RESULT = {
  summary: "",
  tags: [],
  favoriteTopics: [],
  avoidTopics: [],
  communicationAdvice: "",
  careNote: "",
  nextSuggestion: {
    opening: "",
    pace: "",
    avoid: "",
    followUp: "",
  },
  serviceOpportunities: [],
};

const SYSTEM_PROMPT = [
  "你是“知老”系统中的养老服务辅助 AI。",
  "你的任务不是诊断老人，也不是替代医生、护士、社工和专业评估人员。",
  "你只能根据用户提供的事实信息，生成服务人员可执行的陪伴建议。",
  "不得编造老人经历、疾病、家庭关系、财产情况。",
  "不得输出医疗诊断、心理诊断、风险评级。",
  "语言要温暖、尊重、克制、具体、可执行。",
  "输出必须是严格 JSON。",
].join("\n");

function createHeaders(fallbackToMock) {
  return {
    ...JSON_HEADERS,
    "X-AI-Fallback-To-Mock": String(fallbackToMock),
  };
}

function jsonResponse(statusCode, body, fallbackToMock = true) {
  return {
    statusCode,
    headers: createHeaders(fallbackToMock),
    body: JSON.stringify(body),
  };
}

function readBooleanEnv(value, defaultValue) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return String(value).toLowerCase() === "true";
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function parseList(value, maxItems = 5) {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeText(item))
      .filter(Boolean)
      .slice(0, maxItems);
  }

  if (typeof value === "string") {
    return value
      .split(/[，、,；;\n\r]+/)
      .map((item) => sanitizeText(item))
      .filter(Boolean)
      .slice(0, maxItems);
  }

  return [];
}

function normalizeNextSuggestion(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const opening = sanitizeText(value);
    return {
      opening,
      pace: "",
      avoid: "",
      followUp: "",
    };
  }

  return {
    opening: sanitizeText(value.opening),
    pace: sanitizeText(value.pace),
    avoid: sanitizeText(value.avoid),
    followUp: sanitizeText(value.followUp),
  };
}

function normalizeOpportunity(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null;
  }

  const type = sanitizeText(item.type);
  const title = sanitizeText(item.title);
  const description = sanitizeText(item.description);

  if (!type && !title && !description) {
    return null;
  }

  return { type, title, description };
}

function normalizeResult(value) {
  const nextSuggestion = normalizeNextSuggestion(value?.nextSuggestion);
  const serviceOpportunities = Array.isArray(value?.serviceOpportunities)
    ? value.serviceOpportunities.map(normalizeOpportunity).filter(Boolean).slice(0, 3)
    : [];

  return {
    summary: sanitizeText(value?.summary),
    tags: parseList(value?.tags, 5),
    favoriteTopics: parseList(value?.favoriteTopics, 5),
    avoidTopics: parseList(value?.avoidTopics, 5),
    communicationAdvice: sanitizeText(value?.communicationAdvice),
    careNote: sanitizeText(value?.careNote),
    nextSuggestion,
    serviceOpportunities,
  };
}

function firstJsonObject(text) {
  const input = String(text || "");
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) start = index;
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return input.slice(start, index + 1);
      }
    }
  }

  return "";
}

function parseStrictJson(text) {
  const content = String(text || "").trim();
  if (!content) {
    throw new Error("AI 返回为空");
  }

  const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch?.[1]?.trim() || content;

  try {
    return JSON.parse(candidate);
  } catch {
    const objectText = firstJsonObject(candidate);
    if (!objectText) {
      throw new Error("AI 返回不是合法 JSON");
    }
    return JSON.parse(objectText);
  }
}

function pickInput(input) {
  return {
    name: sanitizeText(input?.name),
    age: sanitizeText(input?.age),
    gender: sanitizeText(input?.gender),
    nickname: sanitizeText(input?.nickname),
    birthday: sanitizeText(input?.birthday),
    formerJob: sanitizeText(input?.formerJob),
    lifeExperience: sanitizeText(input?.lifeExperience),
    interests: sanitizeText(input?.interests),
    favoriteTopicsInput: sanitizeText(input?.favoriteTopicsInput ?? input?.favoriteTopics),
    avoidTopicsInput: sanitizeText(input?.avoidTopicsInput ?? input?.avoidTopics),
    communicationStyle: sanitizeText(input?.communicationStyle),
    familyNote: sanitizeText(input?.familyNote),
    careNoteInput: sanitizeText(input?.careNoteInput),
    staffNote: sanitizeText(input?.staffNote),
  };
}

function buildUserPrompt(elderInput) {
  return [
    "请仅根据下面提供的老人事实信息，生成知老卡 JSON。",
    "不要输出 Markdown，不要输出解释，不要补充未提供的事实。",
    "请遵守以下限制：",
    "1. tags 最多 5 个；",
    "2. favoriteTopics 最多 5 个；",
    "3. avoidTopics 最多 5 个；",
    "4. serviceOpportunities 最多 3 条；",
    "5. 不做医疗诊断；",
    "6. 不做心理诊断；",
    "7. 不判断病情；",
    "8. 不判断家庭财产；",
    "9. 不编造没有提供的信息；",
    "10. 所有建议必须温暖、克制、具体、可执行。",
    "",
    "输出 JSON 结构必须固定为：",
    JSON.stringify(
      {
        summary: "一句话认识老人",
        tags: ["标签1", "标签2", "标签3"],
        favoriteTopics: ["话题1", "话题2", "话题3"],
        avoidTopics: ["需要避开的话题"],
        communicationAdvice: "沟通建议",
        careNote: "服务注意",
        nextSuggestion: {
          opening: "开场方式",
          pace: "沟通节奏",
          avoid: "注意避开",
          followUp: "后续跟进",
        },
        serviceOpportunities: [
          {
            type: "phone_call",
            title: "电话问候",
            description: "建议本周进行一次轻量问候。",
          },
        ],
      },
      null,
      2
    ),
    "",
    "老人输入信息：",
    JSON.stringify(elderInput, null, 2),
  ].join("\n");
}

async function readJsonBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    throw new Error("请求体不是合法 JSON");
  }
}

async function requestChatCompletion({ baseUrl, apiKey, model, timeoutMs, elderInput }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(elderInput) },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI 服务响应失败（${response.status}）${errorText ? `: ${errorText.slice(0, 300)}` : ""}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("AI 响应缺少内容");
    }

    return normalizeResult(parseStrictJson(content));
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("AI 请求超时");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function handler(event) {
  const fallbackToMock = readBooleanEnv(process.env.AI_FALLBACK_TO_MOCK, true);

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: createHeaders(fallbackToMock),
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(
      405,
      { ok: false, source: "real_ai", error: "Method not allowed" },
      fallbackToMock
    );
  }

  let body;
  try {
    body = await readJsonBody(event);
  } catch (error) {
    return jsonResponse(
      400,
      { ok: false, source: "real_ai", error: error.message || "请求体无效" },
      fallbackToMock
    );
  }

  const elderInput = pickInput(body?.elderInput || body);
  const provider = process.env.AI_PROVIDER || "openai_compatible";
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  if (!apiKey) {
    return jsonResponse(
      500,
      { ok: false, source: "real_ai", error: "AI_API_KEY is not configured" },
      fallbackToMock
    );
  }

  try {
    const data = normalizeResult(
      await requestChatCompletion({
        baseUrl,
        apiKey,
        model,
        timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS,
        elderInput,
      })
    );

    return jsonResponse(
      200,
      {
        ok: true,
        source: "real_ai",
        data: {
          ...EMPTY_RESULT,
          ...data,
          nextSuggestion: {
            ...EMPTY_RESULT.nextSuggestion,
            ...data.nextSuggestion,
          },
        },
      },
      fallbackToMock
    );
  } catch (error) {
    console.error(`[generate-elder-card] ${provider} real AI failed:`, error?.message || error);
    return jsonResponse(
      502,
      {
        ok: false,
        source: "real_ai",
        error: error?.message || "AI generation failed",
      },
      fallbackToMock
    );
  }
}
