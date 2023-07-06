$(document).ready(function() {
  // Setting the button state when the page is loaded
  $('#signup button[type="submit"]').addClass('disabled').prop('disabled', true);
  $('#login button[type="submit"]').addClass('disabled').prop('disabled', true);

  // Validation of fields when sending the registration form
  $('#signup').submit(function(event) {
    event.preventDefault();
    validateRegistrationForm();
  });

  // Field validation when submitting the login form
  $('#login').submit(function(event) {
    event.preventDefault();
    validateLoginForm();
  });

  // Validation of fields when changing values in the registration form
  $('#signup input').keyup(function() {
    validateRegistrationForm();
  });

  // Validation of fields when changing values in the input form
  $('#login input').keyup(function() {
    validateLoginForm();
  });

  // Cleaning up form fields and removing error styles on page load
  $('.form-group input').val('').removeClass('error success');
  $('.form-group .message').text('');

  // Cleaning up form fields and removing error styles when switching between forms
  $('.form-toggle').click(function() {
    $('.form-group input').val('').removeClass('error success');
    $('.form-group .message').text('').removeClass('error success');
    $('#signup button[type="submit"]').addClass('disabled').prop('disabled', true);
    $('#login button[type="submit"]').addClass('disabled').prop('disabled', true);
  });
});



function validateRegistrationForm() {
  var valid = true;

  limitInputLength();

  // Checking the "Username" field in the registration form
  var username = $('#signup #signup-username');
  if (username.val().length === 0) {
    showDefaultState(username);
    valid = false;
  } else if (
    username.val().length < 4 ||
    containsEmoji(username.val()) ||
    containsCyrillic(username.val()) ||
    !validUsernameCharacters(username.val())
  ) {
    var errorMessage = 'Username must contain at least 4 characters and be in the correct format. We allow input only in Latin';
    showError(username, errorMessage);
    valid = false;
  } else if (isConsecutiveCharacters(username.val(), 6)) {
    var errorMessage = 'Username must not contain more than six identical characters in a row';
    showError(username, errorMessage);
    valid = false;
  } else {
    showSuccess(username, 'Username is valid');
  }

  // Checking the "Email Address" field in the registration form
  var email = $('#signup #email');
  if (email.val().length === 0) {
    showDefaultState(email);
    valid = false;
  } else if (!validateEmail(email.val())) {
    valid = false;
    showError(email, 'Please enter a valid email address');
  } else {
    showSuccess(email, 'Email address is valid');
  }


  // Checking the "Password" field in the registration form
  var password = $('#signup #signup-password');
  if (password.val().length === 0) {
    showDefaultState(password);
    valid = false;
  } else if (
    password.val().length < 6 ||
    containsEmoji(password.val()) ||
    containsCyrillic(password.val()) ||
    !validPasswordCharacters(password.val())
  ) {
    var errorMessage = "The password must contain at least 6 characters and be in the correct format. Let's enter letters and numbers. We allow input only in Latin";
    showError(password, errorMessage);
    valid = false;
  } else if (isConsecutiveCharacters(password.val(), 6)) {
    var errorMessage = 'The password must not contain more than 6 identical characters in a row';
    showError(password, errorMessage);
    valid = false;
  } else {
    showSuccess(password, 'The password is valid');
  }

  // Checking the "Confirm Password" field in the registration form
  var confirmPassword = $('#signup #cpassword');
  if (confirmPassword.val().length === 0) {
    showDefaultState(confirmPassword);
    valid = false;
  } else if (confirmPassword.val() !== password.val()) {
    valid = false;
    showError(confirmPassword, 'Passwords do not match');
  } else {
    showSuccess(confirmPassword, 'The passwords match');
  }

  // Setting the state of the "Register" button
  var registerButton = $('#signup button[type="submit"]');
  if (valid) {
    registerButton.removeClass('disabled').prop('disabled', false);
  } else {
    registerButton.addClass('disabled').prop('disabled', true);
  }
}


