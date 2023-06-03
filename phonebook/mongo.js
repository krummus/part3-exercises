const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}else if (process.argv.length < 5 && process.argv.length > 3) {
    console.log('Please provide a name followed by a number after password as an argument: node.mongo.js <password> <name> <number>')
}

const password = process.argv[2]
const argname = process.argv[3]
const argnumber = process.argv[4]

const url =
  `mongodb+srv://backend-user:${password}@cluster0.brutf.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const person = new Person({
        name: argname,
        number: argnumber,
    })

    person.save().then(() => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}