import passport from 'passport';
import LocalStrategy from 'passport-local';
import { getUserByUsername } from '../dao/dao.mjs';

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUserByUsername(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
  return cb(null, user);
}));

passport.serializeUser((user, cb) => {
  cb(null, user.toJSON());
});

passport.deserializeUser((user, cb) => {
  return cb(null, user);
});

export default passport;