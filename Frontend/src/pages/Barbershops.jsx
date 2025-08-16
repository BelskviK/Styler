// src/pages/Shops.jsx
export default function Shops() {
  // This would fetch real data in a real app
  const shops = [
    { id: 1, name: "Hair Haven", address: "123 Main St" },
    { id: 2, name: "Style Studio", address: "456 Oak Ave" },
    { id: 3, name: "Cut & Color", address: "789 Elm Blvd" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Barbershops</h1>
      <div className="grid gap-4">
        {shops.map((shop) => (
          <div key={shop.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{shop.name}</h2>
            <p className="text-gray-600">{shop.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
