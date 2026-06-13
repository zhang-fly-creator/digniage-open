import {
  getAppData,
  getCurrentMembership,
  getCurrentOrganization,
  getCurrentUser,
  updateOrganization,
} from "../services/storageService";

export { getCurrentMembership, getCurrentOrganization, getCurrentUser };

export function getOrganizations() {
  return getAppData().organizations;
}

export function canEditOrganizationSettings() {
  return getCurrentMembership()?.role === "org_admin";
}

export function saveCurrentOrganization(input) {
  const current = getCurrentOrganization();
  return updateOrganization(current.id, input);
}
