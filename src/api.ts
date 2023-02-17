const body = document.getElementsByTagName("body")[0];

const createDiv = (id: string = "", ...classes: string[]) => {
  const div = document.createElement("div");
  div.id = id;
  div.classList.add(...classes);
  return div;
};

