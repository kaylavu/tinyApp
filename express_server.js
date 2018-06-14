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

const urlDatabase = {
    "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: 'userRandomID'},
    "9sm5xK": {longURL:"http://www.google.com", userID: 'user2RandomID'} 
};

const users = { 
    "userRandomID": {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    }
  }

//generates a 6 character alphanumeric string 
function generateRandomString() {
    const randomString = Math.random().toString(36).substring(2, 8);
    return randomString;
}

function getUserByEmail(email) {
    for (userId in users) {
        var user = users[userId];
        if(user.email === email) {
            return user;
        }
    }
}

function getUserFromRequest(req) {
    return getUserById(req.cookies.user_id);
}

function getUserById(userId) {
    return users[userId];
}

function urlsForUser(id)  {
    const urlForUserDatabase = {};
    for (url in urlDatabase) {
        console.log("URL:", url);
        console.log(urlDatabase[url]['userID']);
        if (urlDatabase[url]['userID'] === id) {
            console.log("URL userID:", url.userID ,"ID:", id );
            urlForUserDatabase[url] = urlDatabase[url];
        }
    }
}

console.log("URL SUBSET FOR USER>>>>>", urlsForUser('userRandomID')); 

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
        user: getUserFromRequest(req)
    };
    res.render("urls_index", templateVars);
});

// route handler to render form for user input  
app.get("/urls/new", (req, res) => {
    let templateVars = {
        user: getUserFromRequest(req)
    };
    if(!getUserFromRequest(req)) {
        res.redirect("/login")
    } else {
        res.render("urls_new",templateVars);
    }
});

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString(); //generate short url
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: getUserFromRequest(req).id } // add to urlDatabase  //console.log(req.body, shortURL);  
    //urlDatabase['userID'] = getUserFromRequest(req)
    var shortUrl = "/urls/" + shortURL; //short url path  //console.log(urlDatabase);
    //console.log('MY NEW DATABASE:', urlDatabase);
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
    let longURL = urlDatabase[req.params.id].longURL;
    let templateVars = {
        shortURL: req.params.id,
        longURL: longURL,
        user: getUserFromRequest(req)
    };
    res.render("urls_show", templateVars);
    //console.log(urlDatabase);
    //console.log(longURL);
    //console.log('MY FULL URL:', req.params.id);
});

// route handler to delete a URL
app.post("/urls/:id/delete", (req, res) => { 
   const urlID = urlDatabase[req.params.id].userID; 
   const userID = req.cookies.user_id; 
   if(urlID === userID) {
       delete urlDatabase[req.params.id];
       res.redirect("/urls")
   } else {
       res.status(404).send("User does not have access to delete this URL"); 
   }
   
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
    const user = getUserByEmail(req.body.email);
    // console.log(req.body);
    if(user === undefined) {
        res.status(403).send("User does not exist");
        return; 
    }
    res.cookie('user_id', user.id);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/urls");
});


app.get("/register", (req, res) => {
    let templateVars = {
        user: getUserFromRequest(req)
    };
    res.render("urls_register", templateVars)
});



app.post("/register", (req, res) => {
    const userID = generateRandomString(); 
    const email = req.body.email; 
    const password = req.body.password; 
    
    if(!email || !password === 0) {
        res.status(400).send('Please enter email and password!');
        return;
    }
    for (userId in users) {
        var user = users[userId];
        if(user.email === email) {
            // console.log("you already exist")
            res.status(400).send('No clones!')
            return;
        }
    }
    users[userID] = {id:userID, email:email, password:password} 
    //console.log(users); 
    res.cookie('user_id', userID)
    res.redirect("/urls")

});

app.get("/login", (req, res) => {
    //res.render("urls_login");
    let templateVars = {
        user: getUserFromRequest(req)
    };
    res.render("urls_login",templateVars); 
});

