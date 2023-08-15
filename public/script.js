//Javascript
import mmvVault from './mmvVault.js';
import mmvToken from './mmvToken.js';
import dotenv from './dotenv';
//import config from './config.js';
   
//Global Variables
let ipfs = '';
let ipfsHash = null;
let allHashes = [];
let file = "";
let src = 'images/JordanToken-blue.png';
let readStream = '';
let MMVault = '';
let chainId = ''; 
let blockNumber = '';
let transactionHash = '';
let gasUsed ='';
let web3 = '';
let txReceipt =  '';
let bal = '';
let userAddr = '';
let userAddress = '';
let createDate = '';
let MMVToken = '';
let totalTokenVal = 0;
let reward = 0;
let hashes = '';
let memeCount = '';
let vaultNum = 0;
let copyVaultNum = '';
let walletStatus = "Not Connected";
let submitDis = true;
let mintDis = true;
let keyDis = true;
let loadSubmit = "hidden";
let loadRK = "hidden";
let buttonSelcted = "";
let MMconnect = false;
let uploadDis = false;
let _uri = "";
let _timeStamp = "";
let showAddToken = false;
let userSpace;
let dupVault;


//Metamask Connect button
let connectButton = document.getElementById('connectButton');
//Submit Button
document.getElementById('submitMemeBtn').addEventListener('click', uploadToPinata);

//Mint Button
document.getElementById('claimRewardBtn').addEventListener('click', mintToken);

//Grant Key Button
document.getElementById('grabNFTKeyBtn').addEventListener('click', createMeta);


//On load
document.addEventListener('DOMContentLoaded', function() {
  ipfsLoad();
  dotenv.load();
  dotenv.config();

  dotenv.config({path: '.env'});
  //Add to IPFS & GET Hash
  const pinata_api_key = process.env.pinata_api_key
  const pinata_secret_api_key = process.env.pinata_secret_api_key

  console.log(pinata_api_key, pinata_secret_api_key);

  checkMM().then(result => {
    
    if(result){  
     loadVaultStats();
    }else{
      alert("Please connect to MetaMask");
    }

  }).catch(error => {
  // Handle any errors that might occur during the Promise execution
  console.error(error);
  });
  
});

async function ipfsLoad(){
  ipfs = window.Ipfs;

  // Example code
  ipfs.create().then(ipfsInstance => {
    console.log('IPFS instance created:', ipfsInstance);
    // Use the IPFS instance for your desired operations
  }).catch(error => {
    console.error('Error creating IPFS instance:', error);
  });
}

//Check MM status
async function checkMM() {
  
  try {
     console.log(window.ethereum);
     console.log(window.web3);

     if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);

        await window.ethereum.enable();           

      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      
      } else { //No MetaMask detected
        disableAllButtons();
        console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
        return false;
      }

      //assign to global variable
      web3 = window.web3; 

      if(web3 != null){ //MM exist
        //check chain
        const chainId_raw = await window.ethereum.request({ method: 'eth_chainId' });
        const chainId = chainId_raw.toString();

        if(chainId !== "0x5"){ //Arbitrum Testnet and Arbitrum Mainnet

          uploadDis =  true;
          disableAllButtons();
          alert("Switch to Ethereum Mainnet");
          //POP NEEDED for wrong chain
          
          return false;
        }

        //obtain contract address for MMV vault & token
        MMVault = await mmvVault.options.address;
        MMVToken = await mmvToken.options.address;

        const accounts = await web3.eth.getAccounts();
        /*
        if (err != null){
              console.error("An error occurred: "+err);
              MMconnect = false;
              return false;

        }else 
            */
        if (accounts.length == 0) {
          console.log("User is not logged in to MetaMask");
          disableAllButtons();
          //popup
          MMconnect = false;
          return false;
        }else {
          console.log("User is logged in to MetaMask");
          connectButton.disabled = true;
          connectButton.innerHTML = 'Connected';
          
          const addressLong = accounts[0];
          const address_short = addressLong.slice(0,20) + "...";
          console.log(addressLong);

          walletStatus = address_short;
          MMconnect = true;
          userAddress = addressLong;

          return true; 
        }

       }else{

          	MMconnect = false;
            return false; 
       }
      }
      catch (e){
        console.error(e);
        MMconnect = false;
        return false;
      }
}

