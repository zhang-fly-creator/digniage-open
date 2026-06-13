import { useCallback, useEffect, useState } from "react";
import {
  addServiceRecord,
  archiveElder,
  dismissOpportunity,
  ensureSeedData,
  getElderById,
  getElders,
  getOpportunities,
  getRecords,
  restoreElder,
  saveElder,
} from "../utils/storage";

export function useLocalData() {
  const [elders, setElders] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [records, setRecords] = useState([]);

  const reload = useCallback(() => {
    ensureSeedData();
    setElders(getElders());
    setOpportunities(getOpportunities());
    setRecords(getRecords());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSaveElder = useCallback(
    (elder) => {
      saveElder(elder);
      reload();
    },
    [reload]
  );

  const handleArchiveElder = useCallback(
    (id, reason) => {
      archiveElder(id, reason);
      reload();
    },
    [reload]
  );

  const handleRestoreElder = useCallback(
    (id) => {
      restoreElder(id);
      reload();
    },
    [reload]
  );

  const handleDismissOpportunity = useCallback(
    (id, reason) => {
      dismissOpportunity(id, reason);
      reload();
    },
    [reload]
  );

  const handleAddRecord = useCallback(
    (record) => {
      const savedRecord = addServiceRecord(record);
      reload();
      return savedRecord;
    },
    [reload]
  );

  return {
    elders,
    opportunities,
    records,
    reload,
    saveElder: handleSaveElder,
    archiveElder: handleArchiveElder,
    restoreElder: handleRestoreElder,
    dismissOpportunity: handleDismissOpportunity,
    addRecord: handleAddRecord,
    getElderById,
  };
}
