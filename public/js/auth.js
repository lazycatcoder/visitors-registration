$(document).ready(function() {
  var panelOne = $('.form-panel.one')[0].scrollHeight,
    panelTwo = $('.form-panel.two')[0].scrollHeight;

  // Function to check the current URL and activate the form
  function activateFormByURL() {
    var currentURL = window.location.href;

    if (currentURL.indexOf('/auth/signup') !== -1) {
      activateSignupForm();
    } else {
      activateLoginForm();
    }
  }

  // Function to activate the login form
  function activateLoginForm() {
    $('.form-toggle').removeClass('visible');
    $('.form-panel.one').removeClass('hidden');
    $('.form-panel.two').removeClass('active');
    $('.form').animate({
      'height': panelOne
    }, 200);

    // Updating the link when activating the login form
    $('.register-link').attr('href', '/auth/signup');
    history.replaceState(null, null, '/auth/login');
  }

  // Function to activate the registration form
  function activateSignupForm() {
    $('.form-toggle').addClass('visible');
    $('.form-panel.one').addClass('hidden');
    $('.form-panel.two').addClass('active');
    $('.form').animate({
      'height': panelTwo
    }, 200);

    // Updating the link when activating the registration form
    $('.register-link').attr('href', '/auth/signup');
    history.replaceState(null, null, '/auth/signup');
  }

  // Call the function when the page is loaded
  activateFormByURL();

  $(document).on('click', '.form-panel.two:not(.active)', function(e) {
    e.preventDefault();
    activateSignupForm();
    history.pushState(null, null, '/auth/signup');
  });

  $('.form-toggle').on('click', function(e) {
    e.preventDefault();
    if ($('.form-panel.one').hasClass('hidden')) {
      activateLoginForm();
      history.pushState(null, null, '/auth/login');
    } else {
      activateSignupForm();
      history.pushState(null, null, '/auth/signup');
    }
  });

  $(document).on('click', '.register-link', function(event) {
    activateSignupForm();
    history.pushState(null, null, '/auth/signup');
  });

  // The event of following links and returning to the login page
  window.addEventListener('popstate', function() {
    activateFormByURL();
  });
});



// Event handler for registering a new user
$(document).ready(function() {
  var usernameExists = false; // Flag indicating that the username is in the database

  // Event handler for registering a new user
  $('#signup').submit(function(event) {
    event.preventDefault(); // Cancel the submission of the form to the server and reload the page
    // Receiving data from the registration form
    var username = $('#signup-username').val();
    var email = $('#email').val();
    var password = $('#signup-password').val();
    var confirmPassword = $('#cpassword').val();

    // Verifying that the password and confirmation password match
    if (password !== confirmPassword) {
      showError('Password and confirmation password do not match');
      return;
    }

    // Checking if the user exists in the database
    if (usernameExists) {
      showError("Username already exists");
      return; // Add a return from the function to abort the registration
    }

    clearError();

    var csrfToken = $('[name="_csrf"]').val();
    
    // Sending a request to the server to create a new user
    $.ajax({
      url: '/auth/signup',
      method: 'POST',
      data: {
        username: username,
        email: email,
        password: password,
        _csrf: csrfToken
      },
      headers: {
        'csrf-token': csrfToken
      },
      success: function(response) {
        $('.form-toggle').click();

        location.reload();

        // $('#login-message').text('You have successfully registered, you can login');
        alert('You are successfully registered, you can login')

        // Clearing the message after 5 seconds
        setTimeout(function() {
          $('#login-message').text('');
        }, 5000);
      },
      error: function(xhr, status, error) {
        showError('Registration error: ' + error);
      }
    });
  });

  // Event handler for each keystroke in the username field
  $('#signup-username').on('input', function() {
    var username = $(this).val();
    checkUsername(username);
  });

  // Function to check the presence of a user in the database
  function checkUsername(username) {
    if (username.trim().length === 0) {
      clearError();
      usernameExists = false;
      return;
    }

    var csrfToken = $('[name="_csrf"]').val();
    
    $.ajax({
      url: '/auth/checkuser',
      method: 'POST',
      data: { username: username },
      headers: { 'csrf-token': csrfToken },
      success: function(response) {
        usernameExists = response.exists;
        if (usernameExists) {
          showError("Username already exists");
        } else {
          clearError();
        }
      },
      error: function(xhr, status, error) {
        showError('Error validating username:' + error);
      }
    });
  }

  function showError(message) {
    $('#signup-message').text(message);
  }

  function clearError() {
    $('#signup-message').text('');
  }
});


// Event handler for switching between active forms
$(document).ready(function() {
  $(document).on('click', '.form-toggle', function(event) {
    $('#login-message').text('');
    $('#signup-message').text('');
  });

  $(document).on('click', '.register-link', function(event) {
    $('#login-message').text('');
    $('#signup-message').text('');
  });

  $('#login-message').text('');
  $('#signup-message').text('');
});


// Event handler for authentication
$(document).ready(() => {
  $('#login').on('submit', (e) => {
    e.preventDefault();
    const username = $('#login-username').val();
    const password = $('#login-password').val();
    const csrfToken = $('input[name="_csrf"]').val();

    $.ajax({
      url: '/auth/login',
      method: 'POST',
      data: JSON.stringify({
        username: username,
        password: password,
        _csrf: csrfToken
      }),
      contentType: 'application/json',
      headers: { 'csrf-token': csrfToken },
      success: (response) => {
        window.location.href = response.redirectTo;
      },
      error: (xhr, status, error) => {
        $('#login-message').text(xhr.responseJSON.message);
      }
    });
  });

  
  $('#logout').on('click', () => {
    const csrfToken = $('input[name="_csrf"]').val();
    
    $.ajax({
      url: '/auth/logout',
      method: 'GET',
      headers: { 'csrf-token': csrfToken },
      success: (response) => {
        window.location.href = '/';
      }
    });
  });
});