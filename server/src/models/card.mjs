export class Card {
  constructor(id, name, imagePath, miseryIndex){
    this.id = id;
    this.name = name;
    this.imagePath = imagePath;
    this.miseryIndex = miseryIndex;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      imageFilename: this.imagePath,
      miseryIndex: this.miseryIndex
    };
  }

  toJSONWithoutMiseryIndex() {
    return {
      id: this.id,
      name: this.name,
      imageFilename: this.imagePath
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
