

// let statsConfig = require('./js/data/statsConfig.json');
let rightNow = new Date;
let currentYear = rightNow.getFullYear();

// console.log(statsConfig);

let utils = {
	statsBaseUrl: "http%3A%2F%2Fmlb.mlb.com%2Fpubajax%2Fwf%2Fflow%2Fstats.splayer",
	playerListActive: "http://m.mlb.com/lookup/json/named.search_autocomp.bam?active_sw=%27Y%27&sport_code=%27mlb%27&all_star_sw=%27N%27&team_all.col_in=name_display_full,file_code,name_abbrev,website_url",
	// statCats: {
		// "hitting-header": ["year", "ab", "r", "h", "hr", "rbi", "sb", "avg", "obp", "ops"],
		// "pitching-header": ["year", "w", "l", "era", "g", "gs", "sv", "ip", "so", "whip"],
		// "hitting-main": ["year", "team", "lg", "g", "ab", "r", "h", "tb", "2b", "3b", "hr", "rbi", "bb", "ibb", "so", "sb", "cs", "avg", "obp", "slg", "ops", "go_ao"],
		// "pitching-main": ["year", "team", "lg", "w", "l", "era", "g", "gs", "cg", "sho", "sv", "svo", "ip", "h", "r", "er", "hr", "hb", "bb", "ibb", "so", "avg", "whip", "go_ao"]
	// },
	create: function(element, props) {
		let newEl = document.createElement(element);
		return Object.assign(newEl, props);
	},
	getRandomArbitrary: function (min, max) {
	  return Math.floor(Math.random() * (max - min) + min);
	},
	getPlayerStatsUrl: function(playerType = 'hitting', playerId = randomPlayer.player_id, gameType = 'R', leagueListId = 'mlb', sortBy = 'season_asc', season = currentYear) {
		return `http://m.mlb.com/lookup/json/named.sport_${playerType}_composed.bam?game_type=%27${gameType}%27&league_list_id=%27${leagueListId}%27&sort_by=%27${sortBy}%27&player_id=${playerId}&sport_${playerType}_composed.season=${currentYear}`;
	},
	getTeamUrl: function(playerId = randomPlayer.player_id, season = currentYear) {
		return `http://m.mlb.com/lookup/json/named.player_teams.bam?player_id=${playerId}&season=${season}class_id=1`;
	},
	getStatsUrl: function(season = currentYear, sortOrder = '\'desc\'', sortCol = '\'avg\'', statType = 'hitting', pageType = 'SortablePlayer', gameType = '\'R\'', playerPool = 'QUALIFIER', seasonType = 'ANY', sportCode = '\'mlb\'', results = '1000', recSP = '1', recPP = '50') {
		return `${statsBaseUrl}%3Fseason%3D${season}%26sort_order%3D%27${sortOrder}%27%26sort_column%3D%27${sortCol}%27%26stat_type%3D${statType}%26page_type%3D${pageType}%26game_type%3D%27${gameType}%27%26player_pool%3D${playerPool}%26season_type%3D${seasonType}%26sport_code%3D%27${sportCode}%27%26results%3D${results}%26recSP%3D${recSP}%26recPP%3D${recPP}`;
	},
	createQuery: function(path) {
		return firebase.database().ref(path);
	},
	createSnapshot: function(query, callback) {
		return query.once("value")
			.then(callback);
	},
	getStatType: function(player) {
		let query = utils.createQuery(`Players/${player.player_id}`);
		function statType() {
			return utils.createSnapshot(query, function(snapshot) {
				return snapshot.val().pi_primary_stat_type;
			});
		}
		return statType();
	},
	getRssUrl: function(player) {
		let uriEncodedName = player.player_info.pi_player_name_display.split(' ').join('%2B');
		return `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feednormalizer%20where%20url%3D'https%3A%2F%2Fnews.google.com%2Fnews%2Ffeeds%3Fpz%3D1%26cf%3Dall%26ned%3Den%26hl%3Dus%26q%3D${uriEncodedName}%2Bbaseball%26output%3Drss'%20and%20output%3D'atom_1.0'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=handleResponseNewsRss`
	},
	checkKeyPlayers: function(player) {
	// console.log(player.player_id);
	let ref = firebase.database().ref(`keyPlayers/${player.player_id}`);
	function checkKey() {
		return ref.once("value")
			.then(function(snapshot) {
			// console.log('snapshot exists ', snapshot.exists());
			// console.log('snapshot val()', snapshot.val());
			// snapshot.val().player_has_stats ? console.log('snapshot has stats ', snapshot.val().player_has_stats) : console.log('no has stats');
			return snapshot.exists();
	    });
	} 
	return checkKey();
	},
	fillStatRow: function(targetElement, statCatArray, elementType, props) {		
		statCatArray.forEach(function(statCat) {
			// console.log(targetElement);
			let el = document.createElement(elementType);
			let elProps = props(statCat);
			targetElement.appendChild(Object.assign(el, elProps));
		});
	},
	clearContent: function(elementId, className) {
		Array.from(document.getElementById(elementId).getElementsByClassName(className)).forEach(function(element) {
			element.innerHTML = '';
		});
	},
	imageExists: function(imgUrl, callback) {
		console.log('imgurl', imgUrl)
		let img = new Image();
		img.onload = function() { callback(true); };
		img.onerror = function() { callback(false); };
		img.src = imgUrl;
	},
	getHeaderBackgroundImgUrl: function(player) {
		let _baseUrl = 'http://mlb.mlb.com/images/players/action_shots/';
		return new Promise(function(resolve, reject) {
			utils.imageExists(`${_baseUrl}${player.player_info.pi_player_id}.jpg`, function(exists) {
				resolve((exists)
					? `${_baseUrl}${player.player_info.pi_player_id}.jpg`
					// `${_baseUrl}${player.team_info.pt_team_abbrev}.jpg`
					: player.team_info.pt_org_abbrev !== 'WSH'
						? `${_baseUrl}${player.team_info.pt_org_abbrev.toLowerCase()}.jpg`
						: `${_baseUrl}was.jpg`)					
			});
		});
	}
};

