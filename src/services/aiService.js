import {
  mockAnalyzeServiceRecord,
  mockDiscoverServiceOpportunities,
  mockGenerateCommunicationAdvice,
  mockGenerateElderCard,
} from "../utils/mockAI.js";
import { calculateAge } from "../utils/age.js";

const ELDER_CARD_ENDPOINT = "/api/ai/generate-elder-card";
const SERVICE_RECORD_ANALYSIS_ENDPOINT = "/api/ai/analyze-service-record";
const REQUEST_TIMEOUT_MS = 35000;
const MOCK_ELDER_CARD_WARNING = "真实 AI 暂不可用，已使用本地模拟建议。";
const MOCK_RECORD_WARNING = "真实 AI 暂不可用，已使用本地模拟分析。";

function normalizeArray(value, maxItems = 5) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, maxItems);
  }

  if (typeof value === "string") {
    return value
      .split(/[，、,；;\n\r\s]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, maxItems);
  }

  return [];
}

function normalizeNextSuggestion(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      opening: String(value.opening || ""),
      pace: String(value.pace || ""),
      avoid: String(value.avoid || ""),
      followUp: String(value.followUp || ""),
    };
  }

  return {
    opening: "",
    pace: "",
    avoid: "",
    followUp: String(value || ""),
  };
}

function normalizeServiceOpportunities(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;

      return {
        type: String(item.type || "").trim(),
        title: String(item.title || "").trim(),
        description: String(item.description || "").trim(),
      };
    })
    .filter((item) => item && (item.type || item.title || item.description))
    .slice(0, 3);
}

function normalizeInput(input) {
  const normalizedBirthday =
    input?.birthday ||
    input?.careDate ||
    (/^\d{4}-\d{2}-\d{2}$/.test(input?.birthDate || "") ? String(input.birthDate).slice(5) : "");

  return {
    name: String(input?.name || "").trim(),
    age: String(input?.age || calculateAge(input?.birthDate) || "").trim(),
    gender: String(input?.gender || "").trim(),
    nickname: String(input?.nickname || "").trim(),
    birthday: String(normalizedBirthday || "").trim(),
    formerJob: String(input?.formerJob || "").trim(),
    lifeExperience: String(input?.lifeExperience || "").trim(),
    interests: String(input?.interests || "").trim(),
    favoriteTopicsInput: String(input?.favoriteTopicsInput || input?.favoriteTopics || "").trim(),
    avoidTopicsInput: String(input?.avoidTopicsInput || input?.avoidTopics || "").trim(),
    communicationStyle: String(input?.communicationStyle || "").trim(),
    familyNote: String(input?.familyNote || "").trim(),
    careNoteInput: String(input?.careNoteInput || "").trim(),
    staffNote: String(input?.staffNote || "").trim(),
  };
}

function normalizeElderCardResult(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AI result is not an object");
  }

  const favoriteTopics = normalizeArray(value.favoriteTopics);
  const avoidTopics = normalizeArray(value.avoidTopics);
  const tags = normalizeArray(value.tags);

  return {
    summary: String(value.summary || ""),
    tags,
    favoriteTopics,
    avoidTopics,
    aiFavoriteTopics: favoriteTopics.join("、"),
    generatedFavoriteTopics: favoriteTopics,
    generatedAvoidTopics: avoidTopics,
    communicationAdvice: String(value.communicationAdvice || ""),
    careNote: String(value.careNote || ""),
    nextSuggestion: normalizeNextSuggestion(value.nextSuggestion),
    serviceOpportunities: normalizeServiceOpportunities(value.serviceOpportunities),
  };
}

function isValidElderCardResult(data) {
  try {
    const normalized = normalizeElderCardResult(data);

    return (
      typeof normalized.summary === "string" &&
      Array.isArray(normalized.tags) &&
      Array.isArray(normalized.favoriteTopics) &&
      Array.isArray(normalized.avoidTopics) &&
      typeof normalized.communicationAdvice === "string" &&
      typeof normalized.careNote === "string" &&
      normalized.nextSuggestion &&
      typeof normalized.nextSuggestion === "object"
    );
  } catch {
    return false;
  }
}

function normalizeElderSnapshot(source) {
  const elder = source && typeof source === "object" && !Array.isArray(source) ? source : {};

  return {
    id: String(elder.id || "").trim(),
    name: String(elder.name || "").trim(),
    age: String(elder.age || "").trim(),
    gender: String(elder.gender || "").trim(),
    nickname: String(elder.nickname || "").trim(),
    summary: String(elder.summary || "").trim(),
    tags: normalizeArray(elder.tags),
    favoriteTopics: normalizeArray(elder.favoriteTopics || elder.generatedFavoriteTopics),
    avoidTopics: normalizeArray(elder.avoidTopics || elder.generatedAvoidTopics),
    communicationAdvice: String(elder.communicationAdvice || "").trim(),
    careNote: String(elder.careNote || "").trim(),
    nextSuggestion: normalizeNextSuggestion(elder.nextSuggestion),
  };
}

