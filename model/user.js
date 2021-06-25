const fs = require('fs')
const path = require('path')
const jimp = require('jimp')
const { v4: uuidv4 } = require('uuid')
// const gravatar = require('gravatar')

const User = require('../schemas/user')

const IMG_DIR = path.join(process.cwd(), 'public', 'avatars')

const getuserById = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId })
    return user
  } catch {
    return {}
  }
}

const getuserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email })
    return user
  } catch {
    return {}
  }
}

const getuserByToken = async (token) => {
  try {
    const modifiedToken = token.split(' ')
    const user = await User.findOne({ token: modifiedToken[1] })
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      token: user.token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch {
    return null
  }
}

const getUserByVerifyToken = async (token) => {
  try {
    const user = await User.findOne(token)
    return user
  } catch {
    return null
  }
}

const addUser = async (body) => {
  try {
    const verifyToken = uuidv4()
    const response = await User.create({ ...body, verifyToken: verifyToken })
    return response
  } catch {
    return {}
  }
}

const updateUserVerifyStatus = async (user) => {
  const updatedUser = await User.findByIdAndUpdate(
    { _id: user._id },
    { emailVerify: true, verifyToken: null },
    { new: true }
  )
  return updatedUser
}

const updateSubscriptionUser = async (userId, body) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { ...body },
      { new: true }
    )
    return updatedUser
  } catch {
    return {}
  }
}

const updateAvatar = async (user, file) => {
  const avatar = await jimp.read(file.path)
  const fileName = `${user.email}-${file.originalname}`
  await avatar.autocrop().cover(250, 250, jimp.HORIZONTAL_ALIGN_CENTER || jimp.VERTICAL_ALIGN_MIDDLE).writeAsync(file.path)
  await fs.rename(file.path, path.join(IMG_DIR, fileName), err => err)
  try {
    const userId = user._id
    const avatarPath = path.join(IMG_DIR, fileName)
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { avatar: avatarPath },
      { new: true }
    )
    return updatedUser
  } catch {
    return null
  }
}

module.exports = {
  getuserById,
  getuserByEmail,
  addUser,
  updateSubscriptionUser,
  getuserByToken,
  updateAvatar,
  getUserByVerifyToken,
  updateUserVerifyStatus
}
