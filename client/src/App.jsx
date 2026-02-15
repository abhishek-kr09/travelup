import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Navbar from "./components/Navbar";   // 👈 add this
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";

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

            </Routes>
          </main>

        </div>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
