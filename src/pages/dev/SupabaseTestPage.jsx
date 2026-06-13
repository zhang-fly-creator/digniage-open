import { CheckCircle2, Database, RefreshCw, Save, XCircle } from "lucide-react";
import { useState } from "react";
import {
  DATA_PROVIDER,
  isSupabaseProviderRequested,
  REQUESTED_DATA_PROVIDER,
} from "../../services/dataProvider";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { supabaseProvider } from "../../services/providers/supabaseProvider";

function StatusPill({ ok, children }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-extrabold ${
        ok ? "bg-app-green text-app-ink" : "bg-app-orangeSoft text-app-orange"
      }`}
    >
      {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {children}
    </span>
  );
}

function ResultBox({ title, children }) {
  if (!children) return null;

  return (
    <section className="rounded-[24px] bg-app-cream p-4">
      <h2 className="text-lg font-extrabold text-app-ink">{title}</h2>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-[18px] bg-app-white p-4 text-sm leading-6 text-app-ink">
        {children}
      </pre>
    </section>
  );
}

function SupabaseTestPage() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const canUseSupabase = isSupabaseProviderRequested() && isSupabaseConfigured;

  const runAction = async (actionName, action) => {
    setLoadingAction(actionName);
    setError("");
    setResult("");

    try {
      const data = await action();
      setResult(JSON.stringify(data, null, 2));
      return data;
    } catch (nextError) {
      setError(nextError.message || "Supabase 测试失败。");
      return null;
    } finally {
      setLoadingAction("");
    }
  };

  const handleConnectionTest = () => {
    runAction("connection", () => supabaseProvider.testConnection());
  };

  const handleReadOrganizations = async () => {
    const data = await runAction("read", () => supabaseProvider.getOrganizations());
    if (Array.isArray(data)) {
      setOrganizations(data);
      setSelectedOrganizationId(data[0]?.id || "");
    }
  };

  const handleUpdateOrganization = async () => {
    const organizationId = selectedOrganizationId || organizations[0]?.id;
    const data = await runAction("update", () =>
      supabaseProvider.updateOrganizationTestRow(organizationId)
    );
    if (data?.id) {
      await handleReadOrganizations();
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-app-ink">
              Supabase 连接测试
            </h1>
            <p className="mt-2 text-base leading-7 text-app-muted">
              用于验证当前 Supabase 配置、organizations 最小读写，以及 RLS 是否允许当前登录身份访问机构数据。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-app-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <StatusPill ok={REQUESTED_DATA_PROVIDER === "supabase"}>
            请求数据源：{REQUESTED_DATA_PROVIDER}
          </StatusPill>
          <StatusPill ok={DATA_PROVIDER === "supabase"}>
            实际数据源：{DATA_PROVIDER}
          </StatusPill>
          <StatusPill ok={isSupabaseConfigured}>
            Supabase 环境变量：{isSupabaseConfigured ? "完整" : "未完整"}
          </StatusPill>
        </div>
        <p className="mt-4 text-sm font-bold leading-6 text-app-muted">
          当实际数据源为 Supabase 时，长者、服务机会、服务记录和成员管理都会通过 Supabase 访问；localStorage 仍作为 fallback 保留。
        </p>
      </section>

      {!canUseSupabase ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          请确认 `.env.local` 已设置 `VITE_DATA_PROVIDER=supabase`、`VITE_SUPABASE_URL` 和
          `VITE_SUPABASE_ANON_KEY`，并重启 dev server。
        </section>
      ) : null}

      <section className="grid gap-3 rounded-[28px] bg-app-white p-5 shadow-sm lg:grid-cols-3">
        <button
          type="button"
          onClick={handleConnectionTest}
          disabled={!canUseSupabase || Boolean(loadingAction)}
          className="flex items-center justify-center gap-2 rounded-[24px] bg-app-orange px-5 py-4 text-base font-extrabold text-white disabled:bg-app-line disabled:text-app-muted"
        >
          <RefreshCw size={18} />
          测试连接
        </button>
        <button
          type="button"
          onClick={handleReadOrganizations}
          disabled={!canUseSupabase || Boolean(loadingAction)}
          className="flex items-center justify-center gap-2 rounded-[24px] bg-app-blue px-5 py-4 text-base font-extrabold text-app-ink disabled:bg-app-line disabled:text-app-muted"
        >
          <Database size={18} />
          读取 organizations
        </button>
        <button
          type="button"
          onClick={handleUpdateOrganization}
          disabled={!canUseSupabase || Boolean(loadingAction) || !selectedOrganizationId}
          className="flex items-center justify-center gap-2 rounded-[24px] bg-app-green px-5 py-4 text-base font-extrabold text-app-ink disabled:bg-app-line disabled:text-app-muted"
        >
          <Save size={18} />
          更新测试数据
        </button>
      </section>

      {organizations.length ? (
        <section className="rounded-[28px] bg-app-white p-5 shadow-sm">
          <label className="block">
            <span className="text-sm font-bold text-app-ink">选择要更新的机构</span>
            <select
              className="mt-2"
              value={selectedOrganizationId}
              onChange={(event) => setSelectedOrganizationId(event.target.value)}
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name || organization.id}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-sm font-bold leading-6 text-app-muted">
            “更新测试数据”只更新所选机构的 `updated_at` 字段，用于验证最小写入能力。
          </p>
        </section>
      ) : null}

      {loadingAction ? (
        <section className="rounded-[24px] bg-app-cream p-4 text-base font-bold text-app-ink">
          正在执行：{loadingAction}
        </section>
      ) : null}

      <ResultBox title="测试结果">{result}</ResultBox>
      <ResultBox title="错误信息">{error}</ResultBox>
    </div>
  );
}

export default SupabaseTestPage;
