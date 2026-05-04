import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/layout/RequireAuth";
import { RequireRole } from "./components/layout/RequireRole";
import { AuthPage } from "./pages/AuthPage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { ListingFormPage } from "./pages/ListingFormPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { MyListingsPage } from "./pages/MyListingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminReportsPage } from "./pages/AdminReportsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<MarketplacePage />} />
        <Route path="listings/:id" element={<ListingDetailPage />} />
        <Route
          path="my-listings"
          element={
            <RequireRole allowedRoles={["farmer"]}>
              <MyListingsPage />
            </RequireRole>
          }
        />
        <Route
          path="my-listings/new"
          element={
            <RequireRole allowedRoles={["farmer"]}>
              <ListingFormPage mode="create" />
            </RequireRole>
          }
        />
        <Route
          path="my-listings/:id/edit"
          element={
            <RequireRole allowedRoles={["farmer"]}>
              <ListingFormPage mode="edit" />
            </RequireRole>
          }
        />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route
          path="admin/reports"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <AdminReportsPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/users"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <AdminUsersPage />
            </RequireRole>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="404" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
