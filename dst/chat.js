"use strict";
let callIcon = null;
let streamIcon = null;
let messageHolder = null;
let shift = false;
const createChat = () => {
    const container = createDiv("", "center");
    container.style.backgroundColor = "var(--dark-background)";
    const chat = createDiv("", "chatScreen");
    const chatInputScreen = createDiv("", "chatInputScreen");
    const chatInput = document.createElement("textarea");
    chatInput.addEventListener("input", () => {
        chatInput.style.height = "1px";
        const height = chatInput.scrollHeight;
        const vh = height / window.innerHeight;
        body.style.setProperty("--chat-height", `${vh > 0.3 ? 0.3 * window.innerHeight : height}px`);
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
    const header = createDiv("", "header");
    header.innerText = `Chat with ${peerUser}`;
    const iconHolder = createDiv("", "iconHolder");
    const end = createDiv("", "icon");
    end.style.backgroundImage = "url(./icons/end.png)";
    end.addEventListener("click", () => {
        container.remove();
        const connectOverlay = document.getElementById("Connection");
        if (connectOverlay == null) {
            throw new Error("Somehow deleted the 'startMenu', but it should only be invisible.");
        }
        connectOverlay.style.visibility = "visible";
    });
    const call = document.createElement("div");
    call.classList.add("icon");
    call.style.backgroundImage = "url(./icons/call.png)";
    call.addEventListener("click", async () => { });
    callIcon = call;
    const stream = document.createElement("div");
    stream.classList.add("icon");
    stream.style.backgroundImage = "url(./icons/stream.png)";
    stream.addEventListener("click", async () => { });
    streamIcon = stream;
    messageHolder = createDiv("", "messageHolder");
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
let lastMessageMetaData = {
    user: null,
    time: 0,
};
const sendMessage = (message, user = true, initime = 0) => {
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
    const time = `${t.getHours()}:${t.getMinutes() < 10 ? `0${t.getMinutes()}` : t.getMinutes()}`;
    let timestamp = createDiv("", "messageTime");
    timestamp.innerText = time;
    if (lastMessageMetaData.time > t.valueOf() - 60000) {
        timestamp = createDiv();
    }
    else {
        lastMessageMetaData.time = t.valueOf();
    }
    msg.append(author, content, timestamp);
    if (messageHolder == null) {
        throw new Error("Trying to chat with no one. Writing a message makes no sense, when there is no 'messageHolder'.");
    }
    messageHolder.append(msg);
    messageHolder.scrollTop = messageHolder === null || messageHolder === void 0 ? void 0 : messageHolder.scrollHeight;
    timestamp.style.top = `${msg.getBoundingClientRect().bottom -
        timestamp.getBoundingClientRect().height}`;
    if (initime === 0) {
        try {
            conn.send({
                type: "chat",
                message: {
                    message,
                    time: t.valueOf(),
                },
            });
        }
        catch (e) {
            throw new Error("Tried sending a message into the void. But no one listened.\n\n" + e);
        }
    }
};