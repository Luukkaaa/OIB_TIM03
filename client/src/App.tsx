import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";
import { UserAPI } from "./api/users/UserAPI";
import { IUserAPI } from "./api/users/IUserAPI";
import { IPlantAPI } from "./api/plants/IPlantAPI";
import { PlantAPI } from "./api/plants/PlantAPI";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";

const auth_api: IAuthAPI = new AuthAPI();
const user_api: IUserAPI = new UserAPI();
const plant_api: IPlantAPI = new PlantAPI();

function App() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage authAPI={auth_api} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin,seller,sales_manager">
              <DashboardPage userAPI={user_api} plantAPI={plant_api} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
}

export default App;
