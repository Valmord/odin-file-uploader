document.addEventListener("DOMContentLoaded", () => {
  const deleteBtns = document.querySelectorAll(".delete-file");

  if (deleteBtns) {
    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const userConfirmation = confirm(
          "Are you sure you want to delete this item?"
        );

        if (userConfirmation !== true) return;

        const response = await fetch(btn.parentNode.href, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          window.location.reload();
        } else {
          alert("Error deleting file");
        }
      });
    });
  }
});