function injectTeamCss(playerTeam) {
	let linkElement = document.createElement('link');
	linkElement.setAttribute('rel', 'stylesheet');
	linkElement.setAttribute('href', `http://ui.bamstatic.com/fedapp/headers/club-builds/1.0.1/${playerTeam.toLowerCase()}/style/${playerTeam.toLowerCase()}.css
`);
	document.getElementsByTagName('head')[0].appendChild(linkElement);
}

function PlayerStub(playerId, name, team, nameH) {
	this.player_id = playerId;
	this.player_name = name;
	this.player_team = team;
	this.name_h = nameH;
}

// AJAX for array of active players to populate autocomplete
let getPlayerListAjax = new XMLHttpRequest();
getPlayerListAjax.onload = function() {
	return new Promise(function(resolve, reject) {
		let getPlayerListAjaxJSONResponse = JSON.parse(getPlayerListAjax.responseText);
		let getPlayerListAjaxPlayersObj = getPlayerListAjaxJSONResponse.search_autocomp.search_autocomplete.queryResults.row;
		resolve(Array.prototype.map.call(getPlayerListAjaxPlayersObj, function(getPlayerListAjaxPlayerEntry) {
			return getPlayerListAjaxPlayerEntry;
			}));
	});
}
 
function getPlayerList() {		
	return new Promise(function(resolve, reject) {
		getPlayerListAjax.open("GET", utils.playerListActive, true);
		getPlayerListAjax.addEventListener("readystatechange", function () {			
			if(this.readyState === 4) {
				resolve(JSON.parse(getPlayerListAjax.responseText).search_autocomp.search_autocomplete.queryResults.row);	  			    
			}		
		});
	getPlayerListAjax.send();
	})			
}

console.log('path', location.pathname);

function loadContent() {
	getPlayerList().then(function(playerList) {
		utils.clearContent('panel-R-content-div', 'table-div');
		console.log('loading content');
		location.pathname === '/'
		// if at root directory, get a random  playerId to update DOM
		? getPlayerPageId().then(function(playerPageId) {
			console.log('ppid', playerPageId);
			updateDomElements(getPlayerById(playerPageId, playerList));
		})
		// if path is not root, use path as playerID
		: updateDomElements(getPlayerById(getPlayerPageId(), playerList));
		// let loadPlayerStub = getPlayerById(playerPageId, playerList);		
	});
}