function normalizeServiceRecordInput(source) {
  const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};

  return {
    elderId: String(record.elderId || "").trim(),
    relatedOpportunityId: String(record.relatedOpportunityId || "").trim(),
    relatedOpportunityTitle: String(record.relatedOpportunityTitle || "").trim(),
    serviceType: String(record.serviceType || "").trim(),
    elderStatus: String(record.elderStatus || "").trim(),
    content: String(record.content || "").trim(),
    newInfo: String(record.newInfo || "").trim(),
    nextSuggestion: String(record.nextSuggestion || "").trim(),
    operatorName: String(record.operatorName || "").trim(),
  };
}

function normalizeServiceRecordAnalysisResult(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("AI analysis result is not an object");
  }

  const nextSuggestion = normalizeNextSuggestion(value.nextSuggestion);
  const newProfileInfo = normalizeArray(value.newProfileInfo, 5);
  const serviceOpportunities = normalizeServiceOpportunities(
    value.serviceOpportunities || value.generatedOpportunities
  );
  const cardUpdateHintsSource =
    value.cardUpdateHints && typeof value.cardUpdateHints === "object" && !Array.isArray(value.cardUpdateHints)
      ? value.cardUpdateHints
      : {};

  const suggestedTags = normalizeArray(
    value.suggestedTags ||
      cardUpdateHintsSource.favoriteTopicsToAdd ||
      cardUpdateHintsSource.avoidTopicsToAdd,
    5
  );

  return {
    recordSummary: String(value.recordSummary || value.summary || "").trim(),
    elderStatusInsight: String(value.elderStatusInsight || "").trim(),
    newProfileInfo,
    nextSuggestion,
    serviceOpportunities,
    cardUpdateHints: {
      favoriteTopicsToAdd: normalizeArray(cardUpdateHintsSource.favoriteTopicsToAdd, 5),
      avoidTopicsToAdd: normalizeArray(cardUpdateHintsSource.avoidTopicsToAdd, 5),
      careNoteSuggestion: String(cardUpdateHintsSource.careNoteSuggestion || "").trim(),
      communicationAdviceSuggestion: String(
        cardUpdateHintsSource.communicationAdviceSuggestion || ""
      ).trim(),
    },
    suggestedTags,
    serviceOpportunity: serviceOpportunities[0] || null,
    generatedOpportunities: serviceOpportunities,
  };
}

function isValidServiceRecordAnalysisResult(data) {
  try {
    const normalized = normalizeServiceRecordAnalysisResult(data);

    return (
      typeof normalized.recordSummary === "string" &&
      typeof normalized.elderStatusInsight === "string" &&
      Array.isArray(normalized.newProfileInfo) &&
      normalized.nextSuggestion &&
      typeof normalized.nextSuggestion === "object" &&
      Array.isArray(normalized.serviceOpportunities) &&
      normalized.cardUpdateHints &&
      typeof normalized.cardUpdateHints === "object"
    );
  } catch {
    return false;
  }
}

async function postJsonWithTimeout(endpoint, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    return {
      responseOk: response.ok,
      payload: body,
    };
  } finally {
    clearTimeout(timer);
  }
}

function buildRealAiElderCardResult(responsePayload) {
  const normalized = normalizeElderCardResult(responsePayload.data);

  return {
    data: {
      ...normalized,
      _aiSource: "real_ai",
      _aiProvider: String(responsePayload.provider || "").trim(),
      _aiModel: String(responsePayload.model || "").trim(),
      _aiWarning: "",
    },
    meta: {
      source: "real_ai",
      provider: String(responsePayload.provider || "").trim(),
      model: String(responsePayload.model || "").trim(),
      fallbackUsed: false,
      warning: "",
    },
  };
}

function buildMockElderCardFallbackResult(input) {
  const mockResult = mockGenerateElderCard(input);
  const normalized = normalizeElderCardResult({
    ...mockResult,
    favoriteTopics: mockResult.aiFavoriteTopics,
    avoidTopics: input?.avoidTopics || input?.avoidTopicsInput || "",
  });

  return {
    data: {
      ...normalized,
      _aiSource: "mock_fallback",
      _aiProvider: "",
      _aiModel: "",
      _aiWarning: MOCK_ELDER_CARD_WARNING,
    },
    meta: {
      source: "mock_fallback",
      provider: "",
      model: "",
      fallbackUsed: true,
      warning: MOCK_ELDER_CARD_WARNING,
    },
  };
}

