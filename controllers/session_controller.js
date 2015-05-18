// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next){
 if (req.session.user) {
 next();
 } else {
 res.redirect('/login');
 }
};

// Get /login -- Formulario de login
exports.new = function(req, res) {
var errors = req.session.errors || {};
req.session.errors = {};
res.render('sessions/new', {errors: errors});
};

// POST /login -- Crear la sesion si usuario se autentica
exports.create = function(req, res) {
var login = req.body.login;
var password = req.body.password;
var time = new Date();
var timeLogin = time.getTime();
var userController = require('./user_controller');
userController.autenticar(login, password, function(error, user) {
if (error) { // si hay error retornamos mensajes de error de sesión
req.session.errors = [{"message": 'Se ha producido un error: '+error}];
res.redirect("/login");
return;
}
// Crear req.session.user y guardar campos id y username
// La sesión se define por la existencia de: req.session.user
req.session.user = {id:user.id, username:user.username, timeLogin: timeLogin};
res.redirect(req.session.redir.toString());// redirección a path anterior a login
});
};

// DELETE /logout -- Destruir sesion
exports.destroy = function(req, res) {
delete req.session.user;
res.redirect(req.session.redir.toString()); // redirect a path anterior a login
};

//autologout
exports.autoLogout = function(req, res, next){
var logDate = new Date();
var date = logDate.getTime();
if(!req.session.user){
next();
} else{
var difference = date - req.session.user.timeLogin;
console.log(difference);
req.session.user.timeLogin=date;
if(difference<120000){
next();
}
else{
delete req.session.user;
res.redirect('/');
}
}
};
