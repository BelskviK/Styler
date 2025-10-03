import { useState } from "react";

export default function AnimatedImage({
  src,
  alt = "",
  className = "",
  style = {},
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative w-full aspect-square rounded-lg overflow-hidden ${className}`}
      style={{
        backgroundColor: "#e0e0e0",
        ...style,
      }}
    >
      {/* Image */}
      <img
        src={
          error
            ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDl4kgoSaG5CThHM7mjDGYZStlmt0vQSEZS6aok_SdOfSg7rySrDNBizl3xKo8FXUskdyfrCCVumcLTsZEA71P1XWZDgnFJN_SOuo2YM9Gc4TyE0pxW4TFN_5JMMig4ScXovwQh-j1dXZQUp4xAS3AsDQza1wcRxI-igMNs-V2n-B8s8mWQS4HIFcktlneDnbskcc8cQmAsRBPHgZzP3ERGeIf-pFmqz-Pc6bfEYpA6ygtNW27UYgRfZSN2R3C9IzjJyrBWNuzTZzM"
            : src
        }
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
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
