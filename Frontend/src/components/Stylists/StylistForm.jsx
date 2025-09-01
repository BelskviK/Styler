export default function StylistForm({
  formData,
  errors,
  isSubmitting,
  handleInputChange,
  handleSubmit,
  onCancel,
  isEditMode,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.server && (
        <div className="text-red-500 text-sm">{errors.server}</div>
      )}

      <FormInput
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        error={errors.name}
      />

      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
      />

      <FormInput
        label={
          isEditMode ? "Password (leave blank to keep current)" : "Password"
        }
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        placeholder={isEditMode ? "Leave blank to keep current password" : ""}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        >
          <option value="styler">Stylist</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
      </div>

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitText={isEditMode ? "Update" : "Register"}
        submittingText={isEditMode ? "Updating..." : "Registering..."}
      />
    </form>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
function FormActions({ onCancel, isSubmitting, submitText, submittingText }) {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? submittingText : submitText}
      </button>
    </div>
  );
}
