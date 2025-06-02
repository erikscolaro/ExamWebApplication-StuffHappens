// Simple models for database rows
export class Game {
  constructor(id, userid, createdat, isended, isdemo, records = []) {
    this.id = id;
    this.userid = userid;
    this.createdat = createdat;
    this.isended = isended;
    this.isdemo = isdemo;
    this.records = records; // Array of GameRecord objects
  }
}

export class GameRecord {
  constructor(id, gameid, cardid, round, wasguessed) {
    this.id = id;
    this.gameid = gameid;
    this.cardid = cardid;
    this.round = round;
    this.wasguessed = wasguessed;
  }
}