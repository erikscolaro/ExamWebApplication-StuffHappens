// Simple models for database rows
export class Game {
  constructor(id, userid, createdat, roundNum, isended, isdemo, records = []) {
    this.id = id;
    this.userid = userid;
    this.createdat = createdat;
    this.roundNum = roundNum;
    this.isEnded = isended === null ? false : Boolean(isended);
    this.isDemo = isdemo === null ? false : Boolean(isdemo);
    this.records = records;
  }

  getCardsIdsOrdered() {
    return this.records
      .filter(record => record.round <= this.roundNum && record.card)
      .map(record => record.card)
      .filter(card => card.miseryIndex !== undefined && card.miseryIndex !== null)
      .sort((a, b) => a.miseryIndex - b.miseryIndex);
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

  static fromJSON(json) {
    return new Game(
      json.id,
      json.userId,
      json.createdAt,
      json.roundNum,
      json.isEnded,
      json.isDemo,
      json.records ? json.records.map(record => GameRecord().fromJSON(record)) : []
    );
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

  static fromJSON(json) {
    return new GameRecord(
      json.id,
      json.gameId,
      json.cardId,
      json.card ? json.card.fromJSON(json.card) : null,
      json.round,
      json.wasGuessed,
      json.timedOut,
      json.requestedAt,
      json.respondedAt
    );
  }
}