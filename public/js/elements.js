/**
 * File : elements.js
 * Author : Aakanksha Baijal
 * Date : July 2021
 * Project : Microsoft Teams Clone
 *
 * Summary of File:
 *      This file contains code which creates the dialog boxes when
 *      connection / video call request is sent, and the chat messages.
 *      During outgoing call, dialog box only shows 'Calling'.
 *      During incoming call, user has the option to accept or reject the call.
 *      If incorrect personal code was entered,the dialog box shows that
 *      'Callee not found, Please check personal code'.
 *      Incoming chat message is created in the getLeftMessage() function and
 *      Outgoing chat message is created in the getRightMessage() function.
 *
 */

import * as constants from "./constants.js";

/* Dialog when incoming call or connection request, with the option to accept or reject*/

export const getIncomingCallDialog = (
  callTypeInfo,
  acceptCallHandler,
  rejectCallHandler
) => {
  console.log("getting incoming call dialog");

  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");

  /* First the connection request is sent. Once two users are connected,
   * only then option for video call is available.
   */

  dialog.appendChild(dialogContent);
  const title = document.createElement("p");
  title.classList.add("dialog_title");
  if (callTypeInfo === constants.callType.VIDEO_PERSONAL_CODE) {
    title.innerHTML = `Incoming ${callTypeInfo} Call`;
  } else {
    title.innerHTML = "Incoming Request";
  }

  /*Standard Avatar as image in the dialog box*/
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");

  image.src = "./utils/images/dialogAvatar.png";
  imageContainer.appendChild(image);

  /* buttonContainer contains the accept and reject buttons*/
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("dialog_button_container");

  const acceptCallButton = document.createElement("button");
  acceptCallButton.classList.add("dialog_accept_call_button");
  const acceptCallImg = document.createElement("img");
  acceptCallImg.classList.add("dialog_button_image");
  acceptCallImg.src = "./utils/images/acceptCall.png";
  acceptCallButton.append(acceptCallImg);
  buttonContainer.appendChild(acceptCallButton);

  const rejectCallButton = document.createElement("button");
  rejectCallButton.classList.add("dialog_reject_call_button");
  const rejectCallImg = document.createElement("img");
  rejectCallImg.classList.add("dialog_button_image");
  rejectCallImg.src = "./utils/images/rejectCall.png";
  rejectCallButton.append(rejectCallImg);
  buttonContainer.appendChild(rejectCallButton);

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(buttonContainer);

  acceptCallButton.addEventListener("click", () => {
    acceptCallHandler();
  });
  rejectCallButton.addEventListener("click", () => {
    rejectCallHandler();
  });

  return dialog;
};

/*getCallingDialog creates a dialog when we are calling the other user */
export const getCallingDialog = (rejectCallHandler) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");

  dialog.appendChild(dialogContent);
  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = `Calling`;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");

  image.src = "./utils/images/dialogAvatar.png";
  imageContainer.appendChild(image);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("dialog_button_container");

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(buttonContainer);

  return dialog;
};

/* getInfoDialog creates the Dialog when incorrect personal code is entered */
export const getInfoDialog = (dialogTitle, dialogDescription) => {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog_wrapper");
  const dialogContent = document.createElement("div");
  dialogContent.classList.add("dialog_content");

  dialog.appendChild(dialogContent);

  const title = document.createElement("p");
  title.classList.add("dialog_title");
  title.innerHTML = dialogTitle;

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("dialog_image_container");
  const image = document.createElement("img");

  image.src = "./utils/images/dialogAvatar.png";
  imageContainer.appendChild(image);

  const description = document.createElement("p");
  description.classList.add("dialog_description");
  description.innerHTML = dialogDescription;

  dialogContent.appendChild(title);
  dialogContent.appendChild(imageContainer);
  dialogContent.appendChild(description);

  return dialog;
};

/* getLeftMessage is for creating the boxes of incoming messages and appending it into the messages container */
export const getLeftMessage = (message) => {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message_left_container");
  const messageParagraph = document.createElement("p");
  messageParagraph.classList.add("message_left_paragraph");
  messageParagraph.innerHTML = message;
  messageContainer.appendChild(messageParagraph);

  return messageContainer;
};

/* getRighttMessage is for creating the boxes of outgoing messages and appending it into the messages container */
export const getRightMessage = (message) => {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message_right_container");
  const messageParagraph = document.createElement("p");
  messageParagraph.classList.add("message_right_paragraph");
  messageParagraph.innerHTML = message;
  messageContainer.appendChild(messageParagraph);

  return messageContainer;
};
