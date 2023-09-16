class GroupPage {
  constructor() {
    // Modal
    this.modalContainer = document.getElementsByClassName("modal-container")[0];

    // Inputs
    this.inputQualificationGroupName = document.getElementById(
      "qualification-group-name"
    );
    this.inputAddQualificationToGroup =
      document.getElementById("qualification-name");

    // Buttons
    this.btnNewGroup = document.getElementById("btn-new-group");
    this.btnCloseModal = document.getElementById("btn-modal-close");
    this.btnAddQualificationToGroup = document.getElementById(
      "btn-add-qualification"
    );
    this.btnSaveGroup = document.getElementById("btn-save-group");
    this.btnGitHub = document.getElementById("btn-github");

    // Lists
    this.listQualifications = document.getElementById("qualifications-list");

    // Divs
    this.groupList = document.getElementById("group-list");

    // Other vars
    this.groups = [];
    this.modalQualifications = [];
    this.groupIndex = -1;

    this.fetchGroups().then((groups) => {
      // Initial method calls
      this.groups = groups;
      this.loadGroupList();
      this.addListeners();
    });
  }

  loadGroupList() {
    this.groupList.innerHTML = null;
    for (let i = 0; i < this.groups.length; i++) {
      const groupElement = document.createElement("div");
      groupElement.innerHTML = `
        <span>${this.groups[i].title}</span>
        <input
          id="btn-edit-qualification-group-${i}"
          class="btn-edit-qualification-group"
          title="Qualifikationsgruppe bearbeiten"
          type="image"
          src="/assets/edit.svg"
        />
        <input
          id="btn-del-qualification-group-${i}"
          class="btn-del-qualification-group"
          title="Qualifikationsgruppe löschen"
          type="image"
          src="/assets/delete.svg"
        />
      `;

      this.groupList.appendChild(groupElement);
    }

    const btnsEdit = document.getElementsByClassName(
      "btn-edit-qualification-group"
    );
    const btnDel = document.getElementsByClassName(
      "btn-del-qualification-group"
    );

    for (let i = 0; i < btnsEdit.length; i++) {
      btnsEdit[i].addEventListener("click", () => {
        this.inputQualificationGroupName.value = this.groups[i].title;
        this.inputAddQualificationToGroup.value = null;
        this.modalQualifications = this.groups[i].qualifications;

        this.groupIndex = i;

        this.loadModalQualificationsList();
        this.checkIfGroupCanBeSaved();

        this.modalContainer.style.display = "flex";
      });
    }

    for (let i = 0; i < btnDel.length; i++) {
      btnDel[i].addEventListener("click", () => {
        this.groups.splice(i, 1);
        chrome.storage.sync.set({
          groups: JSON.stringify(this.groups),
        });
        this.loadGroupList();
      });
    }
  }

  addListeners() {
    // Buttons
    this.btnNewGroup.addEventListener("click", () => {
      this.inputQualificationGroupName.value = null;
      this.inputAddQualificationToGroup.value = null;
      this.modalQualifications = [];
      this.groupIndex = -1;

      this.loadModalQualificationsList();

      this.btnSaveGroup.disabled = true;
      this.modalContainer.style.display = "flex";
    });

    this.btnCloseModal.addEventListener("click", () => {
      this.modalContainer.style.display = "none";
    });

    this.btnAddQualificationToGroup.addEventListener("click", () => {
      this.addQualificationToList();
      this.inputAddQualificationToGroup.value = null;
      this.checkIfGroupCanBeSaved();
    });

    this.btnSaveGroup.addEventListener("click", () => {
      this.saveGroupToStorage();
    });

    this.btnGitHub.addEventListener("click", () => {
      window.open(
        "https://github.com/Koenigseder/ihk-report-booklet-chrome-extension",
        "_blank"
      );
    });

    // Inputs
    this.inputQualificationGroupName.addEventListener("input", () => {
      this.checkIfGroupCanBeSaved();
    });
  }

  addQualificationToList() {
    const enteredQualification = this.inputAddQualificationToGroup.value.trim();

    if (!enteredQualification) return;

    this.modalQualifications.push(enteredQualification);

    this.loadModalQualificationsList();
  }

  removeQualificationFromList(index) {
    this.modalQualifications.splice(index, 1);
    this.loadModalQualificationsList();
  }

  loadModalQualificationsList() {
    this.listQualifications.innerHTML = null;
    if (this.modalQualifications.length === 0) {
      const emptyListInfo = document.createElement("h2");
      emptyListInfo.textContent = "Noch keine Qualifikationen enthalten";
      this.listQualifications.appendChild(emptyListInfo);
      return;
    }

    for (let i = 0; i < this.modalQualifications.length; i++) {
      const qualificationListItem = document.createElement("li");
      qualificationListItem.innerHTML = `
        <div class="qualification-list-item">
          <span>${this.modalQualifications[i]}</span>
          <input
            id="btn-del-qualification-${i}"
            class="btn-del-qualification-from-list"
            title="Qualifikation aus der Liste löschen"
            type="image"
            src="/assets/delete.svg"
          />
        </div>
        `;

      this.listQualifications.appendChild(qualificationListItem);
    }

    const btnsRemove = document.getElementsByClassName(
      "btn-del-qualification-from-list"
    );

    for (let i = 0; i < btnsRemove.length; i++) {
      btnsRemove[i].addEventListener("click", () => {
        this.removeQualificationFromList(i);
        this.checkIfGroupCanBeSaved();
      });
    }
  }

  checkIfGroupCanBeSaved() {
    if (
      this.inputQualificationGroupName.value.trim() &&
      this.modalQualifications.length > 0
    ) {
      this.btnSaveGroup.disabled = false;
    } else {
      this.btnSaveGroup.disabled = true;
    }
  }

  fetchGroups() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("groups", (data) => {
        resolve(data["groups"] ? JSON.parse(data["groups"]) : []);
      });
    });
  }

  async saveGroupToStorage() {
    const currentGroups = await this.fetchGroups();
    let newGroups;

    const newGroup = {
      id: currentGroups[currentGroups.length - 1] ? currentGroups[currentGroups.length - 1].id + 1 : 0,
      title: this.inputQualificationGroupName.value.trim(),
      qualifications: this.modalQualifications,
    };

    if (this.groupIndex < 0) {
      newGroups = [...currentGroups, newGroup];
    } else {
      newGroups = currentGroups;
      newGroups[this.groupIndex] = newGroup;
    }

    this.groups = newGroups;

    chrome.storage.sync.set({
      groups: JSON.stringify(newGroups),
    });

    this.loadGroupList();
    this.modalContainer.style.display = "none";
  }
}

new GroupPage();
