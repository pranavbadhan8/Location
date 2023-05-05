
let ipAddress = window.localStorage.getItem('ip');

const ipEl = document.getElementById('ip');
const latEl = document.getElementById('latitude');
const longEl = document.getElementById('longitude');
const cityEl = document.getElementById('city');
const regionEl = document.getElementById('region');
const orgEl = document.getElementById('org');
const hostEl = document.getElementById('host');
const timeZoneEl = document.getElementById('time');
const dateTimeEl = document.getElementById('date');
const pinCodeEl = document.getElementById('pincode');
const messageEl = document.getElementById('message');
const searchBoxInputEl = document.getElementById('search');
const mapDisplayEl = document.getElementById('map');
const displayPostOfficesDiv = document.getElementById('container3');
ipEl.textContent = ipAddress


function displayMap(latitude, longitude) {
  let html = `
  <iframe 
  src="https://maps.google.com/maps?q=${latitude}, ${longitude}&output=embed" 
  width="100%" 
  height="100%" 
  frameborder="0" 
  style="border:0">
  </iframe>
  `
  mapDisplayEl.innerHTML = html;
}

function displayPostOffices(poName, poBranch, poDeliveryStatus, poDistrict, poDivision) {
  let html = `
  <div class="details-tiles ${poName.toLowerCase()} ${poBranch.toLowerCase()}">
    <p class="details">Name: <span id="poName">${poName}</span> </p>
    <p class="details">Branch Type: <span id="poBranch">${poBranch}</span></p>
    <p class="details">Delivery Status: <span id="poDeliveryStatus">${poDeliveryStatus}</span></p>
    <p class="details">District: <span id="poDistrict">${poDistrict}</span></p>
    <p class="details">Division: <span id="poDivision">${poDivision}</span></p>
  </div>
  `
  displayPostOfficesDiv.insertAdjacentHTML('beforeend', html);
}


fetch(`https://ipinfo.io/${ipAddress}/geo?token=2f12b9591109d8`)
  .then(response => response.json())
  .then((data) => {
    [lat, long] = data.loc.split(',');
    latEl.textContent = lat;
    longEl.textContent = long;
    cityEl.textContent = data.city;
    regionEl.textContent = data.region;
    orgEl.textContent = data.org;
    hostEl.textContent = `There is no 'host' property given in the object`
    displayMap(lat, long);
    timeZoneEl.textContent = data.timezone;
    dateTimeEl.textContent = new Date().toLocaleString("en-US", { timeZone: `${data.timezone}` });
    pinCodeEl.textContent = data.postal;
    return data.postal;
  })
  .then((pin) => {
    let pinCode = pin;
    fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
      .then(response => response.json())
      .then((postalDataArray) => {
        let postalData = postalDataArray[0];
        messageEl.textContent = postalData.Message;
        let postOfficesInPincodeArray = postalData.PostOffice;
        postOfficesInPincodeArray.forEach(postOffice => {
          displayPostOffices(postOffice.Name, postOffice.BranchType, postOffice.DeliveryStatus, postOffice.District, postOffice.Division)
        });
        searchBoxInputEl.classList.remove('hidden');
        searchBoxInputEl.addEventListener('input', (e) => {
          e.preventDefault();
          let postOfficeArray = document.querySelectorAll('.details-tiles');
          let searchValue = searchBoxInputEl.value.toLowerCase().trim();
          postOfficeArray.forEach((postOfficeElement) => {
            let name = postOfficeElement.querySelector('#poName').textContent.toLowerCase();
            let branchType = postOfficeElement.querySelector('#poBranch').textContent.toLowerCase();
            if (searchValue === '') postOfficeElement.classList.remove('hidden');
            if (!name.includes(searchValue) && !branchType.includes(searchValue)) {
              postOfficeElement.classList.add('hidden');
            } else {
              postOfficeElement.classList.remove('hidden');
            }
          })
        })
      })
      .catch(postalError => {
        console.error(postalError.message);
      })
  })
  .catch((error) => {
    console.error(error.message);
  })
