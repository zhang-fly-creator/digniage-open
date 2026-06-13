import { Newspaper } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import SectionCard from "../components/SectionCard";
import { publicNewsPosts } from "../data/publicNews";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useNewsData } from "../hooks/useNewsData";
import { useOrganizationData } from "../hooks/useOrganizationData";
import { formatDateTime } from "../utils/date";
import { newsScopeLabel, newsSourceLabel } from "./NewsListPage";

function NewsDetailPage() {
  const { newsId } = useParams();
  const { usingSupabaseAuth, isAuthenticated } = useAuthData();
  const { organization } = useOrganizationData();
  const { posts, loading, error } = useNewsData();
  const sourcePosts =
    usingSupabaseAuth && !isAuthenticated && !posts.length ? publicNewsPosts : posts;
  const post = sourcePosts.find((item) => item.id === newsId);
  const organizationName =
    usingSupabaseAuth && !isAuthenticated ? "合作机构" : organization?.name || "当前机构";

  if (loading && !(usingSupabaseAuth && !isAuthenticated)) {
    return <EmptyState title="正在加载动态详情" note="请稍候。" />;
  }

  if (error && !(usingSupabaseAuth && !isAuthenticated)) {
    return <EmptyState title="动态读取失败" note={error} />;
  }

  if (!post) {
    return (
      <EmptyState
        title="未找到这条动态"
        note="它可能已下架，或你当前没有查看权限。"
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
            <Newspaper size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-app-blue px-3 py-1.5 text-sm font-extrabold text-app-ink">
                {newsScopeLabel(post.scope)}
              </span>
              <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-extrabold text-app-orange">
                {post.category || "动态"}
              </span>
            </div>
            <h1 className="mt-3 break-words text-3xl font-extrabold text-app-ink">{post.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-app-muted">
              <span>作者：{post.authorName || "未填写"}</span>
              <span>来源：{newsSourceLabel(post, organizationName)}</span>
              <span>发布时间：{formatDateTime(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>
        </div>
      </section>

      <SectionCard title="正文">
        <div className="whitespace-pre-wrap break-words text-base leading-8 text-app-ink">
          {post.content}
        </div>
      </SectionCard>

      <section className="rounded-[24px] bg-app-cream px-4 py-4 text-sm font-bold leading-6 text-app-muted">
        动态内容涉及长者信息时，请注意保护隐私。
      </section>
    </div>
  );
}

export default NewsDetailPage;
