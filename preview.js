// Get the buttons
const cropBtn = document.getElementById("cropBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Initialize Cropper.js
let cropper;
const previewImage = document.getElementById("previewImage");

// Get the screenshot URL from the popup
chrome.runtime.sendMessage({ type: "screenshotUrl" }, function (response) {
    previewImage.src = response.url;
    // Initialize the Cropper.js instance when the image is loaded
    previewImage.onload = function () {
        cropper = new Cropper(previewImage, {
            aspectRatio: NaN, // Allow free cropping without restricting aspect ratio
            viewMode: 1, // Set the cropping view mode to "move"
        });
    };
});

cropBtn.addEventListener("click", function () {
    // Get the cropped canvas
    const croppedCanvas = cropper.getCroppedCanvas();

    // Convert the canvas to a data URL and display it as the new preview image
    previewImage.src = croppedCanvas.toDataURL("image/png");

    // Destroy the Cropper.js instance
    cropper.destroy();
    cropper = null;
});


// Function to populate the folder dropdown with current folders
function populateFolderDropdown() {
  const folderDropdown = document.getElementById("folderDropdown");

  // Get the current folders from the browser storage
  chrome.storage.local.get(["folders"], function (result) {
    const folders = result.folders || [];
    folderDropdown.innerHTML = "";

    // Create an option for each folder and add it to the dropdown
    folders.forEach((folder) => {
      const option = document.createElement("option");
      option.value = folder.name;
      option.textContent = folder.name;
      folderDropdown.appendChild(option);
    });
  });
}

// Call the function to populate the folder dropdown when the page is loaded
document.addEventListener("DOMContentLoaded", populateFolderDropdown);

// Add event listener to "Save" button
saveBtn.addEventListener("click", function () {
  // Get the selected folder from the dropdown
  const folderDropdown = document.getElementById("folderDropdown");
  const selectedFolderName = folderDropdown.value;

  // Ensure that a folder is selected before proceeding
  if (selectedFolderName) {
    // Get the cropped canvas
    const croppedCanvas = cropper.getCroppedCanvas();

    // Convert the canvas to a data URL
    const croppedImageURL = croppedCanvas.toDataURL("image/png");

    // Get the current folders from the browser storage
    chrome.storage.local.get(["folders"], function (result) {
      const folders = result.folders || [];
      const selectedFolder = folders.find((folder) => folder.name === selectedFolderName);

      if (selectedFolder) {
        // Add the image URL to the selected folder
        selectedFolder.images.push(croppedImageURL);
      } else {
        // This should not happen since the folder dropdown contains existing folders only
        alert("Error: Selected folder not found.");
        return;
      }

      // Save the updated folders to the browser storage
      chrome.storage.local.set({ folders: folders }, function () {
        alert("Image saved successfully.");
        window.close(); // Close the preview window after saving
      });
    });
  } else {
    alert("Please select a folder to save the image.");
  }
});

cancelBtn.addEventListener("click", function () {
    // Close the preview window when the "Cancel" button is clicked
    window.close();
});
