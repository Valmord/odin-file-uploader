document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("new-file-btn");

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

  const addModal = document.querySelector(".add-modal");
  const addFolderBtn = document.getElementById("add-folder-btn");
  const addFileBtn = document.getElementById("add-file-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addModal.classList.remove("hidden");
      addModal.addEventListener("mouseleave", () => {
        addModal.classList.add("hidden");
      });
    });

    // Adding new File
    addFileBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.name = "file";
      input.click();

      const action =
        window.location.pathname === "/"
          ? "/file/new"
          : window.location.pathname;

      input.addEventListener("change", () => {
        if (input.files.length > 0) {
          const form = document.createElement("form");
          form.action = action;
          form.method = "post";
          form.enctype = "multipart/form-data";
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
        }
      });
    });

    // Adding new Folder
    const folderModal = document.getElementById("folder-modal");
    const folderModalCancelBtn = folderModal.querySelector(".cancel-btn");
    const pathInput = document.getElementById("hidden-path-input");

    addFolderBtn.addEventListener("click", () => {
      pathInput.value = window.location.pathname;
      folderModal.showModal();
    });

    folderModalCancelBtn.addEventListener("click", () => {
      folderModal.close();
    });
  }
});
