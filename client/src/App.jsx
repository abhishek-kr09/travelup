import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import EditListing from "./pages/EditListing";
import CreateBooking from "./pages/CreateBooking";

import MyBookings from "./pages/MyBookings";
import HostBookings from "./pages/HostBookings";
import BookingSuccess from "./pages/BookingSuccess";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        {/* 🔥 Global Layout Wrapper */}
        <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-jakarta transition-colors duration-300">
          {/* Navbar stays on every page */}
          <Navbar />

          {/* Main content area */}
          <main className="flex-1 max-w-[1500px] mx-auto w-full px-4 sm:px-5 lg:px-6 py-6 sm:py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/listings" replace />} />
              <Route path="/listings" element={<Listings />} />

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

              <Route path="/booking-success" element={<BookingSuccess />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />

          <Toaster
            position="top-center"
            containerStyle={{
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              transform: "translate(-50%, -50%)",
            }}
            toastOptions={{
              duration: 2600,
              style: {
                borderRadius: "12px",
                background: "#18181b",
                color: "#fafafa",
                border: "1px solid #3f3f46",
                maxWidth: "92vw",
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
