# StudyNote

![화면 캡처 2023-05-22 170653](https://github.com/DASverseTJK/StudyNote/assets/131336470/4d37d622-ade3-44ca-b9d7-ea54b0569ed0)
- Back-end part of registration and login is done using Node.js and Postman


- Why login should be a POST request instead of a GET request?
  - When a user submits their credentials for login, it is important for the request to be sent via the POST method instead of GET. Here are the reasons:
  - Request Payload: When using POST, the data (credentials) is sent in the request body, which is not visible in the URL or browser history. 
    - This provides better security compared to GET requests, where data is appended to the URL and can be easily exposed.
  - Encryption with SSL/TLS: POST requests can be encrypted using protocols like SSL/TLS, ensuring that the data transmitted between the client and server is protected and cannot be easily intercepted or tampered with.
  - Caching: Unlike GET requests, POST requests are not cached by default. 
    - This reduces the risk of sensitive data being stored in caches or intermediate systems, minimizing the exposure of sensitive information.

- JWT (JSON Web Token): 
  - JWT is a compact, URL-safe means of representing claims between two parties. 
    - It is commonly used for authentication and authorization purposes in web applications. It consists of three parts: 
      - a header, a payload, and a signature. JWTs are often used to securely transmit user information and ensure the authenticity of the data.

- Authorization vs Authentication:
  - Authentication: 
    - It is the process of verifying the identity of a user, typically through credentials such as username and password. Authentication ensures that the user is who they claim to be.
  - Authorization: 
    - It is the process of determining what actions and resources a user is allowed to access based on their authenticated identity. 
    - Authorization verifies whether a user has the necessary permissions to perform certain operations or access specific resources.

- Session vs JWT:
  - Session: 
    - In session-based authentication, user information is stored on the server, and a session ID is sent to the client (often stored in a cookie). 
    - The server maintains the session data and uses the session ID to identify the user's session and perform authorization checks.
  - JWT: 
    - Instead of using cookies, JWTs are self-contained tokens that contain user information and are digitally signed. 
    - They are typically sent as a bearer token in the Authorization header of HTTP requests. 
    - JWTs are stateless, meaning the server does not need to store session data, making them more scalable in distributed systems.

![session vs jwt](https://github.com/DASverseTJK/StudyNote/assets/131336470/dd831f34-6201-4c8b-a061-78647ce17e55)
  
- Why JWT?
  -  Server creates a token in JWT format, encodes and serializes it, and uses a secret key for login.
  -  The token itself contains all the necessary information, reducing the burden on the server. The server does not need to store all user-related information.
  -  However, if any information within the token is modified, even a single piece of information, the token becomes invalid and cannot be used.

![1](https://github.com/DASverseTJK/StudyNote/assets/131336470/5e6a0bd2-05af-4827-9713-7902e52e5e8a)

  - Header
    - Algorithm used to encode and decode
    - Usually HS256 is being used to hash data
  - Payload
    - User Data
    - iat (issue at) : used to set up expiration date of token
  - Signature 
    - The most important part of JWT because this part is crucial for the server to verify whether the user has tampered with the token or not. 
    - The server decodes the hashed header and payload, and compares them with the secret key. 
    - This key is responsible for validating whether the token is authentic or not. 
    - It should be kept confidential and only known to the server. 
    - If this key is exposed, it can lead to security breaches and potential hacking attempts.

![servers](https://github.com/DASverseTJK/StudyNote/assets/131336470/ba151250-730e-4c62-a376-7cf5ebe1b48c)
- In the case of a company with multiple servers, users who have the JWT token do not need separate logins for each server. 
- With the master key (JWT), users can access both servers without the need for separate keys. 
- It can be compared to having a master key that can open multiple doors in a house (servers) without needing individual keys for each door.

- User Registration and Login:
  - [POST] Send Email Verification: When a user signs up, an email verification token is sent to the email provided by the user.
  - [POST] Sign up: Users create an account using the email and password they provide.
  - [POST] Login: Users can log in using the email and password they provided during registration or using their existing credentials.
  - [POST] Create both tokens: During login, both the refresh token and access token are generated.
  - [POST] Re-generating AccessToken: If the token expires or needs to be reissued, the token can be regenerated.
  - [GET] Post: Retrieves information about the user's posts (email and title) based on the logged-in user's email.
  - [DEL] Log out: This feature handles user logout. It removes the refresh token to delete the user's token. Upon logging in again, new tokens are generated.

- Server Port
  - Emailurl : 3000
  - Signupurl : 3001
  - Loginurl : 4000
  - Posturl : 4001

- DB
  - userT
  - emailT
  - tokenT
    - Options: Either saves token in server, DB, or set short time expiration date for logout.
    - In this project, saving into DB is selected for saving JWT tokens to set up logout
  - postT

- Stored Procedures
  - hashPasswordToInsert
    - Another way to hash password to save password into DB

![ddbb](https://github.com/DASverseTJK/StudyNote/assets/131336470/5213219c-ef81-4cb8-8d66-2d0cc6125019)


![G1-cash-Sequence Chart drawio (5)](https://github.com/DASverseTJK/StudyNote/assets/131336470/257b5a4c-6378-4a70-9298-815ed8382463)


- Error
  - EmailAuthServer (port 3000)
    - url	error code	message
      - /singup/send/auth	1001	'Failed to delete failed verification dummy users'<br>
      - /singup/send/auth	1002	'Invalid email format'<br>
      - /singup/send/auth	1003	'Internal server error'<br>
      - /singup/send/auth	1004	'User already exist. Use different email'<br>
      - /singup/send/auth	1005	'Fill out empty space'<br>
      - /singup/send/auth	1006	'failed inserting dum'<br>
  <br><br>
  - loginAuthServer (port 4000)<br>
    - url	error code	message<br>
      - /re-token	2001	'Error during token verification'<br>
      - /logout	2002	'Failed to retrieve refresh token from the database'<br>
      - /logout	2003	'Refresh token not found'<br>
      - /logout	2004	'Failed to delete refresh token'<br>
      - /logintoken	2005	'Could not find email'<br>
      - /logintoken	2006	'token insertion fail'<br>
      - /logintoken	2007	'Error getting users: '<br>
      - /logintoken	2008	'Cannot find user'<br>
      - /logintoken	2009	'not allowed'<br>
      - /logintoken	2010	'login fail'<br>
  <br><br>
  - signupServer (port 3001)<br>
    - url	error code	message<br>
      - /users	3001	'Cannot get users:'<br>
      - /users/signup	3002	'Invalid email format'<br>
      - /users/signup	3003	'Error getting user emails'<br>
      - /users/signup	3004	'Email already exists. Use Different Email'<br>
      - /users/signup	3005	'insertion error : '<br>
      - /users/signup	3006	'sign up fail'<br>
     <br><br>
  - postServer (port 4001)<br>
    - url	error code	message<br>
      - /post	4001	'token decoding fail'<br>
      - /post	4002	'Error getting post info'<br>
      - /post	4003	'token is null'<br>
      - /post	4004	'Token is not valid, No Access'<br>



