const { assert } = require('chai');

const { searchUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('searchUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = searchUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return a user with valid email', function() {
    const user = searchUserByEmail("user2@example.com", testUsers)
    const expectedUserID = "user2RandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return null when no user is found with the given email', function() {
    const user = searchUserByEmail("u@example.com", testUsers)
    assert.strictEqual(user, null);
  });
  it('should return null when given database is empty', function() {
    const user = searchUserByEmail("u@example.com", {})
    assert.strictEqual(user, null);
  });
});