import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventory } from "../../store/slices/bloodbankSlice";

export default function Inventory() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.bloodbank);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-600">
          Blood Bank Inventory 🏥
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Track available blood units by group
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((i) => (
          <div
            key={i._id}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800">
                {i.bloodGroup}
              </h3>
              <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                Units
              </span>
            </div>

            <p className="text-3xl font-extrabold text-red-600">
              {i.unitsAvailable}
            </p>

            {i.expiryDate && (
              <p className="text-xs text-gray-500 mt-2">
                Expires on:{" "}
                {new Date(i.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No inventory data available</p>
          <p className="text-sm mt-1">
            Add blood units to see them listed here
          </p>
        </div>
      )}
    </div>
  );
}
