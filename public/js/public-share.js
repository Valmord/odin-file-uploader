document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.querySelector("button");
  downloadBtn.addEventListener("click", () => {
    downloadBtn.textContent = "Downloaded";
    downloadBtn.disabled = true;
  });
});
