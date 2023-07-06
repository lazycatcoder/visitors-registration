// Initializing Socket.IO
const socket = io();



$(document).ready(function() {
  $('#example').DataTable({
      "order": [],
      "dom": '<"top"lf>t<"bottom"ip>',
      "lengthMenu": [10, 25, 50, 100],
      "language": {
          "lengthMenu": "Show _MENU_ entries",
          "search": "Search:",
          "info": "Showing _START_ to _END_ of _TOTAL_ entries",
          "paginate": {
              "previous": "Previous",
              "next": "Next"
          }
      }
  });

  $('.datatable-header').click(function() {
      var table = $('#example').DataTable();
      var column = table.column($(this).index());

      column.visible(!column.visible());
  });
});




// Downloading the table
function downloadTable() {
  const table = $("#example").DataTable();
  const data = table.data().toArray();

// Deleting the last column "Action" and its rows
  const lastColumnIndex = table.columns().header().length - 1;
  const filteredData = data.map(row => row.filter((_, columnIndex) => columnIndex !== lastColumnIndex));

  const headers = table.columns().header().toArray().map(th => th.textContent.trim());
  headers.pop(); // Remove the header of the last column "Action"
  filteredData.unshift(headers);

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(filteredData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toISOString().split("T")[1].split(".")[0].replace(/:/g, "-");
  const filename = `table_${date}_${time}.xlsx`;

  const workbookOptions = { bookType: "xlsx", type: "binary" };
  const excelFile = XLSX.write(workbook, workbookOptions);

  function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([s2ab(excelFile)], { type: "application/octet-stream" }));
  link.download = filename;
  link.click();
}





