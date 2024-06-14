const express = require('express')
const morgan = require('morgan')
const app = express()

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
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
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

  if(!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  else if(!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  const personAlreadyAdded = persons.find(person => person.name === body.name)

  if(personAlreadyAdded){
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person)
  response.json(person)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})