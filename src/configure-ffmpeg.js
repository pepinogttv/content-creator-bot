const os = require("os");
const ffmpeg = require("fluent-ffmpeg");

if (os.platform() === "linux") {
  ffmpeg.setFfmpegPath(path.resolve("bin", "ffmpeg"));
} else {
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  ffmpeg.setFfmpegPath(ffmpegPath);
}
