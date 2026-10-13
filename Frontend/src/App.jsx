import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchSpaces from "./pages/SearchSpaces";
import SpaceDetails from "./pages/SpaceDetails";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import ManagerDashboard from "./pages/ManagerDashboard";
import AddSpace from "./pages/AddSpace";
import AddFacility from "./pages/AddFacility";
import EditSpace from "./pages/EditSpace";
import AdminOrganizations from "./pages/AdminOrganizations";
import AssignFacility from "./pages/AssignFacility";
import SpaceFacilities from "./pages/SpaceFacilities";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import FacilityManagement from "./pages/FacilityManagement";
import AdminSpaces from "./pages/AdminSpaces";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import ScheduleManagement from "./pages/ScheduleManagement";
import GuestRoute from "./components/GuestRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
  path="/login"
  element={
    <GuestRoute>
      <Login />
    </GuestRoute>
  }
/>

        <Route path="/register" element={<Register />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchSpaces />
            </ProtectedRoute>
          }
        />

        <Route
          path="/space/:id"
          element={
            <ProtectedRoute>
              <SpaceDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/spaces/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <EditSpace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/spaces/add"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <AddSpace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/facilities/add"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <AddFacility />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/facilities"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <FacilityManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/facilities/assign"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <AssignFacility />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/organizations"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrganizations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/spaces/:id/facilities"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <SpaceFacilities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/spaces"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSpaces />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
    path="/manager/schedules"
    element={
        <ProtectedRoute allowedRoles={["manager", "admin"]}>
            <ScheduleManagement />
        </ProtectedRoute>
    }
/>
        <Route
    path="/admin/activity-logs"
    element={
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminActivityLogs />
        </ProtectedRoute>
    }
/>
      </Routes>
    </BrowserRouter>
  );
}


export default App;
