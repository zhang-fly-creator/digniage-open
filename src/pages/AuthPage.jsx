import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthData } from "../hooks/useAuthData.jsx";

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

function AuthPage() {
  const navigate = useNavigate();
  const {
    usingSupabaseAuth,
    isAuthenticated,
    hasActiveMembership,
    membership,
    signIn,
    signUp,
    signOut,
    loading,
    error: authError,
  } = useAuthData();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.email.trim()) {
      setError("请填写邮箱。");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError("密码至少需要 6 位。");
      return;
    }
    if (mode === "register" && !form.name.trim()) {
      setError("请填写姓名。");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        await signUp(form);
        setNotice("注册已提交。若 Supabase 开启邮箱确认，请先完成邮箱验证。");
      } else {
        await signIn(form);
        navigate("/");
      }
    } catch (nextError) {
      setError(nextError.message || "操作失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  if (!usingSupabaseAuth) {
    return (
      <main className="min-h-screen bg-app-cream px-4 py-8 text-app-ink">
        <section className="mx-auto max-w-md rounded-[30px] bg-app-white p-5 shadow-card">
          <h1 className="text-3xl font-extrabold">登录注册</h1>
          <p className="mt-3 text-base font-bold leading-7 text-app-muted">
            当前是 localStorage fallback 模式，系统继续使用本地 mock 用户和机构身份。
          </p>
          <Link to="/my" className="primary-btn mt-5 w-full">
            返回我的
          </Link>
        </section>
      </main>
    );
  }

  if (isAuthenticated) {
    return (
      <main className="min-h-screen bg-app-cream px-4 py-8 text-app-ink">
        <section className="mx-auto max-w-md rounded-[30px] bg-app-white p-5 shadow-card">
          <h1 className="text-3xl font-extrabold">已登录</h1>
          <p className="mt-3 text-base font-bold leading-7 text-app-muted">
            当前身份：{membership?.roleName || "尚未加入机构"}
          </p>
          {!hasActiveMembership ? (
            <p className="mt-3 rounded-[22px] bg-app-orangeSoft px-4 py-3 text-base font-bold leading-7 text-app-orange">
              当前账号还没有 active 机构成员身份，请联系机构管理员在 organization_members 中添加成员。
            </p>
          ) : null}
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Link to="/" className="primary-btn w-full">
              进入我的
            </Link>
            <button type="button" onClick={signOut} className="secondary-btn w-full">
              退出登录
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-cream px-4 py-8 text-app-ink">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-5 rounded-[30px] bg-app-white p-5 shadow-card"
      >
        <div>
          <h1 className="text-3xl font-extrabold">知老机构登录</h1>
          <p className="mt-3 text-base font-bold leading-7 text-app-muted">
            请使用邮箱登陆
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-app-cream p-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-[20px] px-4 py-3 text-base font-extrabold ${
              mode === "login" ? "bg-app-orange text-white" : "text-app-muted"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-[20px] px-4 py-3 text-base font-extrabold ${
              mode === "register" ? "bg-app-orange text-white" : "text-app-muted"
            }`}
          >
            注册
          </button>
        </div>

        {mode === "register" ? (
          <label className="block">
            <span className="text-sm font-extrabold text-app-muted">姓名</span>
            <input
              className="mt-2 text-lg"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="张晓明"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-extrabold text-app-muted">邮箱</span>
          <input
            className="mt-2 text-lg"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-extrabold text-app-muted">密码</span>
          <input
            className="mt-2 text-lg"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="至少 6 位"
          />
        </label>

        {error || authError ? (
          <p className="rounded-[22px] bg-app-orangeSoft px-4 py-3 text-base font-bold leading-7 text-app-orange">
            {error || authError}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-[22px] bg-app-green px-4 py-3 text-base font-bold leading-7 text-app-ink">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || loading}
          className="primary-btn w-full disabled:bg-app-line disabled:text-app-muted"
        >
          {mode === "register" ? <UserPlus size={20} /> : <LogIn size={20} />}
          {submitting ? "处理中..." : mode === "register" ? "注册" : "登录"}
        </button>

        <Link to="/" className="secondary-btn w-full">
          返回首页
        </Link>
      </form>
    </main>
  );
}

export default AuthPage;
