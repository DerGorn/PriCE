let audioStream: MediaStream | null = null;
let audioCall: any | null = null;
let videoStream: MediaStream | null = null;
let videoCall: any | null = null;

let peerUser = "";
let peerId: string | null = null;
let peerAudioCall: any | null = null;
let peerAudioStream: MediaStream | null = null;
let peerAudioElement: HTMLAudioElement | null = null;
let mutePeerCall = false;
let peerVideoCall: any | null = null;
let peerVideoStream: MediaStream | null = null;
let peerStreamFullScreen = false;
let peerVideoElement: HTMLDivElement | null = null;

//@ts-ignore
const peer = new Peer();
let conn: any = null;
let id: string = "";

peer.on("open", (Id: string) => {
  id = Id;
  const idDisplay = document.getElementById("id");
  if (idDisplay) idDisplay.innerText = id;
});

peer.on("connection", (con: any) => {
  conn = con;
  conn.on("open", startConnection);
});

peer.on("call", (cal: any) => {
  switch (cal.metadata) {
    case "audio":
      peerAudioCall = cal;
      peerAudioCall.on("stream", receiveAudioCall);
      peerAudioCall.on("close", () => {
        peerAudioStream = null;
        peerAudioElement && peerAudioElement.remove();
        peerAudioElement = null;
        conn.send({ type: "close", message: { type: "audio" } });
      });
      peerAudioCall.answer();
      break;
    case "video":
      peerVideoCall = cal;
      peerVideoCall.on("stream", receiveVideoCall);
      peerVideoCall.on("close", () => {
        peerVideoStream = null;
        peerVideoElement && peerVideoElement.remove();
        peerVideoElement = null;
        conn.send({ type: "close", message: { type: "video" } });
      });
      peerVideoCall.answer();
      break;
  }
});

const startConnection = () => {
  conn.on("data", (data: { type: string; message: object }) => {
    switch (data.type) {
      case "chat":
        const da = data.message as { message: string; time: number };
        sendMessage(da.message, false, da.time);
        break;
      case "close":
        const dd = data.message as { type: string };
        switch (dd.type) {
          case "audio":
            audioCall && audioCall.close();
            break;
          case "video":
            videoCall && videoCall.close();
            break;
        }
        break;
      case "connected":
        const d = data.message as { user: string; id: string };
        peerId = d.id;
        peerUser = d.user;
        if (peerUser === User) User = "You";
        createChat();
        const connectOverlay = document.getElementById(
          "Connection"
        ) as HTMLDivElement;
        if (connectOverlay == null) {
          throw new Error(
            "Clicked on a Button on a screen that doesn't exist. 'Connection' Button should only exist on 'startMenu', but that is 'null'."
          );
        }
        connectOverlay.style.visibility = "hidden";
        break;
    }
    console.log("Received: ", data);
  });
  conn.on("close", () => {
    body.lastChild?.remove();
    const connectOverlay = document.getElementById(
      "Connection"
    ) as HTMLDivElement;
    if (connectOverlay == null) {
      throw new Error(
        "Somehow deleted the 'startMenu', but it should only be invisible."
      );
    }
    audioCall && audioCall.close();
    videoCall && videoCall.close();
    const notifications = notificationHolder.children;
    for (const i = 0; i < notifications.length; ) {
      notifications[i].remove();
    }
    connectOverlay.style.visibility = "visible";
  });
  conn.send({
    type: "connected",
    message: {
      user: User,
      id,
    },
  });
};

const receiveAudioCall = (stream: MediaStream) => {
  peerAudioStream = stream;
  createNotification("audio");
  const audio = document.createElement("audio");
  audio.autoplay = true;
  audio.srcObject = peerAudioStream;
  const chat = body.lastChild as HTMLDivElement;
  chat.append(audio);
  peerAudioElement = audio;
};

const receiveVideoCall = (stream: MediaStream) => {
  peerVideoStream = stream;
  createNotification("video");
  const video = document.createElement("div");
  video.classList.add("center");
  video.style.maxHeight = `calc(99vh - 35px - var(--chat-height))`;
  video.style.top = "calc(0.5vh + 35px)";
  const vid = document.createElement("video");
  vid.srcObject = stream;
  vid.playsInline = true;
  vid.autoplay = true;
  video.append(vid);
  const chat = body.lastChild as HTMLDivElement;
  chat.append(video);
  peerVideoElement = video;
  peerVideoElement.style.visibility = "hidden";
};
