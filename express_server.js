const { generateRandomString, searchForURLId, searchUserByEmail, urlsForUser } = require('./helpers')
const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['tiny'],
  maxAge: 24 * 60 * 60 * 1000
}));

// Database
// URL database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// User database
const users = {};

app.use(express.urlencoded({ extended: true }));

// Homepage route
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// Rendering urls routes
// Shows list of URLs
app.get("/urls", (req, res) => {
  let validURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (req.session.user_id) {
    const templateVars = { urls: validURLs, user: users[req.session.user_id] };
    return res.render("urls_index", templateVars);
  }
  res.send("<html><body>You must first sign in.</body></html>\n");
});

// Shows page for creation of new short URL
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id]
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect('/login');
});

// Shows page for given short URL
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.send("<html><body>You must be logged in to access short URLs</body></html>\n");
  }
  if (!searchForURLId(req.params.id, urlDatabase)) {
    return res.send("<html><body>Short URL does not exist</body></html>\n");
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not have access to this short URL</body></html>\n");
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});



// Rendering auth routes
// Shows page for registering new user
app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    return res.render("register", templateVars);
  }
  res.redirect('/urls');
});

// Shows page for an existing user to login
app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    return res.render("login", templateVars);
  }
  res.redirect('/urls');
});



// urls CRUD REST API
// Creates new short URL
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let id = generateRandomString();
    urlDatabase[id] = {longURL: req.body.longURL, userID: req.session.user_id};
    return res.redirect(`/urls/${id}`);
  }
  res.send("<html><body>You cannot shorten URLs without being signed in.</body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Visits the long URL associated with the given short URL
app.get("/u/:id", (req, res) => {
  if (!searchForURLId(req.params.id, urlDatabase)) {
    return res.send("<html><body>Invalid short URL</body></html>\n");
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not have access to this short URL</body></html>\n");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Updates the long URL for a given short URL
app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.send("<html><body>You must be logged in to access short URLs</body></html>\n");
  }
  if (!searchForURLId(req.params.id, urlDatabase)) {
    return res.send("<html><body>Short URL does not exist</body></html>\n");
  }

  urlDatabase[req.params.id].longURL = req.body.updatedLongURL;
  res.redirect('/urls');
});

// Deletes the long and short URLs for the user they are associated with
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.send("<html><body>You must be logged in to access short URLs</body></html>\n");
  }
  if (!searchForURLId(req.params.id, urlDatabase)) {
    return res.send("<html><body>Short URL does not exist</body></html>\n");
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not have access to this short URL</body></html>\n");
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Auth REST API
// Registers a new user with the given email and password credentials
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('You must enter an email and password');
  }

  if (searchUserByEmail(req.body.email, users)) {
    return res.status(400).send('Email already in use');
  }

  let userObj = {};
  let userID = generateRandomString();
  req.session.user_id = userID;
  userObj.id = userID;
  userObj.email = req.body.email;
  userObj.password = bcrypt.hashSync(req.body.password, 10);
  users[userID] = userObj;
  res.redirect('/urls');
});

// Logs in an a user that has already registered before with the given email and password
app.post("/login", (req, res) => {
  let user = searchUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send('Invalid credentials');
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send('Invalid credentials');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Logs out a user that is currently logged in
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Server listens to incoming requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});