/**
 * File : ui.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains the code for creating and modifying UI elements
 *      like displaying local and remote streams, creating dialog boxes and
 *      displaying chat messages.
 *
 */
import * as constants from "./constants.js";
import * as elements from "./elements.js";

//  The code below is for displaying our personal code
export const updatePersonalCode = (personalCode) => {
  const personalCodeParagraph = document.getElementById(
    "personal_code_paragraph"
  );
  personalCodeParagraph.innerHTML = personalCode;
};

export const updateLocalVideo = (stream) => {
  const localVideo = document.getElementById("local_video");
  localVideo.srcObject = stream;

  localVideo.addEventListener("loadedmetadata", () => {
    localVideo.play();
  });
};

export const showVideoCallButtons = () => {};

export const updateRemoteVideo = (stream) => {
  const remoteVideo = document.getElementById("remote_video");
  remoteVideo.srcObject = stream;
};

/**
 * Displaying the dialog box during incoming call, with the option to accept or reject the call
 * @param {*} callType - connection request is "Chat" and video call is "Video"
 * @param {*} acceptCallHandler - used for forming the connection
 * @param {*} rejectCallHandler - used for displaying a dialog saying that 'Callee rejected your call'
 */
export const showIncomingCallDialog = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";
  const incomingCallDialog = elements.getIncomingCallDialog(
    callTypeInfo,
    acceptCallHandler,
    rejectCallHandler
  );

  //removing all dialogs inside HTML dialog element
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
  dialog.appendChild(incomingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
  const callingDialog = elements.getCallingDialog(rejectCallHandler);
  //removing all dialogs inside HTML dialog element
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
  dialog.appendChild(callingDialog);
};

/**
 * create dialogs when the call was rejected or incorrect personal code was entered by the user.
 * These dialogs are visible on the screen for 4 seconds.
 * @param {*} preOfferAnswer - answer from the other user in response to webRTC request
 */

export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;
  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = elements.getInfoDialog(
      "Call rejected",
      "Callee rejected your call"
    );
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = elements.getInfoDialog(
      "Callee not found",
      "Please check personal code"
    );
  }

  if (infoDialog) {
    const dialog = document.getElementById("dialog");
    dialog.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, [4000]);
  }
};

export const removeAllDialogs = () => {
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

/* The purpose below is to show the video and chat container once the connection is established.
    Video call elements also include all the buttons for mic, camera, hang up, screen share and
    recording.
*/
export const showCallElements = (callType) => {
  if (callType === constants.callType.CHAT_PERSONAL_CODE) {
    showChatCallElements();
  }
  if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
    showVideoCallElements();
  }
};

export const showChatCallElements = () => {
  const finishConnectionChatButtonContainer = document.getElementById(
    "finish_chat_button_container"
  );

  const videoCallButton = document.getElementById("personal_code_video_button");
  showElement(videoCallButton);
  const newMessageInput = document.getElementById("new_message");
  showElement(newMessageInput);
};

/* The video placeholder is the Teams logo as the background image. Once the call begins, 
    the placeholder is hidden and the remote stream is displayed.
*/
const showVideoCallElements = () => {
  const callButtons = document.getElementById("call_buttons");
  showElement(callButtons);

  const placeholder = document.getElementById("video_placeholder");
  hideElement(placeholder);

  const remoteVideo = document.getElementById("remote_video");
  showElement(remoteVideo);
  remoteVideo.muted = false;

  const newMessageInput = document.getElementById("new_message");
  showElement(newMessageInput);
};

const micOnImgSrc = "./utils/images/mic.png";
const micOffImgSrc = "./utils/images/micOff.png";

/**
 * The purpose below is to handle the logic for all buttons available during a video call,
 * and to switch between the mic and video on and off icons.
 * @param {} micActive - if true then shows icon to turn off mic, else shows icon to turn on mic
 */

