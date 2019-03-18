function showPushNotificationDialog() {
  $("#modal-notification-button").off("click");
  $("#modal-notification-button").on("click", sendNotification);
  $('#notificaitonModal').modal()
}

function sendNotification() {
  var notificationText = $('textarea#notification-textarea').val();
  $.post("/announcement/push", {
    message: notificationText
  }).done(function () {
    showSuccess('Push notification sent successfully.');
  }).fail(function(xhr, textStatus, error) {
    showError(xhr.responseText);
  });
}

function showSuccess(msg) {
  $.notify({
    message: msg
  }, {
    type: 'success'
  });
}

function showError(error) {
  $.notify({
    message: error
  }, {
    type: 'danger'
  });
}