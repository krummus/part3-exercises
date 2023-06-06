var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

var personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true,
        unique: true
    },
    number: {
        type: String,
        unique: true,
        minlength: 9,
        maxlength: 11,
        validate: {
            validator: function (v) {
                return /^\d{2,3}-\d{5,6}/.test(v)
            },
            message: props => `${props.value} is not a valid phone number! Requires 10 Numbers of the format xx-xxxxxxxx or xxx-xxxxxxx`
        },
        required: [true, 'User phone number required']
    }
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)