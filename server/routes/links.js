const router = require('express').Router();
const Link = require('../models/Link');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid Token' });
    }
};

// 1. Get all links for logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const links = await Link.find({ userId: req.user.id });
        res.json(links);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 2. Add a new link
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, url } = req.body;
        if (!title || !url) {
            return res.status(400).json({ message: 'Please provide both title and url' });
        }

        const newLink = new Link({
            userId: req.user.id,
            title,
            url
        });

        const savedLink = await newLink.save();
        res.status(201).json(savedLink);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 3. Delete a link
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const link = await Link.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!link) return res.status(404).json({ message: 'Link not found' });
        res.json({ message: 'Link deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// 4. Get public links by username
router.get('/public/:username', async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const links = await Link.find({ userId: user._id });
        res.json({ username: user.username, links });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;