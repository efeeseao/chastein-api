const express = require('express')
const router = express.Router()

const usersController = require('../controllers/usersControllers')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.upateUser)
  .delete(usersController.deleteUser)

module.exports = router
