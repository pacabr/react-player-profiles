$(document).ready(function(){
 
    let wikiIntroExtractUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&indexpageids=&titles=Anthony%20Rendon&callback=?';

    $.ajax({
        type: "GET",
        url: wikiIntroExtractUrl,
        contentType: "application/json; charset=utf-8",
        async: true,
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            console.log(data);

            const wikiPageId = data.query.pageids[0],
            	wikiPageTitle = data.query.pages[wikiPageId].title;
            let wikiPageExtract = `<li class="panel-L-sub-para">${data.query.pages[wikiPageId].extract}</li>`;


            let panelLContentHeading = document.getElementsByClassName('panel-L-content-heading');
            let panelLUL = document.getElementById('panel-L-UL');
            panelLContentHeading[0].innerHTML = `${wikiPageTitle} Wiki`;
            panelLUL.innerHTML = wikiPageExtract;


        },
        error: function (errorMessage) {
        }
    });
});

/* function injectScriptWiki(url) {
	let scriptElement = document.createElement('script');
	scriptElement.setAttribute('type', 'text/javascript');
	scriptElement.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
}

function handleResponseWiki(response) {
	console.log(response);

	/* let newsEntryTitle = '', newsEntry;
	for(let i = 0, k = response.query.results.feed.entry.length; i < k; i++) {
		newsEntry = response.query.results.feed.entry[i];
		newsEntryTitle += `<li class="panel-L-sub-para" id="panel-L-sub-para-${i + 1}"><a href="${newsEntry.link.href}">${newsEntry.title}</a></li>`
	}
	document.getElementById('panel-L-UL').innerHTML = newsEntryTitle; }

document.addEventListener('DOMContentLoaded', function() {
	injectScriptWiki("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feednormalizer%20where%20url%3D'https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FAnthony_Rendon'%20and%20output%3D'atom_1.0'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=handleResponseWiki");
}, false); */