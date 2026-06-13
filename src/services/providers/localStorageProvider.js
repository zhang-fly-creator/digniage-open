import {
  addServiceRecord,
  archiveElder,
  completeServiceOpportunity,
  archiveOrganizationNewsPost,
  createOrganizationNewsPost,
  dismissServiceOpportunity,
  getHomeNewsPosts,
  getNewsPostById,
  getNewsPosts,
  getOrganizationNewsPosts,
  getCurrentMembership,
  getCurrentOrganization,
  getCurrentUser,
  getElders,
  getServiceOpportunities,
  getServiceRecords,
  restoreElder,
  saveElders,
  createServiceOpportunity,
  updateElder,
  updateOrganizationNewsPost,
  updateOrganization,
  updateServiceOpportunity,
} from "../storageService";
import {
  updateServiceRecord as updateLocalServiceRecord,
  deleteServiceRecord as deleteLocalServiceRecord,
} from "../../utils/storage";

export const localStorageProvider = {
  getCurrentUser,
  getCurrentOrganization,
  getCurrentMembership,

  getElders,
  getElderById(id) {
    return getElders().find((elder) => elder.id === id);
  },
  createElder(input) {
    const nextElder = {
      ...input,
      id: input.id || `elder-${Date.now()}`,
      updatedAt: input.updatedAt || new Date().toISOString(),
    };
    const elders = getElders();
    saveElders([nextElder, ...elders]);
    return nextElder;
  },
  updateElder,
  archiveElder,
  restoreElder,

  getServiceOpportunities,
  getServiceOpportunitiesByElderId(elderId) {
    return getServiceOpportunities().filter((item) => item.elderId === elderId);
  },
  createServiceOpportunity,
  updateServiceOpportunity,
  dismissServiceOpportunity,
  completeServiceOpportunity,

  getServiceRecords,
  getServiceRecordsByElderId(elderId) {
    return getServiceRecords().filter((record) => record.elderId === elderId);
  },
  addServiceRecord,
  updateServiceRecord(recordId, patch) {
    return updateLocalServiceRecord(recordId, patch);
  },
  deleteServiceRecord(recordId) {
    return deleteLocalServiceRecord(recordId);
  },

  getNewsPosts,
  getHomeNewsPosts,
  getNewsPostById,
  getOrganizationNewsPosts,
  createOrganizationNewsPost,
  updateOrganizationNewsPost,
  archiveOrganizationNewsPost,

  updateOrganization,
};
