(function($){
  $(function(){

    $('.sidenav').sidenav();
    $('.parallax').parallax();
    $('select').formSelect();

    $('#framework-results').hide();

    $('#form-submit-button').click(function() {
      $('#framework-form').hide();
      $('#framework-results').show();
      $(window).scrollTop(0);
    });

  }); // end of document ready
})(jQuery); // end of jQuery name space

function yesnohtml(question) {
  var html = "<h6>" + question["question"] + "</h6>";
  if(question["info"]) {
    html += "<p>" + question["info"] + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' name='" + question["id"] + "' type='radio' id='yes'> <span>Yes</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' name='" + question["id"] + "' type='radio' id='no'> <span>No</span> </label> </div>";
  html += "</div>";
  return html;
}

function scalehtml(question) {
  var html = "<h6>" + question["question"] + "</h6>";
  if(question["info"]) {
    html += "<p>" + question["info"] + "</p>";
  }
  html += "<div class='form-question-answer'>";
  html += "<div class='col s2'> <label> <input class='with-gap' name='" + question["id"] + "' type='radio' id='never'> <span>Never</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' name='" + question["id"] + "' type='radio' id='rarely'> <span>Rarely</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' name='" + question["id"] + "' type='radio' id='sometimes'> <span>Sometimes</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' name='" + question["id"] + "' type='radio' id='often'> <span>Often</span> </label> </div>";
  html += "<div class='col s2'> <label> <input class='with-gap' name='" + question["id"] + "' type='radio' id='always'> <span>Always</span> </label> </div>";
  html += "</div>";
  return html;
}

$( document ).ready(function() {
  if($("form").length > 0) {
    $.getJSON( "../js/bfaf.json", function( data ) {
      var questions = data["questions"];

      $.each(questions, function(key, question) {
        if(question["type"] == "yesno") {
          $("form").append(yesnohtml(question));
        } else if(question["type"] == "scale") {
          $("form").append(scalehtml(question));
        }
      });
      $("form").append($('#form-submit-button').parent());
    });
  }


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
