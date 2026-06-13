export const currentUser = {
  id: "user_demo_admin",
  name: "张晓明",
  email: "admin@test.com",
};

export const currentOrganizationId = "org_demo";

export const organizations = [
  {
    id: "org_demo",
    name: "日善堂",
    type: "老年公益组织",
    city: "",
    contactName: "张晓明",
    contactPhone: "",
    description: "当前为试点版本，用于管理长者档案、服务机会和服务记录。",
  },
];

export const organizationMembers = [
  {
    id: "member_demo_admin",
    userId: "user_demo_admin",
    organizationId: "org_demo",
    email: "admin@test.com",
    name: "张晓明",
    role: "org_admin",
    roleName: "机构管理员",
    status: "active",
  },
  {
    id: "member_demo_staff",
    userId: "user_demo_staff",
    organizationId: "org_demo",
    email: "staff@test.com",
    name: "测试服务人员",
    role: "staff",
    roleName: "服务人员",
    status: "active",
  },
  {
    id: "member_demo_volunteer",
    userId: "user_demo_volunteer",
    organizationId: "org_demo",
    email: "volunteer@test.com",
    name: "测试志愿者",
    role: "volunteer",
    roleName: "志愿者",
    status: "active",
  },
];
