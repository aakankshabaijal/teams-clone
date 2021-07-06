import * as constants from "./constants.js";
import * as elements from "./elements.js";

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById('personal_code_paragraph');
    personalCodeParagraph.innerHTML = personalCode;
};
//here we have implemented the copy code functionality

export const updateLocalVideo = (stream) => {
    const localVideo = document.getElementById('local_video');
    localVideo.srcObject = stream;

    localVideo.addEventListener('loadedmetadata', () => {
        localVideo.play();
    });
};

//when we are able to get local stream from camera only then the option to video call will 
//be available.if some error occurs in getting the local stream we will not be able to
//do a video call

export const showVideoCallButtons = () => {
    console.log('getting local stream correctly');
}

export const updateRemoteVideo = (stream) => {
    const remoteVideo = document.getElementById('remote_video');
    remoteVideo.srcObject = stream;
};




export const showIncomingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? 
        "Chat" : "Video";
    const incomingCallDialog = 
        elements.getIncomingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler);

    //removing all dialogs inside HTML dialog element
    const dialog = document.getElementById('dialog');
    dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());
    dialog.appendChild(incomingCallDialog);
};


export const showCallingDialog = (rejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(rejectCallHandler);
    //removing all dialogs inside HTML dialog element
    const dialog = document.getElementById('dialog');
    dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());
    dialog.appendChild(callingDialog);
};

export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null;
    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        infoDialog = elements.getInfoDialog('Call rejected', 'Callee rejected your call');
    }

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        infoDialog = elements.getInfoDialog('Callee not found', 'Please check personal code');
    }

    
    if (infoDialog) {
        const dialog = document.getElementById('dialog');
        dialog.appendChild(infoDialog);

        setTimeout(() => {
            removeAllDialogs();
        }, [4000]);
    }



};


export const removeAllDialogs = () => {
    const dialog = document.getElementById('dialog');
    dialog.querySelectorAll('*').forEach((dialog) => dialog.remove());
};

export const showCallElements = (callType) => {
    if (callType === constants.callType.CHAT_PERSONAL_CODE) {
        showChatCallElements();
    }
    if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
        showVideoCallElements();
    }


};

export const showChatCallElements = () => {
    const finishConnectionChatButtonContainer = 
    document.getElementById('finish_chat_button_container');
    
    const videoCallButton = document.getElementById('personal_code_video_button');
    showElement(videoCallButton);
    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);
    
};

const showVideoCallElements = () => {
    const callButtons = document.getElementById('call_buttons');
    showElement(callButtons);

    const placeholder = document.getElementById('video_placeholder');
    hideElement(placeholder);

    const remoteVideo = document.getElementById('remote_video');
    showElement(remoteVideo);
    remoteVideo.muted = false;

    const newMessageInput = document.getElementById('new_message');
    showElement(newMessageInput);
    
}


//ui call buttons
const micOnImgSrc = './utils/images/mic.png';
const micOffImgSrc = './utils/images/micOff.png';

export const updateMicButton = (micActive) => {
    const micButtonImage = document.getElementById('mic_button_image');
    micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = './utils/images/camera.png';
const cameraOffImgSrc = './utils/images/cameraOff.png';


export const updateCameraButton = (cameraActive) => {
    const cameraButtonImage = document.getElementById('camera_button_image');
    cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
}

// ui messages
export const appendMessage = (message, right = false) => {
    const messageContainer = document.getElementById('messages_container');
    const messageElement  = right ? elements.getRightMessage(message) : 
        elements.getLeftMessage(message) ;
    messageContainer.appendChild(messageElement);
};

export const clearMessenger = () => {
    const messageContainer = document.getElementById('messages_container');
    messageContainer.querySelectorAll("*").forEach((n) => n.remove());
};

//recording
export const showRecordingPanel = () => {
    const recordingButtons = document.getElementById('video_recording_buttons');
    showElement(recordingButtons);

    //hide start recording button if it is active
    const startRecordingButton = document.getElementById('start_recording_button');
    hideElement(startRecordingButton);
};

export const resetRecordingButtons = () => {
    const startRecordingButton = document.getElementById('start_recording_button');


    const recordingButtons = document.getElementById('video_recording_buttons');
    hideElement(recordingButtons);
    showElement(startRecordingButton);
};

export const switchRecordingButtons = (switchForResumeButton = false) => {
    const resumeButton = document.getElementById('resume_recording_button');
    const pauseButton = document.getElementById('pause_recording_button');

    if(switchForResumeButton) {
        hideElement(pauseButton);
        showElement(resumeButton);
    }
    else{
        hideElement(resumeButton);
        showElement(pauseButton);
    }
};

// ui after hang up
function muteMe(elem) {
    elem.muted = true;
    elem.pause();
}
function mutePage() {
    var elems = document.querySelectorAll("video, audio");

    [].forEach.call(elems, function(elem) { muteMe(elem); });
}

export const videoCallEnded = () => {
    const remoteVideo = document.getElementById('remote_video');
    
    hideElement(remoteVideo);
    muteMe(remoteVideo);

    const callButtons = document.getElementById('call_buttons');
    hideElement(callButtons);

    const placeholder = document.getElementById('video_placeholder');
    showElement(placeholder);

    
}

export const updateUIAfterHangUp = (callType) => {
    enableDashboard();


    //hide the call buttons
    if(callType === constants.callType.VIDEO_PERSONAL_CODE) {
        const callButtons = document.getElementById('call_buttons');
        hideElement(callButtons);
    } else {
        const chatCallButtons = document.getElementById('finish_chat_button_container');
        hideElement(chatCallButtons);
    }

    const newMessageInput = document.getElementById('new_message');
    hideElement(newMessageInput);
    clearMessenger();

    updateMicButton(false);
    updateCameraButton(false);

    //hide remote video and show placeholder
    const remoteVideo = document.getElementById('remote_video');
    hideElement(remoteVideo);

    const placeholder = document.getElementById('video_placeholder');
    showElement(placeholder);

    const videoCallButton = document.getElementById('personal_code_video_button');
    hideElement(videoCallButton);

    removeAllDialogs();


};


//ui helper functions

const enableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (!dashboardBlocker.classList.contains('display_none')) {
        dashboardBlocker.classList.add('display_none');
    }
};

const disableDashboard = () => {
    const dashboardBlocker = document.getElementById('dashboard_blur');
    if (dashboardBlocker.classList.contains('display_none')) {
        dashboardBlocker.classList.remove("display_none");
    }
};

export const hideElement = (element) => {
    if(element) {
        if (!element.classList.contains('display_none')) {
            element.classList.add('display_none');
        }
    }
    
};

export const showElement = (element) => {
    if(element) {
        if (element.classList.contains('display_none')) {
            element.classList.remove('display_none');
        }
    }
    
};


