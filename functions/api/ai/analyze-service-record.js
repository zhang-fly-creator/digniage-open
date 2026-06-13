const DEFAULT_PROVIDER = "deepseek";
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_TOKENS = 1400;

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

const EMPTY_ANALYSIS = {
  recordSummary: "",
  elderStatusInsight: "",
  newProfileInfo: [],
  nextSuggestion: {
    opening: "",
    pace: "",
    avoid: "",
    followUp: "",
  },
  serviceOpportunities: [],
  cardUpdateHints: {
    favoriteTopicsToAdd: [],
    avoidTopicsToAdd: [],
    careNoteSuggestion: "",
    communicationAdviceSuggestion: "",
  },
};

const JSON_EXAMPLE = {
  recordSummary: "本次服务摘要",
  elderStatusInsight: "对老人本次状态的服务观察，不做诊断",
  newProfileInfo: ["可补充到知老卡的新信息1", "新信息2"],
  nextSuggestion: {
    opening: "下次开场方式",
    pace: "沟通节奏",
    avoid: "注意避开",
    followUp: "后续跟进",
  },
  serviceOpportunities: [
    {
      type: "activity_invitation",
      title: "邀请参加合适活动",
      description: "根据本次记录生成的后续服务建议",
    },
  ],
  cardUpdateHints: {
    favoriteTopicsToAdd: [],
    avoidTopicsToAdd: [],
    careNoteSuggestion: "",
    communicationAdviceSuggestion: "",
  },
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
  return jsonResponse(
    {
      ok: false,
      source: "real_ai",
      error: error.message,
      code: error.code || ERROR_CODE.UNKNOWN_ERROR,
      fallbackToMock,
    },
    error.status || 200
  );
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

function normalizeCardUpdateHints(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      favoriteTopicsToAdd: [],
      avoidTopicsToAdd: [],
      careNoteSuggestion: "",
      communicationAdviceSuggestion: "",
    };
  }

  return {
    favoriteTopicsToAdd: normalizeStringArray(value.favoriteTopicsToAdd, 5),
    avoidTopicsToAdd: normalizeStringArray(value.avoidTopicsToAdd, 5),
    careNoteSuggestion: sanitizeText(value.careNoteSuggestion),
    communicationAdviceSuggestion: sanitizeText(value.communicationAdviceSuggestion),
  };
}

function normalizeServiceRecordAnalysis(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

  return {
    recordSummary: sanitizeText(source.recordSummary).slice(0, 120),
    elderStatusInsight: sanitizeText(source.elderStatusInsight).slice(0, 120),
    newProfileInfo: normalizeStringArray(source.newProfileInfo, 5),
    nextSuggestion: normalizeNextSuggestion(source.nextSuggestion),
    serviceOpportunities: normalizeServiceOpportunities(source.serviceOpportunities),
    cardUpdateHints: normalizeCardUpdateHints(source.cardUpdateHints),
  };
}

function buildJsonExampleText() {
  return JSON.stringify(JSON_EXAMPLE, null, 2);
}

function buildSystemPrompt() {
  return [
    "你是“知老”系统中的养老服务记录分析 AI。",
    "你的任务不是诊断老人，也不是替代医生、护士、社工和专业评估人员。",
    "你只能根据服务人员填写的服务记录和已有知老卡信息，整理本次服务摘要、提取新增信息、生成下一次陪伴建议。",
    "不得编造老人经历、疾病、家庭关系、财产情况。",
    "不得输出医疗诊断、心理诊断、风险评级。",
    "不得判断病情严重程度、家庭矛盾责任、财产状况。",
    "语言要温暖、尊重、克制、具体、可执行。",
    "输出必须是严格 JSON，不要 Markdown，不要解释文字。",
    "你必须只输出一个 JSON 对象。",
    "目标 JSON 示例：",
    buildJsonExampleText(),
  ].join("\n");
}

