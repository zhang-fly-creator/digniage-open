import {
  ArrowLeft,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";

const audienceCards = [
  ["养老机构护理员", "用于服务前了解长者情况，服务后记录照护与陪伴情况。"],
  ["社区养老工作人员", "用于日常探访、电话问候、活动邀请和重点老人跟进。"],
  ["社工与活动老师", "用于组织活动前了解老人兴趣，活动后沉淀参与情况。"],
  ["公益组织服务人员", "用于探访前查看陪伴提示，探访后记录老人状态和后续需求。"],
  ["残联助残服务人员", "用于一老一残关怀、困难家庭回访和服务对象持续跟进。"],
  ["志愿队长与服务协调人", "用于分配服务任务、查看服务机会、跟进服务记录和活动成果。"],
];

const functionCards = [
  ["查看今日重点长者", "进入首页后，先查看今天需要重点关注的老人，了解近期状态和服务提示。", Users, "bg-app-green"],
  ["查看知老卡", "服务前查看老人喜欢聊什么、需要避开什么、沟通方式和下次陪伴建议。", HeartHandshake, "bg-app-blue"],
  ["处理服务机会", "根据系统提醒，完成电话问候、探访安排、生日关怀、画像补充、活动邀请等任务。", Sparkles, "bg-app-orangeSoft"],
  ["填写服务记录", "服务后用一分钟记录今天做了什么、老人状态如何、聊到了什么、是否需要后续跟进。", ClipboardList, "bg-app-cream"],
  ["更新老人画像", "把服务中新发现的信息补充到知老卡，让下一次服务更准确。", Wand2, "bg-app-blue"],
  ["协同家属与志愿者", "根据家属提醒和活动安排，为志愿者提供必要的陪伴提示，让服务更顺畅。", HandHeart, "bg-app-orangeSoft"],
];

const flowSteps = [
  ["第一步：服务前，看懂老人", "打开知老卡，先看一句话画像、推荐聊天话题、需要避开的话题、沟通建议和服务注意。"],
  ["第二步：服务中，有方法地陪伴", "根据系统提示选择合适的开场方式，不急着追问，不生硬聊天，尽量从老人熟悉和喜欢的话题进入。"],
  ["第三步：服务后，记录一下", "服务结束后，用简短文字记录今天做了什么、老人状态如何、有没有新发现、下次是否需要跟进。"],
  ["第四步：持续跟进，形成闭环", "系统会根据服务记录更新陪伴建议，生成新的服务机会，让下一次服务不是重新开始。"],
];

function scrollToFlow() {
  const target = document.getElementById("staff-flow");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function StaffGuidePage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[34px] bg-app-white p-5 shadow-card">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#fff7eb_0%,#fef4df_45%,#f7ecd8_100%)] p-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-app-ink">让每一次服务都有准备、有方法、有延续</h1>
          <p className="mt-3 text-lg font-medium leading-8 text-app-muted">
            知老帮助服务人员在服务前快速了解老人，服务中自然陪伴，服务后留下记录，让下一次服务更有依据。
          </p>
          <p className="mt-4 text-base leading-7 text-app-ink/85">
            服务人员不只是完成一次探访、一次陪伴、一次活动，而是在一次次服务中持续理解老人。知老把老人信息、沟通建议、服务机会和服务记录连接起来，帮助服务人员更有方法地开展助老服务。
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={scrollToFlow} className="primary-btn min-h-12">
              查看服务流程
            </button>
            <Link to="/auth" className="secondary-btn min-h-12">
              登录进入工作台
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">这个页面适合哪些服务人员？</h2>
        <div className="grid gap-3">
          {audienceCards.map(([title, note]) => (
            <article key={title} className="rounded-[24px] bg-app-white p-4 shadow-sm">
              <h3 className="text-base font-extrabold text-app-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-ink/80">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">服务人员可以在知老里做什么？</h2>
        <div className="grid gap-3">
          {functionCards.map(([title, note, Icon, tone]) => (
            <article key={title} className={`rounded-[24px] ${tone} p-4 shadow-sm`}>
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

      <section id="staff-flow" className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">服务人员四步工作流程</h2>
        <div className="grid gap-3">
          {flowSteps.map(([title, note], index) => (
            <article key={title} className="rounded-[22px] bg-app-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-orange text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-app-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-app-ink/80">{note}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="rounded-[22px] bg-app-orangeSoft px-4 py-3 text-sm font-extrabold text-app-ink">
          看知老卡 → 处理服务机会 → 填写服务记录 → 形成下次建议
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">服务前，先用 30 秒看懂老人</h2>
        <p className="px-1 text-sm font-bold leading-6 text-app-muted">
          知老卡不是一份复杂档案，而是一张服务前可以快速查看的陪伴提示卡。
        </p>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <h3 className="text-2xl font-extrabold text-app-ink">王叔叔</h3>
          <p className="mt-2 text-base leading-7 text-app-ink/85">
            82岁，原来在工厂工作，喜欢聊老厂故事、象棋和本地老街变化。
          </p>
          <div className="mt-4 rounded-[22px] bg-app-orangeSoft px-4 py-3">
            <p className="text-sm font-bold text-app-muted">一句话认识：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              王叔叔性格直爽，喜欢被认真倾听，适合从年轻时的工作经历聊起。
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-green px-4 py-3">
            <p className="text-sm font-bold text-app-muted">可以聊：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              老工厂、象棋、本地老街、年轻时的工作故事
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-orangeSoft px-4 py-3">
            <p className="text-sm font-bold text-app-muted">需要避开：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              不要一开始追问身体情况，不要催促老人快速回答。
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-blue px-4 py-3">
            <p className="text-sm font-bold text-app-muted">沟通建议：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              语速放慢，多用开放式问题，让老人慢慢讲。
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-cream px-4 py-3">
            <p className="text-sm font-bold text-app-muted">下次陪伴建议：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              可以带一张老城区照片，引导老人讲讲过去的生活故事。
            </p>
          </div>
        </article>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">服务机会怎么处理</h2>
        <p className="px-1 text-sm font-bold leading-6 text-app-muted">
          知老不是只保存老人资料，而是把信息转化为下一步可以执行的服务动作。
        </p>
        <div className="grid gap-3">
          {[
            ["重点关注", "老人近期状态需要留意，建议及时探访或电话问候。"],
            ["长期未探访", "超过一段时间没有服务记录，建议安排一次联系或探访。"],
            ["生日关怀", "临近生日或重要纪念日，可以安排祝福、问候或小型活动。"],
            ["画像待完善", "老人资料较少，建议补充兴趣、经历、沟通偏好和家属提醒。"],
            ["电话问候", "适合通过电话进行轻量关怀，了解近期状态。"],
            ["活动邀请", "根据老人兴趣，邀请其参加合适的活动，如戏曲茶话会、生日会、老照片故事会等。"],
          ].map(([title, note]) => (
            <article key={title} className="rounded-[24px] bg-app-white p-4 shadow-sm">
              <h3 className="text-base font-extrabold text-app-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-ink/80">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">服务记录怎么写</h2>
        <p className="px-1 text-sm font-bold leading-6 text-app-muted">
          服务记录不是写长报告，而是把本次服务中最重要的信息留下来，方便下一次继续跟进。
        </p>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <div className="space-y-3">
            {[
              ["服务类型", "探访 / 陪伴 / 电话问候 / 活动 / 家属沟通 / 其他"],
              ["老人状态", "开心 / 平稳 / 低落 / 需要关注"],
              ["今天做了什么", "例如：陪王叔叔聊了老工厂和象棋，老人精神状态较好。"],
              ["新发现的信息", "例如：王叔叔年轻时喜欢下象棋，愿意参加下周社区棋牌活动。"],
              ["下次建议", "例如：下次可邀请他参加象棋活动，或带一张老厂照片继续聊。"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[22px] bg-app-cream px-4 py-3">
                <p className="text-sm font-bold text-app-muted">{label}</p>
                <p className="mt-2 text-base leading-7 text-app-ink">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold leading-6 text-app-muted">
            写真实看到的情况，不夸大、不诊断、不随意评价老人。
          </p>
        </article>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">不是让服务人员多填表，而是让服务更有依据</h2>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <p className="text-base leading-8 text-app-ink/90">
            一线服务人员每天面对很多老人，很难记住每个人的经历、兴趣、忌讳和上次聊到的话题。
          </p>
          <p className="mt-3 text-base leading-8 text-app-ink/90">
            知老的作用，是把零散信息整理成服务前可用的提示，把服务后记录转化为下一次服务建议。
          </p>
          <div className="mt-4 grid gap-3">
            {[
              "今天做了什么；",
              "老人状态如何；",
              "聊到了什么；",
              "新发现了什么；",
              "下次需要跟进什么。",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-app-cream px-4 py-3 text-sm font-bold leading-6 text-app-ink/85">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">服务人员与志愿者有什么不同</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-[26px] bg-app-white p-4 shadow-sm">
            <h3 className="text-lg font-extrabold text-app-ink">服务人员</h3>
            <div className="mt-3 space-y-2 text-sm font-bold leading-6 text-app-ink/85">
              <p>1. 更关注长期服务和持续跟进。</p>
              <p>2. 可以查看更多机构内部服务信息。</p>
              <p>3. 负责填写正式服务记录。</p>
              <p>4. 参与更新知老卡和服务机会。</p>
              <p>5. 帮助机构形成服务闭环。</p>
            </div>
          </article>
          <article className="rounded-[26px] bg-app-white p-4 shadow-sm">
            <h3 className="text-lg font-extrabold text-app-ink">志愿者</h3>
            <div className="mt-3 space-y-2 text-sm font-bold leading-6 text-app-ink/85">
              <p>1. 更关注某一次活动或某一次探访。</p>
              <p>2. 主要查看本次服务所需的陪伴提示。</p>
              <p>3. 提交简短参与记录。</p>
              <p>4. 不查看完整敏感档案。</p>
              <p>5. 在机构安排下参与服务。</p>
            </div>
          </article>
        </div>
        <div className="rounded-[22px] bg-app-orangeSoft px-4 py-3 text-sm font-extrabold text-app-ink">
          服务人员是持续服务的执行者，志愿者是具体活动的参与者。两者一起协作，才能让老人获得更连续、更有温度的陪伴。
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">服务有温度，也要有边界</h2>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <p className="text-base leading-8 text-app-ink/90">
            知老中的信息用于服务辅助，不是公开展示老人隐私的平台。服务人员应根据机构要求使用信息，并对老人资料、服务记录和家属提醒保持谨慎。
          </p>
          <div className="mt-4 grid gap-3">
            {[
              "不随意传播老人姓名、住址、联系方式、病历、家庭纠纷、财产情况等敏感信息。",
              "AI生成内容仅用于服务辅助，必须由服务人员结合实际情况判断。",
              "知老不做医疗诊断、不做心理诊断，不能替代医生、护士、社工和专业评估人员。",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-app-cream px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-orangeSoft text-app-orange">
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
        <h2 className="text-2xl font-extrabold text-app-ink">开始一次更有准备的服务</h2>
        <p className="mt-3 text-base leading-7 text-app-ink/85">
          登录后，你可以查看今日重点长者、服务机会、知老卡和服务记录，完成一次完整的服务闭环。
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link to="/auth" className="primary-btn min-h-12">
            登录进入工作台
          </Link>
          <Link to="/" className="secondary-btn min-h-12">
            <ArrowLeft size={18} />
            返回首页
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] bg-app-cream px-4 py-4 text-sm font-bold leading-6 text-app-muted">
        知老帮助服务人员在服务前更快懂老人；在服务中更自然地陪伴老人；在服务后留下有价值的记录；让每一次服务都成为下一次更好陪伴的基础。
      </section>
    </div>
  );
}

export default StaffGuidePage;
