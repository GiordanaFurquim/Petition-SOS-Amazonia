exports.requireNoSignature = function(request, response, next) {
    if (request.session.signatureId) {
        return response.redirect('/petition/thanks');
    }
    next();
};

exports.requireSignature = function(request, response, next) {
    if (!request.session.signatureId) {
        return response.redirect('/petition');
    }
    next();
};
