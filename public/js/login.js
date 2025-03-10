document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("next-btn");
  const userInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const checkboxLbl = document.querySelector(".login-2-label");
  const checkbox = document.querySelector('input[type="checkbox"]');
  const createAccBtn = document.getElementById("create-account-btn");

  if (checkboxLbl) {
    checkbox.addEventListener("change", () => {
      checkboxLbl.classList.toggle("active");
      if (passwordInput.getAttribute("type") === "password") {
        passwordInput.setAttribute("type", "text");
      } else passwordInput.setAttribute("type", "password");
    });
  }

  if (createAccBtn) {
    createAccBtn.addEventListener("click", () => {
      window.location.href = "/signup";
    });
  }

  if (userInput && userInput.getAttribute("type") !== "hidden") {
    console.log("here");
    userInput.focus();
  }

  if (passwordInput) {
    passwordInput.focus();
  }
});
