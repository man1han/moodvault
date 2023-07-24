// Function to display all folders and images in the masonry layout

let gp = false;

function displayFoldersAndImages() {
    // Get folders from the browser storage
    chrome.storage.local.get(["folders"], function (result) {
        const folders = result.folders || [];
        const masonryLayout = document.getElementById("masonryLayout");

        // Clear the current content in the masonry layout
        masonryLayout.innerHTML = "";

        folders.forEach((folder) => {
            const folderContainer = document.createElement("div");
            folderContainer.classList.add("folder");

            // Add a data attribute to the folder element to store its name
            folderContainer.dataset.folder = folder.name;
            // Attach a click event to the folder element to show images on click
            folderContainer.addEventListener("click", function () {
                showImagesInFolder(folder);
            });

            const folderName = document.createElement("h2");
            folderName.textContent = folder.name;

            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");

            folder.images.forEach((imageSrc) => {
                const imageElement = document.createElement("img");
                imageElement.src = imageSrc;
                imageContainer.appendChild(imageElement);
            });
            folderContainer.appendChild(folderName);
            folderContainer.appendChild(imageContainer);
            masonryLayout.appendChild(folderContainer);
        });
    });
}


// Function to display images inside a folder
function showImagesInFolder(folder) {
    const masonryLayout = document.getElementById("masonryLayout");
    masonryLayout.style.display='block';
    masonryLayout.innerHTML = "";
    
    // masonryLayout.style.width = 'auto';
    masonryLayout.style.gridTemplateColumns='unset';
    masonryLayout.style.gap='unset';
    masonryLayout.style.columnCount='6';
    masonryLayout.style.columnGap='10px';
    // masonryLayout.style.height='60vh';
    masonryLayout.style.overflowX='scroll';

    const folderName = document.getElementById("view-boards-title");
    folderName.innerHTML = folder.name;

    folder.images.forEach((imageSrc) => {
        const imageContainer = document.createElement("figure");
        // imageContainer.classList.add("image-container");
        // imageContainer.style.all='unset';

        const imageElement = document.createElement("img");
        imageElement.src = imageSrc;
        // imageElement.style.maxWidth = "300px"; // Set the maximum width of the image to 300px
        // imageElement.style.width = "auto";
        imageElement.style.borderRadius = "6px";
        imageContainer.appendChild(imageElement);

        // Add a click event listener to select an image
        imageContainer.addEventListener("click", function () {
            // Toggle the 'selected' class on the clicked image container
            imageContainer.classList.toggle("selected");
        });

        masonryLayout.appendChild(imageContainer);
    });

    // Show the delete image button when images are displayed
    const deleteImageButton = document.getElementById("deleteImageButton");
    deleteImageButton.style.display = "block";

    const backButton = document.getElementById("backButton");
    backButton.style.display = "block";

    const downloadButton = document.getElementById("downloadButton");
    downloadButton.style.display = "block";

    const generateColorPaletteButton = document.getElementById("generateColorPaletteButton");
    if(!gp){
        generateColorPaletteButton.style.display = 'block';
    }
    

    // Add click event listener to the delete image button
    deleteImageButton.addEventListener("click", function () {
        // Get all the selected image containers
        const selectedImageContainers = masonryLayout.querySelectorAll(".selected");

        // Get the selected image URLs
        const selectedImageURLs = Array.from(selectedImageContainers).map(
            (container) => container.querySelector("img").src
        );

        // Remove the selected images from the folder
        folder.images = folder.images.filter((imageSrc) => !selectedImageURLs.includes(imageSrc));

        // Save the updated folders to the browser storage
        chrome.storage.local.get(["folders"], function (result) {
            const folders = result.folders || [];
            const folderIndex = folders.findIndex((f) => f.name === folder.name);

            if (folderIndex !== -1) {
                folders[folderIndex] = folder;
                chrome.storage.local.set({ folders: folders }, function () {
                    // Re-display the images after deletion
                    showImagesInFolder(folder);
                    // alert("Image(s) deleted successfully.");
                });
            }
        });
    });

    backButton.addEventListener("click", function () {
        // Go back to the folder view
        window.location.href = "view_boards.html";
    });

    // Add click event listener to the download button

    downloadButton.addEventListener("click", function () {
        // Capture the moodboard container element
        const moodboardContainer = document.getElementById("masonryLayout");

        // Use html2canvas to capture the screenshot of the moodboard container
        html2canvas(moodboardContainer).then(function (canvas) {
            // Create an anchor element to trigger the download
            const downloadLink = document.createElement("a");
            downloadLink.download = `${folder.name}_moodboard.png`;
            downloadLink.href = canvas.toDataURL("image/png");

            // Trigger the download
            downloadLink.click();
        });
    });

    const fullContainer = document.getElementById("full-container");
    generateColorPaletteButton.addEventListener("click", function () {
        gp = true;
        const images = Array.from(document.querySelectorAll("figure img"));
        generateColorPaletteButton.style.display = 'none';

        const colorThief = new ColorThief(); // Create a new instance of ColorThief

        const paletteContainer = document.createElement("div");
        paletteContainer.classList.add("color-palette");

        images.forEach((img) => {
            // Get the color palette from each image
            const palette = colorThief.getPalette(img, 10); // Change the number to get more or fewer colors

            // Create a div for the color palette of the current image
            const paletteDiv = document.createElement("div");
            paletteDiv.classList.add("color-palette-item");
            paletteDiv.style.backgroundImage=`url(${img.src})`;


            // Add each color in the palette to the palette div
            palette.forEach((color) => {
                const hexColor = rgbToHex(color[0], color[1], color[2]);

                const colorBlock = document.createElement("div");
                colorBlock.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                colorBlock.classList.add("color-block");

                const hexCode = document.createElement("div");
                hexCode.textContent = hexColor;
                hexCode.classList.add("hex-code");

                // Add click event listener to the hex code for copy functionality
                hexCode.addEventListener("click", function () {
                    copyToClipboard(hexColor);
                    alert(`Copied ${hexColor} to clipboard!`);
                });

                const onecode = document.createElement("div");
                onecode.classList.add("one-code")
                paletteDiv.appendChild(onecode);
                // colorBlock.appendChild(hexCode);
                onecode.appendChild(hexCode);
                onecode.appendChild(colorBlock);
            });

            // Add the palette div to the main palette container
            paletteContainer.appendChild(paletteDiv);
        });

        // Add the color palette to the masonry layout
        fullContainer.append(paletteContainer);
    });
}


