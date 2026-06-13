const DEFAULT_PROVIDER = "deepseek";
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_TOKENS = 1600;

const ERROR_CODE = {
  TIMEOUT: "AI_TIMEOUT",
  KEY_MISSING: "AI_KEY_MISSING",
  HTTP_ERROR: "AI_HTTP_ERROR",
  JSON_PARSE_ERROR: "AI_JSON_PARSE_ERROR",
  UNKNOWN_ERROR: "AI_UNKNOWN_ERROR",
};

const ALLOWED_OPPORTUNITY_TYPES = new Set([
  "phone_call",
  "visit",
  "birthday_care",
  "profile_completion",
  "activity_invitation",
  "family_message",
  "key_attention",
]);

const EMPTY_ELDER_CARD = {
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

const JSON_EXAMPLE = {
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
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function buildErrorResponse(error, fallbackToMock) {
  return jsonResponse({
    ok: false,
    source: "real_ai",
    error: error.message,
    code: error.code || ERROR_CODE.UNKNOWN_ERROR,
    fallbackToMock,
  }, error.status || 200);
}

function createAppError(message, code, status = 200, extras = {}) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  Object.assign(error, extras);
  return error;
}

async function parseJsonSafely(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function normalizeStringArray(value, maxItems = 5) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => sanitizeText(item))
    .filter(Boolean)
    .slice(0, maxItems);
}

function extractJsonText(text) {
  const source = String(text || "").trim();
  if (!source) return source;

  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

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
      if (depth > 0) depth -= 1;
      if (depth === 0 && start >= 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  return source;
}

function normalizeNextSuggestion(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      opening: "",
      pace: "",
      avoid: "",
      followUp: String(value || ""),
    };
  }

  return {
    opening: sanitizeText(value.opening),
    pace: sanitizeText(value.pace),
    avoid: sanitizeText(value.avoid),
    followUp: sanitizeText(value.followUp),
  };
}

