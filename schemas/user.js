const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')

const { Schema } = mongoose
const SALT_FACTOR = 6

const userSchema = new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate(value) {
      const re = /\S+@\S+\.\S+/
      return re.test(String(value).toLowerCase())
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter'
  },
  token: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: function () {
      return gravatar.url(this.email, { s: '50' }, true)
    }
  },
  verifyToken: {
    type: String,
    required: [true, 'Verify token is required']
  },
  emailVerify: {
    type: Boolean,
    default: false
  }
}, { versionKey: false, timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(
    this.password,
    bcrypt.genSaltSync(SALT_FACTOR)
  )
  next()
})

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('users', userSchema)

module.exports = User
