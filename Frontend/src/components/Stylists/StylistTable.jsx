export default function StylistTable({
  stylists,
  search,
  onEditClick,
  onAssignServicesClick,
  userRole,
}) {
  const filteredStylists = stylists.filter((stylist) =>
    stylist.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filteredStylists.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No stylists found</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 @container">
      <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
        <table className="flex-1">
          <thead>
            <tr className="bg-white">
              <TableHeader> </TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Expertise</TableHeader>
              <TableHeader>Schedule</TableHeader>
              <TableHeader>Reviews</TableHeader>
              {(userRole === "superadmin" || userRole === "admin") && (
                <TableHeader className="text-[#60758a]">Actions</TableHeader>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredStylists.map((stylist, index) => (
              <TableRow
                key={stylist.id || stylist.email || index}
                stylist={stylist}
                onEditClick={onEditClick}
                onAssignServicesClick={onAssignServicesClick}
                userRole={userRole}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHeader({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal ${className}`}
    >
      {children}
    </th>
  );
}

function TableRow({ stylist, onEditClick, onAssignServicesClick, userRole }) {
  const handleAssignServicesClick = () => {
    // console.log("Assign services clicked for:", stylist);
    if (!stylist.id) {
      console.error("Stylist has no ID:", stylist);
      alert("Error: Stylist ID is missing");
      return;
    }
    onAssignServicesClick(stylist);
  };

  const handleEditClick = () => {
    // console.log("Edit clicked for:", stylist);
    if (!stylist.id) {
      console.error("Stylist has no ID:", stylist);
      alert("Error: Stylist ID is missing");
      return;
    }
    onEditClick(stylist);
  };

  return (
    <tr className="border-t border-t-[#dbe0e6]">
      <TableCell>
        <img
          src={
            stylist.profileImage ||
            "https://similarpng.com/_next/image?url=https%3A%2F%2Fimage.similarpng.com%2Ffile%2Fsimilarpng%2Fvery-thumbnail%2F2021%2F08%2FBarber-shop-logo-on-transparent-background-PNG.png&w=3840&q=75"
          }
          alt={stylist.name || "Stylist profile"}
          className="w-10 h-10 rounded-[50%] object-cover"
        />
      </TableCell>
      <TableCell>{stylist.name}</TableCell>
      <TableCell className="text-[#60758a]">
        {stylist.expertise || "N/A"}
      </TableCell>
      <TableCell className="text-[#60758a]">
        {stylist.schedule || "N/A"}
      </TableCell>
      <TableCell className="text-[#60758a]">
        {stylist.reviews || "N/A"}
      </TableCell>
      {(userRole === "superadmin" || userRole === "admin") && (
        <TableCell className="text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em]">
          <div className="flex space-x-4">
            <button
              onClick={handleEditClick}
              className="cursor-pointer text-blue-600 hover:text-blue-800 underline"
            >
              Edit
            </button>
            <button
              onClick={handleAssignServicesClick}
              className="cursor-pointer text-green-600 hover:text-green-800 underline"
            >
              Assign Services
            </button>
          </div>
        </TableCell>
      )}
    </tr>
  );
}

function TableCell({ children, className = "" }) {
  return (
    <td
      className={`h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal ${className}`}
    >
      {children}
    </td>
  );
}
