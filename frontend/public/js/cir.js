/**
 * Global angular app
 */

var $location;

var cir = angular
  .module("CIR", [])
  .constant("API_HOST", API_HOST)
  .constant("FRONTEND_HOST", FRONTEND_HOST)
  // expose $location
  .run([
    "$location",
    function(location) {
      $location = location;
    }
  ]);
