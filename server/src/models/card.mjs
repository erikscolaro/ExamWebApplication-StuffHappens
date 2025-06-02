export class Card {
  constructor(id, name, imagePath, miseryindex){
    this.id = id;
    this.name = name;
    this.imagePath = imagePath;
    this.miseryindex = miseryindex;
  }
}

export class CardWrapper {
  constructor(card){
    this.card=card;
    this.isDrawn = false;
    this.isGuessed = undefined;
    this.round = undefined;
  }
}