function setDefaultValues() {
  var currentDate = new Date();
  // Format the date in "YYYY-MM-DD" format
  var formattedDate =
    currentDate.getFullYear() +
    "-" +
    (currentDate.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    currentDate.getDate().toString().padStart(2, "0");
  // Set the value of the input field
  $("[data-role='calendarpicker']").val(formattedDate);

  const selectField = document.querySelector("select[name='example_length']");

  // Set the default value to 10
  selectField.value = "10";
}

document.addEventListener("DOMContentLoaded", setDefaultValues);





// Get a link to the Refresh button
const refreshBtn = document.getElementById("refreshBtn");

// Add a handler for the Refresh button click event
refreshBtn.addEventListener("click", function() {
  location.reload();
});





function setDefaultValues() {
  var currentDate = new Date();
  var formattedDate =
    currentDate.getFullYear() +
    "-" +
    (currentDate.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    currentDate.getDate().toString().padStart(2, "0");
 // Set the value of the input field
  $("[data-role='calendarpicker']").val(formattedDate);
}

document.addEventListener("DOMContentLoaded", setDefaultValues);






// Updating data in a row
let openRow = null; // Declare a variable to store the open string

// Table update function taking into account the selected date
function updateTable(selectedDate) {
  const table = $("table").DataTable();
  table.clear().draw(); // Clearing and redrawing the table

 
  $.ajax({
    url: "/",
    method: "GET",
    data: {
      selectedDate: selectedDate,
    },
    beforeSend: function(xhr) {
      xhr.setRequestHeader('If-None-Match', '');
    },
    success: function (response) {
      console.log("Response:", response);

      // Adding data to the table
      response.visitors.forEach(function (visitor) {
        const newRow = $("<tr>")
          .attr("data-id", visitor._id)
          .append(
            $("<td>").text(visitor.firstName),
            $("<td>").text(visitor.lastName),
            $("<td>").text(visitor.category),
            $("<td>").text(visitor.arrivalDate),
            $("<td>").text(visitor.arrivalTime),
            $("<td>").text(visitor.leavingDate),
            $("<td>").text(visitor.leavingTime),
            $("<td>").addClass("total-time").text(visitor.totalTime),
            $("<td>").addClass("act-but").append(
              $("<button>")
                .addClass("fa btn-edit")
                .append($("<i>").addClass("fa-regular fa-pen-to-square")),
              $("<button>")
                .addClass("fa btn-delete")
                .append($("<i>").addClass("fa-regular fa-trash"))
            )
          );

        table.row.add(newRow);
      });

      table.draw();
    },
    error: function (error) {
      console.error("AJAX Error:", error);
    },
  });
}



// Editing a row
$(document).on("click", ".btn-edit", function() {
  const row = $(this).closest("tr"); // find the nearest string (tr)

  if (openRow && openRow[0] !== row[0]) {
    // If there is already an open line and it does not match the current one
    saveChanges(openRow); // Save the changes in the open line
  }

  if (!row.hasClass("highlight")) {
    // If the row is not open for editing
    openRow = row; // Update the open line

    const cells = row.find("td:not(.act-but)"); // Get all the cells in the row, excluding the cell with the class "act-but"

    // Go through the cells and add an editing option
    cells.each(function(index) {
      const cell = $(this);
      if (index === 7) {
       // If it is the "totalTime" cell, make it uneditable
        cell.prop("contenteditable", false);
      } else {
        const originalValue = cell.text(); // Keep the original cell value
        cell.html(`<input type="text" value="${originalValue}">`); // Replace the contents of the cell in the input field while keeping the original value
        cell.addClass("edited"); // Add the edited class to mark edited cells

        // Apply the data entry rules for cells
        const input = cell.find("input");
        applyInputRules(cell.index(), input);
      }
    });

    row.addClass("highlight");
    row.find(".btn-edit, .btn-delete").prop("disabled", true);

    $("#addBtn, .btn-edit, .btn-delete").prop("disabled", true);
  }
});

// Function to apply data entry rules for cell
function applyInputRules(cellIndex, input) {
  switch (cellIndex) {
    case 0: // firstName
    case 1: // lastName
    case 2: // category
      input.on("input", function(event) {
        const inputValue = event.target.value;
        const validInput = inputValue.replace(/[^a-zA-Zа-яА-Я\s-.]/g, "").slice(0, 20);
        if (inputValue !== validInput) {
          event.preventDefault();
          input.val(validInput);
        }
      });
      break;
    case 3: // arrivalDate
    case 5: // leavingDate
      input.on("input", function(event) {
        const inputValue = event.target.value;
        const validInput = inputValue.replace(/[^0-9-]/g, "").slice(0, 10);
        if (inputValue !== validInput) {
          event.preventDefault();
          input.val(validInput);
        }
      });
      break;
    case 4: // arrivalTime
    case 6: // leavingTime
      input.on("input", function(event) {
        const inputValue = event.target.value;
        const validInput = inputValue.replace(/[^0-9:]/g, "").slice(0, 5);
        if (inputValue !== validInput) {
          event.preventDefault();
          input.val(validInput);
        }
      });
      break;
    case 7: // totalTime
      input.prop("contenteditable", false);
      break;
    default:
      break;
  }
}


// Function for saving changes in an open line
function saveChanges(row) {
  const openRowCells = row.find("td:not(.act-but)");

  // Go through the cells of the open row and save the new values
  openRowCells.each(function() {
    const cell = $(this);
    if (cell.hasClass("edited")) {
      const newValue = cell.find("input").val();
      cell.text(newValue);
      cell.removeClass("edited");
    }
  });

  row.removeClass("highlight");

  const arrivalDate = row.find("td:nth-child(4)").text();
  const arrivalTime = row.find("td:nth-child(5)").text();
  const leavingDate = row.find("td:nth-child(6)").text();
  const leavingTime = row.find("td:nth-child(7)").text();
  const totalTimeCell = row.find("td:nth-child(8)");

  if (
    arrivalDate === "" ||
    arrivalTime === "" ||
    leavingDate === "" ||
    leavingTime === ""
  ) {
    // Clear "totalTime" if at least one of the cells is empty
    totalTimeCell.text("");
  } else {
    const calculatedTotalTime = calculateTotalTime(
      arrivalDate,
      arrivalTime,
      leavingDate,
      leavingTime
    );
    totalTimeCell.text(calculatedTotalTime);
  }

  const visitorId = row.attr("data-id");
  const updatedData = {
    firstName: row.find("td:nth-child(1)").text(),
    lastName: row.find("td:nth-child(2)").text(),
    category: row.find("td:nth-child(3)").text(),
    arrivalDate: arrivalDate,
    arrivalTime: arrivalTime,
    leavingDate: leavingDate,
    leavingTime: leavingTime,
    totalTime: totalTimeCell.text(),
  };

  $.ajax({
    url: `/${visitorId}`,
    method: "PUT",
    data: updatedData,
    success: function(response) {
      console.log("Update success:", response);
      openRow = null; // Reset the open line after a successful update

    },
    error: function(error) {
      console.error("Update error:", error);
    }
  });

  $("#addBtn, .btn-edit, .btn-delete").prop("disabled", false);
}

// Add a click event handler to hide the line stroke and save the changed values
$(document).on("click", function(event) {
  // check: is not a child and not a descendant
  if (openRow && !openRow.is(event.target) && openRow.has(event.target).length === 0) {
    // saveChanges if there is an open line and the click was outside of it
    saveChanges(openRow);
  }
});

// Function to calculate the total time
function calculateTotalTime(arrivalDate, arrivalTime, leavingDate, leavingTime) {
  const arrival = new Date(`${arrivalDate} ${arrivalTime}`);
  const leaving = new Date(`${leavingDate} ${leavingTime}`);
  const diffInMs = leaving - arrival;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffHours = Math.floor(diffInMinutes / 60);
  const diffMinutes = diffInMinutes % 60;
  return `${diffHours}:${diffMinutes.toString().padStart(2, "0")}`;
}


// Handling the 'visitorUpdated' event from the server
socket.on('visitorUpdated', function(updatedData) {
  const selectedDate = $('[data-role="calendarpicker"]').val();
  updateTable(selectedDate);
});





// Deleting a row
$(document).ready(function() {
  $(document).on('click', '.btn-delete', function() {
    const row = $(this).closest('tr');
    const table = $('#example').DataTable();
    const visitorId = row.data('id');

    $.ajax({
      url: `/${visitorId}`,
      method: 'DELETE',
      success: function() {
        // Removing a row from a table
        table.row(row).remove().draw();

        // Disabling the delete button
        row.find('.btn-delete').prop('disabled', true);
      },
      error: function(error) {
        console.error('AJAX Error:', error);
      }
    });
  });

  
  // Handling the 'visitorDeleted' event from the server
  socket.on('visitorDeleted', (visitorId, selectedDate) => {
    // Checking if the deleted post is on the current page
    const table = $('#example').DataTable();
    const row = table.row(`[data-id="${visitorId}"]`);

    if (row.length) {
      // Delete row from table and update it
      row.remove().draw();
    }
  });
});





// Adding a row
$(document).ready(function() {
  function addVisitor(selectedDate) {
    $.ajax({
      url: '/',
      method: 'POST',
      data: {
        arrivalDate: selectedDate
      },
      success: function(response) {
        console.log('Response:', response);

      },
      error: function(error) {
        console.error('AJAX Error:', error);
      }
    });
  }

  // Add button click event handler
  $('#addBtn').click(function() {
    const selectedDate = $('[data-role="calendarpicker"]').val();
    addVisitor(selectedDate);
  });
  

  // Handling the 'visitorAdded' event from the server
  socket.on('visitorAdded', function(newVisitor) {
    const selectedDate = $('[data-role="calendarpicker"]').val();
    updateTable(selectedDate);
  });

});





// Data output in a table
$(document).ready(function() {
  function updateTableWithVisitors(visitors) {
    const table = $('table').DataTable();

    table.clear();

    // Add new data to the table
    visitors.forEach(function(visitor) {
      const newRow = $('<tr>').attr('data-id', visitor._id).append(
        $('<td>').text(visitor.firstName),
        $('<td>').text(visitor.lastName),
        $('<td>').text(visitor.category),
        $('<td>').text(visitor.arrivalDate),
        $('<td>').text(visitor.arrivalTime),
        $('<td>').text(visitor.leavingDate),
        $('<td>').text(visitor.leavingTime),
        $('<td>').addClass('total-time').text(visitor.totalTime),
        $('<td>').addClass('act-but').append(
          $('<button>').addClass('fa btn-edit').append(
            $('<i>').addClass('fa-regular fa-pen-to-square')
          ),
          $('<button>').addClass('fa btn-delete').append(
            $('<i>').addClass('fa-regular fa-trash')
          )
        )
      );

      table.row.add(newRow);
    });

    table.draw();
  }

  function updateTable(selectedDate) {
    console.log('Selected Date:', selectedDate);

    // Hiding buttons if the user is not authorized
    function checkLogin() {
      // Checking for a block with id="logout"
      if ($("#logout").length > 0) {
        $("#addBtn").show();
        $(".btn-edit").show();
        $(".btn-delete").show();
      } else {
        $("#addBtn").hide();
        $(".btn-edit").hide();
        $(".btn-delete").hide();
      }   
    }

    $.ajax({
      url: '/',
      method: 'GET',
      data: {
        selectedDate: selectedDate
      },
      beforeSend: function(xhr) {
        xhr.setRequestHeader('If-None-Match', '');
      },
      success: function(response) {
        console.log('Response:', response);

        updateTableWithVisitors(response.visitors);
        checkLogin();
      },
      error: function(error) {
        console.error('AJAX Error:', error);
      }
    });
  }  

  // Date picker event handler in calendarpicker
  $('[data-role="calendarpicker"]').change(function() {
    const selectedDate = $(this).val();
    updateTable(selectedDate);
  });

  $('table').DataTable();

  // Get the initial value and update the table
  const initialValue = $('[data-role="calendarpicker"]').val();
  updateTable(initialValue);
});





// Function to hide .btn-edit and .btn-delete buttons
function hideButtons() {
  if ($('#logout').length === 0) {
    $('#example .btn-edit, #example .btn-delete').hide();
  }
}

// Create an instance of the Mutation Observer
const observer = new MutationObserver(function(mutationsList) {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      hideButtons();
    }
  }
});

// Watch for changes inside the example element
const exampleElement = document.getElementById('example');
observer.observe(exampleElement, { childList: true, subtree: true });

// Hide buttons at the beginning if #logout is missing
hideButtons();