//Check User Stats
async function checkUser() {

const MMresult = await checkMM();
      
  if(MMresult){
    //check if user submitted before
    let _userAddress = userAddress;

    mmvVault.methods.getMemeCount().call({from: _userAddress})
      .then(memeCount => {
          
        if(memeCount > 0){
          console.log(userAddress);
          mmvVault.methods.getUserHashes(_userAddress).call({from: _userAddress})
            .then(uHashes => {

              if(uHashes[0] !== 'no hashes'){  //User has vault already
                let userMemeCount = uHashes.length;
                
                let userLastMemeHash = uHashes[userMemeCount - 1];
                
                mmvVault.methods.getMemeDetail(userLastMemeHash).call()  //get meme data
                  .then(data => {
                    const _tokensMinted = data.tokensMinted;
                    const _keyMinted = data.keyGranted;
                    ipfsHash = userLastMemeHash;
                    _timeStamp = data.timeStamp;
                    
                    var _reward = data.reward / (10**18);
                    const _vNum = data.vaultNum;
                    console.log(data);
                    if(_tokensMinted && _keyMinted){ //Complete

                      // go on to check space between last meme
                      var LastMemeIndex = allHashes.length - 1;
                      var userLastMemeIndex = _vNum - 1;
                      userSpace = LastMemeIndex - userLastMemeIndex;

                      updateTracker(_reward,memeCount,totalTokenVal);
                      
                      if(userSpace < 9){
                        disableAllButtons();
                        console.log("need space");
                        openPopup("space");
                      }else{
                        //user can create new meme
                        enableButton("fileInput");
                      }

                    }else if(!_tokensMinted && !_keyMinted){//tokens and key not minted
                      //disable all buttons except mint tokens
                      disableAllButtons();
                      enableButton("claim");
                      closePopup("processingMeme");
                          

                    }else if (_tokensMinted && !_keyMinted){
                      //disable all buttons except mint key
                      disableAllButtons();
                      enableButton("key");
                      closePopup("processingMint")
                    }else{
                      //enable mint token and key button only
                      //add popup
                    }
                });

              }else{
                  enableButton("fileInput");
                  console.log("User can create");
                  //enable all buttons
              }
            });

        }else{
          enableButton("fileInput");
          console.log("User can create");

        }
      });

  }else{
    console.log("User not connected");
  }

  mmvToken.methods.balanceOf(userAddress).call()
    .then((result) => {
      if(result == 0){
        showAddToken = true;
    }
  });

}

async function loadVaultStats(){
  mmvToken.methods.totalSupply().call()
    .then((result) => {
      console.log('Result:', result);
      totalTokenVal = result / (10**18);
      
      loadAllHashes();
      
    }).catch((error) => {
      console.error('Error:', error);
    });
}

async function loadAllHashes(){
  mmvVault.methods.getAllHashes().call({from: userAddress}) 
    .then(theHashes => {
      console.log(theHashes);

      allHashes = theHashes;
      memeCount = allHashes.length;
      updateTracker(0,memeCount,totalTokenVal);
      checkUser();
    });
}

function checkHash() {
  
  const newHash = ipfsHash;
  //hash exist?
  for (var i = 0; i < allHashes.length; i++) {
    if(newHash == allHashes[i]){
      dupVault = i + 1;
      return true;
    }
  }
  return false;
}


//Metamask Button click
window.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    
    //disable all button on load
    disableAllButtons();
    
    // Function to connect to MetaMask
    const connectToMetaMask = async () => {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            console.log('MetaMask is not installed. Please install MetaMask to connect.');
            
            return;
        }else{
        	console.log("Installed");

        }

        try {
            // Request access to the user's MetaMask accounts
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            var connectButton = document.getElementById('connectButton');
			      connectButton.innerHTML = 'Connected';

            disableButton("connect");
            alert('Connected to MetaMask!');
            checkMM();
        } catch (error) {
            console.error(error);
            //disableButtons();
            alert('Failed to connect to MetaMask. Please check your MetaMask settings.');
        }
    };

    // Add click event listener to the connect button
    connectButton.addEventListener('click', connectToMetaMask);
});

