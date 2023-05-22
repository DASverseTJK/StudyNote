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

let errors = [
    { code : 3001, message : 'Cannot get users:' },
    { code : 3002, message : 'Invalid email format' },
    { code : 3003, message : 'Error getting user emails'},
    { code : 3004, message : 'Email already exists. Use Different Email' },
    { code : 3005, message : 'insertion error : ' },
    { code : 3006, message : 'sign up fail'}
]



/**
 * [GET] /user
 * Will get all of users from usert DB
 * Error: Cannot get users 
 */
app.get('/users', (req, res) => {
    con.query('SELECT * FROM usert', (err, rows) => {
        if (err) {
          console.error('Cannot get users:', err);
          const error = errors.find(err => err.code === 3001);
          res.status(500).send(error);
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
        const error = errors.find(err => err.code === 3002);
        return res.status(400).send(error);
    }

    // dfslsdaf ==> even though password is same all the time, 
    // salt makes the password different each time
    // hash(salt + 'password') 

    // email verification is no done
    // const verify = `select emailverification from dumy_user where useremail = ?`;
    // con.query(verify, req.body.useremail, (err, rows) => {
    //    if(verify != req.body.) 
    // });


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

        // Email existance query
        const userEmail = req.body.useremail;
        const EmailCheckquery = 'select * from usert where useremail = ?';
        // Checks email duplication. 
        con.query(EmailCheckquery, [userEmail], (err, rows) => {
            if (err) {
                console.error('Error getting user emails', err);
                const error = errors.find(err => err.code === 3003);
                return res.status(500).send(error);
            }
            // if user input userEmail is found, return error
            if(rows.length > 0) {
                const error = errors.find(err => err.code === 3004);
                //'Email already exists. Use Different Email'
                return res.status(400).send(error);
            } else {
                // if there is not duplicated data in DB,
                // Insert email and password from user into DB
                const query = `insert into usert (useremail, password) values ('${user.useremail}', '${user.password}')`;
                const values = [user.useremail, user.password];
                // If everything passes, insert new user!
                con.query(query, values, (err, result) => {
                    if (err) {
                        console.error('insertion error : ', err);
                        const error = errors.find(err => err.code === 3005);
                        return res.status(500).send(error)
                    }
                    // console.log("User Created" + user.useremail);
                    return res.status(201).json("User Created");
                });
            }
        });
    } catch {
        // 'sign up fail'
        const error = errors.find(err => err.code === 3006);
        res.status(500).send(error);
    }

});

app.listen(3001, () => { console.log("Server is open now")});