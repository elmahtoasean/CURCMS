import { supportedMimes, supportedDocumentMimes } from "../config/filesystem.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const MAX_DOCUMENT_SIZE_MB = 50;
// Validate only PDFs (maxSize in MB)
export const fileValidator = (file, {
  maxSizeMB = MAX_DOCUMENT_SIZE_MB,
  allowedMimes = supportedDocumentMimes,
} = {}) => {
  if (!file) return;

  const mime = file.mimetype || "";
  const name = String(file.name || "");
  const ext = path.extname(name).toLowerCase();

  const okByMime = allowedMimes.includes(mime);
  const okByExtWhenOctet = mime === "application/octet-stream" && /\.(pdf|doc|docx)$/i.test(name);

  if (!okByMime && !okByExtWhenOctet) {
    throw new Error(`Unsupported file type. Allowed: PDF/DOC/DOCX`);
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }
};

// Upload PDF file to the correct directory that will be served by Express
export const uploadFile = async (file, isFile = true, type = 'pdf') => {
  const ext = path.extname(file.name || '')
  const filename = `${uuidv4()}${ext}`
  
  // Upload PDFs to public/documents instead of public/files
  const uploadDir = type === 'pdf' ? 'public/documents' : 'public/images'

  // Ensure directory exists
  await fs.promises.mkdir(uploadDir, { recursive: true })

  const uploadPath = path.join(uploadDir, filename)

  if (isFile) {
    await file.mv(uploadPath) // express-fileupload method
  } else {
    await fs.promises.writeFile(uploadPath, file.data)
  }

  // Return path that will work with static file serving
  return type === 'pdf' ? `documents/${filename}` : `images/${filename}`
}

export const imageValidator = (size, mime) => {
  if (byteToMb(size) > 3) { // Fixed: Changed from 2MB to 3MB as per your requirement
    return "Image size must be less than 3MB";
  } else if (!supportedMimes.includes(mime)) {
    return "IMAGE must be type of png, jpg, gif, jpeg, webp, svg...";
  }
  return null;
};

export const byteToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateRandomNum = () => {
  return uuidv4();
};

// Get document URL (for PDFs)
export const getDocumentUrl = (docPath) => {
    console.log("getDocumentUrl called with:", docPath);
  if (!docPath) {
      console.log("No docPath provided, returning null");
    return null;
  }
    if (/^https?:\/\//i.test(docPath)) return docPath;


    //const fullUrl = `${process.env.APP_URL}/${docPath}`;
//  console.log("Generated PDF URL:", fullUrl);
  
  // Since Express serves public/ as static files, and docPath is relative to public/
  //return `${process.env.APP_URL}/${docPath}`;
const BASE = process.env.APP_URL || 'http://localhost:8000';

  // Strip off leading public/ or documents/
  const clean = String(docPath)
    .replace(/^\/?public\/?/, '')
    .replace(/^\/?documents\/?/, '');

  // Final: http://localhost:8000/documents/<file>
  return `${BASE}/documents/${encodeURIComponent(clean)}`;

};

// Fixed: Updated getImageUrl to handle different image path formats
export const getImageUrl = (imgPath) => {
  if (!imgPath) {
    return `${process.env.APP_URL}/images/default.png`;
  }
  
  // If it's already a full path starting with images/, use it as-is
  if (imgPath.startsWith('images/')) {
    return `${process.env.APP_URL}/${imgPath}`;
  }
  
  // If it's just a filename, add the images/ prefix
  if (!imgPath.includes('/')) {
    return `${process.env.APP_URL}/images/${imgPath}`;
  }
  
  // If it starts with /images/, remove the leading slash
  if (imgPath.startsWith('/images/')) {
    return `${process.env.APP_URL}${imgPath}`;
  }
  
  // Default case - assume it's a relative path from public/
  return `${process.env.APP_URL}/${imgPath}`;
};

// Remove document file
export const removeDocument = (docPath) => {
  if (!docPath) return;
  
  const fullPath = path.join(process.cwd(), "public", docPath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Fixed: Updated removeImage to handle different path formats
export const removeImage = (imagePath) => {
  if (!imagePath) return;
  
  let fullPath;
  
  // If it's a full path starting with images/, use it as-is
  if (imagePath.startsWith('images/')) {
    fullPath = path.join(process.cwd(), "public", imagePath);
  }
  // If it's just a filename, assume it's in the images directory
  else if (!imagePath.includes('/')) {
    fullPath = path.join(process.cwd(), "public", "images", imagePath);
  }
  // If it starts with /images/, remove the leading slash
  else if (imagePath.startsWith('/images/')) {
    fullPath = path.join(process.cwd(), "public", imagePath.substring(1));
  }
  // Default case - assume it's a relative path from public/
  else {
    fullPath = path.join(process.cwd(), "public", imagePath);
  }

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export const uploadImage = (image) => {
  const imgExt = image?.name.split(".");
  const imageName = generateRandomNum() + "." + imgExt[imgExt.length - 1]; // Fixed: Use imgExt.length - 1 for last element
  const uploadPath = process.cwd() + "/public/images/" + imageName;

  image.mv(uploadPath, (err) => {
    if (err) throw err;
  });

  return imageName;
};