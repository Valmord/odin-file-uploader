document.addEventListener("DOMContentLoaded", () => {
  const sideBtns = document.querySelectorAll(".btn-grp button");

  const myFilesBtn = document.getElementById("my-files-btn");
  const sharedFilesBtn = document.getElementById("shared-files-btn");

  if (myFilesBtn) {
    myFilesBtn.addEventListener("click", () => {
      if (myFilesBtn.classList.contains("active")) return;
      window.location.href = "/";
    });
  }

  if (sharedFilesBtn) {
    sharedFilesBtn.addEventListener("click", () => {
      if (sharedFilesBtn.classList.contains("active")) return;
      window.location.href = "/shares/";
    });
  }

  // if (sideBtns) {
  //   sideBtns.forEach((btn) => {
  //     btn.addEventListener("click", () => {
  //       if (btn.classList.contains("active")) return;

  //       sideBtns.forEach((btn) => {
  //         btn.classList.remove("active");
  //       });
  //       btn.classList.add("active");
  //     });
  //   });
  // }
});
