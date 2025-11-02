const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const db = admin.database();
const blockedIPsRef = db.ref('blockedIPs');

// Nodemailer 설정
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '(gmail)', // Gmail 계정
        pass: '(gmail 앱비번)', // Gmail 앱비번
    },
});

const URL = 'https://sdrwebsitebeta-5aa7d.firebaseapp.com';

module.exports = {
    functions,
    admin,
    nodemailer,
    db,
    blockedIPsRef,
    mailTransport,
    URL
};