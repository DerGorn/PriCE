let peerUser = "";
let peerId: string | null = null;

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

const startConnection = () => {
  conn.on("data", (data: { type: string; message: object }) => {
    switch (data.type) {
      case "chat":
        const da = data.message as { message: string; time: number };
        sendMessage(da.message, false, da.time);
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
