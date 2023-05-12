// this will allow us to use .env file
require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

app.use(express.json());

const posts = [
    {
        username: 'tj',
        title: 'post 1'
    },
    {
        username: 'aj',
        title: 'post 2'
    },
    {
        username: 'ej',
        title: 'post 3'
    },
]

app.get('/post', authenticateToken, (req, res) => {
    // Only user can access to the data
    res.json(posts.filter(post => post.username === req.user.name));
});

// middleware that will verify
function authenticateToken(req, res, next) {
    // header
    const authHeader = req.headers['authorization'];

    // Bearar TOKEN : split by space and get second one which is TOKEN
    // if we have authHeader, return token. if not return null
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401).json({message : "token is null"});

    // since we know we have validate token, we can validate
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403).json({message : "Token is not valid, No Access"});
        // we know that we have validate token, so set user
        req.user = user;
        // move on from our middleware
        next();
    })
}

app.listen(3000, () => { console.log("Server is Open now") });