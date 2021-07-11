/**
 * File : main.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains the client side code for establishing the connection between two peers,
 *      which includes taking the input of personal code, sending requests through webRTC, sending
 *      messages, and logic for all the buttons present during a video call (mic, camera, screen share,
 *      recording, and hang up).
 *      socket.io is used for connection between the client and server.
 *
 */

import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as recordingUtils from "./recordingUtils.js";

//initialization of socketIO connection
const socket = io("/"); //port will be inserted automatically
wss.registerSocketEvents(socket);

/*  If the camera is detected, user can see their camera feed in the local preview */
webRTCHandler.getLocalPreview();

/*  The purpose below is to copy the personal code of the user to the clipboard when the copy button is clicked
 */
const personalCodeCopyButton = document.getElementById(
  "personal_code_copy_button"
);
personalCodeCopyButton.addEventListener("click", () => {
  const personalCode = store.getState().socketId;
  navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

/*  The buttons below are for initiating a connection request or video call request.
    personalCodeChatButton is for sending a connection request, which once accepted, 
    allows users to chat and gives the option of a video call.
    The endConnectionButton will close the existing peer connection.

 */
const personalCodeChatButton = document.getElementById(
  "personal_code_chat_button"
);
const personalCodeVideoButton = document.getElementById(
  "personal_code_video_button"
);
const endConnectionButton = document.getElementById("end_connection_button");

personalCodeChatButton.addEventListener("click", () => {
  const calleePersonalCode = document.getElementById(
    "personal_code_input"
  ).value;
  const callType = constants.callType.CHAT_PERSONAL_CODE;
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

personalCodeVideoButton.addEventListener("click", () => {
  const calleePersonalCode = document.getElementById(
    "personal_code_input"
  ).value;
  const callType = constants.callType.VIDEO_PERSONAL_CODE;
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

endConnectionButton.addEventListener("click", () => {
  webRTCHandler.handleHangUp();
});

/*  The code below is for buttons available during a video call:
    1.mic on/off
    2.video on/off
    3.hang up video call
    4.screen sharing start/end
    5.start, pause, resume and stop recording 

 */

const micButton = document.getElementById("mic_button");
micButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const micEnabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !micEnabled;
  //if user was unmuted then mute them else if user was muted unmute them
  ui.updateMicButton(micEnabled);
});

const cameraButton = document.getElementById("camera_button");
cameraButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const cameraEnabled = localStream.getVideoTracks()[0].enabled;
  localStream.getVideoTracks()[0].enabled = !cameraEnabled;
  //if user's video was off then turn video on else if their video was on, turn it off
  ui.updateCameraButton(cameraEnabled);
});

/*  Since there is only one container for the local preview and one for the remote stream,
    once user starts their screen share, their outgoing video stream is replaced by the
    screen share stream. So now the other participant can only see the screen share, not 
    the video. Once screen share has ended, the video stream is adeed back and users can
    continue to communicate via video.
 */

const switchForScreenSharingButton = document.getElementById(
  "screen_sharing_button"
);
switchForScreenSharingButton.addEventListener("click", () => {
  const screenSharingActive = store.getState().screenSharingActive;
  webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

/*  Code for sending messages via chat  */
const newMessageInput = document.getElementById("new_message_input");
newMessageInput.addEventListener("keydown", (event) => {
  const key = event.key;

  //when enter key is pressed, message will be sent
  if (key === "Enter") {
    webRTCHandler.sendMessageUsingDataChannel(event.target.value);
    ui.appendMessage(event.target.value, true);
    newMessageInput.value = "";
  }
});

const sendMessageButton = document.getElementById("send_message_button");
sendMessageButton.addEventListener("click", () => {
  const message = newMessageInput.value;
  webRTCHandler.sendMessageUsingDataChannel(message);
  ui.appendMessage(message, true);
  newMessageInput.value = "";
});

/*  The recording feature is implemented below. Once the user starts recording,
    there is option to pause or stop the recording. For one meeting, only one 
    video file is generated, which contains everything that was present in 
    the remote stream (video or screen share).
    If recording is paused, there is option to resume or stop recording.
    Once the recording is stopped, only then the file is generated which can be saved
    locally by the user. Both users can record simultaneously and different files 
    would be generated for each of them.
 */
const startRecordingButton = document.getElementById("start_recording_button");
startRecordingButton.addEventListener("click", () => {
  recordingUtils.startRecording();
  ui.showRecordingPanel();
});

const stopRecordingButton = document.getElementById("stop_recording_button");
stopRecordingButton.addEventListener("click", () => {
  recordingUtils.stopRecording();
  ui.resetRecordingButtons();
});

const pauseRecordingButton = document.getElementById("pause_recording_button");
pauseRecordingButton.addEventListener("click", () => {
  recordingUtils.pauseRecording();
  ui.switchRecordingButtons(true);
});

const resumeRecordingButton = document.getElementById(
  "resume_recording_button"
);
resumeRecordingButton.addEventListener("click", () => {
  recordingUtils.resumeRecording();
  ui.switchRecordingButtons();
});

// hangUpButton ends only the video call, but the chat still remains active
const hangUpButton = document.getElementById("hang_up_button");
hangUpButton.addEventListener("click", () => {
  webRTCHandler.onlyVideoHangUp();
});

// hangUpChatButton ends the entire peer connection
const hangUpChatButton = document.getElementById("finish_chat_call_button");
hangUpChatButton.addEventListener("click", () => {
  webRTCHandler.handleHangUp();
});