//File upload
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('fileInput').addEventListener('change', async function(event) {
    
    //Initial file not loaded
    if(file === ""){

      file = event.target.files[0];
      const reader = new FileReader();

      if (typeof file === 'undefined') {
        //Do nothing, no file was loaded
        console.log("Initial - undefined, 2nd Attempt - undefined")

      }else{
        loadImage(reader);
      }
    }else{
      //initial file was loaded
      if (typeof file !== 'undefined') {
        file = event.target.files[0];
        const reader = new FileReader();

        loadImage(reader);
      }else{
        console.log("Initial - loaded, 2nd Attempt - undefined")
      }
    }

  });
});

//Load Image
async function loadImage(_reader){

  await new Promise((resolve, reject) => {
    _reader.onload = function(e) {
      resolve();
    };
    _reader.onerror = function(e) {
      console.error('Failed to read file:', e.target.error);
      
      reject(new Error('Failed to read file'));
    };
    _reader.readAsDataURL(file);
    const base64ImageData = getBase64ImageData(file);
    console.log(base64ImageData);
  });
  
  console.log(_reader);

  const imageDataURL = _reader.result;

  if (imageDataURL !== "") {
    enableButton("submit");
  }else{
    disableButton("submit");
  }
  
  // Create a new image element
  const img = new Image();
  
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set the desired dimensions for the resized image
    const maxWidth = 200;
    const maxHeight = 200;
    
    let width = img.width;
    let height = img.height;
    
    // Calculate the aspect ratio
    const aspectRatio = width / height;
      
    if (width > maxWidth || height > maxHeight) { 
      const aspectRatio = width / height; 
      if (width > height) {
        width = maxWidth;
        height = width / aspectRatio;
      } else {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }
    
    // Resize the image on the canvas
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    // Get the resized image as a data URL
    const resizedImageDataUrl = canvas.toDataURL();
    
    // Set the src of the uploadedImage element to the resized image
    document.getElementById('uploadedImage').src = resizedImageDataUrl;
    const uploadedImage = document.getElementById('uploadedImage');
    console.log(uploadedImage.width, uploadedImage.height);

  };
  // Set the src of the image element to the original image
  img.src = imageDataURL;
}

function getBase64ImageData(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          const base64Data = event.target.result.split(',')[1];
          resolve(base64Data);
      };
      reader.onerror = (error) => {
          reject(error);
      };
      reader.readAsDataURL(file);
  });
}

//account changes
window.ethereum.on('accountsChanged', function (accounts) {
  
  if (accounts.length === 0) {
    console.log('User disconnected from MetaMask.');
    disableAllButtons();
    closePopup();
    // Trigger an alert or perform any other action
    alert('You have been disconnected from MetaMask.');
  } else if (accounts.length > 1) {
    console.log('User connected to MetaMask with a new account.');
    location.reload();
    // Perform any necessary action when the user switches accounts

  } else {
    console.log("confirmed");
    openPopup("");
  }
});

window.ethereum.on('chainChanged', (chainId) => {
    // The chainId parameter represents the ID of the newly selected chain
    // You can perform actions based on the new chain ID here
    console.log('User switched to blockchain with chain ID:', chainId);
    
    // For example, you can reload the page to reset the application state
    location.reload();
  });

function disableAllButtons(){
	
    document.getElementById('fileInput').disabled = true;
    document.getElementById('submitMemeBtn').disabled = true;
    document.getElementById('claimRewardBtn').disabled = true;
    document.getElementById('grabNFTKeyBtn').disabled = true;

}

function disableButton(_buttonId) {
  
  // document.getElementById('fileInput').disabled = true;

  // Add a case statement based on a condition
  switch (_buttonId) {
    case "fileInput":
      document.getElementById('fileInput').disabled = true;
      break;
    case "connect":
      document.getElementById('connectButton').disabled = true;
      break;
    case "submit":
      document.getElementById('submitMemeBtn').disabled = true;
      break;
    case "claim":
      document.getElementById('claimRewardBtn').disabled = true;
      break;
    case "key":
      document.getElementById('grabNFTKeyBtn').disabled = true;
      break;
    default:
      // Code to be executed when none of the conditions are true
      break;
  }
}

function enableButton(_buttonId) {
  
  // document.getElementById('fileInput').disabled = true;

  // Add a case statement based on a condition
  switch (_buttonId) {
    case "connect":
      document.getElementById('connectButton').disabled = false;
      break;
    case "fileInput":
      document.getElementById('fileInput').disabled = false;
      break;
    case "submit":
      document.getElementById('submitMemeBtn').disabled = false;
      break;
    case "claim":
      document.getElementById('claimRewardBtn').disabled = false;
      break;
    case "key":
      document.getElementById('grabNFTKeyBtn').disabled = false;
      break;
    default:
      // default
      break;
  }
}

