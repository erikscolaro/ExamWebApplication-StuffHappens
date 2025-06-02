
class User {
  constructor(id, username, hashPassword, salt){
    this.id,
    this.username = username;
    this.hashPassword = hashPassword;
    this.salt = salt;
  }
}

export default User;