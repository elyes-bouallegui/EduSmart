const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/profile-pictures");

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB of decoded image data
// 2 MB of binary is about 2.8M Base64 characters; allow some slack for whitespace
const MAX_BASE64_CHARS = 3 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const BASE64_REGEX =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function matchesSignature(buffer, mimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );

    case "image/png":
      return buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE);

    case "image/webp":
      return (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );

    default:
      return false;
  }
}

/**
 * Validates a Base64 image without touching the disk.
 * Returns { ok: false, message } or { ok: true, buffer, extension }.
 */
function parseImage(imageData, mimeType) {
  if (
    typeof imageData !== "string" ||
    !imageData.trim() ||
    typeof mimeType !== "string" ||
    !mimeType.trim()
  ) {
    return { ok: false, message: "Image data and MIME type are required." };
  }

  const normalizedMimeType = mimeType.trim().toLowerCase();

  if (!Object.hasOwn(ALLOWED_TYPES, normalizedMimeType)) {
    return {
      ok: false,
      message: "Only JPEG, PNG, and WebP images are allowed.",
    };
  }

  // Reject oversized input before doing any expensive processing
  if (imageData.length > MAX_BASE64_CHARS) {
    return {
      ok: false,
      message: "Image must be smaller than or equal to 2 MB.",
    };
  }

  // Raw Base64 only, no "data:" prefix
  const base64 = imageData.replace(/\s/g, "");

  if (!base64 || base64.length % 4 !== 0 || !BASE64_REGEX.test(base64)) {
    return { ok: false, message: "Invalid Base64 image data." };
  }

  const buffer = Buffer.from(base64, "base64");

  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: "Image must be smaller than or equal to 2 MB.",
    };
  }

  console.log("MIME:", normalizedMimeType);
  console.log("Base64 start:", base64.slice(0, 20));
  console.log("Decoded signature:", buffer.subarray(0, 8).toString("hex"));
  console.log("Decoded size:", buffer.length);

  // Check the real file signature, not just the declared MIME type
  if (!matchesSignature(buffer, normalizedMimeType)) {
    return {
      ok: false,
      message: "Image content does not match the specified format.",
    };
  }

  return { ok: true, buffer, extension: ALLOWED_TYPES[normalizedMimeType] };
}

/** Writes the image with a unique name and returns the filename. */
async function saveImage(buffer, extension) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;

  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer, { flag: "wx" });

  return filename;
}

/** Deletes a stored image. Never throws; ignores names outside the folder. */
async function deleteImage(filename) {
  if (!filename || path.basename(filename) !== filename) {
    return;
  }

  await fs.unlink(path.join(UPLOAD_DIR, filename)).catch((error) => {
    if (error.code !== "ENOENT") {
      console.error("Could not delete profile picture:", error);
    }
  });
}

module.exports = { parseImage, saveImage, deleteImage };
