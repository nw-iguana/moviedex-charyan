require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const moviedb = require('./moviedb.json')

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(helmet())

app.use(handleServerError)
app.use(validateApiKey)

app.get('/movie', respondToGetRequest)

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`)
})


function handleServerError(error, req, res, next) {
    let response

    if (process.env.NODE_ENV === 'production') {
        response = { error:  { message: 'server error' } }
    }
    else {
        response = { error }
    }

    return res.status(500).json(response)
}

function validateApiKey(req, res, next) {
    const userKey = process.env.API_KEY
    const authKey = req.get('Authorization')

    if (!authKey || authKey.split(' ')[1] !== userKey) {
        return res.status(401).json({ error: "Unauthorized request" })
    }
    else {
        next()
    }
}

function respondToGetRequest(req, res) {
    const { genre, country, avg_vote } = req.query
    let response = moviedb

    if (genre) {
        response = response.filter(movie => {
            return movie.genre.toLowerCase().includes(genre.toLowerCase())
        })
        if (!response.length) {
            return res.status(400).json({ "Error": "No movies with that genre!" })
        }
    }

    if (country) {
        response = response.filter(movie => {
            return movie.country.toLowerCase().includes(country.toLowerCase())
        })
        if (!response.length) {
            return res.status(400).json({ "Error": "No movies in that country!" })
        }
    }

    if (avg_vote) {
        if (isNaN(avg_vote)) {
            return res.status(400).json({ "Error": "Average vote must be a number!" })
        }
        if (avg_vote >= 10 || avg_vote < 1) {
            return res.status(400).json({ "Error": "Average vote must be between 1 and 9.9!" })
        }
        response = response.filter(movie => {
            return movie.avg_vote >= avg_vote
        })
    }

    return res.status(200).json(response)
}