function buildUserPrompt(elderSnapshot, serviceRecordInput) {
  const structuredInput = {
    elderSnapshot: {
      id: sanitizeText(elderSnapshot?.id),
      name: sanitizeText(elderSnapshot?.name),
      age: sanitizeText(elderSnapshot?.age),
      gender: sanitizeText(elderSnapshot?.gender),
      nickname: sanitizeText(elderSnapshot?.nickname),
      summary: sanitizeText(elderSnapshot?.summary),
      tags: Array.isArray(elderSnapshot?.tags) ? elderSnapshot.tags : [],
      favoriteTopics: Array.isArray(elderSnapshot?.favoriteTopics)
        ? elderSnapshot.favoriteTopics
        : [],
      avoidTopics: Array.isArray(elderSnapshot?.avoidTopics)
        ? elderSnapshot.avoidTopics
        : [],
      communicationAdvice: sanitizeText(elderSnapshot?.communicationAdvice),
      careNote: sanitizeText(elderSnapshot?.careNote),
      nextSuggestion:
        elderSnapshot?.nextSuggestion &&
        typeof elderSnapshot.nextSuggestion === "object" &&
        !Array.isArray(elderSnapshot.nextSuggestion)
          ? elderSnapshot.nextSuggestion
          : {},
    },
    serviceRecordInput: {
      elderId: sanitizeText(serviceRecordInput?.elderId),
      relatedOpportunityId: sanitizeText(serviceRecordInput?.relatedOpportunityId),
      relatedOpportunityTitle: sanitizeText(serviceRecordInput?.relatedOpportunityTitle),
      serviceType: sanitizeText(serviceRecordInput?.serviceType),
      elderStatus: sanitizeText(serviceRecordInput?.elderStatus),
      content: sanitizeText(serviceRecordInput?.content),
      newInfo: sanitizeText(serviceRecordInput?.newInfo),
      nextSuggestion: sanitizeText(serviceRecordInput?.nextSuggestion),
      operatorName: sanitizeText(serviceRecordInput?.operatorName),
    },
  };

  return [
    "请只基于以下已有知老卡信息和服务记录信息，输出一个严格 JSON 对象。",
    "不要 Markdown，不要解释文字，不要代码块。",
    "不要编造未提供的信息。",
    "如果信息不足，可以给出保守、克制、可执行的建议。",
    "不要生成医疗诊断、心理诊断、风险评级。",
    "不要判断病情严重程度、家庭矛盾责任或财产状况。",
    "目标 JSON 示例：",
    buildJsonExampleText(),
    "输出限制：",
    "1. recordSummary 不超过 120 字。",
    "2. elderStatusInsight 不超过 120 字。",
    "3. newProfileInfo 最多 5 条。",
    "4. serviceOpportunities 最多 3 条。",
    "5. favoriteTopicsToAdd 最多 5 条。",
    "6. avoidTopicsToAdd 最多 5 条。",
    "7. serviceOpportunities.type 只能是以下值之一：phone_call, visit, birthday_care, profile_completion, activity_invitation, family_message, key_attention。",
    "输入信息：",
    JSON.stringify(structuredInput, null, 2),
  ].join("\n\n");
}

function parseAiJson(content) {
  const extracted = extractJsonText(content);

  try {
    return JSON.parse(extracted);
  } catch {
    throw createAppError(
      "AI返回结果格式异常，请稍后重试",
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
        temperature: 0.3,
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
          }
        );
      }

      return response.json();
    } catch (error) {
      if (error?.name === "AbortError") {
        throw createAppError(
          "AI分析超时，请稍后重试",
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
      return sendRequest(false);
    }

    throw error;
  }
}

function validateAiContent(content) {
  if (!sanitizeText(content)) {
    throw createAppError(
      "AI返回结果格式异常，请稍后重试",
      ERROR_CODE.JSON_PARSE_ERROR
    );
  }
}

function warnBriefly(code, message) {
  console.warn(`[analyze-service-record] ${code}: ${message}`);
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

  const elderSnapshot =
    body.elderSnapshot &&
    typeof body.elderSnapshot === "object" &&
    !Array.isArray(body.elderSnapshot)
      ? body.elderSnapshot
      : {};
  const serviceRecordInput = body.serviceRecordInput;

  if (
    !serviceRecordInput ||
    typeof serviceRecordInput !== "object" ||
    Array.isArray(serviceRecordInput)
  ) {
    return jsonResponse(
      {
        ok: false,
        source: "real_ai",
        error: "缺少 serviceRecordInput",
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
      userPrompt: buildUserPrompt(elderSnapshot, serviceRecordInput),
    });

    const content = response?.choices?.[0]?.message?.content;
    validateAiContent(content);

    const normalizedData = normalizeServiceRecordAnalysis(parseAiJson(content));

    return jsonResponse({
      ok: true,
      source: "real_ai",
      provider,
      model,
      data: {
        ...EMPTY_ANALYSIS,
        ...normalizedData,
        nextSuggestion: {
          ...EMPTY_ANALYSIS.nextSuggestion,
          ...normalizedData.nextSuggestion,
        },
        cardUpdateHints: {
          ...EMPTY_ANALYSIS.cardUpdateHints,
          ...normalizedData.cardUpdateHints,
        },
      },
      fallbackToMock,
    });
  } catch (error) {
    const appError = error?.code
      ? error
      : createAppError(
          "AI 分析失败，请稍后重试",
          ERROR_CODE.UNKNOWN_ERROR
        );

    warnBriefly(appError.code, appError.message);
    return buildErrorResponse(appError, fallbackToMock);
  }
}
