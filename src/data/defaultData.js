import {
  currentOrganizationId,
  currentUser,
  organizationMembers,
  organizations,
} from "./orgMockData";
import { initialElders, initialNewsPosts, initialOpportunities, initialRecords } from "../utils/mockData";

export const defaultAppData = {
  currentUser,
  currentOrganizationId,
  organizations,
  organizationMembers,
  elders: initialElders,
  serviceOpportunities: initialOpportunities,
  serviceRecords: initialRecords,
  newsPosts: initialNewsPosts,
};
