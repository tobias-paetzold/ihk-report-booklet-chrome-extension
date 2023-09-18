(() => {
  let qualBtns;
  let numberOfQualBtns = 0;
  let groups = [];
  let optionCheckBoxes = [];
  let qualifications = [];

  chrome.runtime.onMessage.addListener((obj) => {
    const { loaded } = obj;

    if (!loaded) {
      return;
    }

    qualBtns = document.getElementsByClassName("qualifications-button");
    addListenersToQualBtns();

    document.body.addEventListener("click", () => {
      addListenersToQualBtns();
    });
  });

  const addListenersToQualBtns = () => {
    qualBtns = document.getElementsByClassName("qualifications-button");
    if (qualBtns.length != numberOfQualBtns) {
      for (let i = 0; i < qualBtns.length; i++) {
        qualBtns[i].addEventListener("click", handleQualBtnClick);

        numberOfQualBtns = qualBtns.length;
      }
    }
  };

  const handleQualBtnClick = () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.className === "cdk-global-overlay-wrapper") {
          observer.disconnect();
          modifyDOM();
        }
      });
    });

    const t = document.body;
    const config = {
      childList: true,
      subtree: true,
    };

    observer.observe(t, config);
  };

  const modifyDOM = async () => {
    const wrapper = document.getElementsByClassName(
      "cdk-global-overlay-wrapper"
    )[0];

    wrapper.style.display = "grid";
    wrapper.style.position = "static";
    wrapper.style.justifyContent = "space-evenly";
    wrapper.style.gridAutoFlow = "column";

    const groupsChild = document.createElement("div");
    groupsChild.id = "cdk-overlay-2";
    groupsChild.className = "cdk-overlay-pane group-container";

    groupsChild.innerHTML = `
    <h1>Gruppen</h1>
    `;

    groups = await fetchGroups();

    optionCheckBoxes = [];

    if (groups.length <= 0) {
      const noGroupsHint = document.createElement("p");
      noGroupsHint.style.fontWeight = "bold";
      noGroupsHint.textContent = `Bisher keine Gruppen hinzugefügt. Durch Klick auf die Extension kannst du neue hinzufügen.`;
      groupsChild.appendChild(noGroupsHint);
    } else {
      for (let i = 0; i < groups.length; i++) {
        optionCheckBoxes.push(appendGroupOption(groupsChild, groups[i]));
      }
    }

    wrapper.appendChild(groupsChild);

    const btnsDialog = document.querySelectorAll(".mat-dialog-actions button");
    btnsDialog.forEach((btn) => {
      btn.addEventListener("click", () => {
        groupsChild.style.animation = "fadeOut 300ms linear";
      });
    });
  };

  const appendGroupOption = (parentNode, group) => {
    const groupOption = document.createElement("label");
    groupOption.className = "group-option";
    groupOption.id = `group-option-${group.id}`;

    groupOption.innerHTML = `
      ${group.title}
      <input type="checkbox">
      <span class="checkmark"></span>
    `;

    groupOption.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      autoClickOnQualifications(groupOption.children[0]);
    });

    parentNode.appendChild(groupOption);

    return groupOption.children[0];
  };

  const fetchGroups = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get("groups", (data) => {
        resolve(data["groups"] ? JSON.parse(data["groups"]) : []);
      });
    });
  };

  const autoClickOnQualifications = (optionCheckbox) => {
    const qualificationLayout = document.getElementsByClassName(
      "mat-checkbox-layout"
    );

    qualifications = [];

    optionCheckbox.checked = !optionCheckbox.checked;

    for (let i = 0; i < optionCheckBoxes.length; i++) {
      if (!optionCheckBoxes[i].checked) {
        continue;
      }

      qualifications = qualifications.concat(groups[i].qualifications);
    }

    for (let i = 0; i < qualificationLayout.length; i++) {
      const qualificationName =
        qualificationLayout[i].children[1].textContent.trim();

      const checkbox = qualificationLayout[i].children[0].children[0];

      let shouldBeChecked = false;

      for (let j = 0; j < qualifications.length; j++) {
        if (qualificationName.startsWith(qualifications[j])) {
          shouldBeChecked = true;

          if (checkbox.checked) {
            break;
          }

          checkbox.click();
          break;
        }
      }

      if (!shouldBeChecked) {
        if (checkbox.checked) {
          checkbox.click();
        }
      }
    }
  };
})();
