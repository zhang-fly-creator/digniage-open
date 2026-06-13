import {
  APP_STORAGE_KEY,
  getAppData,
  importAppData,
  isValidAppDataShape,
} from "./storageService";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function resolveBackupPayload(parsed) {
  if (isValidAppDataShape(parsed)) return parsed;
  if (isValidAppDataShape(parsed?.[APP_STORAGE_KEY])) return parsed[APP_STORAGE_KEY];
  return null;
}

export function exportLocalBackup() {
  const data = getAppData();
  const payload = {
    exportedAt: new Date().toISOString(),
    version: "v1.2-local-backup",
    [APP_STORAGE_KEY]: data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `zhilao-backup-${todayString()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function importLocalBackupFile(file) {
  const text = await readFileAsText(file);
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("备份文件不是有效 JSON。");
  }

  const data = resolveBackupPayload(parsed);
  if (!data) {
    throw new Error("备份文件缺少 zhilao_app_data 所需的数据结构。");
  }

  importAppData(data);
}
