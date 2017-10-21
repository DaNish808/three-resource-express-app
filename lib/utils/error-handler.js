module.exports = (err, req, res, next) => {

    let code = 500;
    let error = { error: 'internal server error' };

    if(err.code) {
        code = err.code;
        error.error = err.message;
    }
    else if(err.name === 'CastError') {
        code = 404;
        error.error = err.message;
    }
    else if(err.name === 'ValidationError') {
        code = 400;
        error.error = Object.values(err.errors).map(key => key.message);
    }
    else console.log(err);

    res.status(code).send(error);
};