function validateLoginForm() {
  var valid = true;

  limitInputLength();
 
  // Checking the "Username" field in the login form
  var username = $('#login #login-username');
  if (username.val().length === 0) {
    showDefaultState(username);
    valid = false;
  } else if (
    username.val().length < 4 ||
    containsEmoji(username.val()) ||
    containsCyrillic(username.val()) ||
    !validUsernameCharacters(username.val())
  ) {
    var errorMessage = "Username must contain at least 4 characters and be in the correct format. Let's enter letters and numbers. We allow input only in Latin";
    showError(username, errorMessage);
    valid = false;
  } else if (isConsecutiveCharacters(username.val(), 6)) {
    var errorMessage = 'Username must not contain more than six identical characters in a row';
    showError(username, errorMessage);
    valid = false;
  } else {
    showSuccess(username, 'Username is valid');
  }

  // Checking the "Password" field in the login form
  var password = $('#login #login-password');
  if (password.val().length === 0) {
    showDefaultState(password);
    valid = false;
  } else if (
    password.val().length < 6 ||
    containsEmoji(password.val()) ||
    containsCyrillic(password.val()) ||
    !validPasswordCharacters(password.val())
  ) {
    var errorMessage =
    "The password must contain at least 6 characters and be in the correct format. Let's enter letters and numbers. Let's accept input only in Latin";
    showError(password, errorMessage);
    valid = false;
  } else if (isConsecutiveCharacters(password.val(), 6)) {
    var errorMessage = 'The password must not contain more than six identical characters in a row';
    showError(password, errorMessage);
    valid = false;
  } else {
    showSuccess(password, 'The password is valid');
  }

  // Setting the state of the "Log In" button
  var loginButton = $('#login button[type="submit"]');
  if (valid) {
    loginButton.removeClass('disabled').prop('disabled', false);
  } else {
    loginButton.addClass('disabled').prop('disabled', true);
  }
}

function showDefaultState(input) {
  input.removeClass('error success');
  input.next('.message').removeClass('error success').text('');
}

// Checking for the presence of Cyrillic characters in a line
function containsCyrillic(input) {
  var cyrillicPattern = /[а-яА-ЯЁё]/;
  return cyrillicPattern.test(input);
}

// Checking for valid characters in the "Username" field
function validUsernameCharacters(input) {
  var usernamePattern = /^[A-Za-z0-9.\-]+$/;
  return usernamePattern.test(input);
}

// Checking for valid characters in the "Password" field
function validPasswordCharacters(input) {
  var passwordPattern = /^[A-Za-z0-9]+$/;
  return passwordPattern.test(input);
}

// Checking for the presence of the same consecutive characters in a string
function isConsecutiveCharacters(input, limit) {
  for (var i = 0; i < input.length - limit + 1; i++) {
    var substring = input.substring(i, i + limit);
    if (substring.match(/^(.)\1+$/)) {
      return true;
    }
  }
  return false;
}

function showDefaultState(input) {
  input.removeClass('success error');
  input.next('.message').removeClass('success error').text('');
}

function showError(input, message) {
  input.removeClass('success').addClass('error');
  input.next('.message').removeClass('success').addClass('error').text(message);
}

function showSuccess(input, message) {
  input.removeClass('error').addClass('success');
  input.next('.message').removeClass('error').addClass('success').text(message);
}

// Simple verification of Email address using regular expression
function validateEmail(email) {
  var emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
}

// Checking for emoji in a string
function containsEmoji(input) {
  var emojiPattern = /[\uD800-\uDFFF]./;
  return emojiPattern.test(input);
}

// Checking the presence of Cyrillic characters in a string
function containsCyrillic(input) {
  var cyrillicPattern = /[а-яА-ЯЁё]/;
  return cyrillicPattern.test(input);
}

// Checking for valid characters in the "Username" field
function validUsernameCharacters(input) {
  var usernamePattern = /^[A-Za-z0-9.\-]+$/;
  return usernamePattern.test(input);
}

// Checking for valid characters in the "Password" field
function validPasswordCharacters(input) {
  var passwordPattern = /^[A-Za-z0-9]+$/;
  return passwordPattern.test(input);
}

// Checks for the presence of identical consecutive characters in a string
function isConsecutiveCharacters(input, limit) {
  for (var i = 0; i < input.length - limit + 1; i++) {
    var substring = input.substring(i, i + limit);
    if (substring.match(/^(.)\1+$/)) {
      return true;
    }
  }
  return false;
}

// Restrictions for input characters
function limitInputLength() {
  $('input').on('input', function() {
    var maxLength = 50;
    var input = $(this);

    if (input.val().length > maxLength) {
      input.val(input.val().slice(0, maxLength));
      input.next('span').text('Maximum number of characters:' + maxLength).addClass('error');
    } else {
      input.next('span').text('').removeClass('error');
    }
  });
}