var hardwareScannerStarted = false;

function scanHardwareQR() {
  if (hardwareScannerStarted) {
    closeScanner();
    hardwareScannerStarted = false;
  } else {
    startCustomScanner("hardware-qr-scanner", function (token, stopFunction) {
      sendReserveTakeRequest();
      hardwareScannerStarted = true;
    });
  }
}

function sendTokenManually() {
  sendReserveTakeRequest($("#token").val());
}

function sendReserveTakeRequest(token) {
  $.post({
    url: "/hardware/take",
    data: {
      token: token
    },
    success: function (response) {
      location.reload();
      $.notify({
        message: response.message
      }, {
          type: 'success'
        });
    },
    error: function (error) {
      $.notify({
        message: error.responseJSON.message
      }, {
          type: 'danger'
        });
      return;
    }
  });
  closeScanner();
}