
class User {
  constructor(id, username, hashPassword, salt){
    this.id = id;
    this.username = username;
    this.hashPassword = hashPassword;
    this.salt = salt;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username
    };
  }
}

export default User;