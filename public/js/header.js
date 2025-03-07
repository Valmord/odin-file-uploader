document.addEventListener("DOMContentLoaded", () => {
  const addFileBtn = document.getElementById("new-file-btn");
  if (addFileBtn) {
    addFileBtn.addEventListener("click", () => {
      console.log("here");
      const input = document.createElement("input");
      input.type = "file";
      input.name = "file";
      input.click();

      input.addEventListener("change", () => {
        if (input.files.length > 0) {
          const form = document.createElement("form");
          form.action = "/file/new";
          form.method = "post";
          form.enctype = "multipart/form-data";

          form.appendChild(input);

          document.body.appendChild(form);
          form.submit();
        }
      });
    });
  }
});
