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

//Adding the bookID or name to the Path in the form
function appendBookIdToActionPath() {
    //router.get('/:bookIdOrName', booksController.getBookByIdOrName)
    idOrName = document.getElementById('bookIdOrName').value
    alert('Book ID/Name: ' + idOrName)
    if (idOrName == 0) {
        idOrName = 1
    }
    //Variables gets the ID or Name passed from body and add to the path.
    //New form.action gets the new path
    bookRouterPath = `/books/get/${idOrName}`
    document.getElementById('formGetOneBook').action = bookRouterPath
}

//Validation to delete the Book with parameters from the Book Edit EJS page
function removeConfirmation(name, id) {
    if (confirm('Are you sure, you want to delete this book ' + name)) {
        window.location.href = '/books/delete/' + id
    } else {
        alert('Operation canceled')
    }
}
