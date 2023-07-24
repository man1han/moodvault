// Function to capture the screenshot
function captureScreenshot() {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, function (screenshotUrl) {
    // Open the preview window with the captured screenshot
    chrome.windows.create(
      {
        url: "preview.html",
        type: "popup",
        width: 800,
        height: 500,
      },
      function (window) {
        // Pass the screenshot URL to the preview window
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
          if (message.type === "screenshotUrl") {
            sendResponse({ url: screenshotUrl });
          }
        });
      }
    );
  });
}



// Function to create a new folder
function createNewFolder() {
  const folderName = prompt("Enter the name for the new folder:");

  if (folderName) {
    // Prevent the user from creating a folder with the name 'Default'
    if (folderName.toLowerCase() === "default") {
      alert("You cannot create a folder named 'Default'. Please choose a different name.");
      return;
    }

    // Get the current folders from the browser storage
    chrome.storage.local.get(["folders"], function (result) {
      const folders = result.folders || [];

      // Check if a folder with the same name already exists
      const existingFolder = folders.find((folder) => folder.name === folderName);
      if (existingFolder) {
        alert("A folder with the same name already exists. Please choose a different name.");
        return;
      }

      // Create a new folder object
      const newFolder = { name: folderName, images: [] };

      // Save the new folder to the browser storage
      folders.push(newFolder);
      chrome.storage.local.set({ folders: folders }, function () {
        alert(`Folder "${folderName}" created successfully.`);
      });
    });
  }
}


// Function to populate the dropdown lists with existing folder names
function populateDropdownLists() {
  // Get the current folders from the browser storage
  chrome.storage.local.get(["folders"], function (result) {
    const folders = result.folders || [];
    // const deleteFolderDropdown = document.getElementById("deleteFolderDropdown");
    // const renameFolderDropdown = document.getElementById("renameFolderDropdown");
    const folderDropdown = document.getElementById("folderDropdown");

    // deleteFolderDropdown.innerHTML = "";
    // renameFolderDropdown.innerHTML = "";
    folderDropdown.innerHTML = "";

    folders.forEach((folder) => {
      // Add folder names as options to the dropdown lists
      // const deleteOption = document.createElement("option");
      // deleteOption.value = folder.name;
      // deleteOption.textContent = folder.name;
      // deleteFolderDropdown.appendChild(deleteOption);

      // const renameOption = document.createElement("option");
      // renameOption.value = folder.name;
      // renameOption.textContent = folder.name;
      // renameFolderDropdown.appendChild(renameOption);

      const editOption = document.createElement("option");
      editOption.value = folder.name;
      editOption.textContent = folder.name;
      folderDropdown.appendChild(editOption);
    });
  });
}



// Function to delete an existing folder
function deleteFolder() {
  // const deleteFolderDropdown = document.getElementById("deleteFolderDropdown");
  // const folderToDelete = deleteFolderDropdown.value;

  const folderDropdown = document.getElementById("folderDropdown");
  const folderToDelete = folderDropdown.value;

  if (folderToDelete.toLowerCase() === "default") {
    alert("You cannot delete the 'Default' folder.");
    return;
  }

  // Get the current folders from the browser storage
  chrome.storage.local.get(["folders"], function (result) {
    const folders = result.folders || [];
    const folderIndex = folders.findIndex((folder) => folder.name === folderToDelete);

    if (folderIndex !== -1) {
      // Remove the folder from the folders array
      folders.splice(folderIndex, 1);

      // Save the updated folders to the browser storage
      chrome.storage.local.set({ folders: folders }, function () {
        alert(`Folder "${folderToDelete}" deleted successfully.`);
      });
    } else {
      alert(`Folder "${folderToDelete}" not found.`);
    }
  });
}

// Function to rename an existing folder
function renameFolder() {

  const folderDropdown = document.getElementById("folderDropdown");
  const oldFolderName = folderDropdown.value;
  const newFolderName = prompt(`Enter the new name for the folder "${oldFolderName}":`);

  if (newFolderName && oldFolderName.toLowerCase() !== "default") {
    // Get the current folders from the browser storage
    chrome.storage.local.get(["folders"], function (result) {
      const folders = result.folders || [];
      const existingFolder = folders.find((folder) => folder.name === newFolderName);

      if (existingFolder) {
        alert("A folder with the same name already exists. Please choose a different name.");
        return;
      }

      const folderToRename = folders.find((folder) => folder.name === oldFolderName);

      if (folderToRename) {
        folderToRename.name = newFolderName;
        // Save the updated folders to the browser storage
        chrome.storage.local.set({ folders: folders }, function () {
          alert(`Folder "${oldFolderName}" renamed to "${newFolderName}".`);
        });
      } else {
        alert(`Folder "${oldFolderName}" not found.`);
      }
    });
  } else {
    alert("You cannot rename the 'Default' folder or choose an empty name.");
  }
}

// Call the function to populate the dropdown lists when the popup is loaded
document.addEventListener("DOMContentLoaded", populateDropdownLists);

// Function to initialize the extension
function initializeExtension() {
  // Check if the 'Default' folder already exists in the browser storage
  chrome.storage.local.get(["folders"], function (result) {
    const folders = result.folders || [];
    const defaultFolder = folders.find((folder) => folder.name === "Default");

    // If the 'Default' folder doesn't exist, create it and save it to the browser storage
    if (!defaultFolder) {
      const defaultFolder = { name: "Default", images: [] };
      folders.push(defaultFolder);
      chrome.storage.local.set({ folders: folders }, function () {
        console.log("'Default' folder created for the user.");
      });
    }
  });
}

// Call the function to initialize the extension when the popup is loaded
document.addEventListener("DOMContentLoaded", initializeExtension);
// Add event listeners to buttons
document.getElementById("captureBtn").addEventListener("click", captureScreenshot);
document.getElementById("viewBoardsBtn").addEventListener("click", function () {
  // Open the "View Boards" tab
  chrome.tabs.create({ url: "view_boards.html" });
});
document.getElementById("createFolderBtn").addEventListener("click", createNewFolder);
document.getElementById("renameFolderBtn").addEventListener("click", renameFolder);
document.getElementById("deleteFolderBtn").addEventListener("click", deleteFolder);