// Function to display images inside a folder
// function showImagesInFolder(folder) {
//     const masonryLayout = document.getElementById("masonryLayout");
//     masonryLayout.innerHTML = "";
//     const folderName = document.createElement("h2");
//     folderName.textContent = folder.name;

//     masonryLayout.appendChild(folderName);
//     folder.images.forEach((imageSrc) => {
//         const imageContainer = document.createElement("div");
//         imageContainer.classList.add("image-container");

//         const imageElement = document.createElement("img");
//         imageElement.src = imageSrc;
//         imageElement.style.maxWidth = "300px"; // Set the maximum width of the image to 300px
//         imageElement.style.width = "auto";
//         imageElement.style.height = "auto";
//         imageContainer.appendChild(imageElement);

//         // Add a click event listener to select an image
//         imageContainer.addEventListener("click", function () {
//             // Toggle the 'selected' class on the clicked image container
//             imageContainer.classList.toggle("selected");
//         });

//         masonryLayout.appendChild(imageContainer);
//     });

//     // Show the delete image button when images are displayed
//     const deleteImageButton = document.getElementById("deleteImageButton");
//     deleteImageButton.style.display = "block";

//     const backButton = document.getElementById("backButton");
//     backButton.style.display = "block";

//     const downloadButton = document.getElementById("downloadButton");
//     downloadButton.style.display = "block";

//     const generateColorPaletteButton = document.getElementById("generateColorPaletteButton");
//     generateColorPaletteButton.style.display = 'block';

