
const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");

const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");
const notFound=document.querySelector(".not-found");

//Initially required variables
let currentTab=userTab;
const API_KEY="e347bdea2b9f558a483588978d68f893";
currentTab.classList.add("current-tab");
getfromSessionStorage();

//This function is used for switching the tab 
function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        
        //Checking whether searchform conatiner is invisible if yes then make it visible
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            
        }
        //Here we are at the your weather tab,so visible the your weather tab
        else{
            searchForm.classList.remove("active");
            notFound.classList.remove("active");
            userInfoContainer.classList.remove("active");

            //Now we are at the your weather tab now we have to display the weather data also 
            //so lets check for the local storage for coordinates if we save them there.
            getfromSessionStorage(); 

        }
    }
}

userTab.addEventListener("click", () =>{
    switchTab(userTab); //Passing clicked tab as input parameter
});

searchTab.addEventListener("click", () =>{
    switchTab(searchTab); //Passing clicked tab as input parameter
    
});


//Checking if the coordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates=sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){ //If we not get local coordinates then
      grantAccessContainer.classList.add("active");
      
    }
    else{  //If we get the coordinates then
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates); //This will fetch the user info from the coordinates
        
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    //Make the grant container invisible
    grantAccessContainer.classList.remove("active");
    //Make load image visible
    loadingScreen.classList.add("active");

    //API Call
    try {
       const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
       const data= await response.json();

       loadingScreen.classList.remove("active");
       userInfoContainer.classList.add("active");
       renderWeatherInfo(data); //It is used for Taking the values from data dynamically and put into the userInfoconatiner  
    }
    catch(err) {
          loadingScreen.classList.remove("active");

    }
}


function renderWeatherInfo(weatherInfo){
    //first we have to fetch the elements
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-WeatherDesc]");
    const WeatherIcon=document.querySelector("[data-WeatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windspeed=document.querySelector("[data-windSpeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    //Now fetching the data and put into UI elements
    cityName.innerText=weatherInfo?.name;
    countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0]?.description;
    WeatherIcon.src=`https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherInfo?.main?.temp} °C`;
    windspeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all}%`;
}


function getLocation(){
    if(navigator.geolocation){ //Checking for the geolocation support
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //Alert show for no geolocation support available
          alert('Please grant access to location');
    }
    
}

function showPosition(position){
      const userCoordinates= {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton=document.querySelector("[data-grantAccess]"); //Creating a button to grant access
grantAccessButton.addEventListener("click",getLocation);


const searchInput=document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e) =>{
    e.preventDefault();
     grantAccessContainer.classList.remove("active");
     notFound.classList.remove("active");
    let cityName=searchInput.value;
    if(cityName === ""){
        return; 
    }
    else{
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data= await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        if(!response.ok){
            throw new Error("Bad response");
        }
        renderWeatherInfo(data);
    } 
    catch (err){  
        throw (notFound.classList.add("active"),
         userInfoContainer.classList.remove("active"));
    }
}
