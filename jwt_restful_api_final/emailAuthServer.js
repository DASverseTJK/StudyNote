const mysql = require('mysql');

const express = require('express');
const app = express();
const path = require('path');
const nodemailer = require ('nodemailer');
const crypto = require('crypto');
app.use(express.json());


const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'testpw',
    database: 'g1cash'  
  });
  
let errors = [
    { code : 1001, message : 'Failed to delete failed verification dummy users' },
    { code : 1002, message : 'Invalid email format' },
    { code : 1003, message : 'Internal server error' },
    { code : 1004, message : 'User already exist. Use different email' },
    { code : 1005, message : 'Fill out empty space' },
    { code : 1006, message : 'failed inserting dum' }
]


app.post('/signup/send/auth', (req, res) =>{
    // delete failed verification dummy
    const currDate = new Date();
    const expiredUser = `DELETE FROM dumy_user WHERE expiration_date < ?`
    con.query(expiredUser, [currDate], (err, result) => {
        if (err) {
          // console.error('Failed to delete failed verification dummy users', err);
          const error = errors.find(err => err.code === 1001);
          return res.status(500).send(error);
        }
        else {
            console.log("expired user deleted");
        }
      });
      


    const inputEmail = req.body.useremail

    // let user keep their email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
        const error = errors.find(err => err.code === 1002);
        return res.status(400).send(error);
    }

    // if password and confirmPassword is matched, rest of code will be processed ==> next() function from confirmPw
    function generateToken() {
        return crypto.randomBytes(16).toString('hex');
    }
    // generate random token and save to send
    const verificationToken = generateToken();

    // this is my own actual gamil account to test thie email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            // own gmail account to send email.
          user: 'testAcc8150@gmail.com',
          pass: 'vkzncvuameukbrdi'
        }
    });

    // users.verify = verificationToken;

    const Emailquery = `select useremail from usert where useremail = ?`;
    let userExists;

    con.query(Emailquery, [inputEmail], (err, rows) => {
        if (err) {
            console.error('Error, email not found', err);
            const error = errors.find(err => err.code === 1003);
            return res.status(500).send(error);
        }
        // console.log(rows);
        userExists = rows;
        // console.log(userExists);
        if( userExists.length > 0 ) {
            console.log("user exist");
            const error = errors.find(err => err.code === 1004);
            return res.status(409).json(error);
        } else if( inputEmail == "" || verificationToken == "" ) {
            console.log("empty space");
            const error = errors.find(err => err.code === 1005);
            return res.status(400).json(error);
        }
    });

    // setting up 3 min expiration_date to verify
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 3);

    // inserting dummy user to verify email verification
    const insertDumUser = `insert into dumy_user (useremail, emailverification, expiration_date) values (?,?,?)`;
    con.query(insertDumUser, [inputEmail, verificationToken, expirationDate], (err, rows) => {
        if (err) {
            // console.error("failed inserting dum", err);
            const error = errors.find(err => err.code === 1006);
            return res.status(500).send(error);
        }
        else if(userExists.length == 0) {
            console.log("dummy user set up waiting for verification");
        }
    });

    // sending emails
    const mailOptions = {
        from : 'testAcc8150@gmail.com',
        to: inputEmail,
        subject: 'Email Verficiation from G1-CASH',
        text : `Please click on the following link to verify your email address to sign up G1-Cash: '\n' ${verificationToken}`
    };

    // transporter that sends mail.
    transporter.sendMail(mailOptions, (error, info) => {
        if(error) { console.log(error);                           }
        else      { console.log ('Email sent: ' + info.response); }
    });

    // SENT
    res.json( {
        ok: true, 
        message : 'Verification token sent' , 
        emailverification : verificationToken, 
        useremail : inputEmail
    });
});

// http://localhost:3000
app.listen(3000, () => console.log("G1 CASH Admin Homepage is OPEN"));