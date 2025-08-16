export function decodeToken(token) {
  if (!token) return null;

  try {
    // split header.payload.signature
    const payload = token.split(".")[1];
    if (!payload) return null;

    // atob handles standard base64; replace URL‐safe chars:
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

    try {
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to parse token payload:", e);
      return null;
    }
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
}
