/**
 * Angular app for top n x of y
 */

cir.controller("QueryParamsController", [
  "API_HOST", "$scope",
  function(API_HOST, $scope) {
    $scope.xCategories = [
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
        display: "Author",
        key: "authors"
      },
      {
        display: "Venue",
        key: "venues"
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
      topN : 3
    };

    $scope.submitQuery = function() {
      console.log($scope.query);
    };

    $(".domain-selector").autocomplete({
      source: function(req, resolve) {
        var domain = $scope.query.yCategoryValue
        var search = $scope.query.yValue
        var searchParams = new URLSearchParams();
        searchParams.set('domain', domain);
        searchParams.set('search', search);
        var url = API_HOST + "/autocomplete?" + searchParams.toString()
        console.log(url)
        $.ajax({
          url: url,
          success: resolve
        });
      }
    });
  }
]);
