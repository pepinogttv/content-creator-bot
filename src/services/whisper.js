const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
const CacheManager = require("../utils/cache-manager");
const cacheManager = new CacheManager();

/**
 *
 * @param {string} path url mp3
 * @param {string} videoId video id to cache
 */
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const convertAudioToText = async (path, videoId) => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }

  if (cacheManager.search(videoId)) {
    return cacheManager.get(videoId);
  }

  try {
    const resp = await openai.createTranscription(
      fs.createReadStream(path),
      "whisper-1"
    );

    cacheManager.save(videoId, resp.data.text);
    return resp.data.text;
  } catch (err) {
    console.error(err);
    return "ERROR";
  }
};

module.exports = { convertAudioToText };
