/**
 * Angular app for top n x of y
 */

cir.controller("QueryDisplayController", function($scope) {

});

cir.controller("QueryParamsController", function($scope) {
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
      key: "venue"
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
      display: "Conference",
      key: "conference"
    },
    {
      display: "Cited Author",
      key: "cited-author"
    },
    {
      display: "Cited By Author",
      key: "cited-by-author"
    }
  ];

  $scope.topN = 0;
  $scope.query = {};
  $scope.show = true;

  $scope.submitQuery = function() {
    console.log($scope.query);
  };
});
