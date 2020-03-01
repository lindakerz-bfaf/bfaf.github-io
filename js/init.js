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
  var html = question["question"];

  return html;
}

function scalehtml(question) {
  var html = question["question"];
  
  return html;
}

$( document ).ready(function() {
  $.getJSON( "../js/bfaf.json", function( data ) {
    var questions = data["questions"];

    $.each(questions, function(key, question) {
      if(question["type"] == "yesno") {
        console.log(yesnohtml(question));
      } else if(question["type"] == "scale") {
        console.log(scalehtml(question));
      }
    });
  });

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
