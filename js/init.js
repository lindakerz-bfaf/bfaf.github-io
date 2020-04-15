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
var LATE_STAGE = '0-2'
var MID_STAGE = '3-10'
var EARLY_STAGE = '11-20'

var SCALE_MODE = 5
var SORTED_STAGES = ['dominant',LATE_STAGE, MID_STAGE, EARLY_STAGE]
var PASS_STAGE_WEIGHT = 0.75
var PAGES = [
  {stage:[LATE_STAGE, 'dominant'], type: 'Symptom'},
  {stage:[MID_STAGE,EARLY_STAGE], type: 'Symptom', showIf: function(results){
    return getGroupWeight(LATE_STAGE, results) < PASS_STAGE_WEIGHT
  }},
  {type: 'Factor'}
]
var currentPage = -1
var questionCount = 0;

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
  questionCount ++;
  var html = "<h6>Q" + questionCount + ": " + question.question + "</h6>";
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
  var html = "<h6 class='counter-question disabled'>Q" + questionCount + "b: " +  question.counterQuestion + "</h6>";
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

function setupFailureGrid(results) {
  $.each(results, function(index, result){
    if(result.type === 'Factor' && result.value > 0){

      $(".failure-factor-grid ." + result.code).show();
      $(".failure-factor-grid .no-risk").hide();

      $(".failure-factor-grid ." + result.code + " .exposure").html(getSimplifiedStringRiskHtml(result.rawValue)).addClass(getRiskClass(result.rawValue));
      $(".failure-factor-grid ." + result.code + " .counter").html(getSimplifiedStringRiskHtml(result.counterValue)).addClass(getRiskClass(result.counterValue));
      var risk = result.rawValue - result.counterValue;
      if(risk < 0) risk = 0;
      $(".failure-factor-grid ." + result.code + " .risk").html(getSimplifiedStringRiskHtml(risk)).addClass(getRiskClass(risk));
    }
  })
}

function setupDominantScore(results){
  var score = Math.round(calculateDominantScore(results)*100);
  $(".dominant-score").html(score + "%");
}

function getSimplifiedStringRiskHtml(risk) {
  if(risk > 0.75) return "Very High";
  if(risk > 0.5) return "High";
  if(risk > 0.25) return "Medium";
  if(risk > 0) return "Low";
  else return "Minimal";
}

function getRiskClass(risk) {
  if(risk > 0.75) return "very-high";
  if(risk > 0.5) return "high";
  if(risk > 0.25) return "medium";
  if(risk > 0) return "low";
  else return "none";
}

function setupVersusChart(results, stage) {
  var bubbleResults = []
  var bubbleDomain = {}
  $.each(results, function(index, result){
    if(result.type === 'Factor' && result.value > 0){
      bubbleResults.push(result)
      bubbleDomain[result.domain] = true
    }
  })

  var bubbleSelector = '#bubble-' + stage
  var elem = $(bubbleSelector)
  var width = elem.innerWidth()
  var height = elem.innerHeight()
  window.bfaf.drawBubbleChart(bubbleResults, width, height, bubbleSelector)

  $(".arrow").addClass("arrow-" + stage);

  if(!bubbleDomain["Internal"]) $(".arrow-1").hide();
  if(!bubbleDomain["Immediate"]) $(".arrow-2").hide();
  if(!bubbleDomain["General"]) $(".arrow-3").hide();

  $(".versus-" + stage).show();
  var width = $('.factor-row-4').width() + 'px';
  $('.firm-factor-bg').css('border-right-width', width);
}

function setupOverallFailureScore(score) {
  var percentScore = score * 100;
  var percentRemain = 100 - percentScore;
  renderDial(percentScore, percentRemain);
}