// fix this to work and use active players from mlb api
// accepts playerList (optional), returns playerStub
function createRandomPlayer(playerList) {
	let playerIndex, newPlayer; 
	return playerList
	? function() {
		playerIndex = utils.getRandomArbitrary(0, playerList.length - 1);
		newPlayer = playerList[playerIndex];
		return new PlayerStub(newPlayer.p, newPlayer.n, newPlayer.t, newPlayer.nh)
	}
	: getPlayerList().then(function(playerList) {			
		playerIndex = utils.getRandomArbitrary(0, playerList.length - 1);
		newPlayer = playerList[playerIndex];
		// console.log('player index ', playerIndex);
		// console.log('player list', playerList);
		console.log(playerList[playerIndex]);
		return new PlayerStub(newPlayer.p, newPlayer.n, newPlayer.t, newPlayer.nh);		
	});
}

// accepts no parameters, returns player_id
function getPlayerPageId() {
	let playerIndex;
	return location.pathname === '/'
	// if at root directory, 
	? new Promise(function(resolve, reject) {
		resolve(getPlayerList().then(function(playerList) {
			playerIndex = utils.getRandomArbitrary(0, playerList.length - 1);
			return playerList[playerIndex].p;
		}));
	})
	: location.pathname.slice(1)	
}

console.log('crp', createRandomPlayer());

loadContent();

// must be called with a playerList param; called by the .then() method of loadContent()
// FIX: filter returns an array, no need for single item array
function getPlayerByName(playerName, playerList) {		
	let foundPlayer = playerList.filter(function(player) {
		return player.n === playerName;
	});
	return new PlayerStub(foundPlayer[0].p, foundPlayer[0].n, foundPlayer[0].t, foundPlayer[0].nh);
}

// must be called with a playerList param; called by the .then() method of loadContent()
// can we just return playerList.filter? need new playerStub?
function getPlayerById(playerId, playerList) {
	console.log('pid', playerId, 'plist', playerList);
	let foundPlayer = playerList.find(function(player) {
		return player.p === playerId;
	});
	console.log('fp', foundPlayer);
	return new PlayerStub(foundPlayer.p, foundPlayer.n, foundPlayer.t, foundPlayer.nh);
}
	


// TO-DO: FIX THIS
function Player(player) {
 	//this.player_info = playerInfo;
 	//this.player_stats = playerStats;
 	//this.team_info = teamInfo;
 }

function getPlayerInfo(player) {
	let playerInfoKeysRoot = ["pi_player_id", "pi_player_name_display", "pi_player_has_stats", "pi_player_headshot", "pi_player_stats_year"];
	let playerInfoKeysP_I = ["pi_display_status", "pi_primary_stat_type", "pi_name_nick", "pi_primary_position", "pi_primary_position_txt", "pi_age", "pi_bats", "pi_throws", "pi_weight", "pi_display_height"];
	let playerInfoKeysP_T = ["pi_forty_man_sw", "pi_jersey_number"];
	let query = utils.createQuery(`players/${player.player_id}`);
	let infoObj = {};
	function getInfo() {
		return utils.createSnapshot(query, function(snapshot) {
			let playerData = (snapshot.val());
			let playerInfoKeyTrimmed;
			playerInfoKeysRoot.forEach(function(playerInfoKey) {
				playerInfoKeyTrimmed = playerInfoKey.slice(3);
				Object.defineProperty(infoObj, [`${playerInfoKey}`], {
					value: playerData[playerInfoKeyTrimmed] !== undefined ? playerData[playerInfoKeyTrimmed] : "",
				});
			});
			playerInfoKeysP_I.forEach(function(playerInfoKey) {
				playerInfoKeyTrimmed = playerInfoKey.slice(3);
				Object.defineProperty(infoObj, [`${playerInfoKey}`], {
					value: playerData.player_info[playerInfoKey] !== undefined ? playerData.player_info[playerInfoKey] : playerData.player_info[playerInfoKeyTrimmed] !== undefined ? playerData.player_info[playerInfoKeyTrimmed] : ""
				});
			});
			playerInfoKeysP_T.forEach(function(playerInfoKey) {
				playerInfoKeyTrimmed = 'pt_' + playerInfoKey.slice(3);
				Object.defineProperty(infoObj, [`${playerInfoKey}`], {
					value: playerData.player_team[playerInfoKeyTrimmed] !== undefined ? playerData.player_team[playerInfoKeyTrimmed] : "",
				});
			});
			return infoObj;
		});
	}
	return getInfo();
}

