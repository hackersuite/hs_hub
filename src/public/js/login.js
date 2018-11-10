function showError(error) {
  console.log(error);
  $.notify({
    message: error
  }, {
      type: 'danger'
    });
}