document.addEventListener("DOMContentLoaded", () => {
  const folders = document.querySelectorAll(".folder-link");

  if (folders) {
    folders.forEach((folder) => {
      const path = window.location.pathname;
      if (path !== "/") {
        const newUrl = `${path}/${folder.textContent}`;
        folder.href = newUrl;
      }
    });
  }

  const delFolderBtns = document.querySelectorAll(".delete-folder");

  if (delFolderBtns) {
    delFolderBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const isConfirmed = confirm(
          "Are you sure you wish to delete this folder?\n(All files will be deleted as well)"
        );
        if (!isConfirmed) {
          return;
        }

        const response = await fetch(btn.parentNode.href, {
          headers: {
            "Content-Type": "json/application",
          },
          method: "Delete",
        });

        console.log(response);

        if (response.ok) {
          console.log("Folder successfully deleted");
          window.location.reload();
        } else {
          alert("Failed to delete folder");
        }
      });
    });
  }

  const delFileBtns = document.querySelectorAll(".delete-file");

  if (delFileBtns) {
    delFileBtns.forEach((btn) => {
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
    const currentShares = document.querySelector(".current-shares");
    const pubCheckbox = document.querySelector('input[type="checkbox"]');
    const sharedLink = document.querySelector(".shared-link");

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

          console.log(response);

          if (response.ok) {
            const data = await response.json();

            if (data.length === 0) {
              modal.showModal();
              return;
            }
            console.log("data..");
            console.log(data);
            console.log(data.sharedInfo.sharedWith);

            // Clear out
            if (data.sharedInfo.sharedWith.length)
              currentShares.textContent = "";
            data.sharedInfo.sharedWith.forEach((share) => {
              console.log(share);
              const li = document.createElement("li");
              li.textContent = share.user.username;
              currentShares.appendChild(li);
            });

            const isPublic = data.sharedInfo?.isPublic || false;
            pubCheckbox.checked = isPublic;
            if (isPublic) sharedLink.classList.remove("hidden");
            else sharedLink.classList.add("hidden");

            const shareId = data.sharedInfo?.shareId;
            sharedLink.querySelector("a").href = `/file/public/${shareId}`;

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
        const li = document.createElement("li");
        li.textContent = shareInput.value;
        currentShares.appendChild(li);
      } else {
        alert(data.error);
      }

      shareInput.value = "";
    });

    const unshareBtns = document.querySelectorAll(".unshare-shared-file");

    unshareBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const confirmation = confirm(
          "Are you sure you no longer need this file?"
        );

        if (!confirmation) return;

        const response = await fetch(btn.parentNode.href, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          window.location.reload();
        } else alert("Failed to remove file");
      });
    });

    pubCheckbox.addEventListener("change", async () => {
      const response = await fetch("/file/public", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: +publicForm.dataset.id,
        }),
      });

      if (response.ok) {
        const link = sharedLink.querySelector("a");
        const data = await response.json();
        link.href = `/file/shared/${data.link}/`;

        console.log(data);
      }

      sharedLink.classList.toggle("hidden");
    });
  }
});
