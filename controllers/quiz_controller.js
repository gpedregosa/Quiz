var models = require('../models/models.js');
// Autoload :id
exports.load = function(req, res, next, quizId) {
    models.Quiz.find({
        where: {
            id: Number(quizId)
        },
        include: [{
            model: models.Comment
        }]
    }).then(
        function(quiz) {
            if (quiz) {
                req.quiz = quiz;
                next();
            } else{next(new Error('No existe quizId=' + quizId))}
        }
    ).catch(function(error){next(error)});
};

// GET /quizes
exports.index = function(req, res) {
    var query = req.query.search;
    if(query){
        console.log("buscando...");
        models.Quiz.findAll({where:["pregunta like ?", '%' + query + '%']}).then(function(quizes) {
            res.render('quizes', {quizes: quizes, errors: []});
        })
    } else {
        console.log("nada que buscar");
        models.Quiz.findAll().then(
            function(quizes) {
                res.render('quizes/index', {quizes: quizes, errors: []});
            }).catch(function(error){next(error);})
    }
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
        resultado = 'Correcto';
    }
    res.render(
        'quizes/answer',
        { quiz: req.quiz,
         respuesta: resultado,
         errors: []
        }
    );
};

// GET /quizes/new
exports.new = function(req, res) {
    var quiz = models.Quiz.build( // crea objeto quiz
        {pregunta: "Pregunta", respuesta: "Respuesta", categoria: "Categoría"}
    );
    res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build( req.body.quiz );
    quiz.validate().then(
        function(err){
            if (err) {
                res.render('quizes/new', {quiz: quiz, errors: err.errors});
            } else {
                quiz // save: guarda en DB campos pregunta y respuesta de quiz
.save({fields: ["pregunta", "respuesta", "categoria"]})
.then( function(){ res.redirect('/quizes')})
} // res.redirect: Redirección HTTP a lista de preguntas
}
).catch(function(error) {next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
    var quiz = req.quiz; // req.quiz: autoload de instancia de quiz
    res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
    req.quiz.pregunta = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.categoria = req.body.quiz.categoria;
    req.quiz.validate().then(
        function(err){
            if (err) {
                res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
            } else {
                req.quiz // save: guarda campos pregunta y respuesta en DB
.save( {fields: ["pregunta", "respuesta", "categoria"]})
.then( function(){ res.redirect('/quizes');});
} // Redirección HTTP a lista de preguntas (URL relativo)
}
).catch(function(error) {next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
    req.quiz.destroy().then(function(){
        res.redirect('/quizes');
    }).catch(function(error) {next(error)});
};

// GET /quizes/statistics
exports.statistics = function(req, res){
// numero de preguntas
models.Quiz.findAll().then(function(quizes){
var numPreguntas = quizes.length;
// Numero de comentarios totales
models.Comment.findAll().then(function(comments){
numComments = comments.length;
//media
var mediaComPreg = numComments/numPreguntas;
// numero de preguntas sin comentarios
var numPregSinCom = 0;
var numPregConComments = 0;
for(var i = 0; i<quizes.length; i++){
quizes[i].getComments().then(function(quizesComment){
if(quizesComment.length === 0){
numPregSinCom++;
calculoEstadisticas(i, numPreguntas, numComments, mediaComPreg, numPregSinCom, numPregConComments, quizes.length-1);
}
else{
numPregConComments++;
calculoEstadisticas(i, numPreguntas, numComments, mediaComPreg, numPregSinCom, numPregConComments, quizes.length-1);
}
});
}
});
}).catch(function(error){next(error)});
function calculoEstadisticas(i, numPreg, numComments, mediaComPreg, numPregSinCom, numPregConComments, quizLength){
if(numPregConComments+numPregSinCom === i){
console.log(numPreg);
console.log(numComments);
console.log(mediaComPreg);
console.log(numPregSinCom);
console.log(numPregConComments);
res.render('quizes/estadisticas', {
numPreg: numPreg,
numComments: numComments,
media: mediaComPreg,
numPregSinCom: numPregSinCom,
numPredConComments: numPregConComments,
errors: []
});
}
};
}
