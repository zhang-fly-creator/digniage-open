import {
  CalendarClock,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  Newspaper,
  Users,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { publicNewsPosts } from "../data/publicNews";
import { useNewsData } from "../hooks/useNewsData";
import { formatDateTime } from "../utils/date";

const valueCards = [
  {
    title: "服务前懂老人",
    note: "快速了解老人经历、兴趣、禁忌和沟通方式。",
    icon: Users,
    tone: "bg-app-green",
  },
  {
    title: "服务中会陪伴",
    note: "AI生成开场话题、沟通建议和注意事项。",
    icon: Wand2,
    tone: "bg-app-blue",
  },
  {
    title: "服务后可跟进",
    note: "服务记录持续沉淀，生成下一次服务机会。",
    icon: ClipboardList,
    tone: "bg-app-orangeSoft",
  },
];

const starterCards = [
  {
    to: "/volunteer",
    title: "志愿者指引",
    note: "了解志愿者如何参与助老活动、查看陪伴提示、提交服务记录。",
    icon: HeartHandshake,
  },
  {
    to: "/organization-partner",
    title: "机构指南",
    note: "了解养老机构、社区服务点、公益组织如何使用知老建立服务闭环。",
    icon: Users,
  },
  {
    to: "/staff-guide",
    title: "服务人员指南",
    note: "查看服务人员如何通过知老卡、服务机会和服务记录完成助老服务。",
    icon: ClipboardList,
  },
];

function LandingHome() {
  const { posts, loading } = useNewsData();
  const visibleNews = (posts.length ? posts : publicNewsPosts).slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[34px] bg-app-white p-5 shadow-card">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,#fff7eb_0%,#fef4df_45%,#f7ecd8_100%)] p-5 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-6 lg:p-7">
          <div>
            <div className="flex items-center gap-4">
              <img
                src="/branding/logodan.png"
                alt="知老 logo"
                className="h-16 w-16 rounded-[20px] bg-white/80 object-contain p-1.5 shadow-sm"
              />
              <div className="min-w-0">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-app-orange">ZhiLao</p>
                <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-app-ink lg:text-5xl">知老</h1>
              </div>
            </div>
            <p className="mt-3 text-lg font-medium leading-8 text-app-muted">让每一次陪伴都更懂老人</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-app-ink/85">
              系统以“知老卡”为核心，通过人工填写老人真实信息，结合 AI 自动整理长者画像、沟通建议、适合话题、避免话题、服务注意和下一次陪伴方案，帮助服务人员在探访前快速了解老人，在陪伴中更自然地沟通，在服务后通过记录持续生成新的关怀机会。
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link to="/auth" className="primary-btn min-h-12">
                登录使用
              </Link>
              <Link to="/organization-partner" className="secondary-btn min-h-12">
                申请试用
              </Link>
            </div>
          </div>

          <article className="mt-5 rounded-[28px] bg-white/75 p-4 shadow-sm backdrop-blur lg:mt-0">
            <p className="text-sm font-bold text-app-muted">服务闭环</p>
            <h3 className="mt-2 text-2xl font-extrabold text-app-ink">建知老卡 → AI给出建议</h3>
            <p className="mt-2 text-base leading-7 text-app-ink/85">
              安排服务 → 填写记录 → 形成下次建议
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 text-lg font-extrabold text-app-ink">不是只记录老人，而是知道下一次怎么陪伴</h2>
        <div className="grid gap-3">
          {valueCards.map(({ title, note, icon: Icon, tone }) => (
            <article key={title} className={`${tone} rounded-[24px] p-4 shadow-sm`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-app-ink">
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
        <h2 className="px-1 text-lg font-extrabold text-app-ink">示例知老卡</h2>
        <article className="rounded-[30px] bg-app-white p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-app-orangeSoft text-app-orange">
              <HeartHandshake size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-extrabold text-app-ink">张奶奶 · 78岁</h3>
              <p className="mt-2 text-sm leading-6 text-app-ink/85">
                喜欢戏曲和园艺，性格温和，适合温柔交流。
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["已建画像", "需情绪陪伴", "家属可协助"].map((tag) => (
                  <span key={tag} className="rounded-full bg-app-green px-2.5 py-1 text-xs font-bold text-app-ink">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-[22px] bg-app-orangeSoft px-4 py-3">
            <p className="text-sm font-bold text-app-muted">一句话画像</p>
            <p className="mt-2 text-sm leading-6 text-app-ink">
              张奶奶喜欢戏曲和花草，性格温和，适合慢慢交流。
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-green px-4 py-3">
            <p className="text-sm font-bold text-app-muted">可以聊</p>
            <p className="mt-2 text-sm leading-6 text-app-ink">
              戏曲、花草、年轻时的生活故事、家里最近的变化。
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-blue px-4 py-3">
            <p className="text-sm font-bold text-app-muted">AI 沟通建议</p>
            <p className="mt-2 text-sm leading-6 text-app-ink">
              先从熟悉的话题自然进入，语速放慢，多给老人表达时间，不急着追问细节。
            </p>
          </div>
          <div className="mt-3 rounded-[22px] bg-app-cream px-4 py-3">
            <p className="text-sm font-bold text-app-muted">下次建议</p>
            <p className="mt-2 text-sm leading-6 text-app-ink">
              可以从一段熟悉的戏曲唱段或阳台花草聊起，再慢慢引导老人讲讲过去的生活。
            </p>
          </div>
        </article>
      </section>

      <section className="space-y-2.5">
        <div className="px-1">
          <h2 className="text-lg font-extrabold text-app-ink">你可以从这里开始使用知老</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-app-muted">
            不同参与者，可以从不同入口了解知老如何帮助自己完成服务。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {starterCards.map(({ to, title, note, icon: Icon }) => (
            <Link key={to} to={to} className="rounded-[26px] bg-app-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-app-orangeSoft text-app-orange">
                  <Icon size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-extrabold leading-8 text-app-ink [word-break:keep-all]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-app-ink/80">{note}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-app-line pt-3 text-sm font-extrabold text-app-ink">
                    <span>查看{title}</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-lg font-extrabold text-app-ink">知老动态</h2>
          <Link to="/news" className="text-sm font-extrabold text-app-orange">
            查看更多
          </Link>
        </div>
        <div className="rounded-[30px] bg-app-white p-4 shadow-card">
          <div className="rounded-[24px] bg-[linear-gradient(135deg,#fffaf3_0%,#fef4df_55%,#f8ead7_100%)] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-app-orange shadow-sm">
                <Newspaper size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-app-ink">平台与机构正在持续沉淀助老经验</h3>
                <p className="mt-1 text-sm leading-6 text-app-ink/80">
                  最新动态会展示平台试点进展、机构服务安排和公益活动消息，让公开信息也保持温暖、有序、可信。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading && !visibleNews.length ? (
              <article className="rounded-[22px] bg-app-white p-3.5 shadow-sm">
                <p className="text-sm font-bold text-app-muted">正在加载公开动态...</p>
              </article>
            ) : null}

            {visibleNews.map((post) => (
              <Link
                to={`/news/${post.id}`}
                key={post.id}
                className="block rounded-[24px] border border-app-line bg-white px-4 py-4 shadow-sm transition hover:border-app-orangeSoft"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
                    <CalendarClock size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-app-blue px-2.5 py-1 text-xs font-extrabold text-app-ink">
                        平台动态
                      </span>
                      <span className="rounded-full bg-app-orangeSoft px-2.5 py-1 text-xs font-extrabold text-app-orange">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-extrabold leading-7 text-app-ink">{post.title}</h3>
                    <p className="mt-1 overflow-hidden text-sm leading-6 text-app-ink/80 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                      {post.summary}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-app-line/70 pt-3">
                      <p className="text-xs font-bold text-app-muted">{formatDateTime(post.publishedAt)}</p>
                      <span className="text-sm font-extrabold text-app-orange">查看详情</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link to="/news" className="secondary-btn mt-4 w-full">
            查看更多动态
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LandingHome;