function enableButtons() {
  	var connectButton = document.getElementById('connectButton');
  	connectButton.innerHTML = 'Connected';

  	//document.getElementById('fileInput') = false;
  	document.getElementById('connectButton').disabled = true;
  	document.getElementById('submitMemeBtn').disabled = false;
  	document.getElementById('claimRewardBtn').disabled = false;
  	document.getElementById('grabNFTKeyBtn').disabled = false;
}

var popup = new bootstrap.Modal(document.getElementById('mbr-popup-1o'));
const popHeader = document.getElementById('popHeader');
const doneButton = document.getElementById('doneButton');
const popImage = document.getElementById('popImage');
const popText = document.getElementById('popText');

// Function to open the popup
function openPopup(_popupID) {

  switch (_popupID){
    case "processingMeme":
      
      // Disable the button
      doneButton.disabled = true;

      //Change Header
      popHeader.textContent = "Submit Meme!";

      popText.textContent = "Please confirm and wait as your Meme is submitted";

      // Change the text
      doneButton.textContent = 'Processing...';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmS6RpiXE4C33iHX6f92Q5YJN2aKq6EMG5RR84o38C19Ky';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmayrabDv7GJ3rT9cmoFpUcdu5AW81GJUjYjAbZdyAgBfq');

      popup.show();
      
      break;
    case "processingMint":
      
      // Disable the button
      doneButton.disabled = true;

      //Change Header
      popHeader.textContent = "Mint Tokens";

      popText.textContent = "Please confirm and wait as your MMV tokens are minted";

      // Change the text
      doneButton.textContent = 'Processing...';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmS6RpiXE4C33iHX6f92Q5YJN2aKq6EMG5RR84o38C19Ky';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmayrabDv7GJ3rT9cmoFpUcdu5AW81GJUjYjAbZdyAgBfq');

      popup.show();
      
      break;
    case "processingKey":
      
      // Disable the button
      doneButton.disabled = true;

      //Change Header
      popHeader.textContent = "Grant Vault Key";

      popText.textContent = "Please confirm and wait as your Vault Key is granted";

      // Change the text
      doneButton.textContent = 'Processing...';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmS6RpiXE4C33iHX6f92Q5YJN2aKq6EMG5RR84o38C19Ky';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmayrabDv7GJ3rT9cmoFpUcdu5AW81GJUjYjAbZdyAgBfq');

      popup.show();
      
      break;
    case "space":
      
      var remainingMemes = 9 - userSpace;
      // Disable the button
      doneButton.disabled = false;

      //Change Header
      popHeader.textContent = "Too Soon!";

      popText.textContent = "You need to wait for " + remainingMemes + " more memes to be posted.";

      // Change the text
      doneButton.textContent = 'CLOSE';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmVHH3UmnbswjP9foAGmWmFJAeXVZCcVk4F5xehr9ANHpH';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmVHH3UmnbswjP9foAGmWmFJAeXVZCcVk4F5xehr9ANHpH');

      popup.show();
      
      break;
    case "duplicate":

      //Change Header
      popHeader.textContent = "Copy-Cat!";
      
      // Disable the button
      doneButton.disabled = false;

      popText.textContent = "Nice try. We've seen this meme before in Vault #" + dupVault + ". Try again!";

      // Change the text
      doneButton.textContent = 'CLOSE';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmRQX9PsZhowJff9WcSR5uHb897nHvrtiq38T6phiERy9N';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmRQX9PsZhowJff9WcSR5uHb897nHvrtiq38T6phiERy9N');

      popup.show();
      
      break;
    default:
      // default
      break;
  }
  
}

