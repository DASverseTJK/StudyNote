### run the first server with port 3000
npm run devStart

### run the second server with new terminal with port 4000
npm run devStartAuth

### After 2 different servers are opened, go to /request.rest file
### and send request to /login to get token and replace to token in /post
### then try to log in. ==> replacing token is just to test with different user
### originally the token is set up with 'tj', so no need to change if you are not going to change user.


### 1. login -> generate accesstoken + refreshtoken
### 2. copy and paste refreshtoken to /token and /logout
### 3. /logout -> delete refreshtoken
### 4. /token -> forbidden -> because refreshToken is deleted
###     4-1 : this line will catch error
###             if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403).json({ message: "refresh token does not exists"});


