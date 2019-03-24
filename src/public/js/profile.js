function updateRepository(repoURL) {
  $.post({
    url: "/team/updateRepository",
    data: {
      repo: repoURL
    },
    success: function(response) {
      $.notify({
        message: response
      }, {
        type: 'success'
      });
    },  
    error: function(error) {
      $.notify({
        message: error.responseJSON.message
      }, {
        type: 'danger'
      });
      return;
    }
  });
}

function createTeam() {
  $.post({
    url: "/team/create",
    success: function(response) {
      location.reload();
    },
    error: function(error) {
      $.notify({
        message: error.responseJSON.message
      }, {
        type: 'danger'
      });
      return;
    }
  });
}

function joinTeam(teamCode) {
  $.post({
    url: "/team/join",
    data: {
      team: teamCode
    },
    success: function(response) {
      location.reload();
    },  
    error: function(error) {
      $.notify({
        message: error.responseJSON.message
      }, {
        type: 'danger'
      });
      return;
    }
  });
}

function leaveTeam() {
  $.post({
    url: "/team/leave",
    success: function(response) {
      location.reload();
    },
    error: function(error) {
      $.notify({
        message: error.responseJSON.message
      }, {
        type: 'danger'
      });
      return;
    }
  });
}