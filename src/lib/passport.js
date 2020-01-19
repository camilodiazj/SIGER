const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM USERS WHERE username = ?', username);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.password);
        if (validPassword) {
            done(null, user, req.flash('success','Bienvenido ' + user.username));
        } else {
            done(null, false, req.flash('message','Tu contraseña está incorrecta'));
        }
    } else {
        return done(null, false, req.flash('message', 'Tu usuario no está registrado'));
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) => {
    const { no_id } = req.body;
    const newUser = {
        username,
        password,
        no_id
    }
    const usernameVal = await pool.query('SELECT username FROM USERS where username = ?', username);
    const idVal = await pool.query('SELECT * FROM USERS where no_id = ?', no_id);
    if (!idVal[0]) {
        done(null, false, req.flash('message', 'No puedes realizar el registro de tu cuenta, comunicate con la facultad'));
    } else if (idVal[0].username) {
        done(null, false, req.flash('message', 'Ya estás registrado'));
    } else if (usernameVal[0]){
        done(null, false, req.flash('message', 'El nombre de usuario ya está registrado'));
    } else { 
        newUser.password = await helpers.encryptPassword(password);
        await pool.query('UPDATE USERS SET username = ?, password = ? WHERE no_id = ?', [username, newUser.password, no_id]);
        newUser.id = idVal[0].id; 
        return done(null, newUser);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM USERS WHERE ID = ?', [id]);
    done(null, rows[0]);
});