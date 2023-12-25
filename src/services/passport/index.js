import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { jwtSecret } from '../../config';
import User from '../../api/user/model'; 


export const password = () => (req, res, next) =>
  passport.authenticate('password', { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err);
    } else if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

export const master = () =>
  passport.authenticate('master', { session: false });

export const token = ({ required, roles = User.rawAttributes.role.values } = {}) => (req, res, next) =>
  passport.authenticate('token', { session: false }, (err, user, info) => {
    if (err || (required && !user) || (required && !roles.includes(user.role))) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

passport.use('password', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return done(true);
    }
    return user.authenticate(password, user.password).then((user) => {
      done(null, user)
      return null
    }).catch(done)
  } catch (error) {
    return done(error);
  }
}));

passport.use('master', new BearerStrategy((token, done) => {
  if (token === masterKey) {
    done(null, {});
  } else {
    done(null, false);
  }
}));

passport.use('token', new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromBodyField('access_token'),
    ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  ]),
}, async ({ id }, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
}));