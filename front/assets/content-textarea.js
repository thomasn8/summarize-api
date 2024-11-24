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
	if (selectedRadio.value === 'Urls') 
		textarea.placeholder = 'https://fr.wikipedia.org/wiki/Sept_Merveilles_du_monde';
	else
		textarea.placeholder = 'The 7 wonders of the world and their characteristics';

	// init tab values
	return ['', ''];
}

function update(textarea, selectedRadio, valuesMemorized) {
	if (selectedRadio.value === 'Urls') {
		valuesMemorized[1] = textarea.value;
		textarea.value = valuesMemorized[0];
		textarea.placeholder = 'https://fr.wikipedia.org/wiki/Sept_Merveilles_du_monde';
	} else {
		valuesMemorized[0] = textarea.value;
		textarea.value = valuesMemorized[1];
		textarea.placeholder = 'The 7 wonders of the world and their characteristics';
	}
	return valuesMemorized;
}