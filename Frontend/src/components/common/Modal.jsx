// src/components/common/Modal.jsx
import React, { useRef, useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Title */}
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
