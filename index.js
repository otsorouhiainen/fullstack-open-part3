require('dotenv').config()

const express = require('express')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (request, response) => JSON.stringify(request.body))

const modifiedTinyConfiguration = ':method :url :status :res[content - length] - :response-time ms :body'


app.use(express.json())
app.use(morgan('tiny'))

app.use((req, res, next) =>{
  if(req.method === 'POST'){
    morgan(modifiedTinyConfiguration)(req,res,next)
  }else{
    next()
  }
})

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122"
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  const date = new Date()
  response.send('<div>Phonebook has info for ' + persons.length + ' people </div>' + date)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons =>{
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person =>{
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) =>{
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

const generateId = () =>{
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}
app.post('/api/persons', (request, response) =>{
  const body = request.body

  if(body.name === undefined) {
    return response.status(400).json({error: 'name missing'})
  }
  if(body.number === undefined) {
    return response.status(400).json({error: 'number missing'})
  }
  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson =>{
    response.json(savedPerson)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})