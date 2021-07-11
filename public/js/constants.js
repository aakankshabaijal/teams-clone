/**
 * File : constants.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains the constants for call type and call states.
 *      These are used to get information about the current status of the connection,
 *      as there are 3 processes to establish a connection in WebRTC : sending offer,
 *      accepting the answer and exchanging the ICE candidates.
 *      Additional constants are also used for determining if the call was accepted or rejected.
 *      If incorrect personal code was entered, the "CALLEE_NOT_FOUND" property is used.
 *
 */

export const callType = {
  CHAT_PERSONAL_CODE: "CHAT_PERSONAL_CODE",
  VIDEO_PERSONAL_CODE: "VIDEO_PERSONAL_CODE",
};

export const preOfferAnswer = {
  CALLEE_NOT_FOUND: "CALLEE_NOT_FOUND",
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_REJECTED: "CALL_REJECTED",
};

export const webRTCSignaling = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  ICE_CANDIDATE: "ICE_CANDIDATE",
};

export const callState = {
  CALL_AVAILABLE: "CALL_AVAILABLE",
  CALL_AVAILABLE_ONLY_CHAT: "CALL_AVAILABLE_ONLY_CHAT",
};
