const ytdl = require("ytdl-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { xml2js } = require("xml-js");

async function getTranscriptEndpointInfo(info) {
  let panel = info.response.engagementPanels.find(
    ({ engagementPanelSectionListRenderer }) => {
      return (
        engagementPanelSectionListRenderer.panelIdentifier ===
        "engagement-panel-searchable-transcript"
      );
    }
  );
  panel = panel.engagementPanelSectionListRenderer;
  const { continuationEndpoint } = panel.content.continuationItemRenderer;

  const { apiUrl } = continuationEndpoint.commandMetadata.webCommandMetadata;
  const endpointBody = {
    ...continuationEndpoint.getTranscriptEndpoint,
    context: {
      client: {
        hl: "es",
        gl: "AR",
        clientName: "WEB",
        clientVersion: "2.20230824.06.00",
      },
    },
  };
  return { apiUrl, endpointBody };
}

async function alternativeGetTranscript(info, baseUrl) {
  const { apiUrl, endpointBody } = await getTranscriptEndpointInfo(info);
  endpointBody.params =
    "CgtFSHVjVktqMU9RRRISQ2dOaGMzSVNBbVZ6R2dBJTNEGAEqM2VuZ2FnZW1lbnQtcGFuZWwtc2VhcmNoYWJsZS10cmFuc2NyaXB0LXNlYXJjaC1wYW5lbDABOAFAAA%3D%3D";
  const fullUrl = `${baseUrl}${apiUrl}`;
  const { data } = await axios.post(fullUrl, endpointBody);
  return data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.content.transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer.initialSegments.map(
    (segment) => {
      const { startMs, endMs, snippet } = segment.transcriptSegmentRenderer;
      return {
        startMs: Number(startMs),
        endMs: Number(endMs),
        text: snippet.runs[0].text,
      };
    }
  );
}

async function xmlGetTranscript(xmlUrl) {
  const { data } = await axios.get(xmlUrl);
  const { transcript } = xml2js(data, { compact: true });
  return transcript.text.map((segment) => {
    return {
      start: Number(segment._attributes.start),
      dur: Number(segment._attributes.dur),
      text: segment._text,
    };
  });
}

// jsdoc notation of downloadYoutubeTranscript
/**
 * @typedef {Object} TranscriptSegment
 * @property {number} start
 * @property {number} end
 * @property {string} text
 *
 * @param {string} url
 * @returns {Promise<TranscriptSegment[]>}
 * */

async function downloadYoutubeTranscript(url) {
  return xmlGetTranscript(url);
}

const formatTime = (s) => {
  const date = new Date(s * 1000);
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

function transcriptToSRT(transcript) {
  return transcript.reduce((acc, curr, i) => {
    const { startMs, endMs, text } = curr;

    let startS = startMs / 1000;
    let endS = endMs / 1000;

    startS = Number(startS.toFixed(3));
    endS = Number(endS.toFixed(3));

    startS = formatTime(startS);
    endS = formatTime(endS);

    return `${acc}${i + 1}\n${startS} --> ${endS}\n${text}\n\n`;
  }, "");
}

module.exports = {
  transcriptToSRT,
  downloadYoutubeTranscript,
  alternativeGetTranscript,
};
