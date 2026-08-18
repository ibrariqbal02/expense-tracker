// import cloudinary from "../config/cloudinary";

// const uploadToCloudinary = async (filePath: string, folder: string) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder,
//     });
//     return result;
//   } catch (error: any) {
//     const httpCode = error?.http_code ?? error?.error?.http_code;
//     const message =
//       error?.error?.message || error?.message || "Cloudinary upload failed";
//     const name = error?.error?.name || error?.name;
//     throw new Error(
//       `${name ? `${name}: ` : ""}${message}${httpCode ? ` (${httpCode})` : ""}`
//     );
//   }
// };

// export default uploadToCloudinary;



import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export default uploadToCloudinary;