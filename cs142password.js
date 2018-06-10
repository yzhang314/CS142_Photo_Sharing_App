"use strict";
/* jshint node: true */

var crypto = require('crypto');

/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 */
function makePasswordEntry(clearTextPassword) {

    var salt = crypto.randomBytes(8).toString('hex');
    var hash = crypto.createHash('sha1');
    hash.update(clearTextPassword + salt);

    var passwordEntry = {};
    passwordEntry.salt = salt;
    passwordEntry.hash = hash.digest('hex');

    return passwordEntry;


}

/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {

    var hash1 = crypto.createHash('sha1');
    hash1.update(clearTextPassword + salt);
    var generatedPassword = hash1.digest('hex');

    if (generatedPassword === hash) {
        return true;
    }

    return false;


}

module.exports = {
    makePasswordEntry: makePasswordEntry,
    doesPasswordMatch: doesPasswordMatch
};