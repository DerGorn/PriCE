"use strict";
let peerUser = "";
let peerId = null;
const peer = new Peer();
let conn = null;
let id = "";
peer.on("open", (Id) => {
    id = Id;
    const idDisplay = document.getElementById("id");
    if (idDisplay)
        idDisplay.innerText = id;
});
peer.on("connection", (con) => {
    conn = con;
    conn.on("open", startConnection);
});
const startConnection = () => {
    conn.on("data", (data) => {
        switch (data.type) {
            case "chat":
                const da = data.message;
                sendMessage(da.message, false, da.time);
                break;
            case "connected":
                const d = data.message;
                peerId = d.id;
                peerUser = d.user;
                if (peerUser === User)
                    User = "You";
                createChat();
                const connectOverlay = document.getElementById("Connection");
                if (connectOverlay == null) {
                    throw new Error("Clicked on a Button on a screen that doesn't exist. 'Connection' Button should only exist on 'startMenu', but that is 'null'.");
                }
                connectOverlay.style.visibility = "hidden";
                break;
        }
        console.log("Received: ", data);
    });
    conn.on("close", () => {
        var _a;
        (_a = body.lastChild) === null || _a === void 0 ? void 0 : _a.remove();
        const connectOverlay = document.getElementById("Connection");
        if (connectOverlay == null) {
            throw new Error("Somehow deleted the 'startMenu', but it should only be invisible.");
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
