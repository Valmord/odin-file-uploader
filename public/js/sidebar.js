document.addEventListener("DOMContentLoaded", () => {
  const sideBtns = document.querySelectorAll(".btn-grp button");

  if (sideBtns) {
    sideBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        sideBtns.forEach((btn) => {
          btn.classList.remove("active");
        });
        btn.classList.add("active");
      });
    });
  }
});
