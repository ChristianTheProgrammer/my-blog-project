require('dotenv').config();
const express = require('express');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

const USERNAME = process.env.USERNAME;
const PASSWORD_HASH = process.env.PASSWORD_HASH;

console.log('Loaded USERNAME:', USERNAME);
console.log('Loaded PASSWORD_HASH:', PASSWORD_HASH);

app.use(express.static('public'));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if you are using HTTPS
        httpOnly: true,
        maxAge: 60000 // Set session expiration time (e.g., 1 minute)
    }
}));

app.get('/posts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    fs.readFile('posts.json', (err, data) => {
        if (err) throw err;
        const posts = JSON.parse(data);
        const paginatedPosts = posts.slice(startIndex, endIndex);
        res.json({
            page,
            limit,
            total: posts.length,
            totalPages: Math.ceil(posts.length / limit),
            posts: paginatedPosts
        });
    });
});

app.post('/add-post', (req, res) => {
    if (!req.session.loggedIn) {
        console.log('Unauthorized attempt to add post');
        return res.status(401).send('Unauthorized');
    }

    const newPost = req.body;

    fs.readFile('posts.json', (err, data) => {
        if (err) throw err;
        const posts = JSON.parse(data);
        posts.push(newPost);

        fs.writeFile('posts.json', JSON.stringify(posts), err => {
            if (err) throw err;
            res.status(201).send();
        });
    });
});

app.put('/edit-post/:id', (req, res) => {
    if (!req.session.loggedIn) {
        console.log('Unauthorized attempt to edit post');
        return res.status(401).send('Unauthorized');
    }

    const postId = parseInt(req.params.id);
    const updatedPost = req.body;

    fs.readFile('posts.json', (err, data) => {
        if (err) throw err;
        const posts = JSON.parse(data);
        const postIndex = posts.findIndex(post => post.id === postId);

        if (postIndex === -1) {
            return res.status(404).send('Post not found');
        }

        posts[postIndex] = updatedPost;

        fs.writeFile('posts.json', JSON.stringify(posts), err => {
            if (err) throw err;
            res.status(200).send();
        });
    });
});

app.delete('/delete-post/:id', (req, res) => {
    if (!req.session.loggedIn) {
        console.log('Unauthorized attempt to delete post');
        return res.status(401).send('Unauthorized');
    }

    const postId = parseInt(req.params.id);

    fs.readFile('posts.json', (err, data) => {
        if (err) throw err;
        const posts = JSON.parse(data);
        const updatedPosts = posts.filter(post => post.id !== postId);

        if (posts.length === updatedPosts.length) {
            return res.status(404).send('Post not found');
        }

        fs.writeFile('posts.json', JSON.stringify(updatedPosts), err => {
            if (err) throw err;
            res.status(200).send();
        });
    });
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again later.'
});

app.post('/login', loginLimiter, 
    body('username').isAlphanumeric().escape(),
    body('password').isLength({ min: 5 }).escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        console.log('Login attempt:', username);

        if (username === USERNAME) {
            console.log('Username match');
            bcrypt.compare(password, PASSWORD_HASH, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).send('Internal server error');
                }

                console.log('Password comparison result:', result);

                if (result) {
                    req.session.loggedIn = true;
                    console.log('Login successful');
                    res.status(200).send();
                } else {
                    console.log('Password mismatch');
                    res.status(401).send('Invalid credentials');
                }
            });
        } else {
            console.log('Username mismatch');
            res.status(401).send('Invalid credentials');
        }
    }
);

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.status(200).send();
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
