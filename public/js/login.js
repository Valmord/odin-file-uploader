document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("next-btn");
  const userInput = document.getElementById("username");
  const checkboxLbl = document.querySelector(".login-2-label");
  const checkbox = document.querySelector('input[type="checkbox"]');

  if (checkboxLbl) {
    checkbox.addEventListener("change", () => {
      checkboxLbl.classList.toggle("active");
    });
  }

  // const nextPage = async function () {
  //   const response = await fetch("/login", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       username: userInput.value,
  //     }),

  //   });
  // };

  // nextBtn.addEventListener("click", () => {
  //   if (userInput.validity.valid) {
  //     nextPage();
  //   }
  // });

  // userInput.addEventListener("keypress", (e) => {
  //   if (e.key === "Enter" && userInput.validity.valid) {
  //     nextPage();
  //   }
  // });
});
