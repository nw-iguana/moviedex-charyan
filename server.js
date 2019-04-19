require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const moviedb = require('./moviedb.json');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(validateApiKey);
app.use(helmet());

app.listen(8000, () => {
    console.log('Server started on http://localhost:8000');
});

app.get('/movie', respondToGetRequest)

function respondToGetRequest(req, res) {
    const { genre, country, avg_vote } = req.query;
    let response = moviedb;

    if(genre) {
        response = response.filter(movie => {
            return movie.genre.toLowerCase().includes(genre.toLowerCase());
        })
        if(!response.length) {
            res.status(400).json({ "Error": "No movies with that genre!" });
        }
    }

    if(country) {
        response = response.filter(movie => {
            return movie.country.toLowerCase().includes(country.toLowerCase());
        })
        if(!response.length) {
            res.status(400).json({ "Error": "No movies in that country!" });
        }
    }

    if(avg_vote) {
        if(isNaN(avg_vote)) {
            res.status(400).json({ "Error": "Average vote must be a number!" });
        }
        if(avg_vote >= 10 || avg_vote < 1) {
            res.status(400).json({ "Error": "Average vote must be between 0 and 9.9!" });
        }
        response = response.filter(movie => {
            return movie.avg_vote >= avg_vote;
        })
    }

    res.status(200).json(response);
}


function validateApiKey(req, res, next) {
    const userKey = process.env.API_KEY;
    const authKey = req.get('Authorization');

    if(!userKey || authKey.split(' ')[1] !== userKey) {
        res.status(401).json({ "Error": "Unauthorized request" });
    }
    next();
}