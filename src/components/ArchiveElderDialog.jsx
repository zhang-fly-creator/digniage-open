const archiveReasons = ["不再服务", "信息录入错误", "重复档案", "转由其他机构服务", "其他"];

function ArchiveElderDialog({ elderName, reason, onReasonChange, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35 px-4 py-6">
      <section className="mx-auto w-full max-w-md rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-app-ink">归档长者档案</h2>
            <p className="mt-2 text-base leading-7 text-app-muted">
              归档后，{elderName} 将不再出现在默认长者列表和服务提醒中，但历史服务记录会保留。
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-cream text-base font-extrabold text-app-ink"
            aria-label="关闭弹窗"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {archiveReasons.map((item) => {
            const active = reason === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onReasonChange(item)}
                className={`rounded-[20px] px-4 py-3 text-base font-extrabold active:scale-[0.99] ${
                  active ? "bg-app-orange text-white" : "bg-app-cream text-app-ink"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!reason}
          className="mt-5 flex w-full items-center justify-center rounded-[22px] bg-app-orange px-5 py-4 text-lg font-extrabold text-white disabled:bg-app-line disabled:text-app-muted"
        >
          确认归档
        </button>
      </section>
    </div>
  );
}

export default ArchiveElderDialog;
