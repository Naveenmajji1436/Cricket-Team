const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
app = express();
app.use(express.json());

let db = null;

const installingServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log(`Server Started...`);
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
installingServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET THE PLAYERS
app.get("/players/", async (request, response) => {
  const SqlGetQuery = `
    SELECT *
    FROM cricket_team;`;
  let playersArray = await db.all(SqlGetQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//GET THE PLAYER
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const SqlGetPlayerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id=${playerId};`;
  let playerDetail = await db.get(SqlGetPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerDetail));
});

//DELETE PLAYER
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlDeleteQuery = `
    DELETE FROM
    cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(sqlDeleteQuery);
  response.send(`Player Removed`);
});

//PUT THE PLAYER
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const SqlUpdateQuery = `
    UPDATE 
    cricket_team
    SET
     player_name = '${playerName}',
     jersey_number = ${jerseyNumber},
     role = '${role}'
    WHERE player_id = ${playerId};`;
  await db.run(SqlUpdateQuery);
  response.send(`Player Details Updated`);
});

//POST THE PLAYERS
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const SqlPostQuery = `
  INSERT INTO
  cricket_team (player_name,jersey_number,role)
  VALUES("${playerName}",${jerseyNumber},"${role}");`;
  let addPlayer = await db.run(SqlPostQuery);
  let playerId = addPlayer.lastID;
  response.send(`Player Added to Team`);
});

module.exports = app;
