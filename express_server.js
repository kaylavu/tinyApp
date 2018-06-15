const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

const app = express();
var PORT = 8080; //default port 8080

app.set("view engine", "ejs");

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
app.use(bodyParser.urlencoded({
    extended: true
}));

//activates listener for server 
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
});



var urlDatabase = {
    "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: 'userRandomID'
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        userID: 'user2RandomID'
    }
};

var users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "pass1"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "pass2"
    }
}

//generates random 6 character alphanumeric string 
function generateRandomString() {
    const randomString = Math.random().toString(36).substring(2, 8);
    return randomString;
}

function getUserByEmail(email) {
    for (userId in users) {
        var user = users[userId];
        if (user.email === email) {
            return user;
        }
    }
}

function getUserFromRequest(req) {
    return getUserById(req.session.user_id);
}

function getUserById(userId) {
    return users[userId];
}

function urlsForUser(id) {
    const urlForUserDatabase = {};
    for (url in urlDatabase) {
        if (urlDatabase[url]['userID'] === id) {
            urlForUserDatabase[url] = urlDatabase[url];
        }
    }
    return urlForUserDatabase;
}

app.get("/", (req, res) => {
    if (!getUserFromRequest(req)) {
        res.redirect("/login");
    } else {
        res.redirect("/urls");
    }
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

// route handler to render all the urls on the index page
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlsForUser(req.session.user_id),
        user: getUserFromRequest(req),
    };
    res.render("urls_index", templateVars);
});

// route handler to render form for user input  
app.get("/urls/new", (req, res) => {
    let templateVars = {
        user: getUserFromRequest(req)
    };
    if (!getUserFromRequest(req)) {
        res.redirect("/login")
    } else {
        res.render("urls_new", templateVars);
    }
});

app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: getUserFromRequest(req)
    };
    if (req.session.user_id === urlDatabase[req.params.id].userID) {
        res.render("urls_show", templateVars);
    } else {
        res.status(403).send("Unauthorized Access")
    }

});

app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(301, longURL);
});

app.get("/register", (req, res) => {
    let templateVars = {
        user: getUserFromRequest(req)
    };
    res.render("urls_register", templateVars)
});

app.get("/login", (req, res) => {
    let templateVars = {
        user: getUserFromRequest(req)
    };
    res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: getUserFromRequest(req).id
    }
    var pathName = "/urls/" + shortURL;
    res.redirect(301, pathName);
});

// route handler to delete a URL
app.post("/urls/:id/delete", (req, res) => {
    const urlID = urlDatabase[req.params.id].userID;
    const userID = req.session.user_id;
    if (urlID === userID) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls")
    } else {
        res.status(404).send("User does not have access to delete this URL");
    }
});

// route handler to update a URL 
app.post("/urls/:id", (req, res) => {
    const urlID = urlDatabase[req.params.id].userID;
    const userID = req.session.user_id;
    if (urlID === userID) {
        urlDatabase[req.params.id] = {
            longURL: req.body.newURL,
            shortURL: req.params.id,
            userID
        }
        res.redirect("/urls");
    } else {
        res.status(404).send("User does not have access to edit URL")
    }
});

// route handler to login 
app.post("/login", (req, res) => {
    const user = getUserByEmail(req.body.email);
    if (!user) {
        res.status(403).send("User does not exist.Please register.");
        return;
    }
    const password = req.body.password
    if (bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id
        res.redirect("/urls");
    }
    if (!bcrypt.compareSync(password, user.password)) {
        res.status(404).send("Incorrect Password");
    }
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
});


app.post("/register", (req, res) => {
    const userID = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);

    if (!email || !password) {
        res.status(400).send('Please enter email and password!');
        return;
    }
    for (userId in users) {
        var user = users[userId];
        if (user.email === email) {
            res.status(400).send('User already exists!')
            return;
        }
    }
    users[userID] = {
        id: userID,
        email: email,
        password: hashedPassword
    }
    req.session.user_id = userID;
    res.redirect("/urls");
});