// Function to close the popup
function closePopup(_popupID) {

  switch (_popupID){
    case "processingMeme":
      
      // Disable the button
      doneButton.disabled = false;

      //Change Header
      popHeader.textContent = 'Meme Uploaded!';

      popText.textContent = 'Now select "3. Claim Reward" to mint your tokens';

      // Change the text
      doneButton.textContent = 'Close';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmayrabDv7GJ3rT9cmoFpUcdu5AW81GJUjYjAbZdyAgBfq';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmS6RpiXE4C33iHX6f92Q5YJN2aKq6EMG5RR84o38C19Ky');

      //popup.hide();
      
      break;
    case "processingMint":
      
      // Disable the button
      doneButton.disabled = false;

      //Change Header
      popHeader.textContent = 'Reward Claimed!';

      popText.textContent = 'Now select "4. Grab NFT Key" to get Vault Key';

      // Change the text
      doneButton.textContent = 'Close';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmayrabDv7GJ3rT9cmoFpUcdu5AW81GJUjYjAbZdyAgBfq';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmS6RpiXE4C33iHX6f92Q5YJN2aKq6EMG5RR84o38C19Ky');

      //popup.hide();
      
      break;
    case "processingKey":
      
      // Disable the button
      doneButton.disabled = false;

      //Change Header
      popHeader.textContent = 'Key Granted! ';

      popText.textContent = 'Now proceed to "Vault to view Meme';

      //popText.setAttribute('a');

      // Change the text
      doneButton.textContent = 'Close';

      // Change the image source
      popImage.src = 'https://ipfs.io/ipfs/QmayrabDv7GJ3rT9cmoFpUcdu5AW81GJUjYjAbZdyAgBfq';

      popImage.setAttribute('data-src', 'https://ipfs.io/ipfs/QmS6RpiXE4C33iHX6f92Q5YJN2aKq6EMG5RR84o38C19Ky');

      //popup.hide();
      
      break;
      default:
      // default
      break;
      }
      popup.show();
}

//Add to IPFS & GET Hash
//const pinata_api_key = process.env.pinata_api_key
//const pinata_secret_api_key = process.env.pinata_secret_api_key;

// Function to upload file to Pinata
async function uploadToPinata() {
  // Create a FormData object to store the file
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Make a POST request to Pinata API
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        //pinata_api_key: config.pinataapikey,
        //pinata_secret_api_key: config.pinatasecretapikey,
        pinata_api_key: 'b56ff09022a130a14a77',
        pinata_secret_api_key: '714c8317e650615236956ac98f7e0ca9b8a07bff784cf23e6ed84cd8b7f51f82',
      },
    });

    // Handle the response
    console.log('IPFS hash:', response.data.IpfsHash);
    console.log('Pin Size:', response.data.PinSize);
    console.log('Timestamp:', response.data.Timestamp);
    ipfsHash = response.data.IpfsHash;
    let _time_Stamp = (response.data.Timestamp);
    _timeStamp = new Date(_time_Stamp).toUTCString();

    if(!checkHash()){
      uploadToVault();
    }else{
      console.log("hash exist");
      openPopup("duplicate");
    }

  } catch (error) {
    console.error('Error uploading to Pinata:', error.message);
  }
}

async function uploadToVault() {
	const MMresult = await checkMM();
  
  console.log(MMresult, _timeStamp, ipfsHash);
  
	if(MMresult){
		openPopup("processingMeme");
		mmvVault.methods.submitMeme(ipfsHash, _timeStamp)
			.send({
			  from: userAddress, value: web3.utils.toWei("0.0069") 
			}).then(receipt => {
			    
			    console.log(receipt.events.memeSent.returnValues._reward);
			    var estReward = receipt.events.memeSent.returnValues._reward / (10**18);
			    var vaultN = receipt.events.memeSent.returnValues.v_Num;
			    var tStamp = receipt.events.memeSent.returnValues.timeStamp;
			    var divStatus = receipt.events.memeSent.returnValues.divPaid;
			    console.log(estReward, vaultN, tStamp, divStatus);
          //var totaltokensMinted = receipt.events.memeSent.returnValues.totalsTokens
			    estReward = estReward.toFixed(2);
			    
			    reward = estReward;
			    vaultNum = vaultN;
			    submitDis = true;
			    
			    uploadDis = true;
			    closePopup("processingMeme");	
          disableButton("fileInput");		
          disableButton("submit");
          enableButton("claim");   

			    mintDis = false;

          mmvToken.methods.totalSupply().call()
          .then((result) => {
            console.log('Result:', result);
            var totalTokenVal = result / (10**18);
            console.log('Result:', totalTokenVal.toFixed(2));
            updateTracker(reward,vaultNum,totalTokenVal);
          })
  .       catch((error) => {
            console.error('Error:', error);
          });
			  
			}).catch(function(e) {
			  console.error(e);
			  //closePopup();
			});
		}else{
			alert("Please connect to wallet");
      closePopup();
		}
}

