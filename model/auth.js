const User = require('../schemas/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const SEKRET_KEY = process.env.JWT_SECRET_KEY

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email })
    const validatedPass = await user.validPassword(password)
    if (!user || !validatedPass || !user.emailVerify) {
      return null
    }
    const id = user.id
    const payload = { id }
    const token = jwt.sign(payload, SEKRET_KEY, { expiresIn: '1h' })
    await updateToken(id, token)
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      emailVerify: user.emailVerify,
      subscription: user.subscription,
      token: token,
      createdAt: user.createdAt
    }
  } catch {
    return null
  }
}

const logout = async (userId) => {
  try {
    const user = await updateToken(userId, null)
    if (user) {
      return { token: user.token }
    } else {
      return null
    }
  } catch {
    return null
  }
}

const updateToken = async (userId, token) => {
  const updatedToken = await User.findByIdAndUpdate(
    { _id: userId },
    { token },
    { new: true }
  )
  return updatedToken
}

module.exports = {
  login,
  logout,
  updateToken
}
