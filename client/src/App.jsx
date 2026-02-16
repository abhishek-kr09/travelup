import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import EditListing from "./pages/EditListing"; // 👈 import your EditListing
import CreateBooking from "./pages/CreateBooking";

import MyBookings from "./pages/MyBookings";
import HostBookings from "./pages/HostBookings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* 🔥 Global Layout Wrapper */}
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white font-jakarta transition-colors">
          {/* Navbar stays on every page */}
          <Navbar />

          {/* Main content area */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/listings" element={<Listings />} />

              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />

              <Route path="/listings/:id" element={<ListingDetails />} />

              {/* ✅ Add your edit route here */}
              <Route
                path="/listings/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditListing />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/listings/:id/book"
                element={
                  <ProtectedRoute>
                    <CreateBooking />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings/my"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings/manage"
                element={
                  <ProtectedRoute>
                    <HostBookings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
