var itemInfoTemplate = `<p><b>Item(s):</b> #count x #itemName</p>`;
var items = [];

function deleteItemConfirm(itemId) {
  showConfirmationModal(items[itemId], function() {
    deleteItem(items[itemId]);
  })
}

function showConfirmationModal(item, confirmCallback) {
  $('#confirmModalImg').attr("src", item.itemURL);
  $('#confirmModalBody').html(itemInfoTemplate
                                .replace(/#count/g, item.totalStock)
                                .replace(/#itemName/g, item.name));
  $("#modal-confirm-button").off( "click" );
  $("#modal-confirm-button").click(confirmCallback);
  $('#confirmModal').modal()
}

function deleteItem(item) {
  $.ajax({
    type: "DELETE",
    url: "/hardware/" + item.id + "/delete",
    success: function () {
      location.reload();
    },
    error: showError
  });
}

function showError(error) {
  $.notify({
    message: error.responseJSON.message
  }, {
      type: 'danger'
    });
}