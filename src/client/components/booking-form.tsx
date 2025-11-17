import { useState, useEffect } from "react";
import { rpc } from "@/client/rpc-client";
import { useMutation } from "@tanstack/react-query";

export function BookingForm() {
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    hours: 2,
    numberOfPeople: 1,
    fullName: "",
    mobile: "",
    email: "",
    notes: "",
    preferredCommunication: "whatsapp" as "whatsapp" | "email",
    promoCode: "",
  });

  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const findCustomer = useMutation(
    rpc.bookingSystem.customers.findCustomerByContact.mutationOptions()
  );
  const createBooking = useMutation(
    rpc.bookingSystem.bookings.createBooking.mutationOptions()
  );
  const calculateEstimate = useMutation(
    rpc.bookingSystem.bookings.calculateEstimate.mutationOptions()
  );

  useEffect(() => {
    if (formData.mobile.length >= 10 || formData.email.includes("@")) {
      findCustomer.mutate(
        { mobile: formData.mobile, email: formData.email },
        {
          onSuccess: (customer) => {
            if (customer) {
              setFormData((prev) => ({
                ...prev,
                fullName: customer.fullName,
                mobile: customer.mobile,
                email: customer.email,
              }));
            }
          },
        }
      );
    }
  }, [formData.mobile, formData.email]);

  useEffect(() => {
    if (formData.startTime && formData.hours) {
      calculateEstimate.mutate(
        {
          hours: formData.hours,
          startTime: formData.startTime,
          promoCode: formData.promoCode || undefined,
        },
        {
          onSuccess: (data) => setEstimate(data),
        }
      );
    }
  }, [formData.hours, formData.startTime, formData.promoCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createBooking.mutateAsync({
        ...formData,
        promoCode: formData.promoCode || undefined,
      });
      setSuccess(true);
      setFormData({
        date: "",
        startTime: "",
        hours: 2,
        numberOfPeople: 1,
        fullName: "",
        mobile: "",
        email: "",
        notes: "",
        preferredCommunication: "whatsapp",
        promoCode: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Booking Request Received!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your booking request. Our team will review it and send you a payment link shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">
          Book Your Karaoke Room
        </h1>
        <p className="text-gray-600">Fill in the details below to reserve your spot</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Hours *
            </label>
            <select
              required
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                <option key={h} value={h}>
                  {h} hour{h > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of People *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.numberOfPeople}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfPeople: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Promo Code
          </label>
          <input
            type="text"
            value={formData.promoCode}
            onChange={(e) =>
              setFormData({ ...formData, promoCode: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Communication *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="whatsapp"
                checked={formData.preferredCommunication === "whatsapp"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredCommunication: e.target.value as any,
                  })
                }
                className="mr-2"
              />
              WhatsApp
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="email"
                checked={formData.preferredCommunication === "email"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredCommunication: e.target.value as any,
                  })
                }
                className="mr-2"
              />
              Email
            </label>
          </div>
        </div>

        {estimate && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Estimated Price</h3>
            <div className="space-y-1 text-sm">
              {estimate.isPeakTime && (
                <p className="text-orange-600 font-medium">Peak Time Pricing Applied</p>
              )}
              {estimate.discount > 0 && (
                <p className="text-green-600">
                  Discount: -${estimate.discount.toFixed(2)}
                </p>
              )}
              <p className="text-lg font-bold text-purple-900">
                Total: ${estimate.finalPrice.toFixed(2)}
              </p>
              <p className="text-gray-600">
                Deposit Required: ${estimate.depositAmount.toFixed(2)}
              </p>
              <p className="text-gray-600">
                Remaining on Arrival: ${estimate.remainingAmount.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>
      </form>
    </div>
  );
}
