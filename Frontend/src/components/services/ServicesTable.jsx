// Frontend/src/components/services/ServicesTable.jsx
import ServiceCard from "./ServiceCard";

const ServicesTable = ({ services, user, onEdit, onDelete, searchTerm }) => {
  if (services.length === 0) {
    return (
      <tr>
        <td
          colSpan={user?.role === "superadmin" ? 5 : 4}
          className="px-4 py-4 text-center text-sm text-gray-500"
        >
          {searchTerm ? "No matching services found" : "No services available"}
        </td>
      </tr>
    );
  }

  return services.map((service) => (
    <ServiceCard
      key={service._id}
      service={service}
      user={user}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ));
};

export default ServicesTable;
