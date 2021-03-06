// init fakeloader
const fakeLoader = new CirFakeLoader();

// scripts for year slider
const slider = document.getElementById("slider");

noUiSlider.create(slider, {
  start: 2,
  padding: 0,
  range: {
    min: 1,
    max: 3
  },
  step: 1,
  format: wNumb({
    decimals: 0
  })
});

slider.noUiSlider.on("change", function() {
  const levelSliderValue = slider.noUiSlider.get();
  $("#current-level").text(levelSliderValue[0]);
});

function updateVisualization(data) {
  removeNoDataMessage();
  $("#graph").empty();
  if (!data.nodes[0]) {
    addNoDataMessage();
    return;
  }
  var visualization = d3plus
    .viz()
    .container("#graph")
    .type("rings")
    .text("author")
    .focus(data.nodes[0].id)
    .data(data.nodes)
    .edges(data.links)
    .edges({
      arrows: 4,
      strength: 1.4
    })
    .id("id")
    .width({
      value: $("#graph").width()
    })
    .height({
      value: 500
    })
    .labels({
      value: false
    })
    .tooltip({
      stacked: true,
      large: 500,
      fullscreen: true,
      html: function(id) {
        const node = data.nodes.find(node => node.id === id);
        const viewUrl = googleScholarSearchUrl(node.title);

        const htmlText =
          `<h6>${node.author}</h6>` + `<b>Paper:</b> ${node.title}`;

        return htmlText;
      }
    })
    .draw();
}

/**
 * Autocomplete
 */

function attachAutocomplete($dom) {
  $dom.autocomplete({
    source: function(req, updateList) {
      var searchParams = new URLSearchParams();
      searchParams.set("domain", "author");
      searchParams.set("search", req.term);
      var url = API_HOST + "/autocomplete?" + searchParams.toString();
      $.ajax({
        url: url,
        success: updateList
      });
    }
  });
}
// attach to first input
$(function() {
  attachAutocomplete($("input[name=author]"));
});

/**
 * Query
 */

function getFormParams() {
  return {
    author: $("input[name=author]").val(),
    currentLevel: slider.noUiSlider.get()[0]
  };
}

function renderFormFromSearch() {
  const { author, currentLevel = 2 } = $location.search();
  $("input[name=author]").val(author);
  slider.noUiSlider.set(currentLevel);
}

/**
 * No request is made if name is empty
 */
function submitQuery() {
  fakeLoader.show();

  const { author, currentLevel } = getFormParams();

  if (author) {
    axios
      .get(
        `${API_HOST}/graphs/coauthors?levels=${currentLevel}&author=${author}`
      )
      .then(response => {
        updateVisualization(response.data);
        fakeLoader.hide();
      });
  }
}

/**
 * No data
 */

function removeNoDataMessage() {
  $("div.noDataDiv").remove();
}

function addNoDataMessage() {
  const $noDataDiv = $("<div>")
    .addClass("noDataDiv")
    .css({
      position: "absolute",
      top: "20%",
      left: "0",
      width: "100%",
      height: "100%",
      color: "red",
      'text-align' : 'center'
    })
    .html("No Data Available");
  $("#graph-container").append($noDataDiv);
}

/**
 * UI Controller
 */

function pageLoad() {
  renderFormFromSearch();
  submitQuery();
}

// on submit
$("#filterForm").submit(() => {
  $location.search(getFormParams());
});

// on search change
cir.run([
  "$rootScope",
  $rootScope => {
    $rootScope.$on("$locationChangeStart", () => pageLoad());
  }
]);

// on page load
$(() => () => pageLoad());