function filterQuestions(questions, type, stage){
  var rtnQuestions = []
  $.each(questions, function(key, question) {
    if(type && question.type !== type){ return }
    if(stage){
      var stages = typeof stage === 'string' ? [stage] : stage
      var earliestStage = SORTED_STAGES.length - 1
      $.each(question.clusters || [], function(index, cluster){
        var stageIndex = -1
        var clusterStage = cluster.dominant ? 'dominant' : cluster.stage
        if(clusterStage){
          stageIndex = SORTED_STAGES.indexOf(clusterStage)
        }
        if(stageIndex >= 0 && stageIndex < earliestStage ){
          earliestStage = stageIndex
        }
      })
      if(stages.indexOf(SORTED_STAGES[earliestStage]) < 0){
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
  window.scrollTo(0,document.body.scrollHeight);
}

function getRandomInt(min, max){
  return min + Math.floor(Math.random() * (max - min + 1));
}

$( document ).ready(function() {
  if($("form").length > 0) {
    $.getJSON( "../js/bfaf.json", onJSONLoaded);

  }
  $('#framework-results').hide();

  if(localStorage.getItem('cookieSeen') != 'shown'){
    $(".cookie-banner").delay(2000).fadeIn();
    localStorage.setItem('cookieSeen','shown')
  }

  $('.close').click(function(e) {
    $('.cookie-banner').fadeOut();
  });

  $(window).resize(function() {
    var width = $('.factor-row-4').width() + 'px';
    $('.firm-factor-bg').css('border-right-width', width);
  })

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
  if(currentPage > 0) $(".framework-information").hide()
}


function onJSONLoaded(data){
  var questions = data.questions;
  var totalWeightings = {}
  totalWeightings[LATE_STAGE] = getTotalWeight(LATE_STAGE, questions)
  totalWeightings[MID_STAGE] = getTotalWeight(MID_STAGE, questions)
  totalWeightings[EARLY_STAGE] = getTotalWeight(EARLY_STAGE, questions)
  totalWeightings.factor = getTotalWeight('factor', questions)
  totalWeightings.overall = totalWeightings[LATE_STAGE] + totalWeightings[MID_STAGE] + totalWeightings[EARLY_STAGE]
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
      displayResults(results, questions);
    }
    if(currentPage == 2) $('#form-submit-button').text("Calculate my Results")
    $(window).scrollTop(0);
  });
  var isAuto = getUrlVars()["auto"] ? true : false;
  if(!isAuto) {
    $("#auto-populate").hide();
  }


  $("#auto-populate").on("click", function(){ autoPopulateForm(questions) });
  $(document).on('click', 'input[type="radio"]', function(){
    var key = $(this).attr('data-id')
    var isNever = $(this).val() === 'never'
    var disabled = isNever
    $('.counter-question input[data-id="counter-'+ key + '"]').attr('disabled', disabled).prop('checked', false)
    if(isNever && currentPage == 2) {
      if(!$(this).parent().parent().parent().hasClass("counter-question")) {
        $(this).parent().parent().parent().next().addClass("disabled")
      }

    } else {
      $(this).parent().parent().parent().next().removeClass("disabled")
    }
  })
  $(".mitigation-link").click(function() {
    $(this).parent().parent().next().toggle();
  });
  $(".close-row").click(function() {
    $(this).parent().parent().hide();
  })
}

function displayResults(results, questions) {
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

  var stage = getFailureStage(results, questions);
  var score = getFailureScore(results, stage);

  setupVersusChart(results, stage);
  setupFailureGrid(results);
  setupDominantScore(results);
  setupFailureAndTrajectoryTotals(results, stage);
  //setupOverallFailureScore(score)

  var summaryHtml = "<p><strong>Stage 0-2 total score:</strong> " + getGroupWeight(LATE_STAGE, results) + "</p>";
  summaryHtml += "<p><strong>Stage 3-10 total score:</strong> " + getGroupWeight(MID_STAGE, results) + "</p>";
  summaryHtml += "<p><strong>Stage 11-20 total score:</strong> " + getGroupWeight(EARLY_STAGE, results) + "</p>";
  summaryHtml += "<p><strong>Failure stage:</strong> " + stage + "</p>"
  summaryHtml += "<p><strong>Factors total score:</strong> " + getGroupWeight('Factor', results, 'type') + "</p>";
  $(".responses").append(summaryHtml);

  $(".print").click(function() {
    window.print();
  })

  return categories;
}

function getFailureScore(results, failureStage) {
  var factorsTotalScore = getGroupWeight('Factor', results, 'type');
  var failureStageScore = 0;

  if(failureStage == 'late') failureStageScore = getGroupWeight(LATE_STAGE, results);
  if(failureStage == 'mid') failureStageScore = getGroupWeight(MID_STAGE, results);
  if(failureStage == 'early') failureStageScore = getGroupWeight(EARLY_STAGE, results);

  var failureScore = (factorsTotalScore + failureStageScore) * 100;
  failureScore = Math.round(failureScore);
  if(failureScore > 100) failureScore = 100;
  return failureScore / 100;
}

function calculateDominantScore(results){
  var maxScore = 0;
  var weightedScore = 0;
  $.each(results, function(index, result){
    if(result.dominant){
      maxScore += result.maxValue.stage;
      weightedScore += result.weightedValue.stage;
    }
  })
  return 1 - weightedScore / maxScore;
}

function getFailureStage(results, questions) {
  var lateStageScore = getGroupWeight(LATE_STAGE, results);
  var midStageScore = getGroupWeight(MID_STAGE, results);
  var earlyStageScore = getGroupWeight(EARLY_STAGE, results);
  var count = {}
  count[LATE_STAGE] = getNumQuestions(LATE_STAGE, questions)
  count[MID_STAGE] = getNumQuestions(MID_STAGE, questions)
  count[EARLY_STAGE] = getNumQuestions(EARLY_STAGE, questions)

  var overallCount = count[LATE_STAGE] + count[MID_STAGE] + count[EARLY_STAGE]
  var lateStageOverallScore = lateStageScore * (count[LATE_STAGE]/overallCount);
  var midStageOverallScore = midStageScore * (count[MID_STAGE]/overallCount);
  var earlyStageOverallScore = earlyStageScore * (count[EARLY_STAGE]/overallCount);
  var maxOverall = Math.max(lateStageOverallScore, midStageOverallScore, earlyStageOverallScore);

  if(lateStageScore < 0.25 && midStageScore < 0.25 && earlyStageScore < 0.25){
    return 'success';
  }
  if(lateStageScore > 0.75) return 'late';
  if(maxOverall === earlyStageOverallScore) return 'early';
  if(maxOverall === midStageOverallScore) return 'mid';
  if(maxOverall === lateStageOverallScore) return 'late';
  // if(midStageScore > 0.75) return 'mid';
  // if(lateStageScore > 0.25 && midStageScore > 0.25) {
  //   if(lateStageScore > midStageScore) return 'late';
  //   else return 'mid';
  // }
  // if(earlyStageScore > 0.25) return 'early';
  return 'success'
}

function setupFailureAndTrajectoryTotals(results, stage) {
  var failureScore = getGroupWeight('Factor', results, 'type');
  var failureScoreClass = getRiskClass(failureScore);

  var failureStageScore = 0;

  if(stage == 'late') failureStageScore = getGroupWeight(LATE_STAGE, results);
  if(stage == 'mid') failureStageScore = getGroupWeight(MID_STAGE, results);
  if(stage == 'early') failureStageScore = getGroupWeight(EARLY_STAGE, results);

  var failureTrajectory = (failureScore + failureStageScore) / 2;
  var failureTrajectoryClass = getRiskClass(failureTrajectory);

  failureScore = Math.round(failureScore * 100);
  failureTrajectory = Math.round(failureTrajectory * 100);

  $(".failure-score").html(failureScore);
  $(".failure-trajectory").html(failureTrajectory);

  $(".failure-score-table").find("td").not("." + failureScoreClass).removeClass();
  $(".failure-trajectory-table").find("td").not("." + failureTrajectoryClass).removeClass();
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
        if(cluster.stage === 'factor') totalWeight = totalStageWeight
        var weightedValue = cluster.weighting*netResponseValue
        responses.push({
            code: question.code,
            type: question.type,
            domain: question.domain,
            subDomain: question.subDomain,
            factor: question.factor,
            dominant: cluster.dominant,
            stage: cluster.stage,
            response: responseText,
            value: netResponseValue,
            rawValue: responseValue,
            counterValue: counterResponseValue,
            maxValue: {
              stage: cluster.weighting/totalStageWeight
            },
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

function getGroupWeight(matchValue, results, matchKey, weightingKey){
  matchKey = matchKey || 'stage'
  weightingKey = weightingKey || 'stage'
  var reducer = function(total, result){
    var weight = result.weightedValue && result.weightedValue[weightingKey]
    if(result[matchKey] === matchValue && weight){
      return total + weight
    }
    return total
  }
  return (results || []).reduce(reducer, 0)
}

function getTotalWeight(stage, questions){
  var totalWeight = 0
  $.each(questions, function(index, question){
    $.each(question.clusters, function(index, cluster){
      if (cluster.stage === stage || stage == null) {
        totalWeight += cluster.weighting
      }
    })
  })
  return totalWeight
}

function getNumQuestions(stage, questions){
  var count = 0
  $.each(questions, function(index, question){
    $.each(question.clusters, function(index, cluster){
      if (cluster.stage === stage || stage == null) {
        count++
      }
    })
  })
  return count
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

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
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
