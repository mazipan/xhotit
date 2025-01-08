export const hideCursor = () => {
  const container = document.getElementById("container");
  if (container) container.style.cursor = "none";
};

export const showCursor = () => {
  const container = document.getElementById("container");
  if (container) container.style.cursor = "crosshair";
};
