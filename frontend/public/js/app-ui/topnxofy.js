/**
 * Angular app for top n x of y
 */

cir.controller("QueryParamsController", [
  "API_HOST",
  "$scope",
  function(API_HOST, $scope) {
    $scope.xCategories = [
      {
        display: "Papers",
        key: "paper",
        itemId: i => i.title
      },
      {
        display: "Authors",
        key: "author",
        itemId: i => i.name
      },
      {
        display: "Conferences",
        key: "venue",
        itemId: i => i.venue
      },
      {
        display: "Key Phrase",
        key: "keyphrase",
        itemId: i => i.keyPhrase
      },
      {
        display: "Year",
        key: "year",
        itemId: i => i.year
      }
    ];

    $scope.yCategories = [
      {
        display: "Papers",
        key: "paper"
      },
      {
        display: "Authors",
        key: "author"
      },
      {
        display: "Conferences",
        key: "venue"
      },
      {
        display: "Key Phrase",
        key: "keyphrase"
      },
      {
        display: "Year",
        key: "year"
      }
    ];

    var searchParams = new URLSearchParams(location.search);

    $scope.query = {
      topN: parseInt(searchParams.get("topN")) || 3,
      xCategoryValue:
        searchParams.get("x") || "author" || $scope.xCategories[0]["key"],
      yCategoryValue:
        searchParams.get("y") || "venue" || $scope.yCategories[0]["key"],
      yValue: searchParams.get("value") || "ArXiv"
    };

    function transformDataIntoBarData(data) {
      var itemId = _.find($scope.xCategories, { key: data.x }).itemId;
      var results = data.results;
      return results
        .map(record => {
          return { count: record.count, id: itemId(record.x) };
        })
        .sort((record1, record2) => {
          return record1.count - record2.count;
        });
    }

    var barChart = d3plus
      .viz()
      .type("bar")
      .container("#barchart")
      .id("id");

    function displayVisualization(data) {
      var barData = transformDataIntoBarData(data);

      var maxCount = barData.reduce(
        (max, record) => Math.max(max, record.count),
        0
      );

      var barDataIds = barData.map(record => record.id);

      console.log(data)
      barChart
        .data(barData)
        .x({
          value: d => d["id"],
          label: capitalize(data.x)
        })
        .y({
          value: d => d.count,
          label: "Count"
        })
        .title(
            "Top " +
            barData.length +
            " " +
            capitalize(data.x) +
            "(s) of " +
            capitalize(data.y) +
            ": " +
            data.value
        )
        .title({
          "sub": data.description
        })
        .format({
          text: (text, params) => {
            if (text === "size") {
              return "Count";
            } else {
              return d3plus.string.title(text, params);
            }
          }
        })
        .order(d => barDataIds.indexOf(d))
        .draw();
    }

    function getSearchParamsFromUser() {
      var searchParams = new URLSearchParams();
      searchParams.set("topN", $scope.query.topN);
      searchParams.set("x", $scope.query.xCategoryValue);
      searchParams.set("y", $scope.query.yCategoryValue);
      searchParams.set("value", $scope.query.yValue);
      return searchParams;
    }

    $scope.submitQuery = function() {
      var path = "/top-X-of-Y?" + getSearchParamsFromUser().toString();
      var url = API_HOST + path;

      $.ajax({
        url,
        success: displayVisualization
      });
    };

    $scope.submitQuery();

    $scope.reloadWithParams = function() {
      location.search = getSearchParamsFromUser().toString();
    };

    $(".domain-selector").autocomplete({
      source: function(req, updateList) {
        var domain = $scope.query.yCategoryValue;
        var search = $scope.query.yValue;
        var searchParams = new URLSearchParams();
        searchParams.set("domain", domain);
        searchParams.set("search", search);
        var url = API_HOST + "/autocomplete?" + searchParams.toString();
        $.ajax({
          url: url,
          success: updateList
        });
      }
    });
  }
]);
