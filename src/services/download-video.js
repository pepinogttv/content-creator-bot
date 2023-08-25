const ytdl = require("ytdl-core");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const {
  createTmpPathGetter,
  validateURL,
  waitWritingStream,
} = require("../utils/ytdl.utils");
const { randomUUID } = require("crypto");

async function downloadYotubeVideo(url, format = "mkv") {
  const { searchParams } = validateURL(url);

  const folderName = searchParams.get("ab_channel") || randomUUID();
  const getTmpPath = createTmpPathGetter(folderName);
  const video_id = searchParams.get("v");

  const audioTmpPath = getTmpPath(video_id, "mp3");
  const audio = ytdl(url, { quality: "highestaudio" });
  audio.pipe(fs.createWriteStream(audioTmpPath));

  const videoTmpPath = getTmpPath(video_id, "mp4");
  const video = ytdl(url, { quality: "highestvideo" });
  video.pipe(fs.createWriteStream(videoTmpPath));

  await Promise.all([waitWritingStream(audio), waitWritingStream(video)]);

  if (!fs.existsSync(audioTmpPath) || !fs.existsSync(videoTmpPath)) {
    console.error("One of the temporary files does not exist.");
    return;
  }

  const pathForSave = getTmpPath(`result_${video_id}`, format);
  return new Promise((resolve) => {
    ffmpeg()
      .input(videoTmpPath)
      .input(audioTmpPath)
      .audioCodec("copy")
      .videoCodec("copy")
      .on("progress", (progress) => {
        // tracker.merged.frame = progress.frames;
        // tracker.merged.fps = progress.currentFps;
        // tracker.merged.speed = progress.currentSpeed + "x";
        console.log("Download progress: " + progress.percent + "% done");
      })
      .on("end", () => {
        fs.unlink(videoTmpPath, (err) => {
          if (err) console.log(err);
          else console.log("Video deleted");
        });
        fs.unlink(audioTmpPath, (err) => {
          if (err) console.log(err);
          else console.log("Audio deleted");
        });
        resolve({
          videoPath: pathForSave,
          folderName,
        });
      })
      .save(pathForSave);
  });
}

module.exports = {
  downloadYotubeVideo,
};
