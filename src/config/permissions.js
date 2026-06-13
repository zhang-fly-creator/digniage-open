export const ROLE_LABELS = {
  org_admin: "机构管理员",
  staff: "工作人员",
  volunteer: "志愿者",
};

export const ROLE_PERMISSIONS = {
  org_admin: {
    canManageMembers: true,
    canEditElders: true,
    canArchiveElders: true,
    canPublishNews: true,
    canCloseOpportunities: true,
    canCreateServiceRecords: true,
    canDeleteServiceRecords: true,
    canViewOrgDashboard: true,
  },
  staff: {
    canManageMembers: false,
    canEditElders: true,
    canArchiveElders: false,
    canPublishNews: true,
    canCloseOpportunities: true,
    canCreateServiceRecords: true,
    canDeleteServiceRecords: false,
    canViewOrgDashboard: true,
  },
  volunteer: {
    canManageMembers: false,
    canEditElders: false,
    canArchiveElders: false,
    canPublishNews: false,
    canCloseOpportunities: false,
    canCreateServiceRecords: true,
    canDeleteServiceRecords: false,
    canViewOrgDashboard: false,
  },
};

export function hasPermission(role, permissionKey) {
  return Boolean(ROLE_PERMISSIONS[role]?.[permissionKey]);
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || "成员";
}
