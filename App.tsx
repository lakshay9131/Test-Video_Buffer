import * as React from 'react';
import './style.css';
const myMediaSource = new MediaSource();
var videoTag;
var videoSourceBuffer;
function start() {
  videoTag = document.getElementById('myVideo');

  console.log(myMediaSource);
  console.log(myMediaSource.readyState);
  const url = URL.createObjectURL(myMediaSource);
  videoTag.src = url;
  console.log(url);
  myMediaSource.addEventListener('sourceopen', sourceOpen);
}

// -- Create a MediaSource and attach it to the video (We already learned about that) --

const getDuration = (blob) => {
  return new Promise((res) => {
    const tempVidElem = document.createElement('video');
    tempVidElem.onloadedmetadata = () => {
      res(tempVidElem.duration);
      URL.revokeObjectURL(tempVidElem.src);
    };
    tempVidElem.src = URL.createObjectURL(blob);
  });
};

async function sourceOpen() {
  console.log(myMediaSource.readyState);

  // 1. add source buffers

  //const audioSourceBuffer = myMediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
  videoSourceBuffer = myMediaSource.addSourceBuffer(
    'video/webm; codecs="vp8,vorbis"'
  ); //avc1.64001e
  console.log(myMediaSource);
  console.log(videoSourceBuffer.buffered);
  console.log(videoSourceBuffer.mode);
  var t =
    'https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.webm';
  // add(t);
  const vidClips = [
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f5/STB_Stuttgart_F%C3%B6hrich_U6_Line_Entering_Station_VIDEO.webm/STB_Stuttgart_F%C3%B6hrich_U6_Line_Entering_Station_VIDEO.webm.160p.webm',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/87/Schlossbergbahn.webm/Schlossbergbahn.webm.160p.webm',
    'https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.webm',
  ];
  const clipsToAppend = await Promise.all(
    vidClips.map(async (vidUrl) => {
      const blob = await (await fetch(vidUrl)).blob();
      const duration = await getDuration(blob);
      const buff = await blob.arrayBuffer();
      console.log(buff);
      console.log(duration);
      return {
        url: vidUrl,
        duration,
        buff,
      };
    })
  );
  let clipIndex = 0;
  videoSourceBuffer.onupdateend = () => {
    if (clipIndex < clipsToAppend.length - 1) {
      // We have another segment to add
      // BUT, first we need to offset the time by the duration of
      // the previously appended clip. Otherwise it will overwrite it
      console.log(
        videoSourceBuffer.timestampOffset + '  ---- ' + myMediaSource.duration
      );
      videoSourceBuffer.timestampOffset += clipsToAppend[clipIndex].duration;
      // Now we can move on to next clip and append it
      clipIndex++;
      videoSourceBuffer.appendBuffer(clipsToAppend[clipIndex].buff);
    } else {
      // Done!
      //myMediaSource.endOfStream();
      videoTag.play();
    }
  };
  videoSourceBuffer.appendBuffer(clipsToAppend[clipIndex].buff);
}

export default function App() {
  return (
    <div>
      <h1>Hello StackBlitz!</h1>
      <p>Start editing to see some magic happen :)</p>
      <div>
        <button onClick={start}>Start </button>
        <button onClick={sourceOpen}>Start2 </button>

        <video id="myVideo" src="" controls></video>
      </div>
    </div>
  );
}
