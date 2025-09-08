// Frontend/src/components/services/ServiceCard.jsx
const ServiceCard = ({ service, user, onEdit, onDelete }) => {
  return (
    <tr key={service._id} className="hover:bg-gray-50">
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#111418]">
        {service.name}
      </td>
      <td className="px-4 py-4 text-sm text-[#60758a]">
        {service.description}
      </td>
      <td className="px-4 py-4 text-sm text-[#60758a]">{service.duration}</td>
      <td className="px-4 py-4 text-sm text-[#60758a]">
        ${service.price.toFixed(2)}
      </td>
      {user?.role === "superadmin" && (
        <td className="px-4 py-4 text-sm text-[#60758a] space-x-2">
          <button
            onClick={() => onEdit(service)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(service)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </td>
      )}
    </tr>
  );
};

export default ServiceCard;
