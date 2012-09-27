
var saveGraphURL = "http://math1.staging.bookshare.org/GetEquationDescription?responseFormat=svgFile&equation=";
var getEquationDescriptionURL = "http://math1.staging.bookshare.org/GetEquationDescription?responseFormat=jsonp&equation=";
var getNewEquationURL = "http://math1.staging.bookshare.org/GetNewEquation?responseFormat=jsonp&equation=";

function initEquationSelector() {
	$("#equationParameters").hide();
	$("#graphDescription").hide();
	$("#printOptions").hide();
	$("#graph").hide();
	populateEquationSelector();	
	bindEquationSelector();
}

function bindEquationSelector() {
	$("#equation").change(function() {
		if ($(this).val() != "") {
			//Clean up from past call.
			cleanUpParameters();
			cleanUp();
			callWebService($(this).val());
		} else {
			alert("Please enter an equation.");
		}
	});
}

function callWebService(equation) {
	//Call webservice for description.
	$.ajax({
		type: "GET",
		crossDomain: true,
		url: getEquationDescriptionURL + encodeURIComponent(equation),
		dataType: 'jsonp'
	});
}

function getNewEquation() {
	//accumulate parameters, if any.
	var paramQuery = "";
	$.each($(".parameter"), function() {
		paramQuery = paramQuery + "&pname=" + $(this).attr("id");
		paramQuery = paramQuery + "&pvalue=" + $(this).val();
	});
	//Call webservice for new equation.
	$.ajax({
		type: "GET",
		crossDomain: true,
		url: getNewEquationURL + encodeURIComponent($("#equation").val()) + paramQuery,
		dataType: 'jsonp'
	});
}

function newEquation(json) {
	cleanUp();
	callWebService(json.equation);
}

function cleanUpParameters() {
	$("#equationParameters").find("input").remove();
	$("#equationParameters").find("label").remove();
	$("#equationParameters").hide();
	$("#equationForm").unbind("submit");
}

function cleanUp() {
	$("#graphDescription").hide();
	cleanUpPrintOptions();
	$("#printOptions").hide();
	cleanUpGraph();
}

function cleanUpPrintOptions() {
	$(".button").each(function() {
		$(this).unbind("click");
	});
}

function cleanUpGraph() {
	$("#svgGraph").find("svg").remove();
	$("#graph").hide();
}

function updateEquationDescription(json) {
	var description = json.description;
	if (typeof description.parameters != "undefined") {
		outputParameterFields(description.parameters);
	}
	outputEquationDescription(description);
	outputSVGGraph(json.svg);
	outputAndBindPrintOptions();
}

function outputAndBindPrintOptions() {
	$("#printOptions").show();
	bindPrintGraph();
	bindPrintDescription();
	updateSaveGraph();
}

function updateSaveGraph() {
	$("#saveGraph").attr("href", saveGraphURL + encodeURIComponent($("#equation").val()));
}

function bindPrintDescription() {
	$("#printDescription").click(function(event) {
		event.preventDefault();
		var toPrint = $("<div></div>");
		toPrint.append($("<h1>MathTrax Accessible Graphs</h1>"));
		toPrint.append("<p>" + $("#equationDescription").val() + "</p>");
		toPrint.printElement({
            overrideElementCSS:['css/mde.css']
         });
	});
}

function bindPrintGraph() {
	$("#printGraph").click(function(event) {
		event.preventDefault();
		var toPrint = $("<div></div>");
		toPrint.height("1000");
		toPrint.width("800");
		toPrint.append($("<h1>MathTrax Accessible Graphs</h1>"));
		toPrint.append("<strong>Equation: " + $("#equation").val() + "</strong>");
		var graph = $("#svgGraph").clone();
		graph.attr("id", "svgGraph");
		toPrint.append(graph);
		toPrint.printElement({
            overrideElementCSS:['css/mde.css']
         });
	});
}

function outputSVGGraph(svg) {
	$("#graph").show();
	var svg = $(svg);
	svg.attr("id", "generatedSVG");
	$("#svgGraph").append(svg);
}

function outputEquationDescription(json) {
	$("#graphDescription").show();
	$("#selectedEquation").text(json.equation);
	$("#equationDescription").val(json.description);
}

function outputParameterFields(parameters) {
	$("#equationParameters").show();
	//Add parameter fields.
	$.each(parameters, function() {
		$("#equationParameters").append(getLabel(this));
		$("#equationParameters").append(getInputField(this));
	});
	$("#equationParameters").append($("<input type=\"submit\" value=\"Recalculate\" id=\"getNewEquation\" />"));
	bindParameterFields();
}

function bindParameterFields() {
	$("#equationForm").submit(function(event) {
		event.preventDefault();
		getNewEquation();
	});
}

function getLabel(parameter) {
	return $("<label for=\"" + parameter + "\">" + parameter + ": </label>");
}

function getInputField(parameter) {
	return $("<input type=\"text\" id=\"" + parameter + "\" value=\"1.0\" size=\"3\" class=\"parameter\"/>");
}

function populateEquationSelector() {
	//Load json.
	$.ajax({
		type: "get",
		url: 'js/equationsWithShape.json',
		dataType: 'json',
		cache: false,
		success: function (json) { 
			var equationsByShape = json.data;
			$.each(equationsByShape, function() {
				var shapeType = this.shapeType;
				var optGroup = $("<optgroup id=\"" + this.shapeType + "\" label=\"" + this.shapeType + "\" />");
				var equations = this.equations;
				$.each(equations, function() {
					optGroup.append("<option value=\"" + this.equation + "\">" + this.shape + ": " + this.equation + "</option");
				});
				$("#equation").append(optGroup);
			});
		}
	});
	$("#equation").attr("selectedIndex", 0);
}



$(document).ready(initEquationSelector);