// does it make sense to use Firebase?
function getTeamInfo(player) {
	console.log('get team info called');
	console.log('player_', player);
	let teamInfoKeys = ["pt_league", "pt_league_full", "pt_league_short", "pt_org", "pt_org_abbrev", "pt_org_full", "pt_org_short", "pt_season_state", "pt_team", "pt_team_abbrev", "pt_team_brief", "pt_team_short", "pt_league_full"];
	let query = utils.createQuery(`players/${player.player_id}`);
	let teamObj = {};
	return new Promise(function(resolve, reject) {
		resolve(utils.createSnapshot(query, function(snapshot) {
				let teamData = (snapshot.val().player_team);
				teamInfoKeys.forEach(function(teamInfoKey) {
					Object.defineProperty(teamObj, [`${teamInfoKey}`], {
						value: teamData[teamInfoKey] !== undefined ? teamData[teamInfoKey] : "",
					});
				});
				Object.defineProperty(teamObj, 'pt_org_link', {
					value: teamObj.pt_org_abbrev === 'WSH' ? 'WAS' : teamObj.pt_org_abbrev,
				});
			return teamObj;
		}));
	});
}

function getStatType(player) {
	return new Promise(function(resolve, reject) {
		let query = utils.createQuery(`players/${player.player_id}`);
		resolve(utils.createSnapshot(query, function(snapshot) {
				return snapshot.val().player_info.pi_primary_stat_type;
			}));
	});
}

function getCareerStats(statType, statData) {
	return statData[`sport_${statType}_composed`][`sport_career_${statType}`].queryResults.row;
}

function getSeasonStats(statType, statData) {
	return statData[`sport_${statType}_composed`][`sport_${statType}_tm`].queryResults.row;
}

//TO DO: REPLACE WITH XHR
function getStatsNow(player) {	
	return getStatType(player)
	.then(function(statType) {
		let statsUrl = utils.getPlayerStatsUrl(statType, player.player_id);
		return new Promise(function(resolve, reject) {
			resolve($.ajax({
				type: "GET",
				url: statsUrl,
				async: true,
			    error: function(errorMessage) {
			      alert("error in getStatsNow ajax func: " + errorMessage.responseText);
			    }
			}));
		});
	});
}

function createNewPlayer(player) {
	let newPlayer = new Player;
		return new Promise(function(resolve, reject) {
			return getTeamInfo(player)
			.then(function(teamInfo) {
				newPlayer.team_info = teamInfo;
				return getPlayerInfo(player)
				.then(function(playerInfo) {
					newPlayer.player_info = playerInfo;
					// console.log(player);
					return getStatsNow(player)
					.then(function(playerStats) {
						statType = newPlayer.player_info.pi_primary_stat_type;
						newPlayer.player_stats = {};
						newPlayer.player_stats.career_stats = playerStats[`sport_${statType}_composed`][`sport_career_${statType}`].queryResults.row;
						newPlayer.player_stats.season_stats = playerStats[`sport_${statType}_composed`][`sport_${statType}_tm`].queryResults.row;
						resolve(newPlayer);
				});
			});
		});
	});
}

