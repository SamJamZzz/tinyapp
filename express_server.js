const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser());

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const searchForURLId = (id) => {
  for (i in urlDatabase) {
    if (i === id) {
      return true;
    }
  }
  return false;
};

const searchUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  let validURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      validURLs[url] = urlDatabase[url];
    }
  }
  return validURLs;
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:id/update", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send("<html><body>You must be logged in to access short URLs</body></html>\n");
  }
  if (!searchForURLId(req.params.id)) {
    return res.send("<html><body>Short URL does not exist</body></html>\n");
  }

  urlDatabase[req.params.id].longURL = req.body.updatedLongURL;
  res.redirect('/urls');
});

app.get("/urls/:id/delete", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send("<html><body>You must be logged in to access short URLs</body></html>\n");
  }
  if (!searchForURLId(req.params.id)) {
    return res.send("<html><body>Short URL does not exist</body></html>\n");
  }
  if (req.cookies['user_id'] !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not have access to this short URL</body></html>\n");
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send("<html><body>You must be logged in to access short URLs</body></html>\n");
  }
  if (!searchForURLId(req.params.id)) {
    return res.send("<html><body>Short URL does not exist</body></html>\n");
  }
  if (req.cookies['user_id'] !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not have access to this short URL</body></html>\n");
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  if (!req.cookies['user_id']) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    return res.render("login", templateVars);
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let user = searchUserByEmail(req.body.email);
  if (!user) {
    return res.status(403).send('Incorrect email');
  }

  if (user.password !== req.body.password) {
    return res.status(403).send('Incorrect password');
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let validURLs = urlsForUser(req.cookies['user_id']);

  if (req.cookies['user_id']) {
    const templateVars = { urls: validURLs, user: users[req.cookies["user_id"]] };
    return res.render("urls_index", templateVars);
  }
  res.send("<html><body>You must first sign in.</body></html>\n");
});

app.post("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    let id = generateRandomString();
    if (!urlDatabase[id]) {
      urlDatabase[id] = {};
    }
    urlDatabase[id].longURL = req.body.longURL;
    urlDatabase[id].userID = req.cookies['user_id'];
    return res.redirect(`/urls/${id}`);
  }
  res.send("<html><body>You cannot shorten URLs without being signed in.</body></html>\n");
});

app.get("/u/:id", (req, res) => {
  if (searchForURLId(req.params.id)) {
    const longURL = urlDatabase[req.params.id].longURL;
    return res.redirect(longURL);
  }
  res.send("<html><body>Invalid short URL</body></html>\n");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect('/login');
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send("<html><body>You must be logged in to access short URLs</body></html>\n");
  }
  if (!searchForURLId(req.params.id)) {
    return res.send("<html><body>Short URL does not exist</body></html>\n");
  }
  if (req.cookies['user_id'] !== urlDatabase[req.params.id].userID) {
    return res.send("<html><body>You do not have access to this short URL</body></html>\n");
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (!req.cookies['user_id']) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    return res.render("register", templateVars);
  }
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('You must enter an email and password');
  }

  if (searchUserByEmail(req.body.email)) {
    return res.status(400).send('Email already in use');
  }

  let userObj = {};
  let userID = generateRandomString();
  res.cookie("user_id", userID);
  userObj.id = userID;
  userObj.email = req.body.email;
  userObj.password = req.body.password;
  users[userID] = userObj;
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});