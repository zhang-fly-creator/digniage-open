import { Link } from "react-router-dom";

function PermissionDenied({
  title = "暂无权限",
  description = "当前账号暂无此操作权限，请联系机构管理员。",
}) {
  return (
    <section className="rounded-[30px] bg-app-white p-5 shadow-card">
      <h1 className="text-3xl font-extrabold text-app-ink">{title}</h1>
      <p className="mt-3 rounded-[24px] bg-app-cream px-4 py-4 text-base font-bold leading-7 text-app-ink">
        {description}
      </p>
      <Link to="/" className="primary-btn mt-4 w-full">
        返回首页
      </Link>
    </section>
  );
}

export default PermissionDenied;
