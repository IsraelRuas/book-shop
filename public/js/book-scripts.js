/*

############ PUPULATING THE QUANTITY SELECT BY THE BOOK NAME AND ITS QUANTITY

*/
//Function get the values by params.
function populateBookQuantity(quantityInStock, bookName) {
    const x = quantityInStock
    const select = document.getElementById(bookName)
    //Condition to check if the options are populated
    if (typeof select.options != 'undefined' && select.options.length < 2) {
        //Looping to populate the select until the maximum of Stock quantity
        for (let i = 2; i <= x; i++) {
            const option = document.createElement('option')
            option.value = i
            option.text = 'Quantity: ' + i
            select.appendChild(option)
        }
    }
}
