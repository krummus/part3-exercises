require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

//load some apps from express and cors
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

//for debugging, create a morgan token
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {response.status(204).end()})
        .catch(error => next(error))
})

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(400)
            response.send(`No Entry Found for person in phonebook with ID: ${request.params.id}`)
        }
    })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.find({}).then(persons => {
        const totPersons = persons.length
        const timeDate = new Date()
        response.send(`<p>Phonebook has info for ${totPersons} people</p><p>${timeDate}</p>`)
    })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {

    const body = request.body
    console.log(body)

    if (body.name === undefined) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (body.number === undefined) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    Person.find({ $or : [{ name: { $regex: body.name,$options:'i' } }, { number: body.number }] })
        .then(persons => {
            const nameExists = persons.filter(person => person.name.toLowerCase() === body.name.toLowerCase()).length > 0 ? true : false
            const numberExists = persons.filter(person => person.number === body.number).length > 0 ? true : false

            console.log(nameExists)
            console.log(numberExists)

            person.save()
                .then(savedPerson => response.json(savedPerson))
                .then(savedAndFormattedPerson => response.json(savedAndFormattedPerson))
                .catch(error => next(error))
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})