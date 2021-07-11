/**
 * File : webRTCHandler.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains all functions for creating and ending the peer connection between
 *      two participants by using webRTC. The dataChannel is used for sending and receiving messages
 *      through chat. First the two users have to send a connection request. Once they are connected,
 *      chat and video call option is available. The chat is available even when the video call ends.
 *      The chat is cleared only when the user ends the connection.
 *
 */
import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;
let dataChannel;
let senderVideo;
let userStream;

const defaultConstraints = {
  audio: true,
  video: true,
};

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:13902",
    },
  ],
};

export const getLocalPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setCallState(constants.callState.CALL_AVAILABLE);
      store.setLocalStream(stream);
    })
    .catch((err) => {
      console.log(err);
    });
};

//we need to create an object of RTCPeerConnection on both sides before we start adding the offers and answers
const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);

  //data channel for sending messages in chat call
  dataChannel = peerConnection.createDataChannel("chat");

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {};

    dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data);
      ui.appendMessage(message);
    };
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      //send our ice candidates to other peer
      if (connectedUserDetails) {
        wss.sendDataUsingWebRTCSignaling({
          connectedUserSocketId: connectedUserDetails.socketId,
          type: constants.webRTCSignaling.ICE_CANDIDATE,
          candidate: event.candidate,
        });
      }
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
    }
  };

  /**
   * The purpose of code below is to receive the remote stream of other user
   * and add audio and video tracks to the peer connection.
   */

  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  //adding our stream to peer connection

  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const localStream = store.getState().localStream;
    userStream = localStream;

    for (const track of localStream.getTracks()) {
      senderVideo = peerConnection.addTrack(track, localStream);
    }
  }
};

export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
};

/* Creating offer once user clicks on 'Connect' or 'Video Call' button */
export const sendPreOffer = (callType, calleePersonalCode) => {
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      calleePersonalCode,
    };

    ui.showCallingDialog(callingDialogRejectCallHandler);
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    wss.sendPreOffer(data);
  }
};

/* If the other user is available then they will get the incoming call dialog
    with the option to accept or reject the connection request
*/
export const handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;

  if (!checkCallPossibility()) {
    return sendPreOfferAnswer(
      constants.preOfferAnswer.CALL_UNAVAILABLE,
      callerSocketId
    );
  }

  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  store.setCallState(constants.callState.CALL_UNAVAILABLE);

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
};

const acceptCallHandler = () => {
  createPeerConnection();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};
const rejectCallHandler = () => {
  sendPreOfferAnswer();
  setIncomingCallsAvailable();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId,
  };
  closePeerConnectionAndResetState();
  wss.senduserHangedUp(data);
};

/* Personal code of two users exchanged */
const sendPreOfferAnswer = (preOfferAnswer, callerSocketId = null) => {
  const socketId = callerSocketId
    ? callerSocketId
    : connectedUserDetails.socketId;

  const data = {
    callerSocketId: socketId,
    preOfferAnswer: preOfferAnswer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;
  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    setIncomingCallsAvailable();
    ui.showInfoDialog(preOfferAnswer);
    //show dialog that callee has not been found
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    setIncomingCallsAvailable();
    ui.showInfoDialog(preOfferAnswer);
    //show dialog that callee is not able to connect
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    setIncomingCallsAvailable();
    ui.showInfoDialog(preOfferAnswer);
    //show dialog that call is rejected by callee
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    //send webRTC offer
    ui.showCallElements(connectedUserDetails.callType);
    createPeerConnection();
    sendWebRTCOffer();
  }
};

const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  //storing SDP information
  await peerConnection.setLocalDescription(offer);
  //sending information to other user
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.OFFER,
    offer: offer,
  });
};

//exchanging SDP information
export const handleWebRTCOffer = async (data) => {
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.ANSWER,
    answer: answer,
  });
};

export const handleWebRTCAnswer = async (data) => {
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (err) {}
};

let screenSharingStream;

/* Once the screen sharing begins, the local video stream is 
    replaced by screen sharing stream
*/

export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  if (screenSharingActive) {
    const localStream = store.getState().localStream;
    const senders = peerConnection.getSenders();
    const sender = senders.find((sender) => {
      return sender.track.kind === localStream.getVideoTracks()[0].kind;
    });

    if (sender) {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    }

    //stop screen sharing stream, popup saying that 'you are sharing your screen' will also disapper
    store
      .getState()
      .screenSharingStream.getTracks()
      .forEach((track) => track.stop());

    store.setScreenSharingActive(!screenSharingActive);
    ui.updateLocalVideo(localStream);
  } else {
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      store.setScreenSharingStream(screenSharingStream);
      const senders = peerConnection.getSenders();
      //replace video track with screen share

      const sender = senders.find((sender) => {
        return (
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
        );
      });

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setScreenSharingActive(!screenSharingActive);

      ui.updateLocalVideo(screenSharingStream);
    } catch (err) {
      console.error(
        "error occured when trying to get screen sharing stream",
        err
      );
    }
  }
};

/**
 * The purpose of the function below is to remove the audio and video streams
 * from the peer connection when the user hangs up the video call. The peer
 * connection remains active so that users can still communicate via chat.
 *
 */

export const onlyVideoHangUp = () => {
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId,
  };

  wss.senduserHangedUp(data);
  store.getState().localStream.getVideoTracks()[0].enabled = true;
  store.getState().localStream.getAudioTracks()[0].enabled = true;

  var audioTrack = userStream.getAudioTracks()[0];

  if (audioTrack.length > 0) {
    userStream.removeTrack(audioTrack[0]);
  }

  ui.videoCallEnded();
};

export const handleHangUp = () => {
  if (connectedUserDetails) {
    const data = {
      connectedUserSocketId: connectedUserDetails.socketId,
    };
    wss.endConnection(data);
  }

  closePeerConnectionAndResetState();
};

export const handleConnectedUserHangedUp = () => {};

/**
 * The funtion below ends the peer connection and resets the state for both users
 * so that they are ready to form peer connection with any other user.
 */

export const closePeerConnectionAndResetState = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // active mic and camera
  if (connectedUserDetails) {
    if (
      connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
    ) {
      store.getState().localStream.getVideoTracks()[0].enabled = true;
      store.getState().localStream.getAudioTracks()[0].enabled = true;
    }
    ui.updateUIAfterHangUp(connectedUserDetails.callType);
    setIncomingCallsAvailable();
    connectedUserDetails = null;
  }
};

const checkCallPossibility = (callType) => {
  return true;
};

const setIncomingCallsAvailable = () => {
  const localStream = store.getState().localStream;
  if (localStream) {
    store.setCallState(constants.callState.CALL_AVAILABLE);
  } else {
    store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
  }
};
