import SectionCard from "../components/SectionCard";

function PrivacyPage() {
  return (
    <SectionCard title="隐私与使用边界">
      <div className="space-y-4 text-lg font-medium leading-8 text-app-ink">
        <p>
          体验阶段请使用模拟或脱敏信息，请勿录入身份证号、详细病历、家庭纠纷、财产情况等敏感信息。
        </p>
        <p>AI生成内容仅用于服务辅助，需人工确认后使用。</p>
        <p>
          本系统不做医疗诊断，不做心理诊断，不替代医生、护士、社工和专业评估人员。
        </p>
        <p>
          老人信息和服务记录仅用于机构内部服务辅助，后续如需对外展示，必须经过脱敏和人工审核。
        </p>
      </div>
    </SectionCard>
  );
}

export default PrivacyPage;
