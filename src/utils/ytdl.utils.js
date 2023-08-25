const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const waitWritingStream = (stream) => {
  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      resolve();
    });
    stream.on("error", (err) => {
      reject(err);
    });
  });
};

const createTmpPathGetter = (folderName = randomUUID()) => {
  const folderPath = path.resolve("tmp", folderName);
  fs.mkdirSync(folderPath, { recursive: true });
  return (video_id, format) => {
    return path.resolve(folderPath, `${video_id}.${format}`);
  };
};

const validateURL = (url) => {
  url = url.trim();
  url = new URL(url);

  const errors = [
    url.origin !== "https://www.youtube.com",
    url.protocol !== "https:",
    url.pathname !== "/watch",
    !url.searchParams.get("v"),
  ];

  if (errors.some(Boolean)) throw new Error("Invalid URL");

  return url;
};

module.exports = {
  waitWritingStream,
  createTmpPathGetter,
  validateURL,
};
