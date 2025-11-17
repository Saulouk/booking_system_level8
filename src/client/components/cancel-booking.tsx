import { useState, useEffect } from "react";
import { rpc } from "@/client/rpc-client";
import { useMutation } from "@tanstack/react-query";

export function CancelBooking({ token }: { token: string }) {
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cancelBooking = useMutation(
    rpc.bookingSystem.bookings.cancelBooking.mutationOptions()
  );

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setLoading(true);
    setError("");

    try {
      await cancelBooking.mutateAsync({ token });
      setCancelled(true);
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Booking Cancelled
          </h2>
          <p className="text-gray-600">
            Your booking has been cancelled successfully. We've notified our team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4 text-center">
          Cancel Booking
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Are you sure you want to cancel your karaoke booking?
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => window.close()}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Go Back
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
