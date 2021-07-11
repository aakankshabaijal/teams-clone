/**
 * File : wss.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains the logic for socket.io and communication between the client and server.
 *      Each user has their personal code which is their socket ID. Once webRTC sends any offer or
 *      answer it is emitted through the socket.io server and then handled through webRTC.
 *
 */
import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";

let socketIO = null;

export const registerSocketEvents = (socket) => {
  socket.on("connect", () => {
    socketIO = socket;
    store.setSocketId(socket.id);
    ui.updatePersonalCode(socket.id);
  });

  socket.on("pre-offer", (data) => {
    webRTCHandler.handlePreOffer(data);
  });

  socket.on("pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  /* This function is called when the user ends the video call, but the peer connection still 
     remains active so that the users can chat after the meeting
  */
  socket.on("user-hanged-up", () => {
    webRTCHandler.handleConnectedUserHangedUp();
    ui.videoCallEnded();
  });

  /* This function is called when the user ends the connection, so the peer connection will be
     closed, messages will be cleared and if there is any ongoing video call, that will also be ended.
  */
  socket.on("end-connection", () => {
    webRTCHandler.closePeerConnectionAndResetState();
  });

  socket.on("webRTC-signaling", (data) => {
    switch (data.type) {
      case constants.webRTCSignaling.OFFER:
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case constants.webRTCSignaling.ANSWER:
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case constants.webRTCSignaling.ICE_CANDIDATE:
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });
};

export const sendPreOffer = (data) => {
  socketIO.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
  socketIO.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
  socketIO.emit("webRTC-signaling", data);
};

//the function below only ends the video call, but peer connection remains active so that users can chat
export const senduserHangedUp = (data) => {
  socketIO.emit("user-hanged-up", data);
};

//the function below closes the peer connection between two users
export const endConnection = (data) => {
  socketIO.emit("end-connection", data);
};
