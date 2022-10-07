const { assert } = require('chai');

const { urlsForUser } = require('../helpers.js');

const testURLs = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i7BmLo: {
    longURL: "https://www.facebook.com/",
    userID: "i7BmLo",
  }
};

describe('urlsForUser', function() {
  it('should return a valid URLs for given user ID', function() {
    const urls = urlsForUser("aJ48lW", testURLs)
    const expectedURLs = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      }
    };
    assert.deepEqual(urls, expectedURLs);
  });
  it('should return a valid URLs for given user ID', function() {
    const urls = urlsForUser("i7BmLo", testURLs)
    const expectedURLs = {
      i7BmLo: {
        longURL: "https://www.facebook.com/",
        userID: "i7BmLo",
      }
    };
    assert.deepEqual(urls, expectedURLs);
  });
  it('should return no URLs when no URLs for given user ID are present in database', function() {
    const urls = urlsForUser("i7BmLm", testURLs)
    assert.deepEqual(urls, {});
  });
  it('should return no URLs when database is empty', function() {
    const urls = urlsForUser("i7BmLm", {})
    assert.deepEqual(urls, {});
  });
});