const { app, createFolderIfNotExist } = require('../app')
const db = require('../db')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '..', process.env.UPLOAD_DIR)

const PORT = process.env.PORT || 5000

db.then(() => {
  console.log('Database connection successful')
  app.listen(PORT, () => {
    createFolderIfNotExist(UPLOAD_DIR)
    console.log(`Server running. Use our API on port: ${PORT}`)
  })
}).catch(err => {
  console.log(`Server is not running. Error: ${err.message}`)
})
