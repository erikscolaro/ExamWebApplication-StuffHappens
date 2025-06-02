
class User {
  constructor(username, hashPassword, salt){
    this.username = username;
    this.hashPassword = hashPassword;
    this.salt = salt;
  }
}

export default User;