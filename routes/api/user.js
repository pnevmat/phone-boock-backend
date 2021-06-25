const express = require('express')
const { validateCreateUser, validateUpdateSubscriptionUser, validateVerifyUserEmail } = require('../../validation/validateUser')

const upload = require('../../helpers/uploaders')
const { sendEmail } = require('../../helpers/emailSender')

const router = express.Router()

const {
  getuserByEmail,
  addUser,
  updateSubscriptionUser,
  getuserByToken,
  updateAvatar,
  getUserByVerifyToken,
  updateUserVerifyStatus
} = require('../../model/user.js')
const {
  login,
  logout
} = require('../../model/auth')

router.post('/login', async (req, res, next) => {
  try {
    const user = await login(req.body.email, req.body.password)
    if (user) {
      res.json({
        status: 'Success',
        code: 200,
        data: user
      })
    } else {
      res.json({
        code: 401,
        message: 'Invalid login or password',
      })
    }
  } catch (e) {
    next(e)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    const user = await logout(req.body._id)
    if (user) {
      res.json({
        status: 'Success',
        code: 204,
      })
    } else {
      next({
        code: 401,
        message: 'Not authorized',
      })
    }
  } catch (e) {
    next(e)
  }
})

router.post('/signup', validateCreateUser, async (req, res, next) => {
  try {
    const user = await getuserByEmail(req.body.email)
    if (user) {
      return res.json({
        status: 'Conflict',
        code: 409,
        message: 'This email is already in use'
      })
    }
    if (req.body.name && req.body.email && req.body.password) {
      const user = await addUser(req.body)
      sendEmail(user.verifyToken, user.email, user.name)
      res.json({
        status: 'Success',
        code: 201,
        data: {
          name: user.name,
          email: user.email,
          verifyToken: user.verifyToken
        }
      })
    } else {
      res.json({
        code: 400,
        message: 'Missing required name, email or password field'
      })
    }
  } catch (e) {
    next(e)
  }
})

router.patch('/:userId/subscription', validateUpdateSubscriptionUser, async (req, res, next) => {
  try {
    if (req.body.subscription) {
      const updatedUser = await updateSubscriptionUser(req.params.userId, req.body)
      if (updatedUser) {
        res.json({
          status: 'Success',
          code: 200,
          data: updatedUser
        })
      } else {
        res.json({
          code: 404,
          message: 'Not found'
        })
      }
    } else {
      res.json({
        code: 400,
        message: 'Missing field subscription'
      })
    }
  } catch (e) {
    next(e)
  }
})

router.get('/current', async (req, res, next) => {
  try {
    const user = await getuserByToken(req.rawHeaders[1])
    if (user) {
      res.json({
        status: 'Success',
        code: 200,
        data: user
      })
    } else {
      next({
        code: 401,
        message: 'Not authorized',
      })
    }
  } catch (e) {
    next(e)
  }
})

router.patch('/avatars', upload.single('avatar'), async (req, res, next) => {
  try {
    const user = await getuserByToken(req.rawHeaders[1])
    const avatar = await updateAvatar(user, req.file)
    if (!user) {
      res.json({
        status: 'Unauthorized',
        code: 401,
        contentType: 'application/json',
        responseBody: {
          message: 'Not authorized'
        }
      })
      return
    }
    res.json({
      status: 'Success',
      code: 200,
      contentType: 'application/json',
      responseBody: {
        avatarURL: avatar
      }
    })
  } catch (e) {
    next(e)
  }
})

router.get('/verify/:verifyToken', async (req, res, next) => {
  const user = await getUserByVerifyToken(req.params)
  try {
    if (!user) {
      res.json({
        status: 404,
        ResponseBody: {
          message: 'User not found'
        }
      })
      return
    }
    if (user.emailVerify) {
      res.json({
        Status: 400,
        ResponseBody: {
          message: 'Verification has already been passed'
        }
      })
      return
    }
    await updateUserVerifyStatus(user)
    res.json({
      Status: 200,
      ResponseBody: {
        message: 'Verification successful',
      }
    })
  } catch (e) {
    next(e)
  }
})

router.post('/verify', validateVerifyUserEmail, async (req, res, next) => {
  try {
    console.log(req.body.email)
    const user = await getuserByEmail(req.body.email)
    if (user.emailVerify) {
      res.json({
        status: 'Bad Request',
        code: 400,
        message: 'Verification has already been passed'
      })
      return
    }
    sendEmail(user.verifyToken, user.email, user.name)
    res.json({
      status: 'Success',
      code: 200,
      message: 'Verification email sent'
    })
  } catch (e) {
    next(e)
  }
})

module.exports = router
