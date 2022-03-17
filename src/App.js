import React, {useEffect} from 'react';
import { useImmer } from "use-immer";
import Axios from 'axios';
import './App.css';


function App() { 

  const [state, setState] = useImmer({
    weatherData:{},
    widgetTitle: 'TITLE OF WIDGET',
    tempType: 'celsius',
    temp:0,
    windDirection: '',
    ifDisplayWind: 'true'
  }) 

  useEffect(() => {
    let latitude;
    let longitude;
  
    if (!navigator.geolocation) {
        console.error(`Your browser doesn't support Geolocation`);
    }
    navigator.geolocation.getCurrentPosition( onSuccess, onError);

    function onSuccess(position) {
      ({ latitude, longitude } = position.coords);

      async function getWeatherData() {
        try {
          const response = await Axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=94c4e1a133b8075011a7c2e1f1b13b53`, { cancelToken: ourRequest.token })
        console.log(response.data)
        setState((draft) => {
          draft.weatherData = response.data;
        });
        // getWindDirection();
        } catch (e) {
          console.log("There was a problem.")
        }
      }
      getWeatherData()  
    }
  
    // handle open weather error case
    function onError() {
        console.log("Sorry, it's unable to get your location at the moment. Please refresh the page later.");
    }
    
    // console.log('latitude',latitude)
    const ourRequest = Axios.CancelToken.source()   
    return () => {
      ourRequest.cancel()
    }
  }, [])

  //get wind direction when weatherData.wind is ready
  useEffect(() => {
    let compassSector = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    if(state.weatherData.wind){
      setState((draft) => {
        draft.windDirection = compassSector[(state.weatherData.wind.deg / 22.5).toFixed(0)];
        draft.ifDisplayWind = true;
      });
    }      

    if(state.weatherData.main){
      if(state.tempType == 'celsius'){
        setState((draft) => {
          draft.temp = (Math.round( (state.weatherData.main.temp - 273.15) * 100) / 100).toFixed(2);
        });
        
      }else{
        setState((draft) => {
          draft.temp = state.weatherData.main.temp;
        });      
      }
    } 
  }, [state.weatherData]);

  useEffect(() => {
    if(state.weatherData.main){
      if(state.tempType == 'celsius'){
        setState((draft) => {
          draft.temp = (Math.round( (state.weatherData.main.temp - 273.15) * 100) / 100).toFixed(2);
        });
        
      }else{
        setState((draft) => {
          draft.temp = state.weatherData.main.temp;
        });      
      }
    }
    
  }, [state.tempType]);

  function changeTitle(e){
    setState((draft) => {
      draft.widgetTitle = e.target.value;
    });
  }

  function convertTemp(){
    setState((draft) => {
      draft.tempType = document.querySelector('input[name="temparature"]:checked').value;
    });   
  }

  function toggleWind(){
    setState((draft) => {
      draft.ifDisplayWind = document.querySelector('input[name="wind"]:checked').value;
    }); 
  }

  return (
    <div className="App">
      <form>
        <div className="left">
          <div>
            <label>Title</label><br />
            <input className="mt-10 widget-title" value={state.widgetTitle} onChange={changeTitle} autoFocus type="text" placeholder='Title of widget'/>
          </div>
          
          <div>
            <label >Temperature</label><br />
            <input className="mt-10" 
            onClick={convertTemp} 
            type="radio" 
            id="celsius " 
            name="temparature" 
            value="celsius"
            checked={state.tempType == 'celsius' ? 'checked' : ''} />
            <label htmlFor="celsius">&#8451;</label>
            <input type="radio" onClick={convertTemp} id="fa" name="temparature" value="fa" />
            <label htmlFor="fa">&#8457;</label>
          </div>

          <div>
            <label >Wind</label><br />
            <input className="mt-10" 
            onClick={toggleWind} 
            type="radio" 
            id="wind-on " 
            name="wind" 
            value="true"
            checked={state.ifDisplayWind == 'true' ? 'checked' : ''} />
            <label htmlFor="wind-on">On</label>
            <input type="radio" onClick={toggleWind} id="wind-off" name="wind" value="false" />
            <label htmlFor="wind-off">Off</label>
          </div>
          
        </div>
        <div className="right">
          <div className='container'>
            <h2>{state.widgetTitle}</h2>

            {state.weatherData.weather && <div className='weather'>
              <img src={`http://openweathermap.org/img/wn/${state.weatherData.weather[0].icon}@2x.png`} />
              <div>
                <div className="city">{state.weatherData.name}</div>
                <div className="temp">{state.temp}</div>
                {state.ifDisplayWind == 'true' && <div><strong className='wind'>Wind </strong><span>{state.windDirection}</span>{' '}<span>{state.weatherData.wind.speed}km/h</span></div>}
              </div>
            </div>
            }
           
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;
