const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const searchForURLId = (id, database) => {
  for (i in database) {
    if (i === id) {
      return true;
    }
  }
  return false;
};

const searchUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

const urlsForUser = (id, database) => {
  let validURLs = {};
  for (let url in database) {
    if (database[url].userID === id) {
      validURLs[url] = database[url];
    }
  }
  return validURLs;
};

module.exports = { generateRandomString, searchForURLId, searchUserByEmail, urlsForUser };