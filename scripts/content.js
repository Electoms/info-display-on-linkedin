var apiKey;
var apiSecret;
var addPeopleEndpoint;
var checkPeopleEndpoint;
var fetchPeopleInfoEndpoint;
function getProfileTag(){
    const url = window.location.href;
    const pathname = new URL(url).pathname;
    let tag = pathname.split("/")[2];
    tag = tag.split("?")[0]
    tag = decodeURI(tag)
    return tag;
}
function getMainUrl(){
    const url = window.location.href;
    const host = new URL(url).host;
    return host;
}

function getDataFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        ["api-key", "api-secret", "add-people-endpoint", "check-people-endpoint", "fetch-people-info-endpoint"],
        result => {
          resolve(result);
        }
      );
    });
}
function getPersonalData(){
    var iframe = document.getElementById('scrapeEmail')
    var emailInput = document.getElementById('personateApiEmail')
    let div = document.getElementById("info");           

    if(iframe && emailInput){
        var name = iframe.contentWindow.document.getElementsByTagName('h1')[0].innerText.trim().split(" ");
        if(name){
            var firstName = document.createElement('input');
            var lastName = document.createElement('input');
            firstName.setAttribute('type', "hidden");
            lastName.setAttribute('type', "hidden");
            firstName.setAttribute('id', "firstName");
            lastName.setAttribute('id', "lastName");

            lastName.value = name.pop();
            if(name.join(" ").trim()){
                firstName.value = name.join(" ");
            }else{
                firstName.value = lastName.value
            }

            div.prepend(firstName)
            div.prepend(lastName)
        }else{
            div.innerHTML += "<h5>Nie zaladowano imienia.</h5>"
        }

        var email = iframe.contentWindow.document.querySelector('.ci-email div a');
        if(email){
            emailInput.value =  email.innerText;
            email.setAttribute('placeholder', '');
        }else{
            emailInput.setAttribute("placeholder", "Brak emaila w profilu.")
            emailInput.value =  "";
        }       
    }
}
function loadPersonalData(){
    let div = document.getElementById("info");           
    var emailInput = document.getElementById('personateApiEmail')
    if(div){
        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://${getMainUrl()}/in/${getProfileTag()}${getMainUrl().startsWith('www')?'/overlay/contact-info/':''}`)
        iframe.setAttribute('id', 'scrapeEmail')
        iframe.style.setProperty("display", "none");
        iframe.onload = getPersonalData;
        div.appendChild(iframe)
        console.log(iframe)
        console.log(1)

        emailInput.setAttribute('placeholder', 'Ladowanie...');
    }
}
function addPerson(){ 
    var xhr = new XMLHttpRequest();
    xhr.open('POST', addPeopleEndpoint);
    xhr.onreadystatechange = handler;
    xhr.setRequestHeader('api-key', apiKey);
    xhr.setRequestHeader('api-secret', apiSecret);
    xhr.setRequestHeader('Content-Type', "application/json");

    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var jsonData = {
        "data": {
        "firstName": firstName,
        "lastName": lastName,
        "email": document.getElementById("personateApiEmail").value,
        "linkedin": `https://www.linkedin.com/in/${getProfileTag()}`,
        }
    }
    var jsonString = JSON.stringify(jsonData);
    xhr.send(jsonString);

    function handler(){
        if (this.readyState === this.DONE) {
            const div = document.getElementById("info");
            div.innerHTML = `<h5><strong>Insert Status</strong> ${this.status} ${this.statusText}</h5>`;
            var popup = document.createElement('h2');
            if (this.status === 201) {
                popup.innerText = "Pomyslnie dodano do bazy."
                popup.style.setProperty('color', '#008b00')                
            } else {
                popup.innerText = "Blad, przy dodawaniu do bazy."
                popup.style.setProperty('color', '#8b0000')                
                console.error('Something went wrong when adding person to database.');
            }
            div.append(popup)
        }
    }
}
function handleURLChange() {
    const regex = new RegExp('\https:\/\/.*\.linkedin\.com\/in\/' );
    setTimeout(() => {
        if(regex.test(window.location.href)){
            let div = document.getElementById("info");           
            if(!div){
                div = document.createElement('div');
                div.id = "info";
                div.style.setProperty("width", "100%");
                div.style.setProperty("padding", "1rem 2rem");
                div.style.setProperty("overflow-wrap", "break-word");
                div.innerHTML = 'Loading...';
            }

            const aside = document.getElementsByTagName('aside')[0];
            if(aside){
                aside.style.setProperty("flex-wrap", "wrap", "important");
                aside.prepend(div);
            }else{
                const main = document.getElementsByTagName('main')[0];
                if(main){
                    main.style.setProperty("flex-wrap", "wrap", "important");
                    main.prepend(div);
                }
            }

            if(main || aside){
                    
                    
                    var rawData;
                    fetch(checkPeopleEndpoint.replace('[tag]', getProfileTag()), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': apiKey,
                            'api-secret': apiSecret
                        }
                    })
                    .then(response => {rawData = response;return response.json()})
                    .then(data => {
                        var xhr = new XMLHttpRequest();                        
                        xhr.open('GET', `https://appdev.personate.io/api/v1/crm/people/${data.id}/preview`);
                        xhr.onreadystatechange = handler;
                        xhr.responseType = 'blob';
                        xhr.setRequestHeader('api-key', apiKey);
                        xhr.setRequestHeader('api-secret', apiSecret);
                        xhr.send();
                        function handler() {
                            div.innerHTML = "";
                            if (this.readyState === this.DONE) {
                                div.innerHTML += `<h5><strong>Search status: </strong>${rawData.status} ${rawData.statusText} </h5>`;
                                if (this.status === 200 && rawData.status == 200) {
                                    var data_url = URL.createObjectURL(this.response);
                                    console.log(data_url);
                                    var iframe = document.createElement('iframe');
                                    iframe.setAttribute('src', data_url);
                                    div.append(iframe);
                                } else if(rawData.status == 404){
                                    var email = document.createElement('input')
                                    email.setAttribute('id', 'personateApiEmail');
                                    email.setAttribute('type', 'email');
                                    div.appendChild(email);

                                    loadPersonalData();
                                    
                                    var button = document.createElement("input")
                                    button.setAttribute('type', 'button');
                                    button.setAttribute('value', "Dodaj Osobe");
                                    button.addEventListener('click', addPerson);
                                    div.appendChild(button);
                                }else{
                                    div.innerHTML += `<h5><strong>Display status: </strong>${this.status} ${this.statusText}</h5>`;
                                }
                            }
                        }
                    })  
                    }
                }
            },
            1000
            )    
}
async function main(){
    let div = document.getElementById("info");           
    if(div){
        div.innerHTML = "Loading...";
    }
    const data = await getDataFromStorage();
    apiKey = data['api-key']
    apiSecret = data['api-secret']
    addPeopleEndpoint = data['add-people-endpoint']
    checkPeopleEndpoint = data['check-people-endpoint']
    fetchPeopleInfoEndpoint = data['fetch-people-info-endpoint']
    handleURLChange();
}

const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body")
    const observer = new MutationObserver(() => {
        if(oldHref !== document.location.href && !(document.location.href.endsWith('overlay/contact-info/'))){
            
            oldHref = document.location.href;
            main()
        }
    });
    observer.observe(body, {childList: true, subtree: true})
}
window.onload = observeUrlChange;
main();