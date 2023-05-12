# StudyNote

=== JWT ===
- reference : https://www.youtube.com/watch?v=7Q17ubqLfaM
- What is JWT?
  -  Just for Authorization, not Authentication
    - Authroization  : Mkaing sure who sends requests to your server is same user during Authentication
    - Authentication : Logging user in
  - Session:
    - send down id into cookie. send session id to server and check user memory in server, then Authroization
  - JWT :
    - uses Json web token, not cookie
    
![1](https://github.com/DASverseTJK/StudyNote/assets/131336470/ab7eb05a-72ef-42be-9840-e025ca968103)
 
 - Why JWT?
   - Server creates toekn in JWT and encode and serizlie then signs with own secret key, so server can validate with own signed key.
   - JWT contains all the information and server does not save anything.
   - Client can save any where that can want to save into.
   - If client changes anything in token, server won't validate
   - If client sends validat token, server deserialize the token and sends back the result of the token (validate/not validate).
 - Session vs JWT
   - Session
     - Session stores data in server
     - Session has to lookup the user to find user ID
   - JWT
     - JWT does not have to remember anything and do not have to find any information because JWT(token) contains all the information that they need.

- Header, Payload, Signature (separated by '.')
- 
![1](https://github.com/DASverseTJK/StudyNote/assets/131336470/677e5bd6-5fcc-45d9-ba69-d367d06e7049)

  - Header
    - Algorithm to use encode and decode
  - Payload
    - Data ( all the information in token )
    - iat : issue at; when the token is created
      -  Can be used to expire the token
  - Signature (MOST IMPORTANT)
    - verifies token hasn't been changed before client sends back to server
    - In encoded key:
      - format : header.payload.signature
      - server will decode header.payload and hash it to compare with your secret key.
      - User will not get signature section so that only server can validate other people's token.
      - Warning: if your secret key, signature, is stolen, anyone can hack your user's key


- JWT is Amazing!
- ![1](https://github.com/DASverseTJK/StudyNote/assets/131336470/1371ba4e-2046-44b6-9f45-189411bf4882)
- If you use session key, client has to log in "bank" and "retirement" twice, but if user shares same JWT to "bank" and "retirement", user will be authenticated to both server and do not have to log back in.
  - how this works?
    - because user saves the token not the server! Meaning many different servers do not have to do anything because user is holding the token
    - For example, let's say there are two different doorlocks(server) and user has masterkey(JWT) that works with both of doorlocks, then user do not have to use two separate keys.
