import {
  ArrowRight,
  BookOpenText,
  CalendarHeart,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { id: 1, icon: CalendarHeart },
  { id: 2, icon: HeartHandshake },
  { id: 3, icon: ClipboardList },
  { id: 4, icon: Sparkles },
];

function StepCard({ index, title, note, actionLabel, to, hint, tone = "bg-white/80" }) {
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
          {hint ? <p className="mt-2 text-xs font-bold leading-5 text-app-muted">{hint}</p> : null}
        </div>
      </div>
    </article>
  );
}

function VolunteerOnboardingCard({
  focusElder,
  hasAssignedActivities,
  hasAssignedTarget,
  hasRecords,
  onDismiss,
}) {
  const activityHint = hasAssignedActivities
    ? ""
    : "当前活动功能正在完善，可先查看志愿者服务指南。";
  const targetHint = hasAssignedTarget
    ? ""
    : "当前还没有分配服务对象，可以先查看志愿者服务指南。";
  const recordHint = hasRecords
    ? ""
    : "暂无服务记录。完成一次陪伴、探访或活动后，可以在这里留下你的服务记录。";

  return (
    <section className="rounded-[30px] bg-app-white p-5 shadow-card">
      <div className="rounded-[26px] bg-[linear-gradient(135deg,#fff8ee_0%,#fff4e4_55%,#f7ecdd_100%)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-app-orange">
              ZhiLao
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-app-ink">志愿者快速开始</h2>
            <p className="mt-2 text-base font-bold leading-7 text-app-muted">
              先了解任务，再查看陪伴提示，服务后提交一分钟记录。
            </p>
            <p className="mt-2 text-sm leading-6 text-app-ink/80">
              按下面几步完成一次有准备、有温度、可持续跟进的志愿服务。
            </p>
          </div>

          <div className="flex gap-2 self-start">
            <Link to="/volunteer" className="secondary-btn min-h-11 gap-2 text-sm">
              <BookOpenText size={16} />
              查看志愿者指南
            </Link>
            <button type="button" onClick={onDismiss} className="secondary-btn min-h-11 text-sm">
              我知道了
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <StepCard
            index={1}
            title="第一步：查看我的活动"
            note="先看清楚活动时间、地点、服务内容和你的参与角色。"
            actionLabel="查看我的活动"
            to="/volunteer"
            hint={activityHint || undefined}
          />
          <StepCard
            index={2}
            title="第二步：查看陪伴提示"
            note={
              hasAssignedTarget
                ? "服务前先知道老人喜欢聊什么、需要避开什么、适合怎样开场。"
                : "当前还没有分配服务对象。正式参与活动时，机构会为你提供本次服务所需的陪伴提示。"
            }
            actionLabel={hasAssignedTarget ? "查看陪伴提示" : "查看志愿者指南"}
            to={hasAssignedTarget && focusElder ? `/elders/${focusElder.id}` : "/volunteer"}
            tone="bg-app-white/90"
            hint={targetHint || undefined}
          />
          <StepCard
            index={3}
            title="第三步：提交一分钟记录"
            note="服务后记录今天做了什么、老人状态如何、有没有需要后续跟进的事情。"
            actionLabel="填写服务记录"
            to="/records?mode=new"
          />
          <StepCard
            index={4}
            title="第四步：查看我的知老足迹"
            note="每一次真实陪伴，都会沉淀为你的服务记录和参与足迹。"
            actionLabel="查看我的记录"
            to="/my-service"
            tone="bg-app-white/90"
            hint={recordHint || undefined}
          />
        </div>
      </div>
    </section>
  );
}

export default VolunteerOnboardingCard;
