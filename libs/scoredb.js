//DB object manager.
var dbManager = {
	db: undefined,
	allGames: [],
	insertGame: function (player) {
		var transaction = this.db.transaction("table_score", "readwrite");
		var table = transaction.objectStore("table_score");

		table.add({
			"name": player.name,
			"score": player.score,
			"modality": player.modality,
			"date": player.date
		});
	}
};

//We attempt to read a database with scores as name.
var dbrequest = window.indexedDB.open("scores");


//The first time the database is created this method is executed.
dbrequest.onupgradeneeded = function (event) {
	dbManager.db = dbrequest.result;

	var table = dbManager.db.createObjectStore("table_score", {
		keyPath: "id",
		autoIncrement: true
	});

	var byID = table.createIndex("id_index", "id", {
		"unique": true
	});

	var byName = table.createIndex("name_index", "name", {
		"unique": false
	});

	var byScore = table.createIndex("score_index", "score", {
		"unique": false
	});

	var byDate = table.createIndex("date_index", "date", {
		"unique": false
	});
};

//If the db couldn't be created triggers an error.
dbrequest.onerror = function (event) {
	console.log("The scores DB couldn't be created...");
	alert("The scores DB couldn't be created...");
};

//If the db could be created or accessed
dbrequest.onsuccess = function (event) {
	dbManager.db = dbrequest.result;

	var transaction = dbManager.db.transaction("table_score", "readwrite");
	var table = transaction.objectStore("table_score");

	//Select all the games stored.
	var cursor = table.openCursor();

	//If the game could be retrieved.
	cursor.onsuccess = function (event) {
		var res = event.result || event.target.result;
		if (res) {
			dbManager.allGames.push(res.value);
			res.continue();
		}
	};

	cursor.onerror = function () {
		console.log("Error reading data",
			" or the cursor finished reading all files");
	};
};
