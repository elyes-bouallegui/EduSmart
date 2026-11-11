const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

function validateProfilePicture(imageData, contentType) {
  if (typeof imageData !== "string" || !imageData.trim()) {
    throw new Error("Image data is required.");
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error("Unsupported image type.");
  }

  if (
    imageData.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      imageData,
    )
  ) {
    throw new Error("Invalid Base64 image data.");
  }

  const imageBuffer = Buffer.from(imageData, "base64");

  if (imageBuffer.length === 0 || imageBuffer.length > MAX_SIZE) {
    throw new Error("Image must be between 1 byte and 2 MB.");
  }

  // Verify the actual file signature, not just the declared MIME type.
  const signatures = {
    "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "image/jpeg": Buffer.from([0xff, 0xd8, 0xff]),
    "image/webp": Buffer.from("RIFF"),
  };

  const signature = signatures[contentType];

  if (
    imageBuffer.length < signature.length ||
    !imageBuffer.subarray(0, signature.length).equals(signature)
  ) {
    throw new Error("Image content does not match the declared type.");
  }

  if (
    contentType === "image/webp" &&
    imageBuffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    throw new Error("Invalid WebP image.");
  }

  return imageBuffer;
}

module.exports = validateProfilePicture;
