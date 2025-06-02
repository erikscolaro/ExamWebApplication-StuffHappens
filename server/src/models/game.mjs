// Simple models for database rows
export class Game {
  constructor(id, userid, createdat, roundNum, isended, isdemo, records = []) {
    this.id = id;
    this.userid = userid;
    this.createdat = createdat;
    this.roundNum = roundNum;
    this.isEnded = isended;
    this.isDemo = isdemo;
    this.records = records;
  }
}

export class GameRecord {
  constructor(id, gameid, cardid, round, wasguessed,wasconsidered) {
    this.id = id;
    this.gameid = gameid;
    this.cardid = cardid;
    this.round = round;
    this.wasguessed = wasguessed;
    this.wasconsidered = wasconsidered;
  }
}