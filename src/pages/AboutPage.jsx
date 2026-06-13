import { ArrowLeft, Brain, FileText, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import SectionCard from "../components/SectionCard";

const organizationTypes = [
  "养老机构",
  "社区养老中心",
  "老年公益组织",
  "志愿服务团队",
  "残联助残服务点",
];

const coreFeatures = [
  "AI知老卡",
  "温情互动建议",
  "服务机会提醒",
  "服务记录闭环",
  "机构动态公开展示",
  "成员权限管理",
];

function AboutPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-app-orangeSoft text-app-orange">
            <FileText size={30} />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold text-app-ink">知老项目详细介绍</h1>
            <p className="mt-2 text-base leading-7 text-app-muted">
              产品定位、核心闭环、适用机构与使用方式
            </p>
          </div>
        </div>
      </section>

      <SectionCard title="项目定位">
        <p className="text-base leading-8 text-app-ink/90">
          知老是一套面向养老机构、社区养老、老年公益组织与志愿服务团队的 AI 长者关怀系统。它不是只保存老人资料，而是把老人信息转化为下一次服务的具体方法。
        </p>
        <img
          src="/branding/logojieshao2.png"
          alt="知老项目定位示意图"
          className="mt-4 w-full rounded-[24px] bg-app-white object-contain shadow-sm"
        />
      </SectionCard>

      <SectionCard title="核心闭环">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-blue text-app-ink">
            <Brain size={20} />
          </span>
          <p className="text-base leading-8 text-app-ink/90">
            人工填写事实 → AI整理知老卡 → 服务人员查看 → 发现服务机会 → 填写服务记录 → 形成下一次陪伴建议
          </p>
        </div>
      </SectionCard>

      <SectionCard title="适用机构">
        <div className="grid grid-cols-2 gap-3">
          {organizationTypes.map((item) => (
            <div
              key={item}
              className="rounded-[22px] bg-app-cream px-4 py-3 text-base font-extrabold text-app-ink"
            >
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="核心功能">
        <div className="grid gap-3">
          {coreFeatures.map((item) => (
            <div key={item} className="rounded-[22px] bg-app-white p-4 shadow-sm">
              <p className="text-base font-extrabold text-app-ink">{item}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="使用边界">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-green text-app-ink">
            <UsersRound size={20} />
          </span>
          <p className="text-base leading-8 text-app-ink/90">
            AI生成内容仅用于服务辅助，需由服务人员结合现场情况确认。平台不做医疗诊断、不做心理诊断，不替代医生、护士、社工和专业评估人员。
          </p>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/auth" className="primary-btn min-h-12">
          登录使用
        </Link>
        <Link to="/" className="secondary-btn min-h-12">
          <ArrowLeft size={18} />
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default AboutPage;
