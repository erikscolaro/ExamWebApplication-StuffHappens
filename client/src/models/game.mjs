import { Card } from "./card.mjs";

export class Game {
  constructor(id, userId, createdAt, roundNum, isEnded, isDemo, livesRemaining = 3, records = []) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.roundNum = roundNum;
    this.isEnded = isEnded === null ? false : Boolean(isEnded);
    this.isDemo = isDemo === null ? false : Boolean(isDemo);
    this.livesRemaining = livesRemaining;
    this.records = records;
  }

  getCardsIdsOrdered() {
    // Include only:
    // 1. Cards from previous rounds that were guessed correctly (wasGuessed = true)
    // 2. The current round card (regardless of wasGuessed status, since it's being answered now)
    const validRecords = this.records.filter(
      (record) => record.card && (
        (record.round < this.roundNum && record.wasGuessed === true) ||
        (record.round === this.roundNum)
      )
    );

    return validRecords
      .map(record => record.card)
      .filter(card => card.miseryIndex !== undefined && card.miseryIndex !== null)
      .sort((a, b) => a.miseryIndex - b.miseryIndex);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      createdAt: this.createdAt,
      roundNum: this.roundNum,
      isEnded: this.isEnded,
      isDemo: this.isDemo,
      livesRemaining: this.livesRemaining,
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
      json.livesRemaining || 3,
      json.records ? json.records.map(record => GameRecord.fromJSON(record)) : []
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
      json.card ? Card.fromJSON(json.card) : null,
      json.round,
      json.wasGuessed,
      json.timedOut,
      json.requestedAt,
      json.respondedAt
    );
  }
}