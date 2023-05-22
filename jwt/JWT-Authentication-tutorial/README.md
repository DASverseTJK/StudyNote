### run the first server with port 3000
npm run devStart

### run the second server with new terminal with port 4000
npm run devStartAuth

### After 2 different servers are opened, go to /request.rest file
### 1. /login to get token
### 2. replace the token in /post
### 3. try to log in ==> replacing token is just to test with different user
### 4. originally the token is set up with 'tj', so no need to change if you are not going to change user.

## STEPS ( exclude deleting token )
### 1. send request to /login -> generate accesstoken + refreshtoken
### 2. copy and paste 'refreshtoken' to token section in /token and /logout
### 3. send request to /token -> generate user's information

## STEPS ( include deleting token )
### 1. send request to login -> generate accesstoken + refreshtoken
### 2. copy and paste 'refreshtoken' to token section in /token and /logout
### 3. /logout -> delete refreshtoken
### 4. /token -> forbidden -> because refreshToken is deleted
###     4-1 : Exception handling
###             if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403).json({ message: "refresh token does not exists"});


