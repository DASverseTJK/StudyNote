# StudyNote

=== JWT ===
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

- Header, Payload, Signature
![1](https://github.com/DASverseTJK/StudyNote/assets/131336470/677e5bd6-5fcc-45d9-ba69-d367d06e7049)

  - Header
    - Algorithm to use encode and decode
  - Payload
    - Data ( all the information in token )
  - Signature
    - MOST IMPORTANT: verifies token hasn't been changed before client sends back to server
