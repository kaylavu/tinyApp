const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // allows access to POST request parameters 
const cookieParser = require('cookie-parser'); 
var PORT = 8080; //default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser()); 

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//generates a 6 character alphanumeric string 
function generateRandomString() {
    const randomString = Math.random().toString(36).substring(2, 8);
    return randomString;
}


app.get("/", (req, res) => {
    res.end("Hello!");
});

//activates listener for server 
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// route handler to render all the urls on the index page
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
    };
    res.render("urls_index", templateVars);
});

// route handler to render form for user input  
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString(); //generate short url
    urlDatabase[shortURL] = req.body.longURL; // add to urlDatabase
    //console.log(req.body, shortURL);  
    //console.log(urlDatabase);
    var shortUrl = "/urls/" + shortURL; //short url path  
    res.redirect(301, shortUrl);
});

app.get("/u/:shortURL", (req, res) => {
    //console.log('REQUEST:', req)
    //console.log('RES', res )
    let longURL = urlDatabase[req.params.shortURL];
    //console.log(longURL);
    res.redirect(301, longURL);
});

app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id];
    let templateVars = {
        shortURL: req.params.id,
        longURL: longURL,
        username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
    //console.log(urlDatabase);
    console.log(longURL);
    //console.log(typeof req.params.id);
});

// route handler to delete a URL
app.post("/urls/:id/delete", (req, res) => {
    //1. delete the url from database 
    delete urlDatabase[req.params.id];
    //2. redirect user to urls index page 
   res.redirect("/urls")
});

// route handler to update a URL 
app.post("/urls/:id", (req, res) => {
    //1. modify the corresponding longURL
    urlDatabase[req.params.id] = req.body.newURL
    //2. redirect user to urls index page 
   res.redirect("/urls")
});

// route handler to login 
app.post("/login", (req, res) => {
    //1. use res.cookie set a cookie named username to the value submitted in the request body via the login form
    //2. redirect the browser back to /urls page
    const username = req.body.username
    res.cookie('username', username);
    //console.log(username);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie('username');
    //console.log(username);
    res.redirect("/urls");
});