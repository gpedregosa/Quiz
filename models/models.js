var path = require('path');
// Postgres DATABASE_URL = postgres://user:pass@host:port:database
// SQLite DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user = (url[2] || null);
var pwd = (url[3] || null);
var protocol = (url[1] || null);
var dialect = (url[1] || null);
var port = (url[5] || null);
var host = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;
// Cargar modelo ORM
var Sequelize = require('sequelize');
// Usar BBDD SQLite
var sequelize = new Sequelize(DB_name, user, pwd,
{dialect: protocol,
protocol: protocol,
port: port,
host: host,
storage: storage, // solo SQLite (.env)
omitNull: true	// Solo postgres
}
);
// Importar la definición de la tabla Quiz
var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);
// Importar definición de la tabla comment
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);
exports.Quiz = Quiz; // exporta tabla quiz
exports.Comment = Comment;
// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function () {
// then(..) ejecuta el manejador una vez creada la tabla
Quiz.count().then(function (count) {
if (count === 0) {
Quiz.bulkCreate([
{ pregunta: 'Capital de Italia', respuesta: 'Roma', categoria: 'Humanidades'},
{ pregunta: 'Capital de Portugal', respuesta: 'Lisboa', categoria: 'Humanidades'}
]

).then(function () {console.log('Base de datos inicializada')});
};
});
});
