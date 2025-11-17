import { useState } from "react";
import { BookingForm } from "./components/booking-form";
import { AdminDashboard } from "./components/admin-dashboard";
import { RoomManagement } from "./components/room-management";
import { Settings } from "./components/settings";
import { CustomerDatabase } from "./components/customer-database";
import { CancelBooking } from "./components/cancel-booking";
import { PromoCodeManager } from "./components/promo-code-manager";

function App() {
  const params = new URLSearchParams(window.location.search);
  const cancelToken = window.location.pathname.match(/\/cancel\/(.+)/)?.[1];

  if (cancelToken) {
    return <CancelBooking token={cancelToken} />;
  }

  const [view, setView] = useState<
    "customer" | "admin" | "rooms" | "settings" | "customers" | "promos"
  >("customer");

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎤</span>
              <h1 className="text-xl font-bold">Karaoke Booking System</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("customer")}
                className={`px-4 py-2 rounded ${
                  view === "customer"
                    ? "bg-white text-purple-600"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                Book Now
              </button>
              <button
                onClick={() => setView("admin")}
                className={`px-4 py-2 rounded ${
                  view === "admin"
                    ? "bg-white text-purple-600"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setView("rooms")}
                className={`px-4 py-2 rounded ${
                  view === "rooms"
                    ? "bg-white text-purple-600"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                Rooms
              </button>
              <button
                onClick={() => setView("customers")}
                className={`px-4 py-2 rounded ${
                  view === "customers"
                    ? "bg-white text-purple-600"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setView("promos")}
                className={`px-4 py-2 rounded ${
                  view === "promos"
                    ? "bg-white text-purple-600"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                Promos
              </button>
              <button
                onClick={() => setView("settings")}
                className={`px-4 py-2 rounded ${
                  view === "settings"
                    ? "bg-white text-purple-600"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        {view === "customer" && <BookingForm />}
        {view === "admin" && <AdminDashboard />}
        {view === "rooms" && <RoomManagement />}
        {view === "settings" && <Settings />}
        {view === "customers" && <CustomerDatabase />}
        {view === "promos" && <PromoCodeManager />}
      </div>
    </div>
  );
}

export default App;
