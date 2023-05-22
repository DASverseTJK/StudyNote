/**
 * This file is just for authorization
 * https://www.youtube.com/watch?v=mbsmsi7l3r4
 * /users/login and /logintoken needs to be in one address, but they are separated for educational reason to explain to others
 */

// this will allow us to use .env file
require('dotenv').config();
const mysql = require('mysql');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'testpw',
    database: 'g1cash'  
});
  
app.use(express.json())

let errors = [
    { code : 2001, message : 'Error during token verification'  },
    { code : 2002, message : 'Failed to retrieve refresh token from the database' },
    { code : 2003, message : 'Refresh token not found'},
    { code : 2004, message : 'Failed to delete refresh token' },
    { code : 2005, message : 'Could not find email' },
    { code : 2006, message : 'token insertion fail' },
    { code : 2007, message : 'Error getting users: ' },
    { code : 2008, message : 'Cannot find user' },
    { code : 2009, message : 'not allowed' },
    { code : 2010, message : 'login fail' }
]



// everytime program starts, token will be empty, so this should be replaced with db data
// delete will delete the user's token from list of refreshTokens
let refreshTokens = [];

app.post('/re-token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401).json({ message : "token not found"})
    // Do we have validate refresh tokens?
    // after deleting refreshtoken, this will return error because user doees not have token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          console.error('Token verification error:', err);
          const error = errors.find(err => err.code === 2001);
          return res.sendStatus(403).json(error);
        }
      
        // Proceed with generating and sending the new access token
        const accessToken = generateAccessToken({ useremail: user.useremail });
        res.json({ accessToken: accessToken });
      });
});

/**
 * By deleting refreshToken from tokenT where stores refreshToken, user will not have any access to any information in server
 * To get new refreshToken, user needs to login to get new refreshToken
 */
app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token;
    
    // Perform a database query to retrieve the refresh token
    const query = `SELECT refreshToken FROM tokent WHERE refreshToken = ?`;
    con.query(query, [refreshToken], (err, result) => {
        // could not execute query
        if (err) {
        console.error('Error retrieving refresh token:', err);
        const error = errors.find(err => err.code === 2002);
        return res.status(500).json(error);
      }
      // when Token is not in DB 
      if (result.length === 0) {
        // Token not found in the database
        const error = errors.find(err => err.code === 2003);
        return res.status(404).json(error);
      }
      
      // Delete the refresh token
      const deleteQuery = `DELETE FROM tokent WHERE refreshToken = ?`;
      con.query(deleteQuery, [refreshToken], (err, result) => {
        if (err) {
          console.error('Error deleting refresh token:', err);
          const error = errors.find(err => err.code === 2004);
          return res.status(500).json(error);
        }
        // deleted
        res.status(200).json({ message: 'Refresh token successfully deleted' });
      });
    });
  });
  
/**
 * Since we are creating token, it is post,
 * it does nothing but generating refresh and accesstoken using the username
 * needs to be added in UserAuth-pwLogin /users/login and change name to useremail.
 */

app.post('/logintoken', (req, res) => {
    // authenticate User
     
    const useremail = req.body.useremail;
    const user = { useremail: useremail };

    let uid = 0;
    const queryuid = `select uid from usert where useremail = ?`;
    con.query(queryuid, [useremail], (err, rows) => {
        if (err) {
            const error = errors.find(err => err.code === 2005);
            return res.status(403).json(error);
        } else {
            uid = rows[0].uid;

                    // creating token
            const accessToken = generateAccessToken(user);
            // simply recreate token using same user
            // serializes token with refresh token
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            const query = `insert into tokent (uid, refreshToken) values (?,?)`
            con.query(query, [uid, refreshToken], (err, rows) => {
                if (err) {
                    const error = errors.find(err => err.code === 2006);
                    return res.status(403).json(error);
                }
                else {
                    res.json({ accessToken: accessToken, refreshToken: refreshToken });
                }
            });
        }
    })

    
});

// generate Access Token within expires time
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3m' });
}



// ============================================== 밑에 로그인이랑 바로 위에 로그인 토큰이랑 합쳐 =================



/**
 * [POST] /users/login
 * Due to security reasons, login has to be POST: POST does not store anything in cache
 * Program let users login with their email and password. 
 * Program decrypt hashed password to check validation
 * Checks :
 *          - email already exist
 * 
 * Error :  - user not found
 *          - credential not validate
 */
// need to have async to use bcrypt.compare
app.post('/users/login', async (req, res) => {
    const query = `Select * from usert where useremail = ?`;

    // grab input email and search information in usert DB of that email
    // then decode encrypted password and compare those two password to validate login
    con.query(query, [req.body.useremail] , async (err, result) => {
        if (err) {
            console.error('Error getting users: ', err);
            const error = errors.find(err => err.code === 2007);
            return res.status(500).send(error);
        }
        // encrypted password from DB
        const user = result[0];
        if (!user) {
            const error = errors.find(err => err.code === 2008);
            return res.status(400).send(error);
        }

        try {
            // bcrypt.compare does :
                // hash req.body.password
                // remove salt from user.password
                // then compare whether both are same or not.
                // ==> hashed password from req === hashed passwrod from user
                // bcrypt can prevent timing attack
            if(await bcrypt.compare(req.body.password, user.password)) {
                return res.send('Success');
            } else {
                const error = errors.find(err => err.code === 2009);
                // not allowed
                return res.status(400).send(error);
            }
        } catch (error) {
            // login fail
            const errorr = errors.find(err => err.code === 2010);
            res.status(500).send(errorr);
        }
     });
});


app.listen(4000, () => { console.log("Server is Open now") });