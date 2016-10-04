let testPlayer = nameIdPairs[0];
let rightNow = new Date;
let currentYear = rightNow.getFullYear();

let utils = {
	getRandomArbitrary: function (min, max) {
	  return Math.floor(Math.random() * (max - min) + min);
	},
	getStatsUrl: function(playerType = 'hitting', playerId = randomPlayer.player_id, gameType = 'R', leagueListId = 'mlb', sortBy = 'season_asc', season = currentYear) {
		return `http://m.mlb.com/lookup/json/named.sport_${playerType}_composed.bam?game_type=%27${gameType}%27&league_list_id=%27${leagueListId}%27&sort_by=%27${sortBy}%27&player_id=${playerId}&sport_${playerType}_composed.season=${currentYear}`;
	},
	getTeamUrl: function(playerId = randomPlayer.player_id, season = currentYear) {
		return `http://m.mlb.com/lookup/json/named.player_teams.bam?player_id=${playerId}&season=${season}class_id=1`;
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
			let el = document.createElement(elementType);
			let elProps = props(statCat);
			targetElement.appendChild(Object.assign(el, elProps));
		});
	}
};

function genRandomPlayer() {
	let playerIndex, randomPlayer;
	function getRandom() {
		playerIndex = utils.getRandomArbitrary(1, 4000);
		console.log('player index ', playerIndex);
		console.log('name id ',nameIdPairs[playerIndex]);
		console.log('checking key, ', utils.checkKeyPlayers(nameIdPairs[playerIndex]));
		randomPlayer = utils.checkKeyPlayers(nameIdPairs[playerIndex]) ? nameIdPairs[playerIndex] : getRandom();
		return randomPlayer;
	}
	return getRandom();
}

let randomPlayer = genRandomPlayer(); 

// used for testing, remove
function checkArray() {
      console.log('get info ', getPlayerInfo());
}

function findPlayerId(playerName) {		
	let foundPlayerId = nameIdPairs.filter(function(nameIdPair) {
		return nameIdPair.full_name === playerName;
	});
	return foundPlayerId;
}

function Player(player) {
 	//this.player_info = playerInfo;
 	//this.player_stats = playerStats;
 	//this.team_info = teamInfo;
 }

function getPlayerInfo(player = testPlayer) {
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

function getTeamInfo(player = testPlayer) {
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
			return teamObj;
		}));
	});
}



function getStatType(player = testPlayer) {
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

//TO DO: in playerCreate, only execute getStats if player_has_stats is true;
function getStatsNow(player) {	
	return getStatType(player)
	.then(function(statType) {
		let statsUrl = utils.getStatsUrl(statType, player.player_id);
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

function injectScriptNewsRss(player) {
	console.log('inject, ', utils.getRssUrl(player));
	let scriptElement = document.createElement('script');
	scriptElement.setAttribute('type', 'text/javascript');
	scriptElement.setAttribute('src', utils.getRssUrl(player));
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

function populateStatsTableTop(player) {
	let statCats = player.player_info.pi_primary_stat_type === "hitting" ? ["year", "ab", "r", "h", "hr", "rbi", "sb", "avg", "obp", "ops"] : ["year", "w", "l", "era", "g", "gs", "sv", "ip", "so", "whip"];
	let currentSeasonStats = player.player_stats.season_stats[player.player_stats.season_stats.length - 1];
	currentSeasonStats["year"] = currentSeasonStats["season"];
	let careerStats = player.player_stats.career_stats;
	careerStats["year"] = "CAREER";
	let statsTableTopHeader = document.getElementById('statsTableTopHeader');
	let statsTableTopCurrent = document.getElementById('statsTableTopCurrent');
	let statsTableTopCareer = document.getElementById('statsTableTopCareer');
	
	// Clear all stat table contents before repopulating
	statsTableTopHeader.innerHTML = '';
	statsTableTopCurrent.innerHTML = '';
	statsTableTopCareer.innerHTML = '';
	
	utils.fillStatRow(statsTableTopHeader, statCats, 'th', function(statCat) {
		return {
			id: `th_statCat_${statCat}`,
			textContent: `${statCat.toUpperCase()}`,
			class: 'tg-12oz'
		}
	});
	utils.fillStatRow(statsTableTopCurrent, statCats, 'td', function(statCat) {
		return {
			id: `td_cs_${statCat}`,
			textContent: currentSeasonStats[`${statCat}`],
			class: 'td-current'
		}
	});
	utils.fillStatRow(statsTableTopCareer, statCats, 'td', function(statCat) {
		return {
			id: `td_c_${statCat}`,
			textContent: careerStats[`${statCat}`],
			class: 'td-career'
		}
	})
}

function populateStatsTableMain(player) {

}

function updateDomElements(player) { 
	createNewPlayer(player)
	.then(function(newPlayer) {
		console.log(newPlayer);
		document.getElementById('playerHeadshot').setAttribute('src', newPlayer.player_info.pi_player_headshot  + '.jpg');
		document.getElementsByClassName('jumbotron')[0].style.backgroundImage = `url('http://mlb.mlb.com/images/players/action_shots/${newPlayer.player_info.pi_player_id}.jpg')`;
		document.getElementById('playerNameHeading').innerHTML = newPlayer.player_info.pi_player_name_display;
		document.getElementById('teamNameHeading').innerHTML = `${newPlayer.team_info.pt_team} | ${newPlayer.player_info.pi_primary_position_txt} | #${newPlayer.player_info.pi_jersey_number}`;
		populateStatsTableTop(newPlayer);
		injectScriptNewsRss(newPlayer);
	});
}

$(function() {
  var searchNames = namesArray;
  $( "#searchNames" ).autocomplete({
    source: function(hold) {
    	return namesArray.map(function(name) {
			let playerId = findPlayerId(name)[0]["player_id"];
			//console.log(playerId);
			let el = document.createElement('img');
			let elProps = { src: `http://mlb.mlb.com/images/players/assets/74_${playerId}.png`}
    		return Object.assign(el, elProps);
    	})
    },
    minLength: 3
    // position: { of: "#searchNames", my: "center"}
  });
});

$("#searchName").on("click", function(event) {
	event.preventDefault();
	console.log("clicked");
	playerInput = document.getElementById("searchNames").value;
	let foundPlayer = findPlayerId(playerInput)[0];
	updateDomElements(foundPlayer);
});




