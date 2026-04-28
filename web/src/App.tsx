import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/layout/RequireAuth";
import { AuthPage } from "./pages/AuthPage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { ListingFormPage } from "./pages/ListingFormPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { MyListingsPage } from "./pages/MyListingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage";

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
        <Route path="my-listings" element={<MyListingsPage />} />
        <Route
          path="my-listings/new"
          element={<ListingFormPage mode="create" />}
        />
        <Route
          path="my-listings/:id/edit"
          element={<ListingFormPage mode="edit" />}
        />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="404" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
