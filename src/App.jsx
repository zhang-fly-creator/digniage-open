import { Navigate, Route, Routes } from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import AppLayout from "./components/AppLayout";
import { RequireActiveMembership, RequireAuth, RequirePermission } from "./components/RouteAccess";
import AuthPage from "./pages/AuthPage";
import ElderDetailPage from "./pages/ElderDetailPage";
import ElderFormPage from "./pages/ElderFormPage";
import ElderListPage from "./pages/ElderListPage";
import FounderPage from "./pages/FounderPage";
import HomePage from "./pages/HomePage";
import MembersPage from "./pages/MembersPage";
import OrgLayout from "./layouts/OrgLayout";
import MyPage from "./pages/MyPage";
import MyServicePage from "./pages/MyServicePage";
import NewsDetailPage from "./pages/NewsDetailPage";
import NewsListPage from "./pages/NewsListPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import OpportunityFormPage from "./pages/OpportunityFormPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OrganizationPartnerPage from "./pages/OrganizationPartnerPage";
import OrganizationSettingsPage from "./pages/OrganizationSettingsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RecordsPage from "./pages/RecordsPage";
import StaffGuidePage from "./pages/StaffGuidePage";
import SupabaseTestPage from "./pages/dev/SupabaseTestPage";
import OrgEldersPage from "./pages/org/OrgEldersPage";
import OrgHomePage from "./pages/org/OrgHomePage";
import OrgOpportunitiesPage from "./pages/org/OrgOpportunitiesPage";
import OrgReportPage from "./pages/org/OrgReportPage";
import OrgRecordsPage from "./pages/org/OrgRecordsPage";
import OrgNewsFormPage from "./pages/org/OrgNewsFormPage";
import OrgNewsPage from "./pages/org/OrgNewsPage";
import OrgSettingsPage from "./pages/org/OrgSettingsPage";
import VolunteerIntroPage from "./pages/VolunteerIntroPage";
import { AuthProvider } from "./hooks/useAuthData.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<RequireActiveMembership />}>
            <Route
              path="/org"
              element={
                <RequirePermission
                  permissionKey="canViewOrgDashboard"
                  title="暂无权限"
                  description="当前账号暂无机构工作台权限，请联系机构管理员。"
                >
                  <OrgLayout />
                </RequirePermission>
              }
            >
              <Route index element={<OrgHomePage />} />
              <Route path="elders" element={<OrgEldersPage />} />
              <Route path="opportunities" element={<OrgOpportunitiesPage />} />
              <Route path="opportunities/new" element={<OpportunityFormPage />} />
              <Route path="news" element={<OrgNewsPage />} />
              <Route path="news/new" element={<OrgNewsFormPage />} />
              <Route path="news/:newsId/edit" element={<OrgNewsFormPage />} />
              <Route path="my-service" element={<MyServicePage />} />
              <Route path="records" element={<OrgRecordsPage />} />
              <Route path="report" element={<OrgReportPage />} />
              <Route
                path="members"
                element={
                  <RequirePermission
                    permissionKey="canManageMembers"
                    title="暂无权限"
                    description="当前账号暂无成员管理权限，请联系机构管理员。"
                  >
                    <MembersPage />
                  </RequirePermission>
                }
              />
              <Route path="settings" element={<OrgSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/founder" element={<FounderPage />} />
          <Route path="/organization-partner" element={<OrganizationPartnerPage />} />
          <Route path="/staff-guide" element={<StaffGuidePage />} />
          <Route path="/volunteer" element={<VolunteerIntroPage />} />
          <Route path="/news" element={<NewsListPage />} />
          <Route path="/news/:newsId" element={<NewsDetailPage />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/my/privacy" element={<PrivacyPage />} />
          <Route path="/my/about" element={<AboutPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<RequireActiveMembership />}>
              <Route path="/elders" element={<ElderListPage />} />
              <Route path="/elders/new" element={<ElderFormPage />} />
              <Route path="/elders/:elderId" element={<ElderDetailPage />} />
              <Route path="/elders/:elderId/edit" element={<ElderFormPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/new" element={<OpportunityFormPage />} />
              <Route path="/opportunities/:opportunityId" element={<OpportunityDetailPage />} />
              <Route path="/records" element={<RecordsPage />} />
              <Route path="/my-service" element={<MyServicePage />} />
              <Route path="/my/organization-settings" element={<OrganizationSettingsPage />} />
              <Route path="/dev/supabase-test" element={<SupabaseTestPage />} />
              <Route
                path="/members"
                element={
                  <RequirePermission
                    permissionKey="canManageMembers"
                    title="暂无权限"
                    description="当前账号暂无成员管理权限，请联系机构管理员。"
                  >
                    <MembersPage />
                  </RequirePermission>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
