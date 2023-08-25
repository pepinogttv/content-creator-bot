require("dotenv").config();
require("./configure-ffmpeg");

const readline = require("readline");
const path = require("path");
const fs = require("fs");
const ytdl = require("ytdl-core");
const {
  downloadYoutubeTranscription,
} = require("./services/download-transcriptions");
const { downloadYotubeVideo } = require("./services/download-video");
const { splitVideo } = require("./services/split-video");

fs.mkdirSync(path.resolve("tmp", "audios"), { recursive: true });
fs.mkdirSync(path.resolve("tmp", "transcriptions"), { recursive: true });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getYoutubeUrl() {
  return new Promise((resolve) => {
    rl.question("Ingresa la URL del video de YouTube: ", async (url) => {
      if (!ytdl.validateURL(url)) {
        console.log("URL invalida");
        getYoutubeUrl().then(resolve);
      } else {
        resolve(url);
      }
    });
  });
}

main();
async function main() {
  const youtubeUrl = await getYoutubeUrl();
  const { videoPath, folderName } = await downloadYotubeVideo(youtubeUrl);
  splitVideo({
    inputFile: videoPath,
    folderName,
    onFinish: async (result) => {
      console.log(result);
    },
    onSplit: async (result) => {
      console.log(result);
    },
  });
}
