import multer from "multer";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

export const multerLocal = ({ customPath="general", customTypes=[] }) => {
    const fullPath = `uploads/${customPath}`;
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            
            cb(null, fullPath);
        },
        filename: (req, file, cb) => {
            cb(null, randomUUID() + "__" + file.originalname);
        },
    });

    function fileFilter(req, file, cb) {
        
        if (!customTypes.includes(file.mimetype)) {
            cb(new Error("invalid file type"));
        }

        cb(null, true);
    }

    const uploads = multer({ storage, fileFilter });
    return uploads;
};
