import cloudinary from "../config/cloudinary";

const uploadToCloudinary = async (filePath: string, folder?: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });
    return result;
  } catch (error: any) {
    const httpCode = error?.http_code ?? error?.error?.http_code;
    const message =
      error?.error?.message || error?.message || "Cloudinary upload failed";
    const name = error?.error?.name || error?.name;
    throw new Error(
      `${name ? `${name}: ` : ""}${message}${httpCode ? ` (${httpCode})` : ""}`
    );
  }
};

export default uploadToCloudinary;
