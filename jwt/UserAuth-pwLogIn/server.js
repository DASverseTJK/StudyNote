const express = require('express');
const app = express();
const bcrypt = require('bcrypt')
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'testpw',
    database: 'g1cash'  
});
app.use(express.json());

/**
 * [GET] /user
 * Will get all of users from usert DB
 * Error: Cannot get users 
 */
app.get('/users', (req, res) => {
    con.query('SELECT * FROM usert', (err, rows) => {
        if (err) {
          console.error('Cannot get users:', err);
          res.status(500).send();
          return;
        }
        // Do not need to set users = rows but if code gets bigger, it is better for to read.
        const users = rows;
        res.json(users);
      });
});

/**
 * [POST] /signup
 * Will create new users and insert into DB 'usert'
 * Check :  - User has to keep email format to sign in
 *          - Email existance
 * hashedPw : using bcrypt and hash, encrypt user password to prevent from hacking
 * Error: insertion error, invalid email format error, try catch error
 */
app.post('/users/signup', async (req,res) => {
    // let user keep their email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.useremail)) {
      return res.status(400).send('Invalid email format');
    }

    // dfslsdaf ==> even though password is same all the time, 
    // salt makes the password different each time
    // hash(salt + 'password') 

    try {
        /** 
         * = hashedPW =
         * larger number will be more secure but it will take longer
         * 10 may take 10 seconds but 20 may take couple days
         * this will auto generate salt so that program does not have to generate
         * 
         * */ 
        const hashedPW = await bcrypt.hash(req.body.password, 10);

        /**
         *  = Option 2 = for hashing Password using salt.
         * salt won't be needed once it is replaced by 10.
         * const salt = await bcrypt.genSalt()
         * const hashedPW = await bcrypt.hash(req.body.password, salt);
         * 
         * salt : $2b$10$LDen03lIye63G0oia1UaEu
         * hash : nYijL2EUYu5.SapiNW4prS9tX1y5CHW
         * hashedPW : $2b$10$LDen03lIye63G0oia1UaEunYijL2EUYu5.SapiNW4prS9tX1y5CHW
         * console.log(salt);
         * console.log(hashedPW);
         * 
         * how decrypt works: hash is being saved in  hashpassword
         * How to decrypt : grab just hashedpassword and compare the other version with different salt
         */
        
        // Creating user information using input
        const user = { useremail: req.body.useremail, password : hashedPW }

        // I believe we can just use req.body.name and password as hashedPW
        const query = `insert into usert (useremail, password) values ('${user.useremail}', '${user.password}')`;
        const values = [user.useremail, user.password];
        
        // Email existance query
        const userEmail = req.body.useremail;
        const EmailCheckquery = 'select * from usert where useremail = ?';
        // brackets[] around userEmail will treat userEmail as parameter value not column name and ensures the value
        con.query(EmailCheckquery, [userEmail], (err, rows) => {
            if (err) {
                console.error('Error getting user emails', err);
                return res.status(500).send();
            }
            // if user input userEmail is found, return error
            if(rows.length > 0) {
                return res.status(400).send('Email already exists. Use Different Email');
            }
        })

        // Insertion query
        con.query(query, values, (err, result) => {
            if (err) {
                console.error("insertion error : ", err);
                return res.status(500).send();
            }
            // console.log("User Created" + user.useremail);
            return res.status(201).send();
        });
    } catch {
        res.status(500).send();
    }

});

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
app.post('/users/login', async (req, res) => {
    const query = `Select * from usert where useremail = '${req.body.useremail}'`;

    // grab input email and search information in usert DB of that email
    // then decode encrypted password and compare those two password to validate login
    con.query(query, async (err, result) => {
        if (err) {
            console.err('Error getting users: ', err);
            return res.status(500).send();
        }
        // encrypted password from DB
        const user = result[0];
        if (!user) {
            return res.status(400).send("Cannot find user");
        }

        try {
            // bcrypt.compare does :
                // hash req.body.password
                // remove salt from user.password
                // then compare whether both are same or not.
                // ==> hashed password from req === hashed passwrod from user
                // bcrypt can prevent timing attack
            if(await bcrypt.compare(req.body.password, user.password)) {
                res.send('Success');
            } else {
                res.send("not allowed");
            }
        } catch (error) {
            res.status(500).send();
        }
     });
});


app.listen(5000, () => { console.log("Server is open now")});