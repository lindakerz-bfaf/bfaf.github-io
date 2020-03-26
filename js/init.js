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
var SORTED_STAGES = ['0-2','3-10','11-20']
var PASS_STAGE_WEIGHT = 0.75
var PAGES = [
  {stage:'0-2', type: 'Symptom'},
  {stage:'3-10', type: 'Symptom', showIf: function(results){
    return getGroupWeight('0-2', results) < PASS_STAGE_WEIGHT
  }},
  {type: 'Factor'}
]
var currentPage = -1

function yesNoHtml(question, key) {
  var html = "<h6>" + question.question + "</h6>";
  if(question.info) {
    html += "<p>" + question.info + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question.id + "' type='radio' value='yes'> <span>Yes</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question.id + "' type='radio' value='no'> <span>No</span> </label> </div>";
  html += "</div>";
  return html;
}

function scaleHtml(question, key) {
  var html = "<h6>" + question.question + "</h6>";
  if(question.info) {
    html += "<p>" + question.info + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question.id + "' type='radio' value='always'> <span>Strongly Agree</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question.id + "' type='radio' value='often'> <span>Agree</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question.id + "' type='radio' value='sometimes'> <span>Moderately</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question.id + "' type='radio' value='rarely'> <span>Slightly</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='" + key + "' name='" + question.id + "' type='radio' value='never'> <span>Not at all</span> </label> </div>";
  html += "</div>";
  return html;
}

function counterScaleHtml(question, key) {
  var html = "<h6 class='counter-question disabled'>" + question.counterQuestion + "</h6>";
  html += "<div class='form-question-answer counter-question'>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='counter-" + key + "' name='counter-" + question.id + "' type='radio' value='always' disabled> <span>Very Good</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='counter-" + key + "' name='counter-" + question.id + "' type='radio' value='often' disabled> <span>Good</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='counter-" + key + "' name='counter-" + question.id + "' type='radio' value='sometimes' disabled> <span>Fair</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='counter-" + key + "' name='counter-" + question.id + "' type='radio' value='rarely' disabled> <span>Poor</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' data-id='counter-" + key + "' name='counter-" + question.id + "' type='radio' value='never' disabled> <span>Very Poor</span> </label> </div>";
  html += "</div>";
  return html;
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

function getFailureScore(results, failureStage) {
  var factorsTotalScore = getGroupWeight('Factor', results, 'type');
  var failureStageScore = 0;

  if(failureStage == 'late') failureStageScore = getGroupWeight('0-2', results);
  if(failureStage == 'mid') failureStageScore = getGroupWeight('3-10', results);
  if(failureStage == 'early') failureStageScore = getGroupWeight('11-20', results);

  var failureScore = (factorsTotalScore + failureStageScore) * 100;
  failureScore = Math.round(failureScore);
  if(failureScore > 100) failureScore = 100;
  return failureScore / 100;
}

function getFailureStage(results) {
  var lateStageScore = getGroupWeight('0-2', results);
  var midStageScore = getGroupWeight('3-10', results);
  var earlyStageScore = getGroupWeight('11-20', results);

  if(lateStageScore > 0.75) return 'late';
  if(midStageScore > 0.75) return 'mid';
  if(lateStageScore > 0.25 && midStageScore > 0.25) {
    if(lateStageScore > midStageScore) return 'late';
    else return 'mid';
  }
  if(earlyStageScore > 0.25) return 'early';
  return 'success'
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

  var stage = getFailureStage(results);
  var score = getFailureScore(results, stage);

  var summaryHtml = "<p><strong>Stage 0-2 total score:</strong> " + getGroupWeight('0-2', results) + "</p>";
  summaryHtml += "<p><strong>Stage 3-10 total score:</strong> " + getGroupWeight('3-10', results) + "</p>";
  summaryHtml += "<p><strong>Stage 11-20 total score:</strong> " + getGroupWeight('11-20', results) + "</p>";
  summaryHtml += "<p><strong>Failure stage:</strong> " + stage + "</p>"
  summaryHtml += "<p><strong>Factors total score:</strong> " + getGroupWeight('Factor', results, 'type') + "</p>";
  $(".factors").append(summaryHtml);
  let bubbleResults = []
  $.each(results, function(index, result){
    if(result.type === 'Factor' && result.value > 0){
      bubbleResults.push(result)
    }
  })

  var percentScore = score * 100;
  var percentRemain = 100 - percentScore;
  renderDial(percentScore, percentRemain);

  var bubbleSelector = '#bubble-' + stage
  var elem = $(bubbleSelector)
  var width = elem.innerWidth()
  var height = elem.innerHeight()
  window.bfaf.drawBubbleChart(bubbleResults, width, height, bubbleSelector)

  var html = ''
  var tableHtml = '<table>'
  tableHtml += '<tr>'
  tableHtml += '<th>Type</th>'
  tableHtml += '<th>Domain</th>'
  tableHtml += '<th>Factor</th>'
  // $.each(SORTED_STAGES, function(index, stage){
  //   tableHtml += '<th>' + stage + ' Years</th>'
  // })
  tableHtml += '<th>Value</th>'
  tableHtml += '</tr>'
  $.each(categories, function(type, typeCats){
    $.each(typeCats, function(domainKey, domainCats){
      if(type == "Factor") {
        // html += '<h5>' + type + ': ' + domainKey + '</h5>'
        $.each(domainCats, function(factor, factorCats){
          // html += '<h6>' + factor + '</h6>'
          tableHtml += '<tr>'
          tableHtml += '<td>' + type + '</td>'
          tableHtml += '<td>' + domainKey + '</td>'
          tableHtml += '<td>' + factor + '</td>'
          // $.each(SORTED_STAGES, function(index, stage){
          //   if(factorCats[stage] != null){
          //     var value = factorCats[stage]
          //     tableHtml += '<td>' + numeral(value).format('0.00%') + '</td>'
          //   } else {
          //     tableHtml += '<td />'
          //   }
          // })
          tableHtml += '<td>' + factorCats['factor'] + '</td>'
          tableHtml += '</tr>'
          // $.each(factorCats, function(stage, value){
          //   html += '<p>' + stage + ' = ' + numeral(value).format('0.00%') + '</p>'
          // })
        })
      }
    })
  })
  tableHtml += '</table>'
  $(".factors").append("<p>" + tableHtml + "</p><p>" + html + "</p>");
  $(".responses").append("<p>" + JSON.stringify(results) + "</p>");
  return categories;
}

function filterQuestions(questions, type, stage){
  var rtnQuestions = []
  $.each(questions, function(key, question) {
    if(type && question.type !== type){ return }
    if(stage){
      var earliestStage = SORTED_STAGES.length - 1
      $.each(question.clusters || [], function(index, cluster){
        var stageIndex = -1
        if(cluster.stage){
          stageIndex = SORTED_STAGES.indexOf(cluster.stage)
        }
        if(stageIndex >= 0 && stageIndex < earliestStage ){
          earliestStage = stageIndex
        }
      })
      if(SORTED_STAGES[earliestStage] !== stage){
        return
      }
    }
    rtnQuestions.push(question)
  })
  return rtnQuestions
}

function autoPopulateForm(questions, type, stage) {
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

function getNextPage(results){
  var page = PAGES[++currentPage]
  while(page && page.showIf != null && !page.showIf(results)){
    page = PAGES[++currentPage]
  }
  return page
}

function renderPage(questions){
  $("#form-content").empty()
  $.each(questions, function(index, question) {
    question.id = 'q' + index
    if(question["questionType"] == "yesno") {
      $("#form-content").append(yesNoHtml(question, index));
    } else if(question["questionType"] == "scale") {
      $("#form-content").append(scaleHtml(question, index));
    }
    if(question.counterQuestion){
      $("#form-content").append(counterScaleHtml(question, index));
    }
  });
}


function onJSONLoaded(data){
  var questions = data.questions;
  var totalWeightings = {}
  totalWeightings['0-2'] = getTotalWeight('0-2', questions)
  totalWeightings['3-10'] = getTotalWeight('3-10', questions)
  totalWeightings['11-20'] = getTotalWeight('11-20', questions)
  totalWeightings.factor = getTotalWeight('factor', questions)
  totalWeightings.overall = getTotalWeight(null, questions)
  var page = getNextPage()
  var pageQns = []
  if(page){
    pageQns = filterQuestions(questions, page.type, page.stage)
    renderPage(pageQns)
  }
  var results = []
  $('#form-submit-button').on('click', function() {
    //TODO Validation
    results = [].concat(results, calculateResults(pageQns, totalWeightings));
    var page = getNextPage(results)
    if(page){
      pageQns = filterQuestions(questions, page.type, page.stage)
      renderPage(pageQns)
    } else {
      $('#framework-form').hide();
      $('#framework-results').show();
      displayResults(results);
    }
    $(window).scrollTop(0);
  });
  $("#auto-populate").on("click", function(){ autoPopulateForm(questions) });
  $(document).on('click', 'input[type="radio"]', function(){
    var key = $(this).attr('data-id')
    var isNever = $(this).val() === 'never'
    var disabled = isNever
    $('.counter-question input[data-id="counter-'+ key + '"]').attr('disabled', disabled).prop('checked', false)
    if(isNever) {
      $(this).parent().parent().parent().next().addClass("disabled")
    } else {
      $(this).parent().parent().parent().next().removeClass("disabled")
    }
  })
}

function calculateResults(questions, totalWeightings) {
  var responses = []
  $("form input:checked").each(function(key, response) {
    // if(key == $(response).attr("data-id")) {
      var id = $(response).attr("data-id")
      var counterPrefix = 'counter-'
      if(id && id.substring(0, counterPrefix.length) === counterPrefix){
        return // ignore counter inputs
      }
      var responseText = $(response).val();
      var responseValue = getResponseValue(responseText);
      var netResponseValue = responseValue
      var counterInput = $("form input[data-id='"+ counterPrefix + id + "']:checked").val()
      var counterResponseValue = 0
      if(counterInput){
        counterResponseValue =  getResponseValue(counterInput)
        // remove counter response weighting, ensure that cannot be below 0
        netResponseValue -= counterResponseValue || 0
        netResponseValue =  Math.max(0, netResponseValue)
      }
      var question = questions[id]
      $.each(question && question.clusters, function(clusterIndex, cluster){
        var totalStageWeight = totalWeightings[cluster.stage] || cluster.weighting
        var totalWeight = totalWeightings.overall || cluster.weighting
        var weightedValue = cluster.weighting*netResponseValue
        responses.push({
            code: question.code,
            type: question.type,
            domain: question.domain,
            subDomain: question.subDomain,
            factor: question.factor,
            stage: cluster.stage,
            response: responseText,
            value: netResponseValue,
            rawValue: responseValue,
            counterValue: counterResponseValue,
            weightedValue: {
              stage: weightedValue/totalStageWeight,
              overall: weightedValue/totalWeight
            }
        })
      })

    // }
  });
  return responses;
}

function getGroupWeight(matchValue, results, matchKey){
  matchKey = matchKey || 'stage'
  var reducer = function(total, result){
    if(result[matchKey] === matchValue && result.weightedValue && result.weightedValue.stage){
      return total + result.weightedValue.stage
    }
    return total
  }
  return (results || []).reduce(reducer, 0)
}

function getTotalWeight(stage, questions){
  var totalWeight = 0
  $.each(questions, function(index, question){
    $.each(question.clusters, function(index, cluster){
      if(cluster.stage === stage || stage == null){ totalWeight += cluster.weighting }
    })
  })
  return totalWeight
}

function renderDial(score, remainder) {
  $(".score").html(score + "%");
  var dialColor = '#BBBBBB';
  if(score >= 76) {
    //red
    dialColor = '#E84855';
  } else if(score >= 51) {
    //orange
    dialColor = '#E89F47';
  } else if(score >= 26) {
    //yellow
    dialColor = '#EDD447';
  } else {
    //green
    dialColor = '#4BAF48';
  }
  var ctx = document.getElementById("score-dial").getContext("2d");
  var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data:{
      datasets: [{
        data: [score, remainder],
        backgroundColor: [dialColor, '#E2E2E2']
      }]
    },
    options: {
      cutoutPercentage: 70,
      rotation: Math.PI,
      circumference: Math.PI,
      tooltips: {
         enabled: false
       }
    }
  });
}

function renderChart(){
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
}
