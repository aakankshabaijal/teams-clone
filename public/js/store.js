/**
 * File : store.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains the getter and setter functions for the
 *      call state, local and remote video and screen sharing stream.
 *
 */

import * as constants from "./constants.js";

let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  screenSharingActive: false,
  screenSharingStream: null,
  callState: constants.callState.CALL_AVAILABLE_ONLY_CHAT,
};

export const setSocketId = (socketId) => {
  state = {
    ...state, //copying the previous state
    socketId,
  };
};

export const setLocalStream = (stream) => {
  state = {
    ...state,
    localStream: stream,
  };
};

export const setScreenSharingActive = (screenSharingActive) => {
  state = {
    ...state,
    screenSharingActive,
  };
};

export const setScreenSharingStream = (stream) => {
  state = {
    ...state,
    screenSharingStream: stream,
  };
};

export const setRemoteStream = (stream) => {
  state = {
    ...state,
    remoteStream: stream,
  };
};

export const setCallState = (callState) => {
  state = {
    ...state,
    callState,
  };
};

export const getState = () => {
  return state;
};
