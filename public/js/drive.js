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

  const modal = document.querySelector("dialog");

  if (modal) {
    const shareBtns = document.querySelectorAll(".share-file");
    const shareForm = document.getElementById("share-form");
    const publicForm = document.getElementById("public-form");

    // Populate and open modal

    if (shareBtns) {
      shareBtns.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();

          const fileId = btn.parentNode.href.split("/").at(-1);

          const response = await fetch(btn.parentNode.href, {
            headers: {
              accept: "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(data);

            shareForm.dataset.id = fileId;
            publicForm.dataset.id = fileId;

            modal.showModal();
          }
        });
      });
    }

    const closeModalBtn = document.getElementById("close-modal-btn");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        modal.close();
      });
    }

    // Toggle between forms on modal

    const shareTab = document.getElementById("share-tab-btn");
    const publicTab = document.getElementById("public-tab-btn");

    shareTab.addEventListener("click", () => {
      if (shareTab.classList.contains("active")) return;
      publicTab.classList.remove("active");
      shareTab.classList.add("active");

      shareForm.classList.toggle("hidden");
      publicForm.classList.toggle("hidden");
    });

    publicTab.addEventListener("click", () => {
      if (publicTab.classList.contains("active")) return;
      shareTab.classList.remove("active");
      publicTab.classList.add("active");

      shareForm.classList.toggle("hidden");
      publicForm.classList.toggle("hidden");
    });

    // Post new user to share with

    shareForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const shareInput = shareForm.querySelector("input");
      const fileId = +shareForm.dataset.id;

      const response = await fetch(shareForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: shareInput.value,
          fileId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
      } else {
        alert(data.error);
      }
    });
  }
});
