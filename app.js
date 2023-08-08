const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//get 1
const convertPlayerDetailsObject = (e) => {
  return {
    playerId: e.player_id,
    playerName: e.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const q1 = `select * from player_details;`;
  const data1 = await db.all(q1);
  response.send(data1.map((e) => convertPlayerDetailsObject(e)));
});

//get 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const q2 = `select * from player_details where player_id=${playerId};`;
  const data2 = await db.get(q2);
  //console.log(data2);
  const { player_id, player_name } = data2;
  const obj = {
    playerId: player_id,
    playerName: player_name,
  };
  response.send(obj);
});

//put method 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const q3 = `
    update player_details set player_name='${playerName}'
    where player_id='${playerId}';`;

  await db.run(q3);
  response.send("Player Details Updated");
});

//get method 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const q4 = `select * from match_details where match_id=${matchId};`;
  const data4 = await db.get(q4);
  //console.log(data2);
  const { match_id, match, year } = data4;
  const obj = {
    matchId: match_id,
    match: match,
    year: year,
  };
  response.send(obj);
});

//get method 5
const convertMatchDetails = (m) => {
  return {
    matchId: m.match_id,
    match: m.match,
    year: m.year,
  };
};
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const q5 = `
  SELECT * FROM  player_match_score NATURAL JOIN  match_details 
     WHERE player_id=${playerId};`;
  const matches = await db.all(q5);
  response.send(matches.map((m) => convertMatchDetails(m)));
});
//get method 6
const convert1 = (e1) => {
  return {
    playerId: e1.player_id,
    playerName: e1.player_name,
  };
};
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const q6 = `

select   *
from player_details natural join  player_match_score
where player_match_score.match_id='${matchId}';`;
  const players = await db.all(q6);
  console.log(players);
  response.send(players.map((e1) => convert1(e1)));
});

//get method 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const q7 = `
select 
player_details.player_id as playerId,
player_details.player_name as playerName,
SUM(player_match_score.score) as totalScores,
SUM(player_match_score.fours) as totalFours,
SUM(player_match_score.sixes) as totalSixes
from  player_details inner join  player_match_score on 
player_details.player_id=
player_match_score.player_id
where player_details.player_id=${playerId}
group by player_details.player_name;`;
  const playerScores = await db.all(q7);
  // console.log(playerScores);
  // console.log(playerScores);
  // console.log(data7);
  //console.log(playerScores);
  response.send(playerScores);
});

module.exports = app;
