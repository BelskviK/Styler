import { useState } from "react";

export default function AnimatedImage({
  src,
  alt = "",
  className = "",
  style = {},
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative w-full aspect-square rounded-lg overflow-hidden ${className}`}
      style={{
        backgroundColor: "#e0e0e0", // gray placeholder
        ...style,
      }}
    >
      {/* Image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Placeholder / animation */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-300" />
      )}
    </div>
  );
}
