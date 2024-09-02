const modelElement = document.getElementById('model');
const apiKeyElement = document.getElementById('api-key');
const detailsElement = document.getElementById('details');
const lengthElement = document.getElementById('length');
const languageElement = document.getElementById('language');
const expertiseElement = document.getElementById('expertise');
const directiveElement = document.getElementById('directive');
const requestTypeElement = document.querySelector('input[name="request-type"]:checked');
const contentElement = document.getElementById('content');

document.getElementById('clear-cache').addEventListener('click', function(event) {
	event.preventDefault();

	function clearCache() {
		localStorage.setItem('cache', JSON.stringify([]));
		modelElement.selectedIndex = 0;
		apiKeyElement.value = "";
		detailsElement.value = 2;
		languageElement.selectedIndex = 0;
		lengthElement.value = "";
		expertiseElement.value = "";
		directiveElement.value = "";
		contentElement.value = "";
	}

	clearCache();
})

document.getElementById('apiForm').addEventListener('submit', function(event) {
	event.preventDefault();
	showModal();

	const model = modelElement.value;
	const contextWindow = modelElement.options[selectElement.selectedIndex].getAttribute("data-context-window");
	const apiKey = apiKeyElement.value;
	const details = detailsElement.value;
	const length = lengthElement.value;
	const language = languageElement.value;
	const expertise = expertiseElement.value;
	const directive = directiveElement.value;
	const requestType = requestTypeElement.value;
	const content = contentElement.value;

	const apiEndpoint = 'https://localhost:9443/summarize';
	const body = {
		model: model,
		contextWindow: contextWindow,
		apiKey: apiKey,
		details: details,
		length: length,
		language: language,
		expertise: expertise,
		directive: directive,
		requestType: requestType,
		query: requestType === 'Query' ? content : undefined,
		urls: requestType === 'Urls' ? content : undefined
	};

	let cache = getCache();
	const key = JSON.stringify(body);

	if (cache.has(key)) {
		const cachedResponse = cache.get(key);

		if (cachedResponse['summary'] !== undefined) {
			updateModalWithData(cachedResponse);
		} else {
			updateModalWithError(cachedResponse);	
		}
	} else {
		fetch(apiEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})
		.then(response => response.json())
		.then(data => {
			if (data['summary'] !== undefined) {
				updateModalWithData(data);
			} else {
				updateModalWithError(data);	
			}

			cache.set(key, data);
			saveCache(cache)
		})
		.catch((error) => {
			updateModalWithError(error);
		});
	}

	function getCache() {
		const cache = localStorage.getItem('cache');
		return cache ? new Map(JSON.parse(cache)) : new Map();
	}

	function saveCache(cache) {
		localStorage.setItem('cache', JSON.stringify(Array.from(cache.entries())));
	}

	function showModal() {
		const modal = document.getElementById('myModal');
		const modalBody = document.getElementById('modal-body');

		modalBody.innerHTML = '<div id="loader" class="loader"></div>';
		modal.style.display = "block";

		const span = document.getElementsByClassName("close")[0];
		span.onclick = function() {
			modal.style.display = "none";
		}

		window.onclick = function(event) {
			if (event.target == modal) {
				modal.style.display = "none";
			}
		}
	}

	function copyTextToClipboard() {
		const summaryElement = document.getElementById('text-summary');
		const text = summaryElement.innerText;
		navigator.clipboard.writeText(text)
		.catch(error => {
			console.error('Could not copy text: ', error);
		});
	}

	function updateModalWithData(data) {
		const modalBody = document.getElementById('modal-body');

		modalBody.innerHTML = `<div class="modal-summary"><h3>Summary</h3><p id="text-summary">${data['summary']}</p></div>`;
		if (data['summary'].startsWith('Error') === false)
			modalBody.innerHTML += '<div class="copy"><button id="copyBtn">Copy to clipboard</button></div>'
	
		if (data['summaries'] !== undefined) {
			let summaries = '';
			data['summaries'].forEach(url => {
				summaries += '<div class="single-summary">';
					summaries += `<p>url: ${url['url']}</p>`;
					if (data['summaries'].length > 1 && url['summary'] !== undefined) summaries += `<p>${url['summary']}</p>`;
					url['errors'].forEach(error => { summaries += `<p class="error">${error}</p>`; });
				summaries += `</div>`;
			});

			if (data['summaries'].length > 1 || summaries.includes('<p class="error">'))
				modalBody.innerHTML += `<div class="modal-summaries"><h3>Summaries for each url</h3>${summaries}</div>`;
		}
		
		if (data['summary'].startsWith('Error') === false) {
			const copyBtn = document.getElementById('copyBtn');
			copyBtn.onclick = function() {
				copyTextToClipboard();
			}
		}
	}

	function updateModalWithError(error){
		const modalBody = document.getElementById('modal-body');

		if (error['statusCode'] !== undefined && error['message'] !== undefined) {
			const statusCode = error['statusCode'];
			const message = error['message'];
			modalBody.innerHTML = `<div class="modal-summary"><h3>Error</h3>
					<p id="text-summary">Status code: ${statusCode}</p>
					<p id="text-summary">Error message: ${message}</p>
				</div>`
		} else {
			modalBody.innerHTML = `<div class="modal-summary"><h3>Error</h3>
					<p id="text-summary">Oups! Something went wrong:</p>
					<p id="text-summary">${error}</p>
				</div>`
		}
	}
})