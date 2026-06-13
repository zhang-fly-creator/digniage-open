import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";

const volunteerFunctions = [
  {
    title: "参与公益活动",
    note: "参加机构发布的助老活动、探访活动、生日会、老照片故事会、社区陪伴等服务。",
    icon: HeartHandshake,
    tone: "bg-app-orangeSoft",
  },
  {
    title: "查看陪伴提示",
    note: "服务前了解老人喜欢聊什么、需要避开什么、适合怎样开场，不再从陌生开始。",
    icon: Sparkles,
    tone: "bg-app-blue",
  },
  {
    title: "提交服务记录",
    note: "服务后用一分钟记录今天做了什么、老人状态如何、是否需要后续跟进。",
    icon: ClipboardList,
    tone: "bg-app-green",
  },
  {
    title: "留下知老足迹",
    note: "每一次真实陪伴，都会沉淀为自己的服务记录、参与足迹和公益荣誉。",
    icon: HandHeart,
    tone: "bg-app-cream",
  },
];

const helpSteps = [
  {
    title: "服务前：先看懂老人",
    note: "系统会整理老人兴趣、经历、沟通偏好和注意事项，帮助志愿者提前了解服务对象。",
  },
  {
    title: "服务中：知道怎么开口",
    note: "系统会给出建议开场话题、适合延续的话题和需要避开的表达方式，让陪伴更自然。",
  },
  {
    title: "服务后：一分钟记录",
    note: "志愿者只需要记录今天做了什么、聊了什么、发现了什么，机构可以据此继续跟进服务。",
  },
];

const flowSteps = [
  { title: "第一步：报名活动", note: "选择机构发布的公益活动，了解时间、地点和服务内容。" },
  { title: "第二步：查看提示", note: "提前查看服务对象的陪伴提示，了解适合聊什么、需要注意什么。" },
  { title: "第三步：现场服务", note: "按活动安排参与陪伴聊天、助餐、探访、拍照记录或现场协助。" },
  { title: "第四步：提交记录", note: "服务后填写一分钟记录，让机构知道老人状态和后续需要。" },
];

const volunteerTags = [
  "学生志愿者",
  "社区志愿者",
  "公益组织成员",
  "企业公益团队",
  "养老服务志愿者",
  "活动协助人员",
  "老年服务项目志愿者",
];

function scrollToFlow() {
  const target = document.getElementById("volunteer-flow");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function VolunteerIntroPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[34px] bg-app-white p-5 shadow-card">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#fff7eb_0%,#fef4df_45%,#f7ecd8_100%)] p-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-app-ink">成为知老志愿者</h1>
          <p className="mt-3 text-lg font-medium leading-8 text-app-muted">
            让每一次志愿服务更有准备，也更有温度。
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-app-ink/85">
            知老帮助志愿者在服务前了解老人、服务中自然陪伴、服务后留下记录，让善意不只是一次到达，而是可以持续跟进。
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={scrollToFlow} className="primary-btn min-h-12">
              了解服务流程
            </button>
            <Link to="/auth" className="secondary-btn min-h-12">
              登录参与服务
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">志愿者可以在知老里做什么？</h2>
        <div className="grid gap-3">
          {volunteerFunctions.map(({ title, note, icon: Icon, tone }) => (
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
        <h2 className="px-1 text-lg font-extrabold text-app-ink">不是让志愿者多填表，而是让志愿者更会陪伴</h2>
        <div className="grid gap-3">
          {helpSteps.map((step, index) => (
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
      </section>

      <section id="volunteer-flow" className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">四步开始一次知老服务</h2>
        <div className="grid gap-3">
          {flowSteps.map((step) => (
            <article key={step.title} className="rounded-[22px] bg-app-white p-4 shadow-sm">
              <h3 className="text-base font-extrabold text-app-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-ink/80">{step.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">志愿者版知老卡示例</h2>
        <p className="px-1 text-sm font-bold leading-6 text-app-muted">
          志愿者看到的是服务所需信息，不是完整隐私档案
        </p>
        <p className="px-1 text-sm font-bold leading-6 text-app-muted">
          志愿者只查看与本次服务相关的陪伴提示，例如老人称呼、兴趣话题、沟通建议和注意事项。详细信息由机构管理和审核。
        </p>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <h3 className="text-2xl font-extrabold text-app-ink">张奶奶</h3>
          <p className="mt-2 text-base leading-7 text-app-ink/85">
            一位喜欢戏曲和花草的老人，性格温和，适合慢慢交流。
          </p>
          <div className="mt-4 rounded-[22px] bg-app-green px-4 py-3">
            <p className="text-sm font-bold text-app-muted">可以聊：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              戏曲、花草、年轻时的工作故事、社区活动
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-blue px-4 py-3">
            <p className="text-sm font-bold text-app-muted">建议开场：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              “张奶奶，听说您很喜欢戏曲，最近有没有想听的唱段？”
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-orangeSoft px-4 py-3">
            <p className="text-sm font-bold text-app-muted">需要注意：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              不要一开始追问身体情况，不要催促老人表达。
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-cream px-4 py-3">
            <p className="text-sm font-bold text-app-muted">本次建议：</p>
            <p className="mt-2 text-base leading-7 text-app-ink">
              适合温柔陪伴，可以多听老人讲过去的生活故事。
            </p>
          </div>
        </article>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">适合这些志愿者参与</h2>
        <div className="grid grid-cols-2 gap-3">
          {volunteerTags.map((item) => (
            <article key={item} className="rounded-[22px] bg-app-white p-4 text-sm font-extrabold text-app-ink shadow-sm">
              {item}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">隐私优先，服务有边界</h2>
        <article className="rounded-[30px] bg-app-white p-5 shadow-card">
          <p className="text-base leading-8 text-app-ink/90">
            志愿者只查看本次服务所需的陪伴提示；详细资料、服务记录和对外展示内容由机构管理、审核和脱敏处理。
          </p>
          <div className="mt-4 space-y-3">
            {[
              "不展示身份证号、详细病历、家庭纠纷、财产情况等敏感信息。",
              "AI生成内容仅用于服务辅助，需要人工确认后使用。",
              "对外展示的公益内容必须经过机构审核和脱敏。",
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
        <h2 className="text-2xl font-extrabold text-app-ink">准备好参与一次更有准备的志愿服务了吗？</h2>
        <p className="mt-3 text-base leading-7 text-app-ink/85">
          登录后，你可以查看自己的活动、服务对象、陪伴提示和服务记录。
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link to="/auth" className="primary-btn min-h-12">
            登录参与服务
          </Link>
          <Link to="/" className="secondary-btn min-h-12">
            <ArrowLeft size={18} />
            返回首页
          </Link>
        </div>
      </section>
    </div>
  );
}

export default VolunteerIntroPage;