function updateTracker(estReward,vaultN,totalTokens){

  // Get reference to the elements by id
const rVal = document.getElementById('rewardVal');
const vNum = document.getElementById('vaultNum');
const tMinted = document.getElementById('tokenMinted');

const formattedR = formatNumberWithCommas(estReward);
const formattedT = formatNumberWithCommas(totalTokens);
//console.log(formattedR, formattedT);

// Change the text
rVal.textContent = formattedR;
vNum.textContent = vaultN;
tMinted.textContent = formattedT;

}

function formatNumberWithCommas(number) {
  const numericValue = Number(number);
  if (isNaN(numericValue)) {
    return 'Invalid number';
  }
  
  const parts = numericValue.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

async function mintToken() {
      
  const MMresult = await checkMM();
  
  console.log(MMresult, userAddress, ipfsHash);
  
  if(MMresult){
    openPopup("processingMint");
    mmvVault.methods.mintReward(ipfsHash, userAddress)
      .send({from: userAddress})
      .then(receipt => {
        //console.log(receipt.events.tokenMint.returnValues.reward);
        
        var bal = receipt.events.tokenMint.returnValues.reward;
        var f_bal = bal / (10**18);

        if(showAddToken){
          addToken();
        } 
        closePopup("processingMint");
        disableButton("claim");
        enableButton("key");

        mmvToken.methods.totalSupply().call()
          .then((result) => {
            console.log('Result:', result);
            var totalTokenVal = result / (10**18);
            console.log('Result:', totalTokenVal.toFixed(2));
            updateTracker(reward,vaultNum,totalTokenVal);
          })
  .       catch((error) => {
            console.error('Error:', error);
          });
        
    }).catch(function(e) {
      console.error(e);
      
    });  //validatehash


  }
}

async function addToken() {  
  console.log(MMVToken);
  const tokenAddress = MMVToken;
  const tokenSymbol = 'MMV';
  const tokenDecimals = 18;
  const tokenImage = 'https://ipfs.io/ipfs/QmSwqFYPhZ7cepZx8rFZuUyEh3pi1Jsw3jXrPku8by2RTA';

  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });

    if (wasAdded) {
      console.log("You're welcome!");
    } else {
      console.log('Your loss!');
    }
  } catch (error) {
    console.log(error);
  }
}


async function createMeta() {
  
  const MMresult = await checkMM();
  
  console.log(MMresult, _timeStamp, ipfsHash);
  
  if(MMresult){
    openPopup("processingKey");

    //Store Metadata
    const UserAddress = userAddress.toString();
    const imageLink = "ipfs://" + ipfsHash;
    const _createDate = _timeStamp;
    const creationDate = _createDate.toString();

    const metadata = {
      image: imageLink,
      creator: UserAddress,
      date: creationDate
    };

    // Step 1: Serialize metadata object to JSON string
    const metadataString = JSON.stringify(metadata);

    console.log(creationDate, imageLink);

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadataString,
        {
          headers: {
            pinata_api_key: 'b56ff09022a130a14a77',
            pinata_secret_api_key: '714c8317e650615236956ac98f7e0ca9b8a07bff784cf23e6ed84cd8b7f51f82',
          },
        }
      );

      // Step 3: Extract the hash value from the response
      const ipfsMetadataHash = response.data.IpfsHash;
      console.log('IPFS Metadata Hash:', ipfsMetadataHash);
      
      const metaTimeStamp = response.data.Timestamp;

      getKey(ipfsMetadataHash);

      // Handle the response
        console.log(response.data);
      } catch (error) {
      // Handle the error
        console.error(error);
      }
    }
  }

    
async function getKey(_metaHash){
  console.log(ipfsHash,_metaHash, userAddress);
  mmvVault.methods.grantKey(ipfsHash, _metaHash)
    .send({from: userAddress})
    .then(receipt => {

      console.log(receipt.events.keyGrant.returnValues);
      var vaultNum = receipt.events.keyGrant.returnValues._id;
      let URI = receipt.events.keyGrant.returnValues._uri;
      
      console.log(URI);

      disableButton("key");
      closePopup("processingKey");
      /*
      if(submitDis && mintDis && keyDis){
        //Disable all buttons
      }
      */
  }).catch(function(e) {
      console.error(e);
      
  });  //key call
}
