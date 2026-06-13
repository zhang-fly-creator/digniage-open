import {
  ArrowLeft,
  Building2,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const painPoints = [
  "老人的经历、兴趣和沟通习惯分散在不同人手里。",
  "新来的服务人员或志愿者不了解老人，每次都像从零开始。",
  "服务记录写了，但很难转化为下一次服务建议。",
  "活动结束后只留下照片，缺少可沉淀的服务成果。",
  "家属知道很多重要信息，却没有合适方式参与补充。",
];

const functionCards = [
  {
    title: "建立 AI 知老卡",
    note: "为每位长者建立一张清晰、温暖、可服务的知老卡，整理老人经历、兴趣、沟通偏好、服务注意和下次陪伴建议。",
    icon: HeartHandshake,
    tone: "bg-app-orangeSoft",
  },
  {
    title: "发现服务机会",
    note: "系统根据长者资料、生日关怀、长期未探访、画像待完善、家属留言、活动适配等信息，提醒机构下一步该关注谁。",
    icon: Sparkles,
    tone: "bg-app-blue",
  },
  {
    title: "记录每一次服务",
    note: "服务人员或志愿者可以用一分钟记录今天做了什么、老人状态如何、聊到了什么、是否需要后续跟进。",
    icon: ClipboardList,
    tone: "bg-app-green",
  },
  {
    title: "组织公益活动",
    note: "机构可以围绕助餐、探访、生日会、老照片故事会、节日慰问等活动，组织志愿者参与，并关联具体服务对象。",
    icon: Users,
    tone: "bg-app-cream",
  },
  {
    title: "形成机构成果",
    note: "每一次服务和活动都可以沉淀为服务记录、后续关怀名单、活动简报、公益成果和典型案例。",
    icon: Building2,
    tone: "bg-app-orangeSoft",
  },
  {
    title: "连接家属与志愿者",
    note: "家属可以补充老人经历和重要提醒，志愿者可以查看本次服务所需的陪伴提示，让服务更准确、更自然。",
    icon: HandHeart,
    tone: "bg-app-blue",
  },
];

const audiences = [
  {
    title: "养老机构",
    note: "用于建立长者画像、提升个性化照护和服务交接效率。",
  },
  {
    title: "社区养老中心",
    note: "用于日常探访、活动组织、重点老人跟进和服务记录沉淀。",
  },
  {
    title: "老年公益组织",
    note: "用于公益探访、助餐活动、节日慰问和志愿者协作。",
  },
  {
    title: "残联助残服务点",
    note: "用于一老一残关怀、困难家庭跟进、服务对象画像和持续回访。",
  },
  {
    title: "志愿服务团队",
    note: "用于活动前了解老人、活动后记录服务、沉淀个人和团队公益成果。",
  },
  {
    title: "高校与企业公益团队",
    note: "用于组织学生志愿者、企业公益活动和长期公益服务项目。",
  },
];

const coreFlow = [
  {
    title: "第一步：开通机构空间",
    note: "机构拥有自己的服务空间，用于管理长者、成员、服务机会、服务记录和活动成果。",
  },
  {
    title: "第二步：录入第一批长者",
    note: "先从少量长者开始，填写基础信息、人生经历、兴趣爱好、沟通注意和家属提醒。",
  },
  {
    title: "第三步：生成 AI 知老卡",
    note: "系统根据人工填写的真实信息，生成一句话画像、推荐聊天话题、沟通建议和下次陪伴方案。",
  },
  {
    title: "第四步：查看服务机会",
    note: "系统自动提醒哪些长者需要生日关怀、探访跟进、画像补充、电话问候或活动邀请。",
  },
  {
    title: "第五步：组织服务或活动",
    note: "机构可以安排服务人员、社工、护理员或志愿者开展探访、陪伴、助餐、生日会等服务。",
  },
  {
    title: "第六步：沉淀服务成果",
    note: "服务后填写记录，系统帮助机构形成后续建议、重点关注名单、活动简报和公益成果。",
  },
];

const cooperationCards = [
  {
    title: "机构体验试点",
    note: "适合养老机构、社区养老中心、公益组织先小范围体验。建议从少量长者和一次服务活动开始，验证知老卡和服务闭环是否真正有用。",
  },
  {
    title: "机构正式入驻",
    note: "适合有长期服务对象和固定服务团队的机构。可建立机构空间，管理长者、成员、服务机会、服务记录和活动成果。",
  },
  {
    title: "公益共创点",
    note: "适合公益组织、志愿服务团队、社区服务站。围绕助餐、探访、生日会、节日慰问、老照片故事会等活动，持续沉淀公益成果。",
  },
  {
    title: "城市共创合作",
    note: "适合城市级公益行动、残联项目、社区养老服务网络。可逐步形成城市知老行动数据、机构成果、志愿者足迹和典型案例。",
  },
];

function scrollToCooperation() {
  const target = document.getElementById("cooperation");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function OrganizationPartnerPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[34px] bg-app-white p-5 shadow-card">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#fff7eb_0%,#fef4df_45%,#f7ecd8_100%)] p-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-app-ink">机构指南</h1>
          <p className="mt-3 text-lg font-medium leading-8 text-app-muted">
            让机构更懂老人，让服务更有延续，让公益更有沉淀。
          </p>
          <p className="mt-4 text-base leading-7 text-app-ink/85">
            知老面向养老机构、社区养老中心、老年公益组织、残联助残服务点、志愿服务团队等，提供 AI 知老卡、服务机会提醒、服务记录闭环、志愿者协作和服务成果沉淀能力。
          </p>
          <p className="mt-3 text-base leading-7 text-app-ink/85">
            它不是替代机构原有管理系统，而是帮助机构把老人信息转化为每一次具体、可执行、有温度的服务行动。
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={scrollToCooperation} className="primary-btn min-h-12">
              了解合作方式
            </button>
            <Link to="/" className="secondary-btn min-h-12">
              <ArrowLeft size={18} />
              返回首页
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">很多服务做了，但经验没有留下来</h2>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <p className="text-base leading-8 text-app-ink/90">
            在养老、助老和公益服务中，机构常常已经做了很多工作：探访老人、组织活动、联系家属、安排志愿者、记录服务情况。
          </p>
          <div className="mt-4 grid gap-3">
            {painPoints.map((item) => (
              <div key={item} className="rounded-[22px] bg-app-cream px-4 py-3">
                <p className="text-sm font-bold leading-6 text-app-ink/85">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-base font-extrabold leading-8 text-app-ink">
            知老要解决的，不只是“有没有服务”，而是让机构逐步知道：下一次，应该怎样更懂这位老人。
          </p>
        </article>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">知老可以帮机构做什么</h2>
        <div className="grid gap-3">
          {functionCards.map(({ title, note, icon: Icon, tone }) => (
            <article key={title} className={`${tone} rounded-[24px] p-4 shadow-sm`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-app-ink">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-app-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-app-ink/80">{note}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">适合哪些机构使用</h2>
        <div className="grid gap-3">
          {audiences.map((item) => (
            <article key={item.title} className="rounded-[24px] bg-app-white p-4 shadow-sm">
              <h3 className="text-base font-extrabold text-app-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-ink/80">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">六步完成一次机构服务闭环</h2>
        <div className="grid gap-3">
          {coreFlow.map((step, index) => (
            <article key={step.title} className="rounded-[22px] bg-app-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-orange text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-app-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-app-ink/80">{step.note}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="rounded-[22px] bg-app-orangeSoft px-4 py-3 text-sm font-extrabold text-app-ink">
          建知老卡 → 发现机会 → 安排服务 → 填写记录 → 更新建议 → 沉淀成果
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">不是让机构多填表，而是让服务更有方法</h2>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <p className="text-base leading-8 text-app-ink/90">
            知老不是为了增加基层人员的记录压力，也不是把养老服务变成复杂后台。
          </p>
          <div className="mt-4 grid gap-3">
            {[
              "服务前，帮助服务人员快速了解老人；",
              "服务中，提醒适合聊什么、注意避开什么；",
              "服务后，用简短记录形成下一次服务建议；",
              "活动后，帮助机构沉淀服务成果和公益案例。",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-app-cream px-4 py-3 text-sm font-bold leading-6 text-app-ink/85">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-base font-extrabold leading-8 text-app-ink">
            机构不需要一开始录入大量数据，可以先从 10 位长者、1 场活动、1 个服务团队开始试点。
          </p>
        </article>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">机构可以获得哪些价值</h2>
        <div className="grid gap-3">
          {[
            ["对老人", "让老人不只是被照顾，更被理解；每一次服务都能延续上一次的了解。"],
            ["对服务人员", "不用每次从陌生开始，服务前就知道老人喜欢什么、忌讳什么、怎么沟通。"],
            ["对志愿者", "志愿者不再只是“去现场帮忙”，而是带着陪伴提示参与服务。"],
            ["对家属", "家属可以补充重要信息，让机构更准确理解老人。"],
            ["对机构", "服务记录、活动成果、公益案例可以持续沉淀，方便复盘、展示和汇报。"],
            ["对城市公益", "多个机构和团队可以逐步形成知老行动网络，推动更有温度的城市助老服务。"],
          ].map(([title, note]) => (
            <article key={title} className="rounded-[24px] bg-app-white p-4 shadow-sm">
              <h3 className="text-base font-extrabold text-app-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-ink/80">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="cooperation" className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">机构如何开始使用</h2>
        <div className="grid gap-3">
          {cooperationCards.map((item) => (
            <article key={item.title} className="rounded-[24px] bg-app-white p-4 shadow-sm">
              <h3 className="text-base font-extrabold text-app-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-ink/80">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">老人信息要被珍惜，而不是被随意展示</h2>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <p className="text-base leading-8 text-app-ink/90">
            知老坚持隐私优先、人工确认、分级可见。
          </p>
          <div className="mt-4 grid gap-3">
            {[
              "机构内部可以查看服务所需信息；",
              "志愿者只查看本次服务相关的陪伴提示；",
              "家属补充内容需要经过机构审核；",
              "对外展示的公益内容必须脱敏处理。",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-app-cream px-4 py-3 text-sm font-bold leading-6 text-app-ink/85">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {[
              "不公开展示身份证号、详细病历、家庭纠纷、财产情况等敏感信息。",
              "AI 生成内容仅用于服务辅助，不能替代医生、护士、社工和专业评估人员。",
              "对外展示的活动成果、老人故事和公益案例，必须由机构审核后再发布。",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-app-orangeSoft px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-app-orange">
                    <ShieldCheck size={16} />
                  </span>
                  <p className="text-sm font-bold leading-6 text-app-ink/85">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <h2 className="text-2xl font-extrabold text-app-ink">从第一批长者、第一次服务、第一份成果开始</h2>
        <p className="mt-3 text-base leading-7 text-app-ink/85">
          知老不要求机构一开始就完成复杂系统建设。我们建议从一个小试点开始：录入第一批长者，生成第一批知老卡，完成第一次服务记录，组织一次小型活动，形成第一份机构服务成果。
        </p>
        <p className="mt-3 text-base leading-7 text-app-ink/85">
          当服务可以被记录，经验可以被延续，公益可以被沉淀，机构的助老服务就会越来越有方法。
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => window.alert("请登录后联系平台开通机构空间。")}
            className="primary-btn min-h-12"
          >
            开始机构试点
          </button>
          <button
            type="button"
            onClick={() => window.alert("产品演示功能即将开放，可先联系平台工作人员。")}
            className="secondary-btn min-h-12"
          >
            预约产品演示
          </button>
          <Link to="/" className="secondary-btn min-h-12">
            <ArrowLeft size={18} />
            返回首页
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] bg-app-cream px-4 py-4 text-sm font-bold leading-6 text-app-muted">
        知老，让机构更懂老人；让服务人员更有方法；让志愿者更容易参与；让家属更好协同；让每一次服务都能沉淀为下一次更好的陪伴。
      </section>
    </div>
  );
}

export default OrganizationPartnerPage;