function buildRealRecordAnalysisResult(responsePayload) {
  const normalized = normalizeServiceRecordAnalysisResult(responsePayload.data);

  return {
    ...normalized,
    _aiSource: "real_ai",
    _aiProvider: String(responsePayload.provider || "").trim(),
    _aiModel: String(responsePayload.model || "").trim(),
    _aiWarning: "",
  };
}

function buildMockRecordAnalysisFallbackResult(input) {
  const elderSnapshot = normalizeElderSnapshot(input?.elderSnapshot || input?.elder);
  const serviceRecordInput = normalizeServiceRecordInput(
    input?.serviceRecordInput || input?.record
  );
  const mockResult = mockAnalyzeServiceRecord({
    elder: elderSnapshot,
    record: serviceRecordInput,
  });

  const normalized = normalizeServiceRecordAnalysisResult({
    recordSummary: serviceRecordInput.content || mockResult.summary || "",
    elderStatusInsight: "",
    newProfileInfo: serviceRecordInput.newInfo ? [serviceRecordInput.newInfo] : [],
    nextSuggestion: mockResult.nextSuggestion,
    serviceOpportunities: mockResult.generatedOpportunities || [],
    cardUpdateHints: {
      favoriteTopicsToAdd: [],
      avoidTopicsToAdd: [],
      careNoteSuggestion: "",
      communicationAdviceSuggestion: "",
    },
    suggestedTags: mockResult.suggestedTags || [],
    serviceOpportunity: mockResult.serviceOpportunity || null,
    generatedOpportunities: mockResult.generatedOpportunities || [],
  });

  return {
    ...normalized,
    suggestedTags: normalizeArray(mockResult.suggestedTags, 5),
    serviceOpportunity: mockResult.serviceOpportunity || normalized.serviceOpportunity,
    generatedOpportunities:
      normalizeServiceOpportunities(mockResult.generatedOpportunities) ||
      normalized.generatedOpportunities,
    _aiSource: "mock_fallback",
    _aiProvider: "",
    _aiModel: "",
    _aiWarning: MOCK_RECORD_WARNING,
  };
}

function requestServiceRecordAnalysisSync(elderSnapshot, serviceRecordInput) {
  if (typeof window === "undefined" || typeof XMLHttpRequest === "undefined") {
    throw new Error("XMLHttpRequest is not available");
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", SERVICE_RECORD_ANALYSIS_ENDPOINT, false);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(
    JSON.stringify({
      elderSnapshot,
      serviceRecordInput,
    })
  );

  let payload = null;
  try {
    payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
  } catch {
    payload = null;
  }

  return {
    responseOk: xhr.status >= 200 && xhr.status < 300,
    payload,
  };
}

export async function generateElderCard(input) {
  const normalizedInput = normalizeInput(input);

  try {
    const { responseOk, payload } = await postJsonWithTimeout(ELDER_CARD_ENDPOINT, {
      elderInput: normalizedInput,
    });

    if (responseOk && payload?.ok === true && payload?.data && isValidElderCardResult(payload.data)) {
      return buildRealAiElderCardResult(payload);
    }

    console.warn("[KnowElder] Real elder-card AI unavailable, fallback to mockAI.");
    return buildMockElderCardFallbackResult(input);
  } catch (error) {
    const isTimeout = error?.name === "AbortError";
    console.warn(
      isTimeout
        ? "[KnowElder] Real elder-card AI request timed out, fallback to mockAI."
        : "[KnowElder] Real elder-card AI request failed, fallback to mockAI."
    );
    return buildMockElderCardFallbackResult(input);
  }
}

export function generateCommunicationAdvice(input) {
  return mockGenerateCommunicationAdvice(input);
}

export function analyzeServiceRecord(input) {
  const elderSnapshot = normalizeElderSnapshot(input?.elderSnapshot || input?.elder);
  const serviceRecordInput = normalizeServiceRecordInput(
    input?.serviceRecordInput || input?.record
  );

  const mockInput = {
    elder: elderSnapshot,
    record: serviceRecordInput,
  };

  try {
    const { responseOk, payload } = requestServiceRecordAnalysisSync(
      elderSnapshot,
      serviceRecordInput
    );

    if (
      responseOk &&
      payload?.ok === true &&
      payload?.data &&
      isValidServiceRecordAnalysisResult(payload.data)
    ) {
      return buildRealRecordAnalysisResult(payload);
    }

    console.warn("[KnowElder] Real record-analysis AI unavailable, fallback to mockAI.");
    return buildMockRecordAnalysisFallbackResult(mockInput);
  } catch {
    console.warn("[KnowElder] Real record-analysis AI request failed, fallback to mockAI.");
    return buildMockRecordAnalysisFallbackResult(mockInput);
  }
}

export function generateServiceOpportunities(input) {
  return mockDiscoverServiceOpportunities(input);
}
