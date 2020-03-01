(function($){
  $(function(){

    $('.sidenav').sidenav();
    $('.parallax').parallax();
    $('select').formSelect();



  }); // end of document ready
})(jQuery); // end of jQuery name space

var yes = 1;
var no = 0;
var always = 1;
var often = 0.75;
var sometimes = 0.5;
var rarely = 0.25;
var never = 0;

function yesnohtml(question, key) {
  var html = "<h6>" + question["question"] + "</h6>";
  if(question["info"]) {
    html += "<p>" + question["info"] + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' id='yes'> <span>Yes</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' id='no'> <span>No</span> </label> </div>";
  html += "</div>";
  return html;
}

function scalehtml(question, key) {
  var html = "<h6>" + question["question"] + "</h6>";
  if(question["info"]) {
    html += "<p>" + question["info"] + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' id='never'> <span>Never</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' id='rarely'> <span>Rarely</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' id='sometimes'> <span>Sometimes</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' id='often'> <span>Often</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' id='always'> <span>Always</span> </label> </div>";
  html += "</div>";
  return html;
}

function calculateResults(questions) {
  $("form input:checked").each(function(key, response) {
    if(key == $(response).attr("data-id")) {
      var responseText = $(response).attr("id");
      var responseValue = getResponseValue(responseText);
      questions[key]["response"] = responseText;
      questions[key]["responseValue"] = responseValue;
      questions[key]["responseWeightedValue"] = questions[key]["weighting"] * responseValue;
    }
  });
  return questions;
}

function getResponseValue(responseText) {
  if(responseText == "yes") {
    return yes;
  } else if(responseText == "no") {
    return no;
  } else if(responseText == "always") {
    return always;
  } else if(responseText == "often") {
    return often;
  } else if(responseText == "sometimes") {
    return sometimes;
  } else if(responseText == "rarely") {
    return rarely;
  } else if(responseText == "never") {
    return never;
  }
}

function displayResults(results) {
  var categories = {};
  $.each(results, function(key, result) {
    if(typeof categories[result["factor"]] == "undefined") {
      categories[result["factor"]] = { "factor": result["factor"], "value": 0 };
    }
  });
  $.each(results, function(key, result) {
    categories[result["factor"]]["value"] += result["responseWeightedValue"];
  });
  console.log(categories);
  $(".responses").append("<p>" + JSON.stringify(results) + "</p>");
  $(".factors").append("<p>" + JSON.stringify(categories) + "</p>");
  return categories;
}

$( document ).ready(function() {
  if($("form").length > 0) {
    $.getJSON( "../js/bfaf.json", function( data ) {
      var questions = data["questions"];

      $.each(questions, function(key, question) {
        if(question["type"] == "yesno") {
          $("form").append(yesnohtml(question, key));
        } else if(question["type"] == "scale") {
          $("form").append(scalehtml(question, key));
        }
      });
      $("form").append($('#form-submit-button').parent());
      $('#form-submit-button').click(function() {
        //TODO Validation
        $('#framework-form').hide();
        $('#framework-results').show();
        var results = calculateResults(questions);
        displayResults(results);
        $(window).scrollTop(0);
      });
    });

  }

  $('#framework-results').hide();

});

var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5', 'Category 6', 'Category 7'],
    datasets: [{
      backgroundColor: '#000000',
      borderColor: '#000000',
      pointBackgroundColor: '#000000',
      data: [
        80,
        10,
        30,
        20,
        50,
        90,
        5
      ]
    },
  ] },
  options: {
    scale: {
      ticks: {
        beginAtZero: true,
        suggestedMax: 100
      }
    },
    legend: {
      display: false
    }
  }
});
