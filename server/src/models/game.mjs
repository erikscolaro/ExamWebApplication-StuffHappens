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

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdat,
      roundNum: this.roundNum,
      isEnded: this.isEnded,
      isDemo: this.isDemo,
      records: this.records.map(record => record.toJSON())
    };
  }
}

export class GameRecord {
  constructor(id, gameid, cardid, cardObject, round, wasguessedintime, requestedAt = null, respondedAt = null) {
    this.id = id;
    this.gameid = gameid;
    this.cardid = cardid;
    this.cardObject = cardObject;
    this.round = round;
    this.wasguessedintime = wasguessedintime;
    this.requestedAt = requestedAt; // set when the card is requested serverside
    this.respondedAt = respondedAt; // Will be set when the answer is submitted serverside
  }

  toJSON() {
    return {
      card: this.cardObject ? this.cardObject.toJSON() : null,
      round: this.round,
      wasGuessedInTime: this.wasguessedintime,
      requestedAt: this.requestedAt,
      respondedAt: this.respondedAt
    };
  }
}