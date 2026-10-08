/**
 * Safely parses metadata_json into an array of key-value pairs.
 * Handles objects, stringified JSON strings, and null/undefined values.
 * 
 * @param {Object|String|null} metadata 
 * @returns {Array<{key: string, value: string}>}
 */
export function getMetadataEntries(metadata) {
  if (!metadata) return [];
  let obj = metadata;
  if (typeof metadata === "string") {
    try {
      obj = JSON.parse(metadata);
    } catch (e) {
      return [];
    }
  }
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    return Object.entries(obj)
      .map(([key, value]) => ({
        key: String(key ?? ""),
        value: typeof value === "object" ? JSON.stringify(value) : String(value ?? ""),
      }))
      .filter((item) => item.key.trim() !== "");
  }
  return [];
}
