// src/components/common/CustomerCallModal.jsx
import { useState } from "react";
function CustomerCallModal({ isOpen, customerName, phoneNumber, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, "_self");
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to copy phone number:", err);
    }
  };

  return (
    <div className="fixed inset-0   flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          Call Customer
        </h3>

        <div className="mb-6">
          <p className="text-gray-700 mb-2 font-medium">{customerName}</p>
          <p className="text-2xl font-mono font-semibold text-blue-600 bg-blue-50 p-3 rounded-lg text-center">
            {phoneNumber}
          </p>
        </div>

        {copied ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-600 font-medium">
              ✓ Phone number copied to clipboard!
            </p>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 flex-1 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-150 flex-1 font-medium shadow-sm"
            >
              Copy
            </button>
            <button
              onClick={handleCall}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 flex-1 font-medium shadow-sm"
            >
              Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default CustomerCallModal;
