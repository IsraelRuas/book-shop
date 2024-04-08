/*

############ PUPULATING THE QUANTITY SELECT

*/

function populateBookQuantity(quantityInStock) {
    const x = quantityInStock
    const select = document.getElementById('bookQuantity')
    for (let i = 2; i <= x; i++) {
        const option = document.createElement('option')
        option.value = i
        option.text = 'Quantity: ' + i
        select.appendChild(option)
    }
}