// use below to make separate stat tables, make it function for when buttons are clicked in well; first get it to make header stat table
function makeStatsTable(player, tableId, statType) {
	statType = statType || player.player_info.pi_primary_stat_type;
	// let _statCats = utils.statCats[`${statCats}`];
	let _seasonsStatsObj = player.player_stats.season_stats;
	let statCatTitles = statsConfig.careerColumns[`${statType}`].map(function(item) {
		return item.title;
	}).filter(function(item) {
		return item !== 'Level';
	});
	let statCats = statsConfig.careerColumns[`${statType}`].map(function(item) {
		return item.dataField;
	}).filter(function(item) {
		return item !== 'sport';
	});
	console.log('statcatsss, ', statCats);
	let currentSeasonStats = Array.isArray(player.player_stats.season_stats) // if player has only one season, stats are object not array
	? player.player_stats.season_stats[player.player_stats.season_stats.length - 1]
	: player.player_stats.season_stats;	
	currentSeasonStats["year"] = currentSeasonStats["season"];
	let careerStats = player.player_stats.career_stats;
	careerStats["season"] = "CAREER";

	let _statsTable = utils.create('table', {
		className: 'table table-bordered table-stats',
		id: `table-stats-${tableId}`
	}), _statsTableThead = utils.create('thead', {
		className: 'thead-inverse',
	}), _statsTableHeader = utils.create('tr', {
		id: `table-stats-thead-${tableId}`
	}), _statsTableCurrent = utils.create('tr', {
		id: `table-stats-current-${tableId}`
	}), _statsTableCareer = utils.create('tr', {
		id: `table-stats-career-${tableId}`
	});

	function createSeasonRows() {
		_seasonStatArray = [];
		_seasonsStatsObj.forEach(function(season) {
			_seasonStatRow = utils.create('tr', {
				year: `${season.season}`,
				id: `table-stats-row-${season.season}`,
				className: 'tr-season'
			});
				
			_seasonStatArray.push(_seasonStatRow);
		})
		_seasonStatArray.sort(function(a, b) {
			return Number(a.year) - Number(b.year);
		});
		return _seasonStatArray;
	};

	// populate the header with stats categories
	utils.fillStatRow(_statsTableHeader, statCatTitles, 'th', function(statCat) {
		return {
			id: `th_statCat_${statCat}`,
			textContent: `${statCat.toUpperCase()}`,
			className: 'table-stat-header-12oz'
		}
	});

	// populate the current season stats row
	utils.fillStatRow(_statsTableCurrent, statCats, 'td', function(statCat) {
		return {
			id: `td_cs_${statCat}`,
			textContent: currentSeasonStats[`${statCat}`],
			className: 'td-current'
		}
	});

	// populate the career stats row
	utils.fillStatRow(_statsTableCareer, statCats, 'td', function(statCat) {
		return {
			id: `td_c_${statCat}`,
			textContent: careerStats[`${statCat}`],
			className: 'td-career'
		}
	});

	// create rows for each season of stats if statsObj is an array (multiple seasons exist)
	_statsTable.appendChild(_statsTableThead);
	_statsTableThead.appendChild(_statsTableHeader);	
	Array.isArray(_seasonsStatsObj) && tableId !== 'table-stats-header'
		? createSeasonRows().forEach(function(seasonRow) {
			utils.fillStatRow(seasonRow, statCats, 'td', function(statCat) {
				return	{ 
					id: `td_ss_${statCat}`,
					textContent: player.player_stats.season_stats.find(function(season) {
						return season.season === seasonRow.year;
					})[`${statCat}`],
					className: 'td-season'
				}
			});
			_statsTable.appendChild(seasonRow);
		 })
		: _statsTable.appendChild(_statsTableCurrent);
	_statsTable.appendChild(_statsTableCareer);
	
	return _statsTable;
}	


// need logic so checks if tables/elements exist, if so only update content
function populateStatsTableTop(player, statCats) {
	let statCats = player.player_info.pi_primary_stat_type === "hitting" ? ["year", "ab", "r", "h", "hr", "rbi", "sb", "avg", "obp", "ops"] : ["year", "w", "l", "era", "g", "gs", "sv", "ip", "so", "whip"];
	let currentSeasonStats = Array.isArray(player.player_stats.season_stats) // if player has only one season, stats are object not array
	? player.player_stats.season_stats[player.player_stats.season_stats.length - 1]
	: player.player_stats.season_stats;	
	currentSeasonStats["year"] = currentSeasonStats["season"];
	let careerStats = player.player_stats.career_stats;
	careerStats["year"] = "CAREER";
	
	
	statsTableTopHeader.innerHTML = '';
	statsTableTopCurrent.innerHTML = '';
	statsTableTopCareer.innerHTML = '';
	
	// populate table element rows
	utils.fillStatRow(statsTableTopHeader, statCats, 'th', function(statCat) {
		return {
			id: `th_statCat_${statCat}`,
			textContent: `${statCat.toUpperCase()}`,
			className: 'table-stat-header-12oz'
		}
	});
	
	utils.fillStatRow(statsTableTopCurrent, statCats, 'td', function(statCat) {
		return {
			id: `td_cs_${statCat}`,
			textContent: currentSeasonStats[`${statCat}`],
			className: 'td-current'
		}
	});
	utils.fillStatRow(statsTableTopCareer, statCats, 'td', function(statCat) {
		return {
			id: `td_c_${statCat}`,
			textContent: careerStats[`${statCat}`],
			className: 'td-career'
		}
	});
	statsTableTop.appendChild(statsTableTopThead);
	statsTableTopThead.appendChild(statsTableTopHeader);
	statsTableTop.appendChild(statsTableTopCurrent);
	statsTableTop.appendChild(statsTableTopCareer);
	document.getElementById('header-content-div').appendChild(statsTableTop);
}

