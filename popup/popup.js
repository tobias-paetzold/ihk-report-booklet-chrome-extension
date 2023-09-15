const btnGroups = document.getElementById("btn-show-groups");
btnGroups.addEventListener("click", () => {
  window.open(
    `chrome-extension://${chrome.runtime.id}/groups/groups.html`,
    "_blank"
  );
});
