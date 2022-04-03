$(function() { 
    var locaton =  getLocation();
  });
 
 
 var mainCard = $(".card-body");
 var searchHistory = [];
 
 
 var getItems = function () {
   var storedCities = JSON.parse(localStorage.getItem("searchHistory"));
   if (storedCities !== null) {
     searchHistory = storedCities;
     for(var i=0;i<searchHistory.length;i++) {
         if(i==8){
             break;
         }
       //  creates links/buttons 
       cityListButton = $("<a>").attr({
         class: "list-group-item list-group-item-action",
         href: "#",
         "data-btn-num": i
       });
         // appends history 
         cityListButton.text(searchHistory[i]);
         $(".list-group").append(cityListButton);      
     }
   }
 };
 
 function getData(city) {
     var isError=false;
         mainCard.empty();
     $("#weeklyForecast").empty();
     if(!city){
         return;
     }
   var weatherQueryApiUrl =
     "https://api.openweathermap.org/data/2.5/weather?q=" +
     city +
     "&units=imperial&appid=c346df346fcf488a0dececb76a79e4ca";
   fetch(weatherQueryApiUrl)
     .then(function (response) {
         return response.json();
     })
     .then(function (response) {
         if(response.cod !== 200){
             alert("City Not Found!");
             $("#city").val("");
             isError=true;
             getLocation();
             return;
         }
         if(!isError){
             saveNewCity(city);
         }
     
       var date = moment().format(" MM/DD/YYYY");
       var wIcon = response.weather[0].icon;
       var iconUrl = "http://openweathermap.org/img/w/" + wIcon + ".png";
       var cityName = $("<h3>").html(city + date);
       mainCard.prepend(cityName);
       mainCard.append($("<img>").attr("src", iconUrl));
       var temp = Math.ceil(response.main.temp);
       mainCard.append($("<p>").html("Temperature: " + temp + " &#8457"));
       var feelsLikeTemp = Math.ceil(response.main.feels_like);
       mainCard.append($("<p>").html("Feels Like: " + feelsLikeTemp));
       var humidity = response.main.humidity + "&#37;";
       mainCard.append($("<p>").html("Humidity: " + humidity));
       var windSpeed = response.wind.speed;
       mainCard.append($("<p>").html("Wind Speed: " + windSpeed + " MPH"));
 
       /* Get UV Index from Weather API */
       var fullWeatherUrl =
         "https://api.openweathermap.org/data/2.5/onecall?lat=" +
         response.coord.lat +
         "&lon=" +
         response.coord.lon +
         "&exclude=minutely,hourly&units=imperial&appid=c346df346fcf488a0dececb76a79e4ca";
       return fetch(fullWeatherUrl)
         .then(function (fullResponse) {
           return fullResponse.json();
         })
         .then(function (fullResponse) {
           mainCard.append(
             $("<p>").html(
               "UV Index: <span>" + fullResponse.current.uvi + "</span>"
             )
           );
           /* Set UV Priority Warning */
           if (fullResponse.current.uvi <= 2) {
             $("span").attr("class", "btn btn-success");
           } else if (
             fullResponse.current.uvi > 2 &&
             fullResponse.current.uvi <= 7
           ) {
             $("span").attr("class", "btn btn-warning");
           } else {
             $("span").attr("class", "btn btn-danger");
           }
 
           /* Get 5 Day Forecast From Weather API */
           for (var i = 1; i < 6; i++) {
             var newCard = $("<div>").attr(
               "class",
               "col fiveDay bg-primary text-white rounded-lg p-2"
             );
             $("#weeklyForecast").append(newCard);
             var myDate = new Date(
               fullResponse.daily[i].dt * 1000
             ).toLocaleDateString("en-US");
             /* Display Date */
             newCard.append($("<h4>").html(myDate));
             var iconCode = fullResponse.daily[i].weather[0].icon;
             var iconURL =
               "http://openweathermap.org/img/w/" + iconCode + ".png";
             newCard.append($("<img>").attr("src", iconURL));
             var temp = Math.ceil(fullResponse.daily[i].temp["day"]);
             newCard.append($("<p>").html("Temp: " + temp + " &#8457"));
             var humidity = fullResponse.daily[i].humidity;
             newCard.append($("<p>").html("Humidity: " + humidity));
           }
         });
     });
 }
 /* Search Button Listener */
 $("#searchCity").on("click",function(){
     var city=$("#city").val(); 
     getData(city);
     $("#city").val("");
 });
 
 /* Save City Name to LocalStorage */
 var saveNewCity = function(city){
     var inArray = searchHistory.includes(city);
     if(!inArray && city !==""){
         searchHistory.push(city);
         localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
         var cityListButton = $("<a>").attr(
             {
                 class:"list-group-item list-group-item-action",
                 href: "#",
                 "data-btn-num": searchHistory.length
             }
         );
         cityListButton.text(city);
         $(".list-group").append(cityListButton);
 
     }
 };
 
 /* History List Buttons */
 $(".list-group").on("click",function(e){
     var callCity = e.target.innerHTML;
     $("#city").val(callCity);
     getData(callCity);
 
 });
 
 getItems();
 

   
 