export const updateMicButton = (micActive) => {
  const micButtonImage = document.getElementById("mic_button_image");
  micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = "./utils/images/camera.png";
const cameraOffImgSrc = "./utils/images/cameraOff.png";

export const updateCameraButton = (cameraActive) => {
  const cameraButtonImage = document.getElementById("camera_button_image");
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
};

/**
 * Appending the messages to the message container
 * @param {} message - the message sent or received in the data channel
 * @param {boolean} right - if true, it is an outgoing message, else incoming message
 */
export const appendMessage = (message, right = false) => {
  const messageContainer = document.getElementById("messages_container");
  const messageElement = right
    ? elements.getRightMessage(message)
    : elements.getLeftMessage(message);
  messageContainer.appendChild(messageElement);
};

/**
 * Deletes all the messages in the chat. This function is called when the user
 * ends the connection and peer connection is closed.
 */
export const clearMessenger = () => {
  const messageContainer = document.getElementById("messages_container");
  messageContainer.querySelectorAll("*").forEach((n) => n.remove());
};

/**
 * Displaying buttons for starting recording of remote stream and resetting it
 * once recording stops
 */
export const showRecordingPanel = () => {
  const recordingButtons = document.getElementById("video_recording_buttons");
  showElement(recordingButtons);

  //hide start recording button if it is active
  const startRecordingButton = document.getElementById(
    "start_recording_button"
  );
  hideElement(startRecordingButton);
};

export const resetRecordingButtons = () => {
  const startRecordingButton = document.getElementById(
    "start_recording_button"
  );

  const recordingButtons = document.getElementById("video_recording_buttons");
  hideElement(recordingButtons);
  showElement(startRecordingButton);
};

/**
 *
 * @param {boolean} switchForResumeButton - switches between pause and resume recording button
 */
export const switchRecordingButtons = (switchForResumeButton = false) => {
  const resumeButton = document.getElementById("resume_recording_button");
  const pauseButton = document.getElementById("pause_recording_button");

  if (switchForResumeButton) {
    hideElement(pauseButton);
    showElement(resumeButton);
  } else {
    hideElement(resumeButton);
    showElement(pauseButton);
  }
};

/* Muting streams once video call ends */
function muteMe(elem) {
  elem.muted = true;
  elem.pause();
}
function mutePage() {
  var elems = document.querySelectorAll("video, audio");

  [].forEach.call(elems, function (elem) {
    muteMe(elem);
  });
}

/**
 * Once the video call ends, the remote video is hidden and audio and video tracks are
 * removed from the peer connection, but the chat feature continues to work.
 */
export const videoCallEnded = () => {
  const remoteVideo = document.getElementById("remote_video");

  hideElement(remoteVideo);
  muteMe(remoteVideo);

  const callButtons = document.getElementById("call_buttons");
  hideElement(callButtons);

  const placeholder = document.getElementById("video_placeholder");
  showElement(placeholder);
};

/* The code below is executed once the user ends the connection,
    so the remote stream is hidden, placeholder is shown, and 
    the messages are cleared.
 */

export const updateUIAfterHangUp = (callType) => {
  enableDashboard();

  //hide the call buttons
  if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
    const callButtons = document.getElementById("call_buttons");
    hideElement(callButtons);
  } else {
    const chatCallButtons = document.getElementById(
      "finish_chat_button_container"
    );
    hideElement(chatCallButtons);
  }

  const newMessageInput = document.getElementById("new_message");
  hideElement(newMessageInput);
  clearMessenger();

  updateMicButton(false);
  updateCameraButton(false);

  //hide remote video and show placeholder
  const remoteVideo = document.getElementById("remote_video");
  hideElement(remoteVideo);

  const placeholder = document.getElementById("video_placeholder");
  showElement(placeholder);

  const videoCallButton = document.getElementById("personal_code_video_button");
  hideElement(videoCallButton);

  removeAllDialogs();
};

/* Dashboard is disabled only when there is incoming or outgoing calling dialog */

const enableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (!dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.add("display_none");
  }
};

const disableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.remove("display_none");
  }
};

export const hideElement = (element) => {
  if (element) {
    if (!element.classList.contains("display_none")) {
      element.classList.add("display_none");
    }
  }
};

export const showElement = (element) => {
  if (element) {
    if (element.classList.contains("display_none")) {
      element.classList.remove("display_none");
    }
  }
};
