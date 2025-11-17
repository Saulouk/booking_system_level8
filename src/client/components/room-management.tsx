import { useState } from "react";
import { rpc } from "@/client/rpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

export function RoomManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 10,
    hourlyRate: 50,
  });

  const { data: rooms = [], refetch } = useQuery(
    rpc.bookingSystem.rooms.listRooms.queryOptions()
  );
  const createRoom = useMutation(
    rpc.bookingSystem.rooms.createRoom.mutationOptions()
  );
  const updateRoom = useMutation(
    rpc.bookingSystem.rooms.updateRoom.mutationOptions()
  );
  const deleteRoom = useMutation(
    rpc.bookingSystem.rooms.deleteRoom.mutationOptions()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoom.mutateAsync(formData);
      setFormData({ name: "", capacity: 10, hourlyRate: 50 });
      setShowAddForm(false);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      await deleteRoom.mutateAsync({ id });
      refetch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-600">Room Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            {showAddForm ? "Cancel" : "Add Room"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., VIP Room 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hourlyRate: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Room
            </button>
          </form>
        )}

        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  Capacity: {room.capacity} people | ${room.hourlyRate}/hour
                </div>
              </div>

              <button
                onClick={() => handleDelete(room.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}

          {rooms.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No rooms yet. Add your first room to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
