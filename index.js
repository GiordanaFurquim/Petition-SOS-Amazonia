const express = require("express");
const helmet = require("helmet");
const csurf = require("csurf");
const hb = require("express-handlebars");
const db = require("./utils/db");
const { hash, compare } = require("./utils/bc");
const cookieSessions = require("cookie-session");
const {requireNoSignature, requireSignature} = require('./middleware');

const app = exports.app = express();

app.use(
    cookieSessions({
        secret: "I am always happy.",
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));

app.use("/favicon.ico", (request, response) =>
    response.sendStatus(404));

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(csurf());
app.use(helmet());

app.use(function(request, response, next) {
    response.setHeader("X-Frame-Options", "DENY");
    response.locals.csrfToken = request.csrfToken();
    next();
});

/// MAIN ROUTE ///

app.get('/start', (request, response) => {
    response.render ('start', {
        layout: 'main',
        loggedOut: true
    });
});

/// SLASH ROUTE ///

app.get("/", (request, response) => {
    response.redirect("/start");
});


/// REGISTRATION ROUTE ///

app.get("/registration", (request, response) => {
    response.render("registration",  {
        layout:'main',
        isRegistration: true,
        loggedIn: false
    });
});

app.post("/registration", (request, response) => {
    console.log('request.body', request.body);
    hash(request.body.password)
        .then(hash => {
            console.log("hash:", hash);
            db.insertUser(request.body.first, request.body.last, request.body.email, hash)
                .then(id => {
                    console.log('id:', id);
                    request.session.userId = id;
                    response.redirect("/profile");
                });
        })
        .catch(error => {
            console.log('error in hash:', error);
            response.render("registration", {
                error: "Ops! Something went wrong."
            })
                .catch(error => {
                    console.log('error in registration:', error);
                    response.render("registration", {
                        error:"Uh Uo! Something went wrong. Happens sometimes."
                    });
                });
        });
});

/// PROFILE ///

app.get("/profile", function(request, response) {
    response.render("profile", {
        layout: "main",
        isProfile: true
    });
});

app.post("/profile", (request, response) => {
    let url = request.body.url;

    console.log(request.body.age, request.body.city, url, request.session.userId);
    console.log('typeof request:', typeof request.body.age);
    let age = request.body.age;

    if (age  == "") {
        age = null;
    }

    db.getProfile(age, request.body.city, url, request.session.userId,)
        .then(() => {
            response.redirect("/petition");
        })
        .catch(error => {
            console.log('error in profile:', error);
            response.render("profile", {
                error:"Oh, that looks weird! I guess something went wrong while creating your profile.",
                layout:"main"
            });

        });
});


/// PETITION ROUTE ///

app.get("/petition", requireNoSignature, (request, response) => {
    response.render("petition", {
        layout: "main",
        loggedIn: true
    });
});

app.post("/petition", (request, response) => {
    db.insertSignature(request.body.signatures, request.session.userId)
        .then(id => {
            request.session.signatureId = id;
            response.redirect("/petition/thanks");
        })
        .catch(error => {
            console.log('error in petition:', error);
            response.render("petition", {
                error: "Oh no! Something went wrong. Happens sometimes. "
            });
        });
});

/// THANKS ///

app.get("/petition/thanks", requireSignature, (request, response) => {
    db.getSignature(request.session.userId)
        .then( results => {
            console.log('results:', results);
            response.render("thanks", {
                layout:"main",
                signatures:results.signatures,
                isThanksPage: true
            });
        })
        .catch(error => {
            console.log('error in petition/thanks:', error);
            response.render("thanks", {
                error: "Oh no! Something went wrong. Happens sometimes!"
            });
        });
});

app.post("/petition/thanks", (request, response) => {
    db.deleteSignature(request.session.userId)
        .then(results => {
            console.log('results delete signature:', results);
            request.session.signatureId = null;
            response.redirect("/petition");
        })
        .catch(error => {
            console.log('error in delete signature:', error);
            response.render("petition", {
                error: "Ops! Something went wrong. Happens! "
            });
        });
});

/// SUPPORTERS ROUTE ///

app.get("/supporters", requireSignature, (request, response) => {
    db.getAllSupporters()
        .then(results => {
            console.log('results from getAllSupporters:', results);
            response.render("supporters", {
                layout: 'main',
                supporters: results,
                loggedIn: true
            });
        })
        .catch(error => {
            console.log('error in supporters:', error);
            response.render("supporters", {
                error: "Oh, Batman! Something went incredibly wrong. Help!."
            });
        });
});

/// SAME CITY SUPPORTERS ///

app.get("/petition/supporters/:city", requireSignature, (request, response) => {
    console.log('results from getSameCitySupporters:', request.params.city);
    db.getSameCitySupporters(request.params.city)
        .then(results => {
            console.log('results.rows:', results.rows);
            response.render("samecity", {
                supporters:results.rows,
                city:results.rows[0].city,
                loggedIn: true
            });
        })
        .catch(error => {
            console.log('error in supporters from the same city:', error);
            response.render("samecity", {
                error: "Ops! We did it again! Something went wrong."
            });
        });
});


/// LOGIN ROUTE ///

app.get("/login", (request, response) => {
    response.render("login", {
        layout:"main"
    });
});

app.post("/login", (request, response) => {
    db.userInfo(request.body.email)
        .then(results => {
            console.log("result:", results);
            console.log('request.body:', request.body);
            console.log("req.body.pass:", request.body.password, results.rows[0].password);
            compare(request.body.password, results.rows[0].password)
                .then(match => {
                    if (match) {
                        console.log('request.session login:', request.session.userId);
                        request.session.userId = results.rows[0].id;
                        response.redirect("/petition");
                    }
                    console.log(match);
                })
                .catch(error => {
                    console.log(error);
                    response.render("login", {
                        error:"Oh, that looks weird! I guess something went wrong while login you in.",
                        layout:"main"
                    });
                    request.session.loggedIn = true;
                });
        });
});

/// ABOUT THE FOREST ///

app.get("/theforest", (request, response) => {
    if (request.session.loggedIn) {
        response.render("theforest", {
            layout:"main",
            loggedIn: true
        });
    }else {
        response.render ("theforest", {
            loggedOut: true,
            layout: 'main'
        });
    }
});


/// LOGOUT ///

app.get("/logout", (request, response) => {
    request.session = null;
    response.redirect("/start");
});


/// SERVER ///

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Yo! I am listening to you. Keep coding!");
    });
}
