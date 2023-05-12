/**
 * This file is just for authorization
 * https://www.youtube.com/watch?v=mbsmsi7l3r4
 */

// this will allow us to use .env file
require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

app.use(express.json())

// everytime program starts, token will be empty, so this should be replaced with db data
// delete will delete the user's token from list of refreshTokens
let refreshTokens = [];

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401).json({ message : "token not found"})
    // Do we have validate refresh tokens?
    // after deleting refreshtoken, this will return error because user doees not have token
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403).json({ message: "refresh token does not exists"});
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403).json({ message : " error"});

        const accessToken = generateAccessToken({ name : user.name });
        res.json({ accessToken: accessToken });
    })

});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204).json({ message : "Successfully deleted token"});
})

// since we are creating token, it is post
app.post('/login', (req, res) => {
    // authenticate User
    
    const username = req.body.username;
    const user = { name: username };

    // creating token
    const accessToken = generateAccessToken(user);
    // simply recreate token using same user
    // serializes token with refresh token
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken)

    res.json({ accessToken: accessToken, refreshToken: refreshToken });
    
});

// generate Access Token within expires time
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
}

app.listen(4000, () => { console.log("Server is Open now") });