import { useState } from "react";
import { rpc } from "@/client/rpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

export function PromoCodeManager() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: 10,
    expiresAt: "",
  });

  const { data: promoCodes = [], refetch } = useQuery(
    rpc.bookingSystem.settings.listPromoCodes.queryOptions()
  );

  const createPromoCode = useMutation(
    rpc.bookingSystem.settings.createPromoCode.mutationOptions()
  );

  const updatePromoCode = useMutation(
    rpc.bookingSystem.settings.updatePromoCode.mutationOptions()
  );

  const deletePromoCode = useMutation(
    rpc.bookingSystem.settings.deletePromoCode.mutationOptions()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromoCode.mutateAsync({
        ...formData,
        expiresAt: formData.expiresAt || undefined,
      });
      setFormData({ code: "", discountPercentage: 10, expiresAt: "" });
      setShowAddForm(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (code: string, currentActive: boolean) => {
    try {
      await updatePromoCode.mutateAsync({
        code,
        active: !currentActive,
      });
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (code: string) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      try {
        await deletePromoCode.mutateAsync({ code });
        refetch();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-600">Promo Codes</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            {showAddForm ? "Cancel" : "Add Promo Code"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promo Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                  placeholder="WELCOME10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount %
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Promo Code
            </button>
          </form>
        )}

        <div className="space-y-3">
          {promoCodes.map((promo) => {
            const isExpired = promo.expiresAt
              ? new Date(promo.expiresAt) < new Date()
              : false;

            return (
              <div
                key={promo.code}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  promo.active && !isExpired
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{promo.code}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        promo.active && !isExpired
                          ? "bg-green-600 text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {isExpired ? "Expired" : promo.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {promo.discountPercentage}% discount
                    {promo.expiresAt && (
                      <span className="ml-2">
                        | Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isExpired && (
                    <button
                      onClick={() => handleToggleActive(promo.code, promo.active)}
                      className={`px-4 py-2 rounded ${
                        promo.active
                          ? "bg-yellow-600 text-white hover:bg-yellow-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {promo.active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(promo.code)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {promoCodes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No promo codes yet. Add your first promo code to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
