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
      records: this.records.filter(record => this.roundNum >= record.round).map(record => record.toJSON())
    };
  }
}

export class GameRecord {
  constructor(id, gameId, cardId, card, round, wasGuessed, timedOut, requestedAt = null, respondedAt = null) {
    this.id = id;
    this.gameId = gameId;
    this.cardId = cardId;
    this.card = card;
    this.round = round;
    this.wasGuessed = wasGuessed === null ? null : Boolean(wasGuessed);
    this.timedOut = timedOut === null ? null : Boolean(timedOut);
    this.requestedAt = requestedAt; // set when the card is requested serverside
    this.respondedAt = respondedAt; // Will be set when the answer is submitted serverside
  }

  toJSON() {
    return {
      card: this.card ? this.card.toJSON() : null,
      round: this.round,
      wasGuessed: (this.wasGuessed !== null) ? Boolean(this.wasGuessed): null,
      timedOut: (this.timedOut !== null) ? Boolean(this.timedOut) : null,
    };
  }
}