function populateStatsTableMid(player) {

}

// move below?
let stateObj = { foo: "bar" };


function updateDomElements(player) { 
	
	createNewPlayer(player)
	.then(function(newPlayer) {
		history.replaceState(stateObj, "", `${newPlayer.player_info.pi_player_id}`);
		injectTeamCss(newPlayer.team_info.pt_org_link);
		// let _statCatsHeader = utils.statCats[`${newPlayer.player_info.pi_primary_stat_type}-header`];
		// let _statCatsMain = utils.statCats[`${newPlayer.player_info.pi_primary_stat_type}-main`]
		console.log(newPlayer);
		let _statsTableHeaderUpdate = makeStatsTable(newPlayer, 'table-stats-header');
		let _statsTableMainUpdate = makeStatsTable(newPlayer, 'table-stats-main');
		document.getElementById('playerHeadshot').setAttribute('src', newPlayer.player_info.pi_player_headshot  + '.jpg');
		utils.getHeaderBackgroundImgUrl(newPlayer).then(url =>   {
			document.getElementsByClassName('jumbotron')[0].style.backgroundImage = `url('${url}'`;
		}); 
		document.getElementById('playerNameHeading').innerHTML = newPlayer.player_info.pi_player_name_display;
		document.getElementById('teamNameHeading').innerHTML = `${newPlayer.team_info.pt_team} | ${newPlayer.player_info.pi_primary_position_txt} | #${newPlayer.player_info.pi_jersey_number}`;
		console.log('std', _statsTableHeaderUpdate)
		document.getElementById('header-content-stats-table').appendChild(_statsTableHeaderUpdate);
		document.getElementById('mid-content-stats-table').appendChild(_statsTableMainUpdate);
		// populateStatsTableTop(newPlayer);
		injectScriptNewsRss(newPlayer);
	});
}

// adds script to head for left panel info
function injectScriptNewsRss(player) {
	console.log('inject, ', utils.getRssUrl(player));
	let scriptElement = document.createElement('script');
	scriptElement.setAttribute('type', 'text/javascript');
	scriptElement.setAttribute('src', utils.getRssUrl(player));
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
}

// fetches and populates left panel info
function handleResponseNewsRss(response) {
	console.log(response);
	let newsEntryTitle = '', newsEntry;
	for(let i = 0, k = response.query.results.feed.entry.length; i < k; i++) {
		newsEntry = response.query.results.feed.entry[i];
		newsEntryTitle += `<li class="panel-L-sub-para" id="panel-L-sub-para-${i + 1}"><a href="${newsEntry.link.href}">${newsEntry.title}</a></li>`
	}
	document.getElementById('panel-L-UL').innerHTML = newsEntryTitle;
}

// autocomplete for Player Search bar using awesomplete.js library
let autocompAjax = new XMLHttpRequest();
autocompAjax.open("GET", utils.playerListActive, true);
autocompAjax.onload = function() {
  let autocompJSONResponse = JSON.parse(autocompAjax.responseText);
  let autocompPlayersObj = autocompJSONResponse.search_autocomp.search_autocomplete.queryResults.row;
  let autocompNameList = Array.prototype.map.call(autocompPlayersObj, function(autocompPlayerEntry) {
    return autocompPlayerEntry;
  })
  new Awesomplete(document.querySelector("#searchNames"),{ list: autocompNameList, minChars: 3, maxItems: 10, autoFirst: true });
};
autocompAjax.send();

// move inside searchNames action handler
function getPlayerNameStringFromSearchInput(searchInput) {
	const openParensIndex = searchInput.indexOf('(') !== -1 ? searchInput.indexOf('(') : searchInput.length + 1;
	return searchInput.slice(0, openParensIndex - 1);
}

$("#searchNamesBtn").on("click", function(event) {
	event.preventDefault();
	let searchInputName = getPlayerNameStringFromSearchInput(document.getElementById("searchNames").value);
	getPlayerList().then(function(playerList) {
		let foundPlayer = getPlayerByName(searchInputName, playerList);
		location.pathname = foundPlayer.player_id;
		loadcontent();
	});	
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    console.log(url);
    name = name.replace(/[\[\]]/g, "\\$&");
    console.log(name);
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}




