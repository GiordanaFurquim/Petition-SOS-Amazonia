let tempSession, session = {};

module.exports = () => (req, res, next) => {
    req.session = tempSession || session;
    tempSession = null;
    next();
};

module.exports.mockSession = sess => session = sess;
// creates a fake cookie tha runs for ALL the tests 

module.exports.mockSessionOnce = sess => tempSession = sess;
//creates a fake cookie that runs for ONE test
