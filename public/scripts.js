let data = {
	panelLLeadPara: 'Li Europan lingues es membres del sam familie. Lor separat existentie es un myth.',
	panelLSubParasText: [
		'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.', 
		'A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.', 
		'Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.'
	]
};

function injectScriptNewsRss(url) {
	let scriptElement = document.createElement('script');
	scriptElement.setAttribute('type', 'text/javascript');
	scriptElement.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
}

function handleResponseNewsRss(response) {
	console.log(response);

	let newsEntryTitle = '', newsEntry;
	for(let i = 0, k = response.query.results.feed.entry.length; i < k; i++) {
		newsEntry = response.query.results.feed.entry[i];
		newsEntryTitle += `<li class="panel-L-sub-para" id="panel-L-sub-para-${i + 1}"><a href="${newsEntry.link.href}">${newsEntry.title}</a></li>`
	}
	document.getElementById('panel-L-UL').innerHTML = newsEntryTitle;
}

document.addEventListener('DOMContentLoaded', function() {
	injectScriptNewsRss("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feednormalizer%20where%20url%3D'https%3A%2F%2Fnews.google.com%2Fnews%2Ffeeds%3Fpz%3D1%26cf%3Dall%26ned%3Den%26hl%3Dus%26q%3Danthony%2Brendon%2Bbaseball%26output%3Drss'%20and%20output%3D'atom_1.0'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=handleResponseNewsRss");
}, false);

/* (function insertData(){
	let panelLUL = document.getElementById('panel-L-UL');
  const panelLLeadPara = document.getElementById('panel-L-lead-para');
	panelLLeadPara.innerHTML = data.panelLLeadPara;

	
	const numOfSubParas = data.panelLSubParasText.length;

	for(let i = 0; i < numOfSubParas; i++) {

	} 

	panelLUL.innerHTML = data.panelLSubParasText.map(function(paraText, index) {
		return `<li class="panel-L-sub-para" id="panel-L-sub-para-${index + 1}"><p>${paraText}</p></li>`
	});
	/* panelLUL.innerHTML = panelLSubParas.map(function(para) {
		return para;
	});
	console.table(panelLSubParas);
  
})(); */