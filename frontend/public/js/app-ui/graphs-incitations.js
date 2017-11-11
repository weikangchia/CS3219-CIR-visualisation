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

/**
 * D3 Visualisation
 */

function updateVisualization(data) {
  $("#graph").empty();
  var visualization = d3plus
    .viz()
    .container("#graph")
    .type("rings")
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
        const paper = data.nodes.find(node => node.id === id);
        const viewUrl = paper.pdfUrl || googleScholarSearchUrl(paper.title);

        const htmlText =
          `<h6>${paper.title} (${paper.year})</h6>` +
          `<b>Authors:</b> ${paper.authors
            .map(author => author.name)
            .join(", ")}<br/>` +
          `<b>Abstract:</b> ${paper.abstract}<br/><br/><a class="btn btn-secondary btn-sm" href="${viewUrl}" role="button" target="_blank">View</a>`;

        return htmlText;
      }
    })
    .draw();
}

/**
 * Autocomplete
 */
/**
 * Auto complete
 */

function attachAutocomplete($dom) {
  $dom.autocomplete({
    source: function(req, updateList) {
      var searchParams = new URLSearchParams();
      searchParams.set("domain", "paper");
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
  attachAutocomplete($("input[name=title]"));
});

/**
 * Query
 */

function getFormParams() {
  return {
    title: $("input[name=title]").val(),
    currentLevel: slider.noUiSlider.get()[0]
  };
}

function renderFormFromSearch() {
  const { title, level = 2 } = $location.search();
  $("input[name=title]").val(title);
  slider.noUiSlider.set(level);
}

/**
 * No request is made if title is empty
 */
function submitQuery() {
  // fakeLoader.show();

  const { title, currentLevel } = getFormParams();
  if (title) {
    axios
      .get(`${API_HOST}/graphs/incitation?level=${currentLevel}&title=${title}`)
      .then(response => {
        updateVisualization(response.data);
        // fakeLoader.hide();
      });
  }
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
