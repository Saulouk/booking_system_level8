import { useState } from "react";
import { rpc } from "@/client/rpc-client";
import { useQuery } from "@tanstack/react-query";

export function CustomerDatabase() {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const { data: customers = [] } = useQuery(
    rpc.bookingSystem.customers.listCustomers.queryOptions()
  );
  const { data: history = [] } = useQuery(
    rpc.bookingSystem.customers.getCustomerBookingHistory.queryOptions({
      input: { customerId: selectedCustomer || "" },
      enabled: !!selectedCustomer,
    })
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">
          Customer Database
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">All Customers</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer.id)}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-purple-50 ${
                    selectedCustomer === customer.id
                      ? "bg-purple-100 border-purple-400"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-semibold">{customer.fullName}</div>
                  <div className="text-sm text-gray-600">{customer.mobile}</div>
                  <div className="text-sm text-gray-600">{customer.email}</div>
                  <div className="text-sm text-purple-600 mt-1">
                    Total Visits: {customer.totalVisits}
                  </div>
                </div>
              ))}

              {customers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No customers yet
                </div>
              )}
            </div>
          </div>

          <div>
            {selectedCustomer ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Booking History</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{booking.date}</div>
                          <div className="text-sm text-gray-600">
                            {booking.startTime} • {booking.hours}h
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "cancelled"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      {booking.totalPrice && (
                        <div className="text-sm text-gray-600">
                          Total: ${booking.totalPrice}
                        </div>
                      )}
                      {booking.notes && (
                        <div className="text-sm text-gray-500 mt-2">
                          Note: {booking.notes}
                        </div>
                      )}
                    </div>
                  ))}

                  {history.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No booking history
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a customer to view their booking history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
