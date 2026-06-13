function clean(value) {
  return String(value || "").trim();
}

function limitText(text, maxLength) {
  const normalized = clean(text).replace(/\s+/g, "");
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).replace(/[，、；：。,.]+$/, "")}。`;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function splitText(value) {
  return clean(value)
    .split(/[，、；;,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function birthdayToMmDd(birthday) {
  const value = clean(birthday);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(5);
  if (/^\d{2}-\d{2}$/.test(value)) return value;
  return "";
}

function resolveBirthdaySource(elder = {}) {
  return elder?.birthDate || elder?.birthday || elder?.careDate || "";
}

function daysUntilBirthday(birthday, fromDate = new Date()) {
  const mmdd = birthdayToMmDd(birthday);
  if (!mmdd) return null;

  const [month, day] = mmdd.split("-").map(Number);
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  let target = new Date(fromDate.getFullYear(), month - 1, day);

  if (Number.isNaN(target.getTime())) return null;
  if (target < start) target = new Date(fromDate.getFullYear() + 1, month - 1, day);

  return Math.round((target - start) / (24 * 60 * 60 * 1000));
}

function birthdayDueDate(birthday) {
  const days = daysUntilBirthday(birthday);
  return days === null ? addDays(0) : addDays(days);
}

function isBirthdayOpportunityDue(birthday, withinDays = 14) {
  const days = daysUntilBirthday(birthday);
  return days !== null && days >= 0 && days <= withinDays;
}

function inferAiFavoriteTopics({ favoriteTopics, interests, formerJob, lifeExperience, familyNote }) {
  const topics = [];
  topics.push(...splitText(favoriteTopics));
  topics.push(...splitText(interests).slice(0, 3));
  if (clean(formerJob)) topics.push(`${clean(formerJob)}经历`);
  if (clean(lifeExperience)) topics.push("人生经历");
  if (clean(familyNote).includes("孙")) topics.push("孙辈近况");
  if (clean(familyNote).includes("女儿") || clean(familyNote).includes("儿子")) {
    topics.push("家人近况");
  }
  return unique(topics).slice(0, 5).join("、") || "日常近况、年轻时的经历";
}

function inferCommunicationAdvice({ communicationStyle, avoidTopics }) {
  if (clean(communicationStyle)) {
    return `${clean(communicationStyle).replace(/[。,.，]+$/, "")}；交流时保持耐心，多给老人表达时间。`;
  }
  if (clean(avoidTopics)) {
    return `先从轻松话题进入，主动避开${clean(avoidTopics)}，多听少问，观察老人情绪变化。`;
  }
  return "语速放慢，先寒暄再进入主题，多倾听、少打断，让老人有充分表达时间。";
}

function inferCareNote({ careNoteInput, communicationStyle, avoidTopics, staffNote }) {
  const parts = [];
  if (clean(careNoteInput)) parts.push(clean(careNoteInput));
  if (clean(communicationStyle)) parts.push(`沟通方式参考：${clean(communicationStyle)}`);
  if (clean(avoidTopics)) parts.push(`主动避开：${clean(avoidTopics)}`);
  if (clean(staffNote)) parts.push(`服务人员补充：${clean(staffNote)}`);
  if (!parts.length) parts.push("留意情绪和疲惫程度，必要时缩短陪伴时间。");
  return limitText(parts.join("；"), 100);
}

function buildStructuredNextSuggestion({
  aiFavoriteTopics,
  communicationAdvice,
  avoidTopics,
  careNote,
  familyNote,
  serviceContent,
  elderStatus,
}) {
  const firstTopic = splitText(aiFavoriteTopics)[0] || "日常近况";
  const openingExample = firstTopic.includes("儿子")
    ? "最近有没有和儿子联系？"
    : firstTopic.includes("女儿")
      ? "最近女儿有没有来看您？"
      : firstTopic.includes("家人") || firstTopic.includes("孙")
        ? "最近家里人都还好吗？"
        : `最近${firstTopic}还好吗？`;

  const opening = serviceContent
    ? `下次可先接着本次聊到的“${limitText(serviceContent, 18)}”温和展开，再过渡到老人熟悉的话题。`
    : `下次可先从${firstTopic}温和聊起，例如“${openingExample}”。`;

  const pace = clean(communicationAdvice)
    ? `${clean(communicationAdvice).replace(/[。,.，]+$/, "")}；一次只问一个问题，给老人充分表达时间。`
    : "沟通时语速放慢，先寒暄再进入主题，一次只问一个问题，给老人充分表达时间。";

  const avoid = clean(avoidTopics)
    ? `不主动提${clean(avoidTopics)}；如老人主动提到，先倾听和安抚，不急于评价或纠正。`
    : "避免追问让老人紧张或不舒服的细节，如老人表现犹豫，及时换成轻松话题。";

  const followUpParts = [];
  if (clean(elderStatus) === "低落" || clean(elderStatus) === "需要关注") {
    followUpParts.push("建议优先安排一次短探访，重点观察情绪、睡眠和食欲变化");
  }
  if (clean(careNote)) followUpParts.push(clean(careNote).replace(/[。,.，]+$/, ""));
  if (clean(familyNote)) followUpParts.push("必要时记录给家属的留言或电话关怀事项");
  if (!followUpParts.length) {
    followUpParts.push("记录老人对话题的回应，作为下次陪伴和服务机会判断依据");
  }

  return {
    opening: limitText(opening, 90),
    pace: limitText(pace, 90),
    avoid: limitText(avoid, 90),
    followUp: limitText(`${followUpParts.join("；")}。`, 90),
  };
}

function pickElderTags(data) {
  const source = [
    data.formerJob,
    data.lifeExperience,
    data.interests,
    data.favoriteTopics,
    data.aiFavoriteTopics,
    data.avoidTopics,
    data.communicationStyle,
    data.communicationAdvice,
    data.familyNote,
    data.careNoteInput,
    data.careNote,
    data.staffNote,
  ].join(" ");

  const rules = [
    ["花", "爱花草"],
    ["园艺", "爱花草"],
    ["电影", "老电影"],
    ["戏", "爱听戏"],
    ["唱", "爱文艺"],
    ["手工", "手工陪伴"],
    ["编织", "手工陪伴"],
    ["象棋", "棋类话题"],
    ["新闻", "关注时事"],
    ["家人", "重视家人"],
    ["孙", "牵挂孙辈"],
    ["慢", "语速放慢"],
    ["听力", "近距离沟通"],
    ["低落", "需要关注"],
    ["活动", "适合活动"],
    ["康复", "康复关注"],
  ];

  const matched = rules.filter(([keyword]) => source.includes(keyword)).map(([, tag]) => tag);
  return unique([...matched, "AI整理"]).slice(0, 5);
}

function buildServiceOpportunitiesForCard(data) {
  const opportunities = [];

  if (!clean(data.summary) || !clean(data.aiFavoriteTopics) || !clean(data.communicationAdvice)) {
    opportunities.push({
      type: "画像待完善",
      title: "AI提醒：继续补充知老画像",
      description: "下次服务后可补充喜欢话题、沟通方式和服务注意，让知老卡更完整。",
    });
  }

  if (clean(data.familyNote)) {
    opportunities.push({
      type: "家属留言建议",
      title: "AI建议：向家属同步近况",
      description: "知老卡中包含家属提醒，适合在服务后形成一次简短反馈。",
    });
  }

  if (clean(data.careNote).includes("低落") || clean(data.staffNote).includes("低落")) {
    opportunities.push({
      type: "重点关注提醒",
      title: "AI提醒：安排轻量关怀跟进",
      description: "信息中出现情绪关注点，建议优先安排一次短探访或电话问候。",
    });
  }

  if (clean(data.interests) || clean(data.aiFavoriteTopics)) {
    opportunities.push({
      type: "活动邀请建议",
      title: "AI建议：匹配轻量活动",
      description: `可结合“${limitText(data.interests || data.aiFavoriteTopics, 16)}”安排小型活动或一对一陪伴。`,
    });
  }

  return opportunities.slice(0, 4);
}

export function mockGenerateElderCard(formData) {
  const aiFavoriteTopics = inferAiFavoriteTopics(formData);
  const communicationAdvice = inferCommunicationAdvice(formData);
  const careNote = inferCareNote({ ...formData, communicationAdvice });
  const avoidTopics = clean(formData.avoidTopics);
  const name = clean(formData.name) || "这位长者";
  const formerJob = clean(formData.formerJob);
  const firstTopic = splitText(aiFavoriteTopics)[0] || "日常近况";

  const summaryBase = formerJob
    ? `${name}有${formerJob}经历，适合从${firstTopic}聊起，陪伴时温和慢聊、多倾听。`
    : `${name}适合从${firstTopic}聊起，陪伴时多倾听、慢回应，不急着追问细节。`;

  const completed = {
    ...formData,
    aiFavoriteTopics,
    avoidTopics,
    communicationAdvice,
    careNote,
  };

  return {
    summary: limitText(summaryBase, 50),
    tags: pickElderTags(completed),
    aiFavoriteTopics,
    communicationAdvice,
    careNote,
    nextSuggestion: buildStructuredNextSuggestion({
      aiFavoriteTopics,
      communicationAdvice,
      avoidTopics,
      careNote,
      familyNote: formData.familyNote,
    }),
    serviceOpportunities: buildServiceOpportunitiesForCard(completed),
  };
}

export function mockGenerateCommunicationAdvice(input) {
  const generated = mockGenerateElderCard(input);
  return {
    aiFavoriteTopics: generated.aiFavoriteTopics,
    communicationAdvice: generated.communicationAdvice,
    careNote: generated.careNote,
    nextSuggestion: generated.nextSuggestion,
  };
}

function inferRecordTags(record) {
  const source = `${record.content} ${record.newInfo} ${record.elderStatus}`;
  const tags = [];
  if (source.includes("低落") || source.includes("难过") || source.includes("不想说")) {
    tags.push("情绪关注");
  }
  if (source.includes("开心") || source.includes("高兴")) tags.push("积极回应");
  if (source.includes("家") || source.includes("女儿") || source.includes("儿子") || source.includes("孙")) {
    tags.push("家人牵挂");
  }
  if (source.includes("活动") || source.includes("手工") || source.includes("唱歌")) {
    tags.push("适合活动");
  }
  if (source.includes("康复") || source.includes("疼") || source.includes("累")) {
    tags.push("健康留意");
  }
  return unique([...tags, "AI新发现"]).slice(0, 4);
}

export function mockAnalyzeServiceRecord({ elder, record }) {
  const elderName = elder?.name || "这位长者";
  const topic =
    splitText(record.newInfo)[0] ||
    limitText(record.content, 18) ||
    splitText(elder?.aiFavoriteTopics || elder?.favoriteTopics)[0] ||
    "今天聊到的内容";
  const suggestedTags = inferRecordTags(record);
  const needsAttention = record.elderStatus === "低落" || record.elderStatus === "需要关注";

  const nextSuggestion = buildStructuredNextSuggestion({
    aiFavoriteTopics: elder?.aiFavoriteTopics || elder?.favoriteTopics || topic,
    communicationAdvice: elder?.communicationAdvice || elder?.communicationStyle,
    avoidTopics: elder?.avoidTopics,
    careNote: elder?.careNote || elder?.careNoteInput,
    familyNote: elder?.familyNote,
    serviceContent: topic,
    elderStatus: record.elderStatus,
  });

  const opportunityType = needsAttention
    ? "重点关注提醒"
    : clean(record.newInfo)
      ? "画像待完善"
      : "活动邀请建议";

  return {
    nextSuggestion,
    suggestedTags,
    serviceOpportunity: {
      id: `ai-op-${record.id}`,
      organizationId: record.organizationId || "org_demo",
      elderId: record.elderId,
      type: opportunityType,
      title: `AI发现：${elderName}需要下一步跟进`,
      description: needsAttention
        ? "本次记录显示情绪或状态需要关注，建议安排一次更轻量的关怀跟进。"
        : "本次服务记录出现新的兴趣或生活信息，建议补充到知老卡并安排下一次陪伴。",
      status: "pending",
      dueDate: addDays(needsAttention ? 1 : 3),
      createdAt: new Date().toISOString(),
      completedAt: "",
      relatedRecordId: "",
      dismissReason: "",
      dismissedAt: "",
      source: "ai",
    },
  };
}

export function shouldShowBirthdayOpportunity(elder) {
  return isBirthdayOpportunityDue(resolveBirthdaySource(elder), 14);
}

export function mockDiscoverServiceOpportunities({ elders = [], records = [], opportunities = [] }) {
  const existingIds = new Set(opportunities.map((item) => item.id));
  const generated = [];

  elders.forEach((elder, index) => {
    const elderRecords = records
      .filter((record) => record.elderId === elder.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestRecord = elderRecords[0];
    const base = {
      elderId: elder.id,
      organizationId: elder.organizationId || "org_demo",
      status: "pending",
      source: "ai",
      createdAt: new Date().toISOString(),
      completedAt: "",
      relatedRecordId: "",
      dismissReason: "",
      dismissedAt: "",
    };
    const candidates = [];

    if (shouldShowBirthdayOpportunity(elder)) {
      const birthdaySource = resolveBirthdaySource(elder);
      const days = daysUntilBirthday(birthdaySource);
      candidates.push({
        id: `ai-birthday-${elder.id}`,
        type: "生日关怀",
        title: days === 0 ? `AI提醒：今天是${elder.name}生日` : `AI提醒：${elder.name}生日快到了`,
        description:
          days === 0
            ? "生日就在今天，建议安排一次温暖问候、祝福或陪伴。"
            : `${days} 天后是生日，建议提前准备祝福、照片或轻量陪伴。`,
        dueDate: birthdayDueDate(birthdaySource),
      });
    }

    if (!latestRecord || Date.now() - new Date(latestRecord.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
      candidates.push({
        id: `ai-visit-${elder.id}`,
        type: "长期未探访",
        title: `AI提醒：${elder.name}需要一次探访`,
        description: "AI发现最近服务记录较少，建议安排短探访，确认情绪和生活状态。",
        dueDate: addDays(1 + index),
      });
    }

    if (elder.familyNote) {
      candidates.push({
        id: `ai-family-${elder.id}`,
        type: "家属留言建议",
        title: `AI建议：向${elder.name}家属同步近况`,
        description: elder.familyNote,
        dueDate: addDays(2 + index),
      });
    }

    if (!elder.summary || !elder.aiFavoriteTopics || !elder.communicationAdvice) {
      candidates.push({
        id: `ai-profile-${elder.id}`,
        type: "画像待完善",
        title: `AI提醒：完善${elder.name}的知老画像`,
        description: "AI发现画像信息还不完整，建议服务后补充聊天话题、沟通方式或服务注意。",
        dueDate: addDays(3 + index),
      });
    }

    if (elder.interests || elder.aiFavoriteTopics || elder.favoriteTopics) {
      candidates.push({
        id: `ai-activity-${elder.id}`,
        type: "活动邀请建议",
        title: `AI建议：邀请${elder.name}参加合适活动`,
        description: "结合兴趣和知老卡内容，可尝试安排一次轻量活动或一对一陪伴。",
        dueDate: addDays(4 + index),
      });
    }

    if (
      latestRecord?.elderStatus === "低落" ||
      latestRecord?.elderStatus === "需要关注" ||
      elder.tags?.includes("需要关注")
    ) {
      candidates.push({
        id: `ai-focus-${elder.id}`,
        type: "重点关注提醒",
        title: `AI重点关注：${elder.name}近期状态需跟进`,
        description: "AI结合知老卡和服务记录，建议优先安排一次更有准备的关怀跟进。",
        dueDate: addDays(1),
      });
    }

    candidates.forEach((candidate) => {
      if (!existingIds.has(candidate.id)) generated.push({ ...base, ...candidate });
    });
  });

  return generated.slice(0, 10);
}
