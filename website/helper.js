// This helper script can be used to analyze the detected gunshots by our application
// Run the following code block in the gunshot dashboard index page browser console to 
// display all detected gunshot occurrences and timestamp

// Remove subscript element
document.querySelector(".description-container").remove();

// Remove map element
document.querySelector("#map").remove();

// Remove div that contains date-range input
mapContainerElem = document.querySelector(".map-container");
mapContainerElem.querySelector("div").remove()

// Unhide gunshot audio element
const audiosElement = document.querySelector(".audio-container");
audiosElement.removeAttribute("hidden");

// Align gunshot sound and timestamp side-by-side
audioListElem = document.querySelector("#audio-list");
audioDivs = audioListElem.querySelectorAll("div");
audioDivs.forEach(element => {
    element.style.removeProperty("flex-direction");
});
