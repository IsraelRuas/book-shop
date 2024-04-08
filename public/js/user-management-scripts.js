//Validation to delete the user with parameters from the user-list.ejs page
function removeConfirmation(name, id) {
    if (confirm('Are you sure, you want to delete this user ' + name)) {
        window.location.href = '/users/delete/' + id
    } else {
        alert('Operation canceled')
    }
}

//Adding the userID or name to the Path in the form
function appendUserIdToActionPath() {
    //router.get('/:userIdOrName', userController.getUserByIdOrName)
    idOrName = document.getElementById('userIdOrName').value
    alert('User ID/Name: ' + idOrName)
    if (idOrName == 0) {
        idOrName = 1
    }
    //Variables gets the ID or Name passed from body and add to the path.
    //New form.action gets the new path
    userRouterPath = `/users/${idOrName}`
    document.getElementById('formGetOneUser').action = userRouterPath
}

// const rowsPerPage = 5
// let currentPage = 1

// const data = tableData(data)
// console.log(data)

// function displayTable(page) {
//     const table = document.getElementById('userManagementTableDisplay')
//     const startIndex = (page - 1) * rowsPerPage
//     const endIndex = startIndex + rowsPerPage
//     const slicedData = data.slice(startIndex, endIndex)

//     // Clear existing table rows
//     table.innerHTML = `
//         <tr>
//              <th>Name</th>
//              <th>Email</th>
//              <th>Phone</th>
//              <th>Info</th>
//         </tr>
//     `

//     // Add new rows to the table
//     slicedData.forEach((item) => {
//         const row = table.insertRow()
//         const nameCell = row.insertCell(0)
//         const emailCell = row.insertCell(1)
//         const phoneCell = row.insertCell(2)
//         nameCell.innerHTML = item.name
//         emailCell.innerHTML = item.email
//         phoneCell.innerHTML = item.phone
//     })

//     // Update pagination
//     updatePagination(page)
// }

// function updatePagination(currentPage) {
//     const pageCount = Math.ceil(data.length / rowsPerPage)
//     const paginationContainer = document.getElementById('pagination')
//     paginationContainer.innerHTML = ''

//     for (let i = 1; i <= pageCount; i++) {
//         const pageLink = document.createElement('a')
//         pageLink.href = '#'
//         pageLink.innerText = i
//         pageLink.onclick = function () {
//             displayTable(i)
//         }
//         if (i === currentPage) {
//             pageLink.style.fontWeight = 'bold'
//         }
//         paginationContainer.appendChild(pageLink)
//         paginationContainer.appendChild(document.createTextNode(' '))
//     }
// }

// // Initial display
// displayTable(currentPage)
