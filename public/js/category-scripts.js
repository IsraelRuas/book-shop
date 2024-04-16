//Validation to delete the category with parameters from the admin-category-management EJS page
function removeConfirmation(name, id) {
    if (confirm('Are you sure, you want to delete this category ' + name)) {
        window.location.href = '/categories/delete/' + id
    } else {
        alert('Operation canceled')
    }
}

//Adding the categoryID or name to the Path in the form
function appendCategoryIdToActionPath() {
    //router.get('/get/:categoryIdOrName', categoriesController.getCategoryByIdOrName)
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
