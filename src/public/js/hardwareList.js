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
    url: "/hardware/" + item.id,
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

function previewImage(elementId, url) {
  $("#" + elementId).attr(
    "src",
     url 
  );
}

function editItem(item) {
  $("#update-panel").fadeIn("slow");
  $("#update-item-id").val(item.id);
  $("#update-item-stock").val(item.totalStock);
  $("#update-item-name").val(item.name);
  $("#update-item-image").val(item.itemURL);
  previewImage("update-img-preview", item.itemURL);
}

function editItemSubmit() {
  var item = {
    id: $("#update-item-id").val(),
    totalStock: $("#update-item-stock").val(),
    name: $("#update-item-name").val(),
    itemURL: $("#update-item-image").val(),
  }

  $.ajax({
    type: "PUT",
    url: "/hardware/" + item.id,
    data: item,
    success: function () {
      location.reload();
    },
    error: showError
  });
}