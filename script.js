$(document).ready(function () {
    var searchButton = $("#search-button");
    var cityInput = $("#search-input");
    var citiesButtons = $("#history");
    var APIKey = "d5e929ebd485e2474ada0a4ded0b22e5";
    var weatherToday = $("#today");
    var weatherForecast = $("#forecast");
    // Using date from Dayjs library
    var currentDate = dayjs().format("DD/MM/YYYY"); 

    // Initialize Local Storage (LS) and Retrieve Cities from Local Storage
    function updateLS() {
        var cityfromLS = localStorage.getItem("city");
        if (cityfromLS === null || cityfromLS === undefined) {
          cityfromLS = []; // create empty array if no cities in LS
          localStorage.setItem("city", JSON.stringify(cityfromLS));
        } else {
          cityfromLS = JSON.parse(cityfromLS);
        }
        return cityfromLS;
      }
    
      // Save City upon button click
      function getWeather(event, city) {
        event.preventDefault();
    
        var cityfromLS = updateLS(city); // retrieve cities from LS
    
        // Validation of city field
        var isCityInHistory = cityfromLS.includes(city);
    
        if (city !== "" && !isCityInHistory) {
          cityfromLS.push(city);
          localStorage.setItem("city", JSON.stringify(cityfromLS));
          renderCities();
        }
    
        fetchCurrentWeather(city);
      }
    
      // Fetch current weather for a given city
      function fetchCurrentWeather(city) {
        var queryURL =
          "https://api.openweathermap.org/data/2.5/weather?q=" +
          city.trim() +
          "&units=metric" +
          "&appid=" +
          APIKey;
    
        fetch(queryURL)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            renderForecast(data.coord.lat, data.coord.lon);
    
            // Display current weather conditions for selected city
            weatherToday.removeClass("d-none");
            var weatherTodayIcon = data.weather[0].icon;
            var todayIcon = `<img src="https://openweathermap.org/img/wn/${weatherTodayIcon}@2x.png"/>`;
            weatherToday.append(todayIcon);
            weatherToday.html(
              "<h3><b> " + city + " (" + currentDate + ") </b>" + todayIcon
            );
    
            // Temperature conditions
            var tempCelsius = $("<p>");
            var tempInCelsius = data.main.temp;
            tempCelsius.text("Temp: " + tempInCelsius.toFixed(2) + "°C");
    
            // Wind conditions
            var wind = $("<p>");
            var windInKPH = data.wind.speed * 3.6;
            wind.text("Wind: " + windInKPH.toFixed(2) + " KPH");
    
            // Humidity conditions
            var humidity = $("<p>").text("Humidity: " + data.main.humidity + "%");
    
            // Append to HTML container
            weatherToday.append(tempCelsius, wind, humidity);
          });
      }
    
      // Display Cities from Local Storage
      function renderCities() {
        citiesButtons.empty();
        var cityfromLS = JSON.parse(localStorage.getItem("city")) || [];
    
        // Iterate through cities and create buttons
        cityfromLS.forEach((city) => {
          var newCityButton = $("<button>");
          newCityButton
            .text(city)
            .attr(
              "style",
              "background-color: #AEAEAE; padding:10px; border: none; border-radius: 5px"
            )
            .addClass("new-city-btn");
          citiesButtons.append(newCityButton);
    
          // Click event listener that triggers the getWeather function with the corresponding city name
          newCityButton.on("click", function (event) {
            var cityName = $(event.currentTarget).text();
    
            getWeather(event, cityName);
          });
        });
      }
    
      renderCities();
    
      // Display 5 day forecast for selected city by taking the lat and lon parameters
      function renderForecast(lat, lon) {
        var queryURLForecast =
          "https://api.openweathermap.org/data/2.5/forecast?lat=" +
          lat +
          "&lon=" +
          lon +
          "&units=metric" +
          "&appid=" +
          APIKey;
    
        fetch(queryURLForecast)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            weatherForecast.html("<h5><b>" + "5-Day Forecast: </b>");
    
            // Iterate through the 3h forecast and creating forecast cards by skipping every 7th element in the data.list array, to get daily forecast
            for (let i = 7; i < data.list.length; i += 7) {
              var forecastItem = data.list[i];
    
              var forecastCardDate = forecastItem.dt_txt.split(" ")[0]; // extract only date portion
              var forecastDateItems = forecastCardDate.split("-"); // split extracted date into array
              var formattedDate = // rearrange elements of array
                forecastDateItems[2] +
                "/" +
                forecastDateItems[1] +
                "/" +
                forecastDateItems[0];
    
              var forecastCardIcon = forecastItem.weather[0].icon;
              var forecastCardTemp = forecastItem.main.temp;
              var forecastCardWind = forecastItem.wind.speed;
              var forecastCardHumidity = forecastItem.main.humidity;
              var forecastCard = `<div class="card border border-white" style="width: 20%;">
                <div class="card-body text-white" style="background-color: #2D3E50">
                  <h5 class="card-title">${formattedDate}</h5>
                  <p class="card-text"><img src="https://openweathermap.org/img/wn/${forecastCardIcon}@2x.png"/></p>
                  <p class="card-text">Temp: ${forecastCardTemp} °C</p>
                  <p class="card-text">Wind: ${forecastCardWind} KPH</p>
                  <p class="card-text">Humidity: ${forecastCardHumidity} %</p>
                </div>
              </div>`;
              weatherForecast.append(forecastCard);
            }
          });
      }
    
      // Trigger getWeather function upon button click
      searchButton.on("click", function (event) {
        var cityVal = cityInput.val(); // retrieve value entered in input field
    
        getWeather(event, cityVal);
      });

  });