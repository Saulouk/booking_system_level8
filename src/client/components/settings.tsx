import { useState, useEffect } from "react";
import { rpc } from "@/client/rpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

export function Settings() {
  const { data: settings, refetch } = useQuery(
    rpc.bookingSystem.settings.getSettings.queryOptions()
  );
  const updateSettings = useMutation(
    rpc.bookingSystem.settings.updateSettings.mutationOptions()
  );

  const [formData, setFormData] = useState({
    depositPercentage: 30,
    adminWhatsApp: "",
    adminEmail: "",
    peakHours: [] as number[],
    peakPriceMultiplier: 1.5,
    stripePublishableKey: "",
    stripeSecretKey: "",
    whatsappAccessToken: "",
    whatsappPhoneNumberId: "",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpFrom: "",
    venueName: "Karaoke Paradise",
    venueAddress: "",
    venueLocationLink: "",
    baseHours: 3,
    pricePerPersonBase: 20,
    pricePerPersonAdditional: 5,
    currency: "GBP",
    currencySymbol: "£",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        depositPercentage: settings.depositPercentage || 30,
        adminWhatsApp: settings.adminWhatsApp || "",
        adminEmail: settings.adminEmail || "",
        peakHours: settings.peakHours || [],
        peakPriceMultiplier: settings.peakPriceMultiplier || 1.5,
        stripePublishableKey: settings.stripePublishableKey || "",
        stripeSecretKey: settings.stripeSecretKey || "",
        whatsappAccessToken: settings.whatsappAccessToken || "",
        whatsappPhoneNumberId: settings.whatsappPhoneNumberId || "",
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || "",
        smtpPassword: settings.smtpPassword || "",
        smtpFrom: settings.smtpFrom || "",
        venueName: settings.venueName || "Karaoke Paradise",
        venueAddress: settings.venueAddress || "",
        venueLocationLink: settings.venueLocationLink || "",
        baseHours: settings.baseHours || 3,
        pricePerPersonBase: settings.pricePerPersonBase || 20,
        pricePerPersonAdditional: settings.pricePerPersonAdditional || 5,
        currency: settings.currency || "GBP",
        currencySymbol: settings.currencySymbol || "£",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateSettings.mutateAsync(formData);
      setSuccess(true);
      refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePeakHour = (hour: number) => {
    setFormData((prev) => ({
      ...prev,
      peakHours: prev.peakHours.includes(hour)
        ? prev.peakHours.filter((h) => h !== hour)
        : [...prev.peakHours, hour].sort((a, b) => a - b),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Settings</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) =>
                    setFormData({ ...formData, venueName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.depositPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depositPercentage: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Address
                </label>
                <input
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, venueAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Maps Link
                </label>
                <input
                  type="url"
                  value={formData.venueLocationLink}
                  onChange={(e) =>
                    setFormData({ ...formData, venueLocationLink: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Admin Contact</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.adminWhatsApp}
                  onChange={(e) =>
                    setFormData({ ...formData, adminWhatsApp: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, adminEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Pricing Model</h3>
            <p className="text-sm text-gray-600 mb-4">
              Per-person pricing: Base price for first {formData.baseHours} hours, then additional per hour
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Hours
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.baseHours}
                  onChange={(e) =>
                    setFormData({ ...formData, baseHours: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Person (Base)
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md">
                    {formData.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricePerPersonBase}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerPersonBase: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Per Hour
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md">
                    {formData.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricePerPersonAdditional}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerPersonAdditional: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> With current settings, a booking for 4 people for 5 hours would cost:
                <br />
                Base ({formData.baseHours} hours): 4 × {formData.currencySymbol}{formData.pricePerPersonBase} = {formData.currencySymbol}{4 * formData.pricePerPersonBase}
                <br />
                Additional (2 hours): 4 × {formData.currencySymbol}{formData.pricePerPersonAdditional} × 2 = {formData.currencySymbol}{4 * formData.pricePerPersonAdditional * 2}
                <br />
                <strong>Total: {formData.currencySymbol}{(4 * formData.pricePerPersonBase) + (4 * formData.pricePerPersonAdditional * 2)}</strong>
              </p>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Peak Time Pricing</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peak Price Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={formData.peakPriceMultiplier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    peakPriceMultiplier: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                1.5 = 50% increase during peak hours
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peak Hours (click to toggle)
              </label>
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => togglePeakHour(hour)}
                    className={`px-2 py-1 text-xs rounded ${
                      formData.peakHours.includes(hour)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {hour.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Stripe Settings</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={formData.stripePublishableKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stripePublishableKey: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="pk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={formData.stripeSecretKey}
                  onChange={(e) =>
                    setFormData({ ...formData, stripeSecretKey: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">WhatsApp Cloud API</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get your API credentials from <a href="https://developers.facebook.com/apps" target="_blank" className="text-purple-600 hover:underline">Meta Business</a>
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <input
                  type="password"
                  value={formData.whatsappAccessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappAccessToken: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="EAAxxxxxxxxx..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={formData.whatsappPhoneNumberId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappPhoneNumberId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123456789012345"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Email Settings (SMTP)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) =>
                    setFormData({ ...formData, smtpHost: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smtpPort: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={formData.smtpUser}
                  onChange={(e) =>
                    setFormData({ ...formData, smtpUser: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={formData.smtpPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, smtpPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  value={formData.smtpFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, smtpFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              Settings saved successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
