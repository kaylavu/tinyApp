var express = require("express"); 
var app = express(); 
var PORT = 8080; //default port 8080
const bodyParser = require("body-parser"); // allows access to POST request parameters 

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca", 
    "9sm5xK": "http://www.google.com"
}; 

function generateRandomString() {
    const randomString = Math.random().toString(36).substring(2, 8); 
    return randomString; 
}


app.get("/", (req,res) => {
    res.end("Hello!"); 
}); 

//activates listener for server 
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
}); 

app.get("/urls.json", (req,res) => {
    res.json(urlDatabase); 
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req,res) => {
    let templateVars = { urls: urlDatabase}; 
    res.render("urls_index", templateVars); 
}); 

//adding route handler to render the page with the form 
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();     //generate short url
    urlDatabase[shortURL] = req.body.longURL;    // add to urlDatabase
    //console.log(urlDatabase);  // 
    //console.log(req.body, shortURL);  
    var shortUrl = "/urls/"+shortURL;           // 
    //console.log(shortUrl);
    res.redirect(301,shortUrl);         // 
    //console.log(urlDatabase);
  });



  app.get("/u/:shortURL", (req, res) => {
      //console.log("we are in the /u shorturl")
      //console.log('REQUEST:', req)
      //console.log('RES', res )
    let longURL = urlDatabase[req.params.shortURL];
    //console.log(longURL);
    res.redirect(301, longURL);
  });


//example of how res.render looks into the second param 
//res.render("urls_index", {urls: urlDatabase, key2: 'value2', key3: 'value3})
//res.render("urls_index", var urls = urlDatabse, var key2 = 'value2, var key3 = 'value3') 
app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id]; 
    console.log(urlDatabase);
    console.log(longURL);
    console.log(typeof req.params.id);
    let templateVars = { shortURL: req.params.id , longURL: longURL };
    
    res.render("urls_show", templateVars);
  });



  
 
  




