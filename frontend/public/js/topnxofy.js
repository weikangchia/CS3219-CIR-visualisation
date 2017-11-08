/**
 * Angular app for top n x of y
 */

cir.controller("QueryParamsController", [
  "API_HOST", "$scope",
  function(API_HOST, $scope) {

    $scope.xCategories = [
      {
        display: "Papers",
        key: "paper"
      },
      {
        display: "Authors",
        key: "authors"
      },
      {
        display: "Conferences",
        key: "conference"
      },
      {
        display: "Citations",
        key: "citation"
      },
      {
        display: "Venues",
        key: "venues"
      },
      {
        display: "Book Titles",
        key: "book-title"
      },
      {
        display: "Base Papers",
        key: "base-papers"
      }
    ];

    $scope.yCategories = [
      {
        display: "Venue",
        key: "venues"
      },
      {
        display: "Author",
        key: "authors"
      },
      {
        display: "Cited Author",
        key: "cited-authors"
      },
      {
        display: "Cited By Author",
        key: "cited-by-authors"
      }
    ];

    $scope.query = {
      topN : 3,
      xCategoryValue : $scope.xCategories[0]['key'],
      yCategoryValue : $scope.yCategories[0]['key']
    };

    function displayVisualization(data){
      console.log(data)
    }

    $scope.submitQuery = function() {
      var searchParams = new URLSearchParams();
      searchParams.set('topN', $scope.query.topN);
      searchParams.set('x', $scope.query.xCategoryValue);
      searchParams.set('y', $scope.query.yCategoryValue);
      searchParams.set('value', $scope.query.yValue); //top-X-of-Y?topN=3&x=author&y=venue&value=arxiv
      var url = API_HOST + "/top-X-of-Y?" + searchParams.toString();
      $.ajax({
        url,
        success: displayVisualization
      })
    };

    $(".domain-selector").autocomplete({
      source: function(req, updateList) {
        var domain = $scope.query.yCategoryValue
        var search = $scope.query.yValue
        var searchParams = new URLSearchParams();
        searchParams.set('domain', domain);
        searchParams.set('search', search);
        var url = API_HOST + "/autocomplete?" + searchParams.toString()
        $.ajax({
          url: url,
          success: updateList
        });
      }
    });
  }
]);
