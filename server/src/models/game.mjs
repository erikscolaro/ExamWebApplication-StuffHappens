import dayjs from 'dayjs'
import CONFIG from '../config/config'
import { getCard } from '../dao/dao.mjs'
import { CardWrapper } from './card.mjs';

export class Game {
  constructor(userid, datetime, isDemo, roundNum, drawnCardsNum, cardsNum, isFinished) {
    this.user = userid;
    this.datetime = dayjs();
    this.isDemo = isDemo;
    this.wrappedCards = undefined;
    this.roundNum = 0;
    this.drawnCardsNum = 0;
    this.cardsNum = isDemo?4:6;
    this.isFinished = false;
  }

  static async initGame(){

    try {    
      // can raise error iff input values are wrong
      const gameCardIndexes = this.#getRandomUniqueUintArray(0, CONFIG.CARDS_NUMBER-1, this.cardsNum);
      const cards = await Promise.all(gameCardIndexes.map(id=>getCard(id))); // resolve promise array
      this.wrappedCards = cards.map(c => new CardWrapper(c)); // map to cardwrapper for game
      return this;
    } catch(err) {

    }
  }

  static #getRandomUniqueUintArray(min, max, length) {
    const range = max - min + 1;
    if (length > range) throw new Error("Range too small");

    const result = [];
    const temp = new Uint16Array(1);

    while (result.length < length) {
      crypto.getRandomValues(temp);
      const val = (temp[0] % range) + min;
      if (!result.includes(val)) {
        result.push(val);
      }
    }

    return result;
  }

  setRoundResult(playerHasGuessed){
    const card = this.wrappedCards[this.drawnCardsNum-1];
    card.setGuessed(playerHasGuessed);
  }

  isGameEnded(){
    this.isFinisched = (this.drawnCardsNum>=this.cardsNum);
    return this.isFinisched;
  }

  drawCard(isStartingCard = true){
    const card = this.wrappedCards[this.drawnCardsNum];
    this.drawnCardsNum++;
    card.setDrawn();
    if (!isStartingCard){
      this.roundNum++;
      card.setRound(this.roundNum);
    }
    return card;
  }

}