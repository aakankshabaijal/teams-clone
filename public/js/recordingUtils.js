/**
 * File : recordingUtils.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains the code for implementing the recording feature during a video call.
 *      Only one .webm file is generated for one video call. The recording contains the contents
 *      of the remote stream for the user (the video / screen sharing stream of the other user).
 *      The file is generated only once the 'Stop Recording' button is clicked.
 *      Further there is option to pause or resume recording in between the video call.
 *
 */
import * as store from "./store.js";

let mediaRecorder;

const vp9Codec = "video/webm;codecs=vp9";
const vp9Options = { MimeType: vp9Codec };
const recordedChunks = [];

export const startRecording = () => {
  const remoteStream = store.getState().remoteStream;

  if (MediaRecorder.isTypeSupported(vp9Codec)) {
    mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
  } else {
    mediaRecorder = new MediaRecorder(remoteStream);
  }

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
};

export const pauseRecording = () => {
  mediaRecorder.pause();
};

export const resumeRecording = () => {
  mediaRecorder.resume();
};

export const stopRecording = () => {
  mediaRecorder.stop();
};

//once the recording is stopped, user gets the option to download the recorded video

const downloadRecordedVideo = () => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display:none";
  a.href = url;
  a.download = "recording.webm";
  a.click();
  window.URL.revokeObjectURL(url);
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    downloadRecordedVideo();
  }
};
