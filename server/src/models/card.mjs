export class Card {
  constructor(id, name, imagePath, miseryindex){
    this.id = id;
    this.name = name;
    this.imagePath = imagePath;
    this.miseryindex = miseryindex;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      imageFilename: this.imagePath,
      miseryIndex: this.miseryindex
    };
  }

  toJSONWithoutMiseryIndex() {
    return {
      id: this.id,
      name: this.name,
      imageFilename: this.imagePath
    };
  }

  fromJSON(json) {
    return new Card(
      json.id,
      json.name,
      json.imageFilename,
      json.miseryIndex
    );
  }
}
