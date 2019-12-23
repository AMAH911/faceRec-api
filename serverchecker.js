const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const app = express();

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: '',
        password: '',
        database: 'smartbrain'
    }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db
        .select('email', 'hash')
        .from('login')
        .where('email', '=', req.body.email)
        .then((data) => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db
                    .select('*')
                    .from('users')
                    .where('email', '=', email)
                    .then((user) => {
                        console.log(user);
                        res.json(user[0]);
                    })
                    .catch((err) => res.status(400).json('unable to get user'));
            }
        })
        .catch((err) => res.status(400).json(err));
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password);
    db
        .transaction((trx) => {
            return trx
                .insert({
                    hash: hash,
                    email: email
                })
                .into('login')
                .returning('email')
                .then((loginEmail) => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            name: name,
                            email: loginEmail[0],
                            joined: new Date()
                        })
                        .then((user) => {
                            res.json(user[0]);
                        });
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
        .catch((err) => res.status(400).json(err));
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

    db.select('*').from('users').where({ id }).then((user) => {
        if (user.length) {
            res.json(user[0]);
        } else {
            res.status(400).json('error getting user');
        }
    });
    // if (!found) {
    //     res.status(400).json('Hmmm');
    // }
});

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then((entries) => {
            res.json(entries[0]);
        })
        .catch((err) => res.status(400).json('unable to get entires'));
});

// Load hash from your password DB.

app.listen(3000, () => {
    console.log('App is listening on port 3000');
});