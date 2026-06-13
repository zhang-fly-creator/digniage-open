import { Newspaper } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import SectionCard from "../components/SectionCard";
import { publicNewsPosts } from "../data/publicNews";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useNewsData } from "../hooks/useNewsData";
import { useOrganizationData } from "../hooks/useOrganizationData";
import { formatDateTime } from "../utils/date";

const filters = [
  { label: "全部", value: "all" },
  { label: "平台动态", value: "platform" },
  { label: "机构动态", value: "organization" },
];

export function newsScopeLabel(scope) {
  return scope === "platform" ? "平台动态" : "机构动态";
}

export function newsSourceLabel(post, organizationName = "当前机构") {
  return post.scope === "platform" ? "知老平台" : organizationName;
}

function NewsCard({ post, organizationName }) {
  return (
    <article className="rounded-[28px] bg-app-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-app-blue px-3 py-1.5 text-sm font-extrabold text-app-ink">
          {newsScopeLabel(post.scope)}
        </span>
        <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-extrabold text-app-orange">
          {post.category || "动态"}
        </span>
      </div>
      <h3 className="mt-3 break-words text-xl font-extrabold leading-8 text-app-ink">
        {post.title}
      </h3>
      <p className="mt-2 break-words text-base leading-7 text-app-ink/80">
        {post.summary || post.content.slice(0, 80)}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-app-muted">
        <span>{newsSourceLabel(post, organizationName)}</span>
        <span>{post.authorName || "未填写作者"}</span>
        <span>{formatDateTime(post.publishedAt || post.createdAt)}</span>
      </div>
      <Link to={`/news/${post.id}`} className="secondary-btn mt-4 w-full">
        查看详情
      </Link>
    </article>
  );
}

function NewsListPage() {
  const { usingSupabaseAuth, isAuthenticated } = useAuthData();
  const { organization } = useOrganizationData();
  const { posts, loading, error } = useNewsData();
  const [activeFilter, setActiveFilter] = useState("all");
  const organizationName =
    usingSupabaseAuth && !isAuthenticated ? "合作机构" : organization?.name || "当前机构";
  const sourcePosts =
    usingSupabaseAuth && !isAuthenticated && !posts.length ? publicNewsPosts : posts;

  const filtered = useMemo(
    () => sourcePosts.filter((post) => activeFilter === "all" || post.scope === activeFilter),
    [activeFilter, sourcePosts]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
            <Newspaper size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-app-ink">知老动态</h1>
            <p className="mt-2 text-base leading-7 text-app-muted">
              {usingSupabaseAuth && !isAuthenticated
                ? "游客状态下可查看公开平台动态和机构动态。"
                : "查看平台和本机构发布的服务消息。"}
            </p>
          </div>
        </div>
      </section>

      {error && !(usingSupabaseAuth && !isAuthenticated) ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {error}
        </section>
      ) : null}

      <section className="rounded-[28px] bg-app-white p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-[22px] px-4 py-3 text-base font-extrabold transition active:scale-[0.99] ${
                activeFilter === filter.value ? "bg-app-orange text-white" : "bg-transparent text-app-muted"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {loading && !(usingSupabaseAuth && !isAuthenticated) ? (
          <EmptyState title="正在加载动态" note="请稍候。" />
        ) : filtered.length ? (
          filtered.map((post) => <NewsCard key={post.id} post={post} organizationName={organizationName} />)
        ) : (
          <EmptyState title="暂无动态" note="后续平台和机构发布的服务消息会显示在这里。" />
        )}
      </section>
    </div>
  );
}

export default NewsListPage;
