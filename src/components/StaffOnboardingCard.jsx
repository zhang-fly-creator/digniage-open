import {
  ArrowRight,
  BookOpenText,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    id: 1,
    title: "第一步：查看重点长者",
    icon: Users,
  },
  {
    id: 2,
    title: "第二步：处理服务机会",
    icon: HeartHandshake,
  },
  {
    id: 3,
    title: "第三步：填写服务记录",
    icon: ClipboardList,
  },
  {
    id: 4,
    title: "第四步：查看更新后的知老卡",
    icon: Sparkles,
  },
];

function StepCard({ index, title, note, actionLabel, to, tone = "bg-white/80" }) {
  const Icon = steps[index - 1]?.icon || ArrowRight;

  return (
    <article className={`rounded-[24px] ${tone} p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-app-orange">
            {String(index).padStart(2, "0")}
          </p>
          <h3 className="mt-1 text-base font-extrabold text-app-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-app-ink/80">{note}</p>
          <Link
            to={to}
            className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-app-ink"
          >
            <span>{actionLabel}</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function StaffOnboardingCard({
  focusElder,
  hasPendingOpportunities,
  onDismiss,
}) {
  const focusElderPath = focusElder ? `/elders/${focusElder.id}` : "/elders";
  const focusElderNote = focusElder
    ? "先看一句话画像、适合聊什么、需要避开什么、今天怎么陪伴。"
    : "当前还没有重点长者。你可以先查看长者列表，选择一位老人补充知老卡信息。";
  const opportunityNote = hasPendingOpportunities
    ? "查看哪些老人需要电话问候、探访安排、生日关怀、画像补充或活动邀请。"
    : "当前暂无待处理服务机会。可以先补充长者知老卡，系统会逐步生成后续服务机会。";

  return (
    <section className="rounded-[30px] bg-app-white p-5 shadow-card">
      <div className="rounded-[26px] bg-[linear-gradient(135deg,#fff8ee_0%,#fff3df_55%,#f8ecd9_100%)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-app-orange">
              ZhiLao
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-app-ink">今日服务引导</h2>
            <p className="mt-2 text-base font-bold leading-7 text-app-muted">
              先看重点长者，再处理服务机会，最后填写服务记录。
            </p>
            <p className="mt-2 text-sm leading-6 text-app-ink/80">
              按下面几步完成一次有准备、有方法、有延续的助老服务。
            </p>
          </div>

          <div className="flex gap-2 self-start">
            <Link to="/staff-guide" className="secondary-btn min-h-11 gap-2 text-sm">
              <BookOpenText size={16} />
              查看完整服务指南
            </Link>
            <button type="button" onClick={onDismiss} className="secondary-btn min-h-11 text-sm">
              我知道了
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <StepCard
            index={1}
            title="第一步：查看重点长者"
            note={focusElderNote}
            actionLabel="查看重点长者"
            to={focusElderPath}
          />
          <StepCard
            index={2}
            title="第二步：处理服务机会"
            note={opportunityNote}
            actionLabel={hasPendingOpportunities ? "查看服务机会" : "查看长者列表"}
            to={hasPendingOpportunities ? "/opportunities" : "/elders"}
            tone="bg-app-white/90"
          />
          <StepCard
            index={3}
            title="第三步：填写服务记录"
            note="服务后用一分钟记录今天做了什么、老人状态如何、有没有新发现。"
            actionLabel="填写服务记录"
            to="/records?mode=new"
          />
          <StepCard
            index={4}
            title="第四步：查看更新后的知老卡"
            note="服务记录会反哺老人画像，让下一次服务不再从零开始。"
            actionLabel="查看长者列表"
            to="/elders"
            tone="bg-app-white/90"
          />
        </div>
      </div>
    </section>
  );
}

export default StaffOnboardingCard;
