Moralis.initialize("I2Qz7Jk77amHnXpViW8gTz8PBLhZIMg4fnlp9lbK"); // Application id from moralis.io
Moralis.serverURL = "https://e2akqwmhyliu.moralishost.com:2053/server"; //Server url from moralis.io

let currentTrade = {};
let currentSelection ;
let tokens;

//TODO: Make multichain
// Option 1 create multiple functions that are triggered on click based on user choice from a drop down
// Option 2 create  a variable that gets passed to init() 
async function init(){
    await Moralis.initPlugins();
    await Moralis.enableWeb3();
    await listAvailableTokens();      
    
    currentUser = Moralis.User.current();
    if(currentUser){
        document.getElementById("swap_button").disabled = false;
    }
}

async function listAvailableTokens(){
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
    });

    tokens = result.tokens;
    let parent = document.getElementById("token_list"); 
    for(const address in tokens){
        let  token = tokens[address];
        let div = document.createElement("div");
        div.setAttribute("data-address", address);
        div.className = "token_row";  
        let html  = `
        <img class = "token_list_img" src="${token.logoURI}">
        <span class = "token_list_text">${token.symbol}</span>
        `;
        div.innerHTML = html;
        div.onclick = selectToken;
        parent.appendChild(div); 
    } 
    

}

function selectToken(event){
    closeModal();
    let address = event.target.getAttribute("data-address");
    currentTrade[currentSelection] = tokens[address];
    console.log (currentTrade);
    renderInterface();
}

function renderInterface(){

    if(currentTrade.from){
        document.getElementById("from_token_img").src = currentTrade.from.logoURI;
        document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
    }
    
    if(currentTrade.to){
        document.getElementById("to_token_img").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
    }
}

async function getQuote(){

    if(!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value)
    return;

    let amount = Number(document.getElementById("from_amount").value * 10**currentTrade.from.decimals);

    const quote = await Moralis.Plugins.oneInch.quote({
        chain: 'polygon', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address,
        toTokenAddress: currentTrade.to.address,
        amount: amount,
    });

    document.getElementById("gas_estimation").innerHTML = "Estimated Gas: \t" + quote.estimatedGas; 
    document.getElementById("to_amount").value = quote.toTokenAmount / 10**currentTrade.to.decimals;
}

async function trySwap() {
    let address = Moralis.User.current().get("ethAddress");
    let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
    if (currentTrade.from.symbol !== "MATIC") {
      const allowance = await Moralis.Plugins.oneInch.hasAllowance({
        chain: "polygon", // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        fromAddress: address, // Your wallet address
        amount: amount,
      });
      console.log(allowance);
      if (!allowance) {
        await Moralis.Plugins.oneInch.approve({
          chain: "polygon", // The blockchain you want to use (eth/bsc/polygon)
          tokenAddress: currentTrade.from.address, // The token you want to swap
          fromAddress: address, // Your wallet address
        });
      }
    }
    try {
      let receipt = await doSwap(address, amount);
      alert("Swap Complete");
    } catch (error) {
      console.log(error);
    }
  }
  
  function doSwap(userAddress, amount) {
    return Moralis.Plugins.oneInch.swap({
      chain: "polygon", // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: currentTrade.from.address, // The token you want to swap
      toTokenAddress: currentTrade.to.address, // The token you want to receive
      amount: amount,
      fromAddress: userAddress, // Your wallet address
      slippage: 1,
    });
  }

async function login() {
    try {
        currentUser = Moralis.User.current();
        if(!currentUser){
            currentUser = await Moralis.Web3.authenticate({signingMessage: "Welcome to Dexchange! \n Please click Sign button below."});
        }
        document.getElementById("login_button").style.display = "none";
        document.getElementById("logout_button").style.display = "block";
        document.getElementById("swap_button").disabled = false;
    } catch (error) {
        console.log(error);
    }
}

async function logout(){
    await Moralis.User.logOut();
    document.getElementById("login_button").style.display = "block";
    document.getElementById("logout_button").style.display = "none";
    document.getElementById("swap_button").disabled = true;
    alert("You have been logged out");
}

function openModal(side){
    currentSelection = side;
    document.getElementById("token_modal").style.display = "block";
}

function closeModal(){
    document.getElementById("token_modal").style.display = "none";
}

document.getElementById("login_button").onclick = login;
document.getElementById("logout_button").onclick = logout;
document.getElementById("from_token_select").onclick = (() => {openModal("from")});
document.getElementById("to_token_select").onclick = (() => {openModal("to")});
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;


init();