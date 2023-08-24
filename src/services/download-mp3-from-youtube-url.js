const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const os = require("os");
const { randomUUID } = require("crypto");

if (os.platform() === "linux") {
  ffmpeg.setFfmpegPath(path.resolve("bin", "ffmpeg"));
} else {
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  ffmpeg.setFfmpegPath(ffmpegPath);
}

async function downloadMp3FromYoutubeUrl(url) {
  const filename = randomUUID();
  const output = path.resolve("tmp", "audios", `${filename}.mp3`);

  return new Promise((resolve, reject) => {
    ytdl.getInfo(url).then((info) => {
      console.log(
        info.player_response.captions.playerCaptionsTracklistRenderer
          .captionTracks
      );

      console.log("[Titulo del video]", info.videoDetails.title);
      console.log(
        "[Duración del video]",
        info.videoDetails.lengthSeconds + " segundos"
      );
      console.log("Ya casi terminamos, espera un momento...");

      const audioFormat = ytdl.chooseFormat(info.formats, {
        quality: "highestaudio",
      });

      if (!audioFormat) {
        reject("Error: No se encontró el formato de audio.");
        return;
      }

      const streamOptions = {
        filter: "audioonly",
        quality: "highestaudio",
        format: audioFormat,
      };

      let stream = ytdl(url, streamOptions);

      ffmpeg()
        .input(stream)
        .audioBitrate(128)
        .audioQuality(96)
        .toFormat("mp3")
        .on("end", () => {
          resolve({
            output,
            filename,
          });
        })
        .on("error", (err) => {
          reject(err);
        })
        .pipe(fs.createWriteStream(output), { end: true });
    });
  });
}

module.exports = {
  downloadMp3FromYoutubeUrl,
};
