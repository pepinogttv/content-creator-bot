require("dotenv").config();
require("./configure-ffmpeg");

const readline = require("readline");
const path = require("path");
const fs = require("fs");
const ytdl = require("ytdl-core");
const {
  downloadYoutubeTranscript,
  alternativeGetTranscript,
} = require("./services/download-transcriptions");
const { downloadYotubeVideo } = require("./services/download-video");
const { splitVideo } = require("./services/split-video");
const { randomUUID } = require("crypto");

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

function getCaptionTrackByLenguage(captionTracks) {
  return new Promise((resolve) => {
    const languages = captionTracks.map((captionTrack) => {
      const { languageCode, name } = captionTrack;
      return { languageCode, name };
    });

    languages.forEach(({ languageCode, name }, i) => {
      console.log(`${i + 1}. ${name.simpleText} (${languageCode})`);
    });

    rl.question("Ingresa el numero del lenguaje: ", (languageNumber) => {
      const captionTrack = captionTracks[languageNumber - 1];
      if (!captionTrack) {
        console.log("Lenguaje invalido");
        getLanguage(captionTracks).then(resolve);
      } else {
        resolve(captionTrack);
      }
    });
  });
}

main();
async function main() {
  const youtubeUrl = await getYoutubeUrl();
  const info = await ytdl.getInfo(youtubeUrl);

  const { captionTracks } =
    info.player_response.captions.playerCaptionsTracklistRenderer;

  const captionTrack = await getCaptionTrackByLenguage(captionTracks);

  console.log(captionTrack.url);

  const [{ videoPath }, transcript] = await Promise.all([
    new Promise((r) => r({ videoPath: "video.mp4" })),
    // downloadYotubeVideo(youtubeUrl),
    downloadYoutubeTranscript(captionTrack.baseUrl),
  ]);

  const groupByStart = (data) => {
    let result = [];
    let temp = [];
    let lastEndTime = 0;

    for (let item of data) {
      if (item.start - lastEndTime >= 60) {
        result.push(temp);
        temp = [];
      }

      temp.push(item);
      lastEndTime = item.start;
    }

    if (temp.length > 0) {
      result.push(temp);
    }

    return result;
  };

  // splitVideo({
  //   inputFile: videoPath,
  //   folderName,
  //   onFinish: async (result) => {
  //     console.log(result);
  //   },
  //   onSplit: async (result) => {
  //     console.log(result);
  //   },
  // });
}

// const { searchParams } = new URL(youtubeUrl);
// const {
//   videoDetails: {
//     author: { user },
//     videoId,
//   },
// } = await ytdl.getBasicInfo(youtubeUrl);

// async function getAlternativeTranscriptInfo(youtubeUrl) {
//   const { chromium } = require("playwright");
//   const browser = await chromium.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto(youtubeUrl);

//   await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 30));

//   const btn = await page.$("#button-shape");
//   await btn.click();

//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   await page.$('text="Mostrar transcripción"');

//   const result = await page.evaluate(() => {
//     return [
//       ...document.querySelector(
//         ".ytd-transcript-search-panel-renderer tp-yt-paper-listbox"
//       ).children,
//     ]
//       .filter((el) => el instanceof HTMLAnchorElement)
//       .map((a) => {
//         const text = a.querySelector("tp-yt-paper-item-body").innerText;
//         const data = a.querySelector("yt-reload-continuation").data;
//         return {
//           text,
//           data,
//         };
//       });
//   });

//   console.log(result);

//   await browser.close();
// }
