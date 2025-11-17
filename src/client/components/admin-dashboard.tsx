import { useState } from "react";
import { rpc } from "@/client/rpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

export function AdminDashboard() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    date: "",
    roomId: "",
    customerName: "",
  });

  const { data: bookings = [], refetch } = useQuery(
    rpc.bookingSystem.bookings.listBookings.queryOptions({ input: filters })
  );

  const { data: rooms = [] } = useQuery(
    rpc.bookingSystem.rooms.listRooms.queryOptions()
  );

  const approveBooking = useMutation(
    rpc.bookingSystem.bookings.approveBooking.mutationOptions()
  );
  const rejectBooking = useMutation(
    rpc.bookingSystem.bookings.rejectBooking.mutationOptions()
  );
  const updateBooking = useMutation(
    rpc.bookingSystem.bookings.updateBooking.mutationOptions()
  );

  const handleApprove = async (id: string) => {
    try {
      const result = await approveBooking.mutateAsync({ id });
      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank");
      }
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to reject this booking?")) {
      await rejectBooking.mutateAsync({ id });
      refetch();
    }
  };

  const handlePriceOverride = async () => {
    if (!selectedBooking || !customPrice) return;
    
    try {
      await updateBooking.mutateAsync({
        id: selectedBooking.id,
        customPriceOverride: parseFloat(customPrice),
      });
      setSelectedBooking(null);
      setCustomPrice("");
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoomName = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-purple-600">Admin Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 rounded ${
                  view === "list"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2 rounded ${
                  view === "calendar"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                value={filters.roomId}
                onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Rooms</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) =>
                  setFilters({ ...filters, customerName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Search..."
              />
            </div>
          </div>

          {view === "list" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      People
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{booking.mobile}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{booking.date}</div>
                        <div className="text-sm text-gray-500">{booking.startTime}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getRoomName(booking.roomId)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.hours}h
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.numberOfPeople}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          £{booking.totalPrice || 0}
                          {booking.customPriceOverride && (
                            <span className="ml-1 text-xs text-purple-600">(Custom)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(booking.id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(booking.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCustomPrice(booking.totalPrice?.toString() || "");
                            }}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            Override Price
                          </button>
                          {booking.notes && (
                            <button
                              onClick={() => alert(booking.notes)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Notes
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {bookings.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No bookings found
                </div>
              )}
            </div>
          ) : (
            <CalendarView bookings={bookings} rooms={rooms} />
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Override Price</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Customer:</strong> {selectedBooking.fullName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Date:</strong> {selectedBooking.date} at {selectedBooking.startTime}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>People:</strong> {selectedBooking.numberOfPeople} | <strong>Hours:</strong> {selectedBooking.hours}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Current Price:</strong> £{selectedBooking.totalPrice || 0}
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Price (£)
              </label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter custom price"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setCustomPrice("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePriceOverride}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ bookings, rooms }: any) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getBookingForRoomAndTime = (roomId: string, hour: number) => {
    return bookings.find((b: any) => {
      if (b.roomId !== roomId || b.date !== selectedDate) return false;
      const bookingHour = parseInt(b.startTime.split(":")[0]);
      return hour >= bookingHour && hour < bookingHour + b.hours;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-200 border-yellow-400";
      case "approved":
        return "bg-blue-200 border-blue-400";
      case "confirmed":
        return "bg-green-200 border-green-400";
      case "cancelled":
        return "bg-gray-200 border-gray-400";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex">
            <div className="w-20 flex-shrink-0">
              <div className="h-12 border-b border-gray-300 font-medium text-sm flex items-center justify-center">
                Time
              </div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-gray-300 text-xs flex items-center justify-center"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {rooms.slice(0, 10).map((room: any) => (
              <div key={room.id} className="flex-1 min-w-32 border-l border-gray-300">
                <div className="h-12 border-b border-gray-300 font-medium text-sm flex items-center justify-center bg-gray-50">
                  {room.name}
                </div>
                {hours.map((hour) => {
                  const booking = getBookingForRoomAndTime(room.id, hour);
                  const isStart =
                    booking && parseInt(booking.startTime.split(":")[0]) === hour;

                  return (
                    <div
                      key={hour}
                      className={`h-12 border-b border-gray-300 ${
                        booking ? getStatusColor(booking.status) : ""
                      }`}
                    >
                      {isStart && booking && (
                        <div className="p-1 text-xs">
                          <div className="font-medium truncate">
                            {booking.fullName}
                          </div>
                          <div className="text-gray-600">
                            {booking.hours}h
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
