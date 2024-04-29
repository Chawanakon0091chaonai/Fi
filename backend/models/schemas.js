const mongoose = require('mongoose')
const Schema = mongoose.Schema



const userSchema = new Schema ({
    name: {type:String}, 
    email: {type:String},
    pwd: {type:String},
})

const refreshSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users' },
    token: { type: String },
    createdAt: { type: Date, default: Date.now },
    expires: { type: Date, default: Date.now, expires: 60 * 60 * 24 } // Set expiration to 1 day
  })

  const imageSchema = new Schema ({
    imagename: {type:String},
    contentType: {type:String},
    data: {type:Buffer},
})

  

const Users = mongoose.model('Users', userSchema, 'users')
const Tokens = mongoose.model('Tokens', refreshSchema, 'tokens')
const Images = mongoose.model('Images', imageSchema, 'images')
const mySchemas = {'Users': Users, 'Tokens': Tokens, 'Images': Images}
module.exports = mySchemas