function normalizeServiceOpportunities(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;

      const type = sanitizeText(item.type);
      if (!ALLOWED_OPPORTUNITY_TYPES.has(type)) return null;

      return {
        type,
        title: sanitizeText(item.title),
        description: sanitizeText(item.description),
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeElderCard(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

  return {
    summary: sanitizeText(source.summary),
    tags: normalizeStringArray(source.tags, 5),
    favoriteTopics: normalizeStringArray(source.favoriteTopics, 5),
    avoidTopics: normalizeStringArray(source.avoidTopics, 5),
    communicationAdvice: sanitizeText(source.communicationAdvice),
    careNote: sanitizeText(source.careNote),
    nextSuggestion: normalizeNextSuggestion(source.nextSuggestion),
    serviceOpportunities: normalizeServiceOpportunities(source.serviceOpportunities),
  };
}

function buildJsonExampleText() {
  return JSON.stringify(JSON_EXAMPLE, null, 2);
}

function buildSystemPrompt() {
  return [
    "你是“知老”系统中的养老服务辅助 AI。",
    "你的任务不是诊断老人，也不是替代医生、护士、社工和专业评估人员。",
    "你只能根据用户提供的事实信息，生成服务人员可执行的陪伴建议。",
    "不得编造老人经历、疾病、家庭关系、财产情况。",
    "不得输出医疗诊断、心理诊断、风险评级。",
    "不得判断财产、家庭矛盾、病情严重程度。",
    "语言要温暖、尊重、克制、具体、可执行。",
    "你必须只输出一个 JSON 对象。",
    "不要 Markdown，不要解释文字，不要代码块。",
    "目标 JSON 示例：",
    buildJsonExampleText(),
  ].join("\n");
}

function buildUserPrompt(elderInput) {
  const structuredInput = {
    姓名: sanitizeText(elderInput.name),
    年龄: sanitizeText(elderInput.age),
    性别: sanitizeText(elderInput.gender),
    称呼: sanitizeText(elderInput.nickname),
    "生日 / 关怀日期": sanitizeText(elderInput.birthday),
    原职业: sanitizeText(elderInput.formerJob),
    人生经历: sanitizeText(elderInput.lifeExperience),
    兴趣爱好: sanitizeText(elderInput.interests),
    喜欢聊的话题: sanitizeText(elderInput.favoriteTopicsInput),
    需要避开的话题: sanitizeText(elderInput.avoidTopicsInput),
    沟通方式: sanitizeText(elderInput.communicationStyle),
    家属提醒: sanitizeText(elderInput.familyNote),
    服务注意: sanitizeText(elderInput.careNoteInput),
    服务人员补充说明: sanitizeText(elderInput.staffNote),
  };

  return [
    "请只基于以下事实信息生成知老卡 JSON，不要补充未提供的信息。",
    "请只输出一个 JSON 对象。",
    "不要 Markdown，不要解释文字，不要代码块。",
    "不要输出医疗诊断、心理诊断、风险评级。",
    "不要判断财产、家庭矛盾或病情严重程度。",
    "目标 JSON 示例：",
    buildJsonExampleText(),
    "输出限制：",
    "1. tags 最多 5 个。",
    "2. favoriteTopics 最多 5 个。",
    "3. avoidTopics 最多 5 个。",
    "4. serviceOpportunities 最多 3 条。",
    "5. serviceOpportunities.type 只能是以下值之一：phone_call, visit, birthday_care, profile_completion, activity_invitation, family_message, key_attention。",
    "事实信息：",
    JSON.stringify(structuredInput, null, 2),
  ].join("\n\n");
}

function parseAiJson(content) {
  const extracted = extractJsonText(content);

  try {
    return JSON.parse(extracted);
  } catch {
    throw createAppError(
      "AI 返回结果格式异常，请稍后重试",
      ERROR_CODE.JSON_PARSE_ERROR
    );
  }
}

function shouldRetryWithoutResponseFormat(status, message) {
  if (status < 400) return false;
  const text = String(message || "").toLowerCase();
  return text.includes("response_format") || text.includes("json_object");
}

async function readErrorMessage(response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    return parsed?.error?.message || parsed?.message || text;
  } catch {
    return text;
  }
}

function resolveChatCompletionsUrl(baseUrl) {
  const normalized = sanitizeText(baseUrl) || DEFAULT_BASE_URL;
  const withoutTrailingSlash = normalized.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith("/chat/completions")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/chat/completions`;
}

async function callChatCompletions({
  apiKey,
  baseUrl,
  model,
  timeoutMs,
  systemPrompt,
  userPrompt,
}) {
  const endpoint = resolveChatCompletionsUrl(baseUrl);

  async function sendRequest(includeResponseFormat) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const payload = {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: DEFAULT_MAX_TOKENS,
      };

      if (includeResponseFormat) {
        payload.response_format = { type: "json_object" };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        throw createAppError(
          "AI 服务请求失败，请稍后重试",
          ERROR_CODE.HTTP_ERROR,
          response.status,
          {
            retryWithoutResponseFormat: shouldRetryWithoutResponseFormat(
              response.status,
              errorMessage
            ),
            rawMessage: errorMessage,
          }
        );
      }

      return response.json();
    } catch (error) {
      if (error?.name === "AbortError") {
        throw createAppError(
          "AI生成超时，请稍后重试",
          ERROR_CODE.TIMEOUT
        );
      }

      if (error?.code) {
        throw error;
      }

      throw createAppError(
        "AI 服务请求失败，请稍后重试",
        ERROR_CODE.HTTP_ERROR
      );
    } finally {
      clearTimeout(timer);
    }
  }

  try {
    return await sendRequest(true);
  } catch (error) {
    if (error?.code === ERROR_CODE.TIMEOUT) {
      throw error;
    }

    if (error?.retryWithoutResponseFormat) {
      try {
        return await sendRequest(false);
      } catch (retryError) {
        throw retryError;
      }
    }

    throw error;
  }
}

function validateAiContent(content) {
  if (!sanitizeText(content)) {
    throw createAppError(
      "AI 返回结果格式异常，请稍后重试",
      ERROR_CODE.JSON_PARSE_ERROR
    );
  }
}

function warnBriefly(code, message) {
  console.warn(`[generate-elder-card] ${code}: ${message}`);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await parseJsonSafely(request);
  const fallbackToMock =
    String(env?.AI_FALLBACK_TO_MOCK || "true").toLowerCase() !== "false";

  if (!body) {
    return jsonResponse(
      {
        ok: false,
        source: "real_ai",
        error: "请求体不是有效 JSON",
        code: ERROR_CODE.JSON_PARSE_ERROR,
        fallbackToMock,
      },
      400
    );
  }

  const elderInput = body.elderInput;

  if (!elderInput || typeof elderInput !== "object" || Array.isArray(elderInput)) {
    return jsonResponse(
      {
        ok: false,
        source: "real_ai",
        error: "缺少 elderInput",
        code: ERROR_CODE.UNKNOWN_ERROR,
        fallbackToMock,
      },
      400
    );
  }

  const provider = sanitizeText(env?.AI_PROVIDER) || DEFAULT_PROVIDER;
  const apiKey = sanitizeText(env?.AI_API_KEY);
  const baseUrl = sanitizeText(env?.AI_BASE_URL) || DEFAULT_BASE_URL;
  const model = sanitizeText(env?.AI_MODEL) || DEFAULT_MODEL;
  const timeoutMs = Number(env?.AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  if (!apiKey) {
    return buildErrorResponse(
      createAppError("AI_API_KEY 未配置", ERROR_CODE.KEY_MISSING),
      fallbackToMock
    );
  }

  try {
    const response = await callChatCompletions({
      apiKey,
      baseUrl,
      model,
      timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS,
      systemPrompt: buildSystemPrompt(),
      userPrompt: buildUserPrompt(elderInput),
    });

    const content = response?.choices?.[0]?.message?.content;
    validateAiContent(content);

    const normalizedData = normalizeElderCard(parseAiJson(content));

    return jsonResponse({
      ok: true,
      source: "real_ai",
      provider,
      model,
      fallbackToMock,
      data: {
        ...EMPTY_ELDER_CARD,
        ...normalizedData,
        nextSuggestion: {
          ...EMPTY_ELDER_CARD.nextSuggestion,
          ...normalizedData.nextSuggestion,
        },
      },
    });
  } catch (error) {
    const appError = error?.code
      ? error
      : createAppError(
          "AI 生成失败，请稍后重试",
          ERROR_CODE.UNKNOWN_ERROR
        );

    warnBriefly(appError.code, appError.message);
    return buildErrorResponse(appError, fallbackToMock);
  }
}
