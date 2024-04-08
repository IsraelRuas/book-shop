const form = document.getElementById('form')
//const username = document.getElementById('username');
const email = document.getElementById('email')
const password = document.getElementById('password')
const password2 = document.getElementById('password2')
var validateField = [4]
// show input error message
function showError(input, message) {
    const formControl = input.parentElement
    formControl.className = 'form-control error'
    const small = formControl.querySelector('small')
    small.innerText = message
}

// show success message
function showSuccess(input) {
    formControl = input.parentElement
    formControl.className = 'form-control success'
}

//check email is valid
function checkEmail(input) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (re.test(input.value.trim())) {
        showSuccess(input)
        validateField[0] = true
    } else {
        showError(input, 'Email is not valid')
        validateField[0] = false
    }
}

//check required fields
function checkRequired(inputArr) {
    inputArr.forEach(function (input) {
        if (input.value.trim() === '') {
            showError(input, `${getFieldName(input)} is required`)
            validateField[1] = false
        } else {
            showSuccess(input)
            validateField[1] = true
        }
    })
}

//check input lenght
function checkLength(input, min, max) {
    if (input.value.length < min) {
        showError(
            input,
            `${getFieldName(input)} must be at least ${min} characters`
        )
        validateField[2] = false
    } else if (input.value.length > max) {
        showError(
            input,
            `${getFieldName(input)} must be less than ${max} characters`
        )
        validateField[2] = false
    } else {
        showSuccess(input)
        validateField[2] = true
    }
}

// check passwords match

function checkPasswordsMatch(input1, input2) {
    if (input1.value !== input2.value) {
        showError(input2, 'Passwords do not match')
        validateField[3] = false
    } else {
        validateField[3] = true
    }
}

// Get fieldname
function getFieldName(input) {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1)
}

// Disply a nice message for password confirmation
function checkPassword2(password2) {
    if (password2.value.trim() === '') {
        showError(password2, 'Confirm Password is required')
    }
}
function validateForm() {
    checkRequired([email, password, password2])
    checkLength(password, 6, 25)
    checkEmail(email)
    checkPasswordsMatch(password, password2)
    checkPassword2(password2)
    if (validateField.includes(false)) {
        return false
    }
}

function cleanForm() {
    document.getElementById('userSignUpForm').reset()
}

window.addEventListener('pageshow', function (event) {
    var historyTraversal =
        event.persisted ||
        (typeof window.performance != 'undefined' &&
            window.performance.navigation.type === 2)
    if (historyTraversal) {
        // Handle page restore.
        window.location.reload()
    }
})
