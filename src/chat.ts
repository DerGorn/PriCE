let callIcon: HTMLDivElement | null = null;
let streamIcon: HTMLDivElement | null = null;
let messageHolder: HTMLDivElement | null = null;

let shift = false;

const createChat = () => {
  const container = createDiv("", "center");
  container.style.backgroundColor = "var(--dark-background)";

  //Creates the chat window
  const chat = createDiv("", "chatScreen");
  const chatInputScreen = createDiv("", "chatInputScreen");
  const chatInput = document.createElement("textarea");
  chatInput.addEventListener("input", () => {
    chatInput.style.height = "1px";
    const height = chatInput.scrollHeight;
    const vh = height / window.innerHeight;
    body.style.setProperty(
      "--chat-height",
      `${vh > 0.3 ? 0.3 * window.innerHeight : height}px`
    );
    chatInput.style.height = "var(--chat-height)";
    icon.style.top = `${chatInputScreen.getBoundingClientRect().y}px`;
  });
  chatInput.autofocus = true;
  const icon = document.createElement("img");
  icon.src = "icons/Icon.png";
  icon.style.visibility = "hidden";
  icon.addEventListener("load", () => {
    icon.style.position = "absolute";
    icon.style.top = `${chatInputScreen.getBoundingClientRect().y}px`;
    icon.style.visibility = "visible";
  });

  //Creates the header
  const header = createDiv("", "header");
  header.innerText = `Chat with ${peerUser}`;
  const iconHolder = createDiv("", "iconHolder");
  const end = createDiv("", "icon");
  end.style.backgroundImage = "url(./icons/end.png)";
  end.addEventListener("click", onEndClickHandler);
  const call = document.createElement("div");
  call.classList.add("icon");
  call.style.backgroundImage = "url(./icons/call.png)";
  call.addEventListener("click", onCallClickHandler);
  callIcon = call;
  const stream = document.createElement("div");
  stream.classList.add("icon");
  stream.style.backgroundImage = "url(./icons/stream.png)";
  stream.addEventListener("click", onStreamClickHandler);
  streamIcon = stream;

  //Creates the messageHolder
  messageHolder = createDiv("", "messageHolder");

  // handles message sending
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Shift") {
      shift = true;
    }
  });
  chatInput.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
      shift = false;
    }
  });
  chatInput.addEventListener("keypress", (event) => {
    if (shift && event.key === "Enter") {
      sendMessage(chatInput.value);
      chatInput.value = "";
      chatInput.dispatchEvent(new Event("input"));
      event.preventDefault();
    }
  });

  iconHolder.append(call, stream, end);
  header.append(iconHolder);
  chatInputScreen.append(chatInput);
  chat.append(header, messageHolder, chatInputScreen, icon);
  container.append(chat);
  body.append(container);
};

let lastMessageMetaData: { user: boolean | null; time: number } = {
  user: null,
  time: 0,
};
const sendMessage = (message: string, user = true, initime = 0) => {
  const msg = createDiv("", "message");
  let author = createDiv();
  if (lastMessageMetaData.user !== user) {
    author.innerText = user ? User : peerUser;
    lastMessageMetaData.user = user;
  }
  const content = document.createElement("p");
  content.classList.add("messageBody");
  content.innerText = message;
  const t = initime === 0 ? new Date() : new Date(initime);
  const time = `${t.getHours()}:${
    t.getMinutes() < 10 ? `0${t.getMinutes()}` : t.getMinutes()
  }`;
  let timestamp = createDiv("", "messageTime");
  timestamp.innerText = time;
  if (lastMessageMetaData.time > t.valueOf() - 60_000) {
    timestamp = createDiv();
  } else {
    lastMessageMetaData.time = t.valueOf();
  }

  msg.append(author, content, timestamp);
  if (messageHolder == null) {
    throw new Error(
      "Trying to chat with no one. Writing a message makes no sense, when there is no 'messageHolder'."
    );
  }
  messageHolder.append(msg);
  messageHolder.scrollTop = messageHolder?.scrollHeight;

  timestamp.style.top = `${
    msg.getBoundingClientRect().bottom -
    timestamp.getBoundingClientRect().height
  }`;

  if (initime === 0) {
    try {
      conn.send({
        type: "chat",
        message: {
          message,
          time: t.valueOf(),
        },
      });
    } catch (e) {
      throw new Error(
        "Tried sending a message into the void. But no one listened.\n\n" + e
      );
    }
  }
};

const onEndClickHandler = () => {
  body.lastChild?.remove();
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop());
    audioStream = null;
    audioCall.close();
    audioCall = null;
  }
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
    videoCall.close();
    videoCall = null;
  }
  if (peerAudioCall) {
    peerAudioCall.close();
    peerAudioCall = null;
  }
  if (peerVideoCall) {
    peerVideoCall.close();
    peerVideoCall = null;
  }
  conn.close();
  peerUser = "";
  peerId = null;
  const connectOverlay = document.getElementById(
    "Connection"
  ) as HTMLDivElement;
  if (connectOverlay == null) {
    throw new Error(
      "Somehow deleted the 'startMenu', but it should only be invisible."
    );
  }
  connectOverlay.style.visibility = "visible";
};

const onCallClickHandler = async () => {
  if (audioCall) {
    if (callIcon == null) {
      throw new Error(
        "Clicked on a non existend Button. 'callIcon' was clicked but is 'null'."
      );
    }
    callIcon.style.backgroundColor = "unset";
    audioCall.close();
    audioCall = null;
    return;
  }
  const audio = await getAudio();
  if (audio) {
    if (callIcon == null) {
      throw new Error(
        "Clicked on a non existend Button. 'callIcon' was clicked but is 'null'."
      );
    }
    callIcon.style.backgroundColor = "red";
    audioCall = peer.call(peerId, audio, { metadata: "audio" });
    audioCall.on("close", () => {
      if (audioStream == null) return;
      audioStream.getTracks().forEach((track) => track.stop());
      audioStream = null;
      if (callIcon == null) {
        throw new Error(
          "Clicked on a non existend Button. 'callIcon' was clicked but is 'null'."
        );
      }
      callIcon.style.backgroundColor = "unset";
    });
    audioStream = audio;
  }
};

const onStreamClickHandler = async () => {
  if (videoCall) {
    if (streamIcon == null) {
      throw new Error(
        "Clicked on a non existend Button. 'streamIcon' was clicked but is 'null'."
      );
    }
    streamIcon.style.backgroundColor = "unset";
    videoCall.close();
    videoCall = null;
    return;
  }
  const video = await getVideo();
  if (video) {
    if (streamIcon == null) {
      throw new Error(
        "Clicked on a non existend Button. 'streamIcon' was clicked but is 'null'."
      );
    }
    streamIcon.style.backgroundColor = "red";
    videoCall = peer.call(peerId, video, { metadata: "video" });
    videoCall.on("close", () => {
      if (videoStream == null) return;
      videoStream.getTracks().forEach((track) => track.stop());
      videoStream = null;
      if (streamIcon == null) {
        throw new Error(
          "Clicked on a non existend Button. 'streamIcon' was clicked but is 'null'."
        );
      }
      streamIcon.style.backgroundColor = "unset";
    });
    videoStream = video;
  }
};
