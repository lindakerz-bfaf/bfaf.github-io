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

var SCALE_MODE = 5

function yesnohtml(question, key) {
  var html = "<h6>" + question["question"] + "</h6>";
  if(question["info"]) {
    html += "<p>" + question["info"] + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' value='yes'> <span>Yes</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' value='no'> <span>No</span> </label> </div>";
  html += "</div>";
  return html;
}

function scalehtml(question, key) {
  var html = "<h6>" + question["question"] + "</h6>";
  if(question["info"]) {
    html += "<p>" + question["info"] + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' value='always'> <span>Always</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' value='often'> <span>Often</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' value='sometimes'> <span>Sometimes</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' value='rarely'> <span>Rarely</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question["id"] + "' type='radio' value='never'> <span>Never</span> </label> </div>";
  html += "</div>";
  return html;
}

function getTotalWeight(stage, questions){
  var totalWeight = 0
  $.each(questions, function(index, question){
    $.each(question.clusters, function(index, cluster){
      if(cluster.stage === stage || !stage){ totalWeight += cluster.weighting }
    })
  })
  return totalWeight
}

function calculateResults(questions) {
  var responses = []
  $("form input:checked").each(function(key, response) {
    if(key == $(response).attr("data-id")) {
      var responseText = $(response).attr("value");
      var responseValue = getResponseValue(responseText);
      var question = questions[key]
      $.each(question.clusters, function(clusterIndex, cluster){
        var totalStageWeight = getTotalWeight(cluster.stage, questions) || 1
        var totalWeight = getTotalWeight(null, questions) || 1
        var weightedValue = cluster.weighting*responseValue
        responses.push({
            type: question.type,
            domain: question.domain,
            subDomain: question.subDomain,
            factor: question.factor,
            stage: cluster.stage,
            response: responseText,
            value: responseValue,
            weightedValue: {
              stage: weightedValue/totalStageWeight,
              overall: weightedValue/totalWeight
            }
        })
      })
    }
  });
  return responses;
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
    var type = result.type
    var factor = result.factor
    var stage = result.stage
    var domainKey = result.domain + ' - ' + result.subDomain
    categories[type] = categories[type] || {}
    categories[type][domainKey] = categories[type][domainKey] || {}
    categories[type][domainKey][factor] = categories[type][domainKey][factor] || {}
    categories[type][domainKey][factor][stage] = result.weightedValue.stage
  });
  var stages = ['0-2','3-10','11-20','>20','all']
  console.log(categories);
  var html = ''
  var tableHtml = '<table>'
  tableHtml += '<tr>'
  tableHtml += '<th>Type</th>'
  tableHtml += '<th>Domain</th>'
  tableHtml += '<th>Factor</th>'
  $.each(stages, function(index, stage){
    tableHtml += '<th>' + stage + ' Years</th>'
  })
  tableHtml += '</tr>'
  $.each(categories, function(type, typeCats){
    $.each(typeCats, function(domainKey, domainCats){
      html += '<h5>' + type + ': ' + domainKey + '</h5>'
      $.each(domainCats, function(factor, factorCats){
        html += '<h6>' + factor + '</h6>'
        tableHtml += '<tr>'
        tableHtml += '<td>' + type + '</td>'
        tableHtml += '<td>' + domainKey + '</td>'
        tableHtml += '<td>' + factor + '</td>'
        $.each(stages, function(index, stage){
          if(factorCats[stage] != null){
            var value = factorCats[stage]
            tableHtml += '<td>' + numeral(value).format('0.00%') + '</td>'
          } else {
            tableHtml += '<td />'
          }
        })
        tableHtml += '</tr>'
        $.each(factorCats, function(stage, value){
          html += '<p>' + stage + ' = ' + numeral(value).format('0.00%') + '</p>'
        })
      })
    })
  })
  tableHtml += '</table>'
  $(".factors").append("<p>" + tableHtml + "</p><p>" + html + "</p>");
  $(".responses").append("<p>" + JSON.stringify(results) + "</p>");
  return categories;
}

function autoPopulateForm(questions) {
  //used for testing
  $.each(questions, function(key, question) {
    var min = 0
    var max = 1
    var options = []
    if(question["questionType"] == "yesno") {
      options = ['no','yes']
    } else if(question["questionType"] == "scale") {
      max = SCALE_MODE - 1
      options = SCALE_MODE === 5
        ? ['always','often','sometimes','rarely','never']
        : ['always','sometimes','never']
    }
    var result = getRandomInt(min, max)
    var option = options[result]
    $('input[data-id='+key+'][value='+option+']').prop("checked", true)
  });
}

function getRandomInt(min, max){
  return min + Math.floor(Math.random() * (max - min + 1));
}

$( document ).ready(function() {
  if($("form").length > 0) {
    $.getJSON( "../js/bfaf.json", onJSONLoaded);

  }
  $('#framework-results').hide();

});

function onJSONLoaded(data){
  var questions = data["questions"];

  $.each(questions, function(index, question) {
    question.id = 'q' + index
    if(question["questionType"] == "yesno") {
      $("form").append(yesnohtml(question, index));
    } else if(question["questionType"] == "scale") {
      $("form").append(scalehtml(question, index));
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
  $("#auto-populate").on("click", function(){ autoPopulateForm(questions) });
}

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