//     // Add click event listener to the delete image button
//     deleteImageButton.addEventListener("click", function () {
//         // Get all the selected image containers
//         const selectedImageContainers = masonryLayout.querySelectorAll(".selected");

//         // Get the selected image URLs
//         const selectedImageURLs = Array.from(selectedImageContainers).map(
//             (container) => container.querySelector("img").src
//         );

//         // Remove the selected images from the folder
//         folder.images = folder.images.filter((imageSrc) => !selectedImageURLs.includes(imageSrc));

//         // Save the updated folders to the browser storage
//         chrome.storage.local.get(["folders"], function (result) {
//             const folders = result.folders || [];
//             const folderIndex = folders.findIndex((f) => f.name === folder.name);

//             if (folderIndex !== -1) {
//                 folders[folderIndex] = folder;
//                 chrome.storage.local.set({ folders: folders }, function () {
//                     // Re-display the images after deletion
//                     showImagesInFolder(folder);
//                     alert("Image(s) deleted successfully.");
//                 });
//             }
//         });
//     });

//     backButton.addEventListener("click", function () {
//         // Go back to the folder view
//         window.location.href = "view_boards.html";
//     });

//     // Add click event listener to the download button

//     downloadButton.addEventListener("click", function () {
//         // Capture the moodboard container element
//         const moodboardContainer = document.getElementById("masonryLayout");

//         // Use html2canvas to capture the screenshot of the moodboard container
//         html2canvas(moodboardContainer).then(function (canvas) {
//             // Create an anchor element to trigger the download
//             const downloadLink = document.createElement("a");
//             downloadLink.download = `${folder.name}_moodboard.png`;
//             downloadLink.href = canvas.toDataURL("image/png");

//             // Trigger the download
//             downloadLink.click();
//         });
//     });

//     generateColorPaletteButton.addEventListener("click", function () {
//         const images = Array.from(document.querySelectorAll(".image-container img"));

//         const colorThief = new ColorThief(); // Create a new instance of ColorThief

//         const paletteContainer = document.createElement("div");
//         paletteContainer.classList.add("color-palette");

//         images.forEach((img) => {
//             // Get the color palette from each image
//             const palette = colorThief.getPalette(img, 20); // Change the number to get more or fewer colors

//             // Create a div for the color palette of the current image
//             const paletteDiv = document.createElement("div");
//             paletteDiv.classList.add("color-palette-item");



//             // Add each color in the palette to the palette div
//             palette.forEach((color) => {
//                 const hexColor = rgbToHex(color[0], color[1], color[2]);

//                 const colorBlock = document.createElement("div");
//                 colorBlock.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
//                 colorBlock.classList.add("color-block");

//                 const hexCode = document.createElement("div");
//                 hexCode.textContent = hexColor;
//                 hexCode.classList.add("hex-code");

//                 // Add click event listener to the hex code for copy functionality
//                 hexCode.addEventListener("click", function () {
//                     copyToClipboard(hexColor);
//                     alert(`Copied ${hexColor} to clipboard!`);
//                 });

//                 const onecode = document.createElement("div");
//                 onecode.classList.add("one-code")
//                 paletteDiv.appendChild(onecode);
//                 // colorBlock.appendChild(hexCode);
//                 onecode.appendChild(hexCode);
//                 onecode.appendChild(colorBlock);
//             });

//             // Add the palette div to the main palette container
//             paletteContainer.appendChild(paletteDiv);
//         });

//         // Add the color palette to the masonry layout
//         masonryLayout.appendChild(paletteContainer);
//     });
// }



// Function to convert RGB to Hex
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
// Function to copy text to clipboard
function copyToClipboard(text) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}
// Call the function to display folders and images when the page is loaded
document.addEventListener("DOMContentLoaded", displayFoldersAndImages);
// // Add event listener for image deletion
// document.addEventListener("click", function (event) {
//     if (event.target.classList.contains("delete-image")) {
//         const folderName = event.target.dataset.folder;
//         const imageUrl = event.target.dataset.image;
//         deleteImage(folderName, imageUrl);
//     }
// });