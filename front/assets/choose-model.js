const map = new Map([
	["openai-gpt-4o-mini", {contextWindow: 128000, displayName: "Openai GPT 4o mini"}],
	["openai-gpt-4o", {contextWindow: 128000, displayName: "Openai GPT 4o"}],
	["openai-gpt-4-turbo", {contextWindow: 128000, displayName: "Openai GPT 4"}],
	["gemma2:9b", {contextWindow: 8192, displayName: "Gemma2 9b"}]
]);

const selectElement = document.getElementById('model');

function generateOptions(map) {
	map.forEach((value, key) => {
			const option = document.createElement('option');
			option.value = key;
			option.textContent = value.displayName;
			option.setAttribute("data-context-window", value.contextWindow)
			if (key === "gpt-4o-mini") option.selected = true;
			selectElement.appendChild(option);
	});
}

generateOptions(map);