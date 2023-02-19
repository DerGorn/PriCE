"use strict";
const getAudio = async () => {
    let audioStream = null;
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        });
    }
    catch (e) {
        console.log("Tried to spy on your Microphone, but failed due to: \n\n" + e);
    }
    return audioStream;
};
const getVideo = async () => {
    let screenCapture = null;
    try {
        screenCapture = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
            surfaceSwitching: "include",
        });
    }
    catch (e) {
        console.log("Tried to spy on your Screem, but failed due to: \n\n" + e);
    }
    return screenCapture;
};
