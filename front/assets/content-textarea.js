const valuesMemorized = init(
	document.getElementById('content'),
	document.querySelector('input[name="request-type"]:checked')
);

document.querySelectorAll('input[name="request-type"]').forEach(radio => radio.addEventListener('change', function(event) {
	const textarea = document.getElementById('content');
	const selectedRadio = document.querySelector('input[name="request-type"]:checked');
	update(textarea, selectedRadio, valuesMemorized);
}));

function init(textarea, selectedRadio) {
	// init placeholder
	if (selectedRadio.value === 'query') 
		textarea.placeholder = 'The 7 wonders of the world and their characteristics';
	else
		textarea.placeholder = 'https://fr.wikipedia.org/wiki/Sept_Merveilles_du_monde';

	// init tab values
	return ['', ''];
}

function update(textarea, selectedRadio, valuesMemorized) {
	if (selectedRadio.value === 'Query') {
		valuesMemorized[0] = textarea.value;
		textarea.value = valuesMemorized[1];
		textarea.placeholder = 'The 7 wonders of the world and their characteristics';
	}
	else {
		valuesMemorized[1] = textarea.value;
		textarea.value = valuesMemorized[0];
		textarea.placeholder = 'https://fr.wikipedia.org/wiki/Sept_Merveilles_du_monde';
	}
	return valuesMemorized;
}