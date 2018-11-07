var hardwareScannerStarted = false;

function takeQR() {
  closeScanner();
  startCustomScanner("hardware-qr-scanner", function (token) {
    sendTakeRequest();
    hardwareScannerStarted = true;
  });
}
function returnQR() {
  closeScanner();
  startCustomScanner("hardware-qr-scanner", function (token) {
    sendReturnInformationRequest(token);
    hardwareScannerStarted = true;
  });
}
function infoQR() {
  closeScanner();
  startCustomScanner("hardware-qr-scanner", function (token) {
    sendInfoRequest(token);
    hardwareScannerStarted = true;
  });
}

function takeManual() {
  sendTakeRequest($("#token").val());
}

function returnManual() {
  sendReturnInformationRequest($("#token").val());
}
function infoManual() {
  sendInfoRequest($("#token").val());
}

function sendTakeRequest(token) {
  $.post({
    url: "/hardware/take",
    data: {
      token: token
    },
    success: function (response) {
      location.reload();
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
  hardwareScannerStarted = false;
}

var returnToken;

function sendReturnInformationRequest(token) {
  returnToken = token;
  $.get("/hardware/reservation/" + token, function (response) {
    $('#confirmationModalImg').attr("src", response.hardwareItem.itemURL);
    $('#confirmationModalBody').html(reservationInfoTemplate
      .replace(/#count/g, 1)
      .replace(/#itemName/g, response.hardwareItem.name)
      .replace(/#userName/g, response.user.name)
      .replace(/#reservationStatus/g, response.isReserved ? "Reserved" : "Taken")
    );
    $('#confirmationModal').modal()
  }, "json");
  closeScanner();
  hardwareScannerStarted = false;
}

function sendReturnConfirmRequest() {
  $.post({
    url: "/hardware/return",
    data: {
      token: returnToken
    },
    success: function (response) {
      location.reload();
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
  hardwareScannerStarted = false;
  returnToken = "";
}

var reservationInfoTemplate = "<p><b>Item(s):</b> #countx#itemName</p>" +
  "<p><b>User:</b> #userName</p>" +
  "<p><b>Status:</b> #reservationStatus</p>";

function sendInfoRequest(token) {
  $.get("/hardware/reservation/" + token)
    .done(function (response) {
      $('#infoModalLabel').html(response.user.name + "->" + response.hardwareItem.name);
      $('#infoModalImg').attr("src", response.hardwareItem.itemURL);
      $('#infoModalBody').html(reservationInfoTemplate
        .replace(/#count/g, 1)
        .replace(/#itemName/g, response.hardwareItem.name)
        .replace(/#userName/g, response.user.name)
        .replace(/#reservationStatus/g, response.isReserved ? "Reserved" : "Taken")
      );
      $('#infoModal').modal()
    })
    .fail(function (error) {
      $.notify({
        message: error.responseJSON.message
      }, {
          type: 'danger'
        });
    });
  closeScanner();
  hardwareScannerStarted = false;
}
