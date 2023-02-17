let startMenu: HTMLDivElement | null = null;

let User = "Anonymous";

const main = () => {
  const Connection = createDiv("Connection", "center");

  const title = createDiv("", "title");
  title.innerText = "PriCE";

  const input = createDiv();
  input.style.display = "flex";
  const inputEL = document.createElement("input");
  inputEL.id = "peerId";
  inputEL.type = "text";
  inputEL.placeholder = "peer id";
  inputEL.style.textAlign = "center";
  const button = createDiv("connect", "connectButton");
  button.innerText = "Connect";
  button.addEventListener("click", onConnectClickHandler);

  const id = createDiv("id", "selectAll");

  const settings = createDiv("settings", "icon");
  settings.style.position = "absolute";
  settings.style.top = "10px";
  settings.style.right = "10px";
  settings.style.backgroundImage = "url(./icons/settings.png)";
  settings.addEventListener("click", onSettingsClickHandler);

  input.append(inputEL, button);
  Connection.append(title, input, id, settings);
  body.append(Connection);

  startMenu = Connection;
};

const onSettingsClickHandler = () => {
  if (startMenu === null) {
    throw new Error(
      "Clicked on a Button on a screen that doesn't exist. 'settings' Button should only exist on 'startMenu', but that is 'null'."
    );
  }
  startMenu.style.visibility = "hidden";
  createSettingsMenu();
};

const createSettingsMenu = () => {
  const settings = createDiv("settings", "center");

  const userSetting = createDiv("user", "setting");
  userSetting.innerText = "Username: ";
  const userInput = document.createElement("input");
  userInput.id = "userInput";
  userInput.type = "text";
  userInput.value = User;
  userInput.style.textAlign = "center";
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        User = userInput.value;
    }
  })

  const end = createDiv("settings", "icon");
  end.style.position = "absolute";
  end.style.top = "10px";
  end.style.right = "10px";
  end.style.backgroundImage = "url(./icons/end.png)";
  end.addEventListener("click", () => {
    if (startMenu === null) {
      throw new Error(
        "Clicked on a Button on a screen that doesn't exist. 'end' Button should only exist on 'settings' a child of 'startMenu', but that is 'null'."
      );
    }
    settings.remove();
    startMenu.style.visibility = "visible";
  });

  userSetting.append(userInput);
  settings.append(userSetting, end);
  body.append(settings);
  console.log("settings");
};

const onConnectClickHandler = () => {
  console.log("connect");
};

main();
