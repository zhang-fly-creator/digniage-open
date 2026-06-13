import { ArrowLeft, FileText, HandHeart, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import SectionCard from "../components/SectionCard";

const founderCards = [
  {
    name: "秦豪",
    role: "知老项目发起人",
    accent: "from-[#FFE4CC] to-[#FFF4E8]",
    badge: "Q",
    quote:
      "通过知老系统实现老人需求精准匹配与服务协同，用数字化提升公益效率，守护高龄老人幸福晚年。",
  },
  {
    name: "张卓洲",
    role: "知老项目共创发起人",
    accent: "from-[#FDE7D1] to-[#FFF8EE]",
    badge: "Z",
    quote:
      "很多时候，我们不是不想照顾老人，而是离得太远、太忙、太晚才意识到亏欠。知老想做的，是把这种遗憾变成一种更细致的行动，让服务人员、家属和志愿者都能更懂老人，让陪伴不再只是到过一次，而是能够持续下去。",
  },
  {
    name: "宋一秋",
    role: "知老项目共创发起人",
    accent: "from-[#FFF0DA] to-[#FFF9F1]",
    badge: "S",
    quote:
      "我理想中的关爱，是让每一位老人都能享有尊严、温暖与陪伴，让岁月虽刻下皱纹，却带不走他们眼里的光。趁着我们还能，我们应该做一些力所能及的事。",
  },
];

function FounderCard({ founder }) {
  return (
    <article className="rounded-[26px] bg-app-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${founder.accent} ring-1 ring-white/80`}
        >
          <span className="text-xl font-extrabold text-app-ink">{founder.badge}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-app-ink">{founder.name}</h3>
          <p className="mt-1 text-sm font-bold text-app-orange">{founder.role}</p>
        </div>
      </div>
      <p className="mt-4 text-base leading-8 text-app-ink/90">{founder.quote}</p>
    </article>
  );
}

function FounderPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-app-orangeSoft text-app-orange">
            <UsersRound size={30} />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold text-app-ink">发起人介绍</h1>
            <p className="mt-2 text-base leading-7 text-app-muted">
              发起背景、理念说明与团队介绍
            </p>
          </div>
        </div>
      </section>

      <SectionCard title="发起背景">
        <p className="text-base leading-8 text-app-ink/90">
          知老项目源于一个朴素的问题：很多老人被服务了，但未必被真正理解。一次探访、一次陪伴、一次活动，如果缺少对老人经历、兴趣、禁忌和情绪的了解，服务就容易停留在流程层面。
        </p>
      </SectionCard>

      <SectionCard title="发起理念">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-blue text-app-ink">
            <HandHeart size={20} />
          </span>
          <p className="text-base leading-8 text-app-ink/90">
            知老希望帮助每一个照顾老人的人，更快懂老人，更会陪伴老人。通过人工填写真实信息、AI整理服务方法、服务记录持续沉淀，让每一次陪伴都更有准备，也更有延续。
          </p>
        </div>
      </SectionCard>

      <SectionCard title="发起人与共创者">
        <div className="space-y-3">
          {founderCards.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="我们相信">
        <div className="grid gap-3">
          {["让老人被看见", "让服务者有方法", "让公益有沉淀"].map((item) => (
            <div key={item} className="rounded-[22px] bg-app-cream px-4 py-3 text-base font-extrabold text-app-ink">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-app-orangeSoft text-app-orange">
                  <Sparkles size={16} />
                </span>
                <span>{item}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/about" className="primary-btn min-h-12">
          了解项目
        </Link>
        <Link to="/" className="secondary-btn min-h-12">
          <ArrowLeft size={18} />
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default FounderPage;
