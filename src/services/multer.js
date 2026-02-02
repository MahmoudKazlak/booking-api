import multer from "multer";

export const fileValidation = {
  image: ["image/png", "image/jpeg"],
  pdf: ["application/pdf"],
};

export const HME = (err, req, res, next) => {
  if (err) {
    res.status(400).json({ message: "Multer Error" });
  } else {
    next();
  }
};

export function myMulter(customValidation) {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (!customValidation.includes(file.mimetype)) {
      cb("invalid format", false);
    } else {
      cb(null, true);
    }
  }
  const upload = multer({ fileFilter, storage });
  return upload;
}
