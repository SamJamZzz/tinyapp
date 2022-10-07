const { assert } = require('chai');

const { searchForURLId } = require('../helpers.js');

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

describe('searchForURLId', function() {
  it('should return true when URL of a given ID is present in database', function() {
    assert.isTrue(searchForURLId('i3BoGr', testURLs))
  });
  it('should return true when URL of a given ID is present in database', function() {
    assert.isTrue(searchForURLId('i7BmLo', testURLs))
  });
  it('should return false when URL of a given ID is not present in database', function() {
    assert.isFalse(searchForURLId('i7BmLm', testURLs))
  });
  it('should return false when given database is empty', function() {
    assert.isFalse(searchForURLId('i7BmLm', {}))
  });
});