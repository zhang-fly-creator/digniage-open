import { PenSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import PermissionDenied from "../../components/PermissionDenied";
import SectionCard from "../../components/SectionCard";
import { useAuthData } from "../../hooks/useAuthData.jsx";
import { useNewsData } from "../../hooks/useNewsData";
import { formatDateTime } from "../../utils/date";
import { newsScopeLabel } from "../NewsListPage";

const statusLabel = {
  published: "已发布",
  archived: "已下架",
  draft: "草稿",
};

function OrgNewsPage() {
  const { canPublishNews, usingSupabaseAuth, isAuthenticated } = useAuthData();
  const { posts, refreshing, initialLoading, error, saveError, archivePost } = useNewsData({ organizationOnly: true });
  const [notice, setNotice] = useState("");
  const [showRefreshingBanner, setShowRefreshingBanner] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (!refreshing) {
      setShowRefreshingBanner(false);
      return undefined;
    }

    setShowRefreshingBanner(true);
    setRefreshNotice("");

    const timeout = window.setTimeout(() => {
      setShowRefreshingBanner(false);
      if (posts.length > 0) {
        setRefreshNotice("后台同步较慢，已显示现有机构动态。");
      }
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [posts.length, refreshing]);

  const handleArchive = async (postId) => {
    try {
      await archivePost(postId);
      setNotice("机构动态已下架");
    } catch {
      setNotice("");
    }
  };

  if (usingSupabaseAuth && !isAuthenticated) {
    return (
      <SectionCard title="机构动态管理">
        <p className="rounded-[24px] bg-app-orangeSoft px-4 py-4 text-base font-bold leading-7 text-app-orange">
          请先登录后查看机构动态。
        </p>
        <Link to="/auth" className="primary-btn mt-4 w-full">
          登录 / 注册
        </Link>
      </SectionCard>
    );
  }

  if (!canPublishNews) {
    return <PermissionDenied />;
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="机构动态"
        note="发布机构通知、活动安排和服务报道。"
        action={
          <Link to="/org/news/new" className="primary-btn">
            <PenSquare size={18} />
            发布机构动态
          </Link>
        }
      />

      {notice ? (
        <section className="rounded-[24px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          {notice}
        </section>
      ) : null}

      {location.state?.notice ? (
        <section className="rounded-[24px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          {location.state.notice}
        </section>
      ) : null}

      {error || saveError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {saveError || error}
        </section>
      ) : null}

      {showRefreshingBanner ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步机构动态...
        </section>
      ) : null}

      {refreshNotice ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-sm font-bold leading-6 text-app-orange">
          {refreshNotice}
        </section>
      ) : null}

      <section className="space-y-3">
        {initialLoading ? (
          <EmptyState title="正在加载机构动态" note="请稍候。" />
        ) : posts.length ? (
          posts.map((post) => (
            <article key={post.id} className="rounded-[28px] bg-app-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-app-blue px-3 py-1.5 text-sm font-extrabold text-app-ink">
                  {newsScopeLabel(post.scope)}
                </span>
                <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-extrabold text-app-orange">
                  {post.category || "动态"}
                </span>
                <span className="rounded-full bg-app-cream px-3 py-1.5 text-sm font-extrabold text-app-muted">
                  {statusLabel[post.status] || "已发布"}
                </span>
              </div>
              <h3 className="mt-3 break-words text-xl font-extrabold leading-8 text-app-ink">
                {post.title}
              </h3>
              <p className="mt-2 break-words text-base leading-7 text-app-ink/80">
                {post.summary || "未填写摘要"}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-app-muted">
                <span>作者：{post.authorName || "未填写"}</span>
                <span>时间：{formatDateTime(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Link to={`/news/${post.id}`} className="secondary-btn">
                  查看
                </Link>
                <Link to={`/org/news/${post.id}/edit`} className="secondary-btn">
                  编辑
                </Link>
                {post.status !== "archived" ? (
                  <button
                    type="button"
                    onClick={() => handleArchive(post.id)}
                    className="secondary-btn"
                  >
                    下架
                  </button>
                ) : (
                  <span className="secondary-btn cursor-default text-app-muted">已下架</span>
                )}
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="暂无机构动态" note="发布后会显示在这里。" />
        )}
      </section>
    </div>
  );
}

export default OrgNewsPage;
