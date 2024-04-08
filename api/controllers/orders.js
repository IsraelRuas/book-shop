const Order = require('../models/order')
const Book = require('../models/book')
const mongoose = require('mongoose')

const OrderItem = require('../models/order-item')

/*

    ###  SESSION TO CREATE A NEW ORDER

*/
exports.createNewOrder = async (req, res, next) => {
    //OrderItemsIds will receive the prodycts ID and the quantity of each book.
    //The return have to combine the array of promises together
    const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                _id: new mongoose.Types.ObjectId(),
                quantity: orderItem.quantity,
                book: orderItem.book,
            })
            //Then the array with books ID and quantity will be saved on newOrderItem
            newOrderItem = await newOrderItem.save()
            // it will return only the IDs in the array.
            return newOrderItem._id
        })
    )
    //This will wait for the promisses to be resolved and get the IDs
    const orderItemsIdsResolved = await orderItemsIds
    //Store the data to pass the data to the module

    /*Function to loop all books in orderItem and calculate the price times quantity 
    for each book
    */
    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                'book',
                'price'
            )
            const totalPrice = orderItem.book.price * orderItem.quantity
            return totalPrice
        })
    )
    //The result will be stored in an array, the we combine all items of this arreay
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order({
        //Automatically creates a new unique ID
        _id: new mongoose.Types.ObjectId(),
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        postCode: req.body.postCode,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save()
    //Condition for error
    if (!order) {
        return res.status(500).send('The Order cannot be created')
    } else {
        res.send(order)
    }
}
/*

    ###  SESSION TO GET ALL ORDERS

*/
exports.getOrdersList = async (req, res, next) => {
    //Get order and populate user with just the name
    const ordersList = await Order.find()
        .populate('user', 'name')
        .sort({ dateOrdered: -1 }) // Sort order by date - Newest to Oldest
    if (!ordersList) {
        res.status(500).json({ success: false })
    } else {
        res.send(ordersList)
    }
}
/*

    ###  SESSION TO GET ORDER BY ID

*/
exports.getOrderById = async (req, res, next) => {
    const id = req.params.orderId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            success: false,
            message: 'This Order ID is not valid',
        })
    }
    const order = await Order.findById(id)
        .populate('user', 'name')
        //Populating the book in order from the orderItems with path, then popualating the category with another path
        .populate({
            path: 'orderItems',
            populate: {
                path: 'book',
                populate: 'category',
            },
        })
    if (!order) {
        res.status(500).json({ success: false })
    } else {
        res.send(order)
    }
}
/*

    ###  SESSION TO UPDATE ORDER BY ID

*/
exports.updateOrder = async (req, res, next) => {
    let id = req.params.orderId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(id)) {
        return res.status(500).json({
            success: false,
            message: 'This Order ID is not valid',
        })
    }
    const order = await Order.updateOne(
        { _id: id },
        {
            // orderItems: req.body.orderItems,
            // shippingAddress1: req.body.shippingAddress1,
            // shippingAddress2: req.body.shippingAddress2,
            // city: req.body.city,
            // postCode: req.body.postCode,
            // country: req.body.country,
            // phone: req.body.phone,
            status: req.body.status,
            // totalPrice: req.body.totalPrice,
            // user: req.body.user,
        }
    )
    if (!order) {
        return res.status(404).send('The Order cannot be updated')
    } else {
        res.send(order)
    }
}
/*

    ###  SESSION TO DELETE ORDER BY ID AND THE ORDER ITEM ATTACHED TO THE ORDER

*/
exports.deleteOrder = async (req, res, next) => {
    const orderId = req.params.orderId
    //Function to check if the ID is a Valid ID
    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(500).json({
            success: false,
            message: 'This order ID is not valid',
        })
    }
    //Function to find and delete the Order by ID
    Order.findByIdAndDelete(orderId)
        .then(async (order) => {
            if (order) {
                //Function to find the OrderItems attached to the Order and delete
                await order.orderItems.map(async (orderItem) => {
                    await OrderItem.findByIdAndDelete(orderItem)
                        .then()
                        //Catch the error from order item
                        .catch((err) =>
                            res.status(200).json({
                                success: false,
                                message: 'Order not found',
                            })
                        )
                })
                return res
                    .status(200)
                    .json({ success: true, message: 'The order was deleted' })
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Order not found',
                })
            }
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ success: false, error: err })
        })
}
/*

    ###  SESSION TO SUM THE TOTAL OF ORDERS

*/
exports.totalSales = async (req, res, next) => {
    //Aggregate will add to totalSales the sum of totalPrice from order table
    //Note: The totalPrice was created when the new order is created.
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ])
    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }
    //Delete the ID from the array with .pop
    res.send({ totalSales: totalSales.pop().totalSales })
}

/*

    ###  SESSION TO COUNT THE QUANTITY OF ORDERS

*/
exports.getOrderCount = async (req, res, next) => {
    const orderCount = await Order.countDocuments({})
    if (!orderCount) {
        res.status(500).json({ success: false })
    }

    res.send({ orderCount: orderCount })
}

/*

    ###  SESSION TO GET ALL ORDERS BY USER

*/
exports.getUserOrders = async (req, res, next) => {
    const userId = req.params.userId
    //Get order and populate user with just the name
    const userOrdersList = await Order.find({ user: userId })
        .populate({
            path: 'orderItems',
            populate: {
                path: 'book',
                populate: 'category',
            },
        })
        .sort({ dateOrdered: -1 }) // Sort order by date - Newest to Oldest
    if (!userOrdersList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrdersList)
}

/**

POST ORDER EXEMPLE: 

{
    "orderItems" : [
        {
            "quantity" : 3,
            "book" : "65f822f880372f2c641bd932"
        },
        {
            "quantity" : 2,
            "book" : "65f825e780372f2c641bd935"
        }
    ],
    "shippingAddress1" : "Flowers Street, 45", 
    "shippingAddress1" : "1-B", 
    "city" : "Gold Coast",
    "postCode" : "4211",
    "country" : "Brazil",
    "phone" : "+61414277045",
    "status" : "placed",
    "totalPrice": 158,  
    "user": "65faba5e2cf37d976b56640b"  

}


 */
