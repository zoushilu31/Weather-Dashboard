var savedLocations = [];
var searchBtnEL = document.querySelector("#searchbtn")

$("#searchbtn").on("click", function(){
  event.preventDefault();

  var loc = $("#searchbtn").val().trim();

  //if lc was not empty
  if (loc !==""){
    //clear previous forcast
    clearInterval();
    currentLoc = loc;
    savedLocations(loc);
    //clear search field
    $("#searchinput").val("");
    //get new forecast
    getCurrent(loc);
  
  }
});

// Current city weather function
function getCurrent(city){
  var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=e6dee304a0d16335ecee688e3c6dc7e4&units=imperial";
  fetch(queryURL).then(function(response){
      return response.json();
  })
  .then(function(response){
      console.log(response)
      console.log(city)
      // create card
      var currCard = $("<div>").attr("class", "card bg-light");
      $("#earthforecast").append(currCard);


    //location card 
    var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
    currCard.append(currenCardHead);

    var cardRow = $("<div>").attr("class","row");
    currCard.append(cardRow);

    //icon for weather conditions
    var iconURL = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
    var imgDiv = $("<div>").attr("class", "col-md-4").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);
    
    var textDiv = $("<div>").attr("class", "col-md-8");
    var cardBody = $("<div>").attr("class", "card-body");
    textDiv.append(cardBody);

    // display city name
    cardBody.append($("<h3>").attr("class", "card.title").text(response.name));
    console.log(city)

    // display last update
    var currDate = moment(response.dt, "X").format("dddd, MMM Do YYYY, h:mm a");
    cardBody.append($("<p>").attr("class", "card-text").append($("<div>").attr("class", "text-muted").text("Last Updated: " + currDate)));
    
    // temperature
    cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
    
    // humidity
    cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));

    // wind speed
    cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));
   // UV Index
  var uvURL = "http://api.openweathermap.org/data/2.5/uvi?appid=e6dee304a0d16335ecee688e3c6dc7e4&lat=" + response.coord.lat + "&lon=" + response.coord.lat;

  fetch(uvURL).then(function(response){
    return response.json();
  })
  .then(function(uvresponse){
    var uvindex = uvresponse;
    var bgcolor;
    if (uvindex <= 3){
        bgcolor = "green";
    }
    else if (uvindex >= 3 || uvindex <= 6){
        bgcolor = "yellow";
    }
    else if (uvindex >= 6 || uvindex <= 8){
        bgcolor = "orange";
    }
    else {
        bgcolor = "red";
    }
    var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
    uvdisp.append($("<div>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
    cardBody.append(uvdisp);
});
cardRow.append(textDiv);
getForecast(response.id);
// console.log(uvURL)
})
}

function success(position) {
var lat = position.coords.latitude;
var lon = position.coords.longitude;
var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=e6dee304a0d16335ecee688e3c6dc7e4";
fetch(queryURL).then(function(response){
return response.json()
}).then(function (response) {
currentLoc = response.name;
saveLoc(response.name);
getCurrent(currentLoc);
});
}


// get 5 day forecast function
function getForecast(city){
var queryURL = "http://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=e6dee304a0d16335ecee688e3c6dc7e4&units=imperial";
fetch(queryURL).then(function(response){
return response.json();
}).then(function(response){
// add container div for forcast cards
var newRow = $("<div>").attr("class", "forecast row");

// loop array response to find forecast
for (var i = 0; i < response.list.length; i++){
    if (response.list[i].dt_txt.indexOf("15:00:00") !== -1){

        var colElem = $('<div>').attr("class", "col-lg-2")
        var newCard = $('<div>').attr('class', 'card text-white bg-primary');
        var cardHead = $('<div>').attr('class', 'card-header').text(moment(response.list[i].dt, "X").format("MMM Do"));
        var cardImg = $("<img>").attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
        var bodyDiv = $('<div>').attr("class", "card-body");
        // var newCol = $('<div>').attr('class', 'one-fifth')
        
        newCard.append(cardHead)
        newCard.append(cardImg)
        // newCard.append(bodyDiv)
        newCard.append($('<p>').attr('class', 'card-text').html("Temp: " + response.list[i].main.temp + ' &#8457;'));
        newCard.append($('<p>').attr('class', 'card-text').text("Humidity: " + response.list[i].main.humidity + "%"));
        colElem.append(newCard)
        newRow.append(colElem)
        
    }
}
$("#earthforecast").append(newRow);
});

}

//clear all the weather
function clear() {
$("#earthforecast").empty();
}

// save locations
function saveLoc(loc){
//add this to the saved locations array
if (savedLocations === null) {
savedLocations = [loc];
}
else if (savedLocations.indexOf(loc) === -1) {
savedLocations.push(loc);
}
//save to localstorage
localStorage.setItem("weathercities", JSON.stringify(savedLocations));
showPrevious();
}

// get prevous location from local storage
function saveCity(){
savedLocations = JSON.parse(localStorage.getItem("weathercities"));
var lastSearch;
// display buttons for previous searches
if (savedLocations){
currentLoc = savedLocations[savedLocations.length - 1];
showPrevious();
getCurrent(currentLoc);
}
else{
if (!navigator.geolocation){
    getCurrent("Raleigh");
}
else{
    navigator.geolocation.getCurrentPosition(success, error);
}
}
}
// savedLocations();

function showPrevious() {
//show the previously searched for locations based on what is in local storage
if (savedLocations) {
$("#prevSearches").empty();
var btns = $("<div>").attr("class", "list-group");
for (var i = 0; i < savedLocations.length; i++) {
    var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
    if (savedLocations[i] == currentLoc){
        locBtn.attr("class", "list-group-item list-group-item-action active");
    }
    else {
        locBtn.attr("class", "list-group-item list-group-item-action");
    }
    btns.prepend(locBtn);
}
$("#prevSearches").append(btns);
}
}

// saved locations button on click
$(document).on("click", "#loc-btn", function () {
clear();
currentLoc = $(this).text();
showPrevious();
getCurrent(currentLoc);
});