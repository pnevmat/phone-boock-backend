const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const path = require('path')

const contactsRouter = require('./routes/api/contacts')
const usersRouter = require('./routes/api/user')
const fs = require('fs').promises

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/contacts', contactsRouter)
app.use('/api/users', usersRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).json(err)
})

const isAccessible = (path) => {
  return fs.access(path).then(() => true).catch(() => false)
}

const createFolderIfNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder, (err) => err)
    console.log('Folder for uploads successfuly created')
  }
}

module.exports = { app, createFolderIfNotExist }
