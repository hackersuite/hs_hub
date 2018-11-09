var modalLabels = {
  take: "This person wants to take these items.",
  return: "Are you sure this person is returning these items?"
}

var reservationInfoTemplate = "<p><b>Item(s):</b> #countx#itemName</p>" +
  "<p><b>User:</b> #userName</p>" +
  "<p><b>Status:</b> #reservationStatus</p>";

function scanReservationToken(callback) {
  closeScanner();
  startCustomScanner("hardware-qr-scanner", callback);
}

function showError(error) {
  $.notify({
    message: error.responseJSON.message
  }, {
      type: 'danger'
    });
}

function updateReservationStatus(token, action) {
  $.post({
    url: "/hardware/" + action,
    data: {
      token: token || ""
    },
    success: function () {
      location.reload();
    },
    error: showError
  });
}

function reservationInfo(token) {
  getReservationInfo(token, showInfoModal, showError);
}

function takeItem(token) {
  getReservationInfo(token,
    function (response) {
      if (!response.isReserved) {
        return showError({ responseJSON: { message: "This item has already been taken!" } });
      }
      showConfirmationModal(response, "take", function () {
        updateReservationStatus(token, "take");
      });
    }, showError);
}

function returnItem(token) {
  getReservationInfo(token,
    function (response) {
      if (response.isReserved) {
        return showError({ responseJSON: { message: "This item has not been taken yet!" } });
      }
      showConfirmationModal(response, "return", function () {
        updateReservationStatus(token, "return");
      });
    }, showError);
}

function showConfirmationModal(reservation, action, confirmCallback) {
  $("#confirmModalLabel").html(modalLabels[action])
  $('#confirmModalImg').attr("src", reservation.hardwareItem.itemURL);
  $('#confirmModalBody').html(getModalBodyString(reservation));
  $("#modal-confirm-button").off( "click" );
  $("#modal-confirm-button").click(confirmCallback);
  $('#confirmModal').modal()
}

function showInfoModal(reservation) {
  $("#infoModalLabel").html(reservation.hardwareItem.name + " taken/reserved by " + reservation.user.name);
  $("#infoModalImg").attr("src", reservation.hardwareItem.itemURL);
  $('#infoModalBody').html(getModalBodyString(reservation));
  $('#infoModal').modal()
}

function getModalBodyString(reservation) {
  return reservationInfoTemplate
    .replace(/#count/g, reservation.reservationQuantity)
    .replace(/#itemName/g, reservation.hardwareItem.name)
    .replace(/#userName/g, reservation.user.name)
    .replace(/#reservationStatus/g, reservation.isReserved ? "Reserved" : "Taken");
}

function getReservationInfo(token, success, fail) {
  $.get("/hardware/reservation/" + token)
    .done(success)
    .fail(fail);
  closeScanner();
}
