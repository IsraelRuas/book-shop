//Validation to delete the user with parameters from the user-list.ejs page
function removeConfirmation(name, id) {
    if (confirm('Are you sure, you want to delete this category ' + name)) {
        window.location.href = '/categories/delete/' + id
    } else {
        alert('Operation canceled')
    }
}

//Adding the userID or name to the Path in the form
function appendCategoryIdToActionPath() {
    //router.get('/:userIdOrName', userController.getUserByIdOrName)
    idOrName = document.getElementById('categoryIdOrName').value
    alert('Category ID/Name: ' + idOrName)
    if (idOrName == 0) {
        idOrName = 1
    }
    //Variables gets the ID or Name passed from body and add to the path.
    //New form.action gets the new path
    categoryRouterPath = `/categories/get/${idOrName}`
    document.getElementById('formGetOneCategory').action = categoryRouterPath
}

function cleanForm() {
    document.getElementById('categorySignUpForm').reset()
}
