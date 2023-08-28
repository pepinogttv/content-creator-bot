const ytdl = require("ytdl-core");
const fs = require("fs");
const { validateURL } = require("../utils/ytdl.utils");
const axios = require("axios");
const { xml2js } = require("xml-js");
const CacheManager = require("../utils/cache-manager");
const cacheManager = new CacheManager();

xml2js;

async function downloadYoutubeTranscription(url) {
  const { searchParams } = validateURL(url);
  const video_id = searchParams.get("v");

  if(cacheManager.search(video_id)) return cacheManager.get(video_id);

  const info = await ytdl.getInfo(url);

  const transcriptionURL =
    info.player_response.captions.playerCaptionsTracklistRenderer
      .captionTracks[0].baseUrl;

  const { data } = await axios.get(transcriptionURL);
  const opts = {
    compact: true,
  };

  const { transcript } = xml2js(data, opts);

  cacheManager.save(video_id, transcript);
  return cacheManager.get(video_id);
}

module.exports = {
  downloadYoutubeTranscription,
};
