const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')

const ordersController = require('../controllers/orders')

/*
    GET for the whole DATA in Order
*/
router.get('/', ordersController.getOrdersList)

/*
    POST to add data to the Order Schema
*/
router.post('/', ordersController.createNewOrder)

/*
    GET by ID in Order
*/
router.get('/:orderId', ordersController.getOrderById)
/*
    GET Total of Sales from order 
*/
router.get('/get/total-sales', ordersController.totalSales)
/*
    GET  Product Count
*/
router.get('/get/count', ordersController.getOrderCount)

/*
    GET  Orders BY USER
*/
router.get('/get/user-orders/:userId', ordersController.getUserOrders)

/*
    PATCH to update Order by ID checkAuth
*/
router.patch('/:orderId', ordersController.updateOrder)

/*
    DELETE to delete product by ID checkAuth
*/
router.delete('/:orderId', ordersController.deleteOrder)

module.exports = router
