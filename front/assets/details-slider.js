const labels = [
	"Brief summary",
	"Concise summary",
	"Detailed summary"
];
const descriptions = [
	"Retain only the most critical and major information.",
	"Capture the essential information and significant points, while omitting non-essential details and repetitive content.",
	"Include all important information, examples, and nuances, avoiding unnecessary repetition."
];
const slider = document.getElementById("details");
const label = document.getElementById("details-label");
const description = document.getElementById("details-description");
label.innerText = labels[slider.value - 1];
description.innerText = descriptions[slider.value - 1];
slider.addEventListener("input", function() {
	label.innerText = labels[this.value - 1];
	description.innerText = descriptions[this.value - 1];
});