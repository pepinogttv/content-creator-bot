const ytdl = require("ytdl-core");
const fs = require("fs");
const { validateURL } = require("../utils/ytdl.utils");
const axios = require("axios");
const { xml2js } = require("xml-js");

xml2js;

async function downloadYoutubeTranscription(url) {
  const { searchParams } = validateURL(url);
  const video_id = searchParams.get("v");

  const info = await ytdl.getInfo(url);

  const transcriptionURL =
    info.player_response.captions.playerCaptionsTracklistRenderer
      .captionTracks[0].baseUrl;

  const { data } = await axios.get(transcriptionURL);
  const opts = {
    compact: true,
  };

  const { transcript } = xml2js(data, opts);

  console.log(transcript.text[0]);
  console.log(transcript.text[1]);
  console.log(transcript.text[2]);
}

module.exports = {
  downloadYoutubeTranscription,
};
