export class Card {
  constructor(id, name, imageFilename, miseryIndex){
    this.id = id;
    this.name = name;
    this.imageFilename = imageFilename;
    this.miseryIndex = miseryIndex;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      imageFilename: this.imageFilename,
      miseryIndex: this.miseryIndex,
    };
  }

  toJSONWithoutMiseryIndex() {
    return {
      id: this.id,
      name: this.name,
      imageFilename: this.imageFilename,
    };
  }

  static fromJSON(json) {
    return new Card(
      json.id,
      json.name,
      json.imageFilename,
      json.miseryIndex
    );
  }
}
