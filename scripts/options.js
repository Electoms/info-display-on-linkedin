function updateOptions(){
  const outputInfo = document.createElement('h4');
  outputInfo.innerText = "Dane zaktualizowane polmyslnie."
  
  document.getElementById("main").prepend(outputInfo);
  setTimeout(()=>{
    outputInfo.remove();
  },
  2000
  )

  const apiKey = document.getElementById('api-key')
  const apiSecret = document.getElementById('api-secret')
  const addPeopleEndpoint = document.getElementById('add-people-endpoint')
  const checkPeopleEndpoint = document.getElementById('check-people-endpoint')
  const fetchPeopleInfoEndpoint  = document.getElementById('fetch-people-info-endpoint')

  chrome.storage.sync.set({
    "api-key": apiKey.value,
    "api-secret": apiSecret.value,
    "add-people-endpoint": addPeopleEndpoint.value,
    "check-people-endpoint": checkPeopleEndpoint.value,
    "fetch-people-info-endpoint": fetchPeopleInfoEndpoint.value
  });
}
function displayOptions(){
  const apiKey = document.getElementById('api-key')
  const apiSecret = document.getElementById('api-secret')
  const addPeopleEndpoint = document.getElementById('add-people-endpoint')
  const checkPeopleEndpoint = document.getElementById('check-people-endpoint')
  const fetchPeopleInfoEndpoint  = document.getElementById('fetch-people-info-endpoint')
  
  chrome.storage.sync.get(
  ["api-key", "api-secret", "add-people-endpoint", "check-people-endpoint", "fetch-people-info-endpoint"],
   result => {
    apiKey.value = result["api-key"],
    apiSecret.value = apiSecret.value = result["api-secret"],
    addPeopleEndpoint.value = result["add-people-endpoint"],
    checkPeopleEndpoint.value = result["check-people-endpoint"],
    fetchPeopleInfoEndpoint.value = result["fetch-people-info-endpoint"]
  });
}


displayOptions();

document.getElementById('save').addEventListener('click', updateOptions)



