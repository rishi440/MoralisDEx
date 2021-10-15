Moralis.initialize("I2Qz7Jk77amHnXpViW8gTz8PBLhZIMg4fnlp9lbK"); // Application id from moralis.io
Moralis.serverURL = "https://e2akqwmhyliu.moralishost.com:2053/server"; //Server url from moralis.io



//TODO: Make multichain
// Option 1 create multiple functions that are triggered on click based on user choice from a drop down
// Option 2 create  a variable that gets passed to init() 
async function init(){
          const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
            chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
          });
          console.log(tokens);
        
}

async function login() {
    try {
        currentUser = Moralis.User.current();
        if(!currentUser){
            currentUser = await Moralis.Web3.authenticate();
        }
    } catch (error) {
        console.log(error);
    }
}

function openModal(){
    document.getElementById("token_modal").style.display = "block";
}

function closeModal(){
    document.getElementById("token_modal").style.display = "none";
}

document.getElementById("login_button").onclick = login;
document.getElementById("from_token_select").onclick = openModal;
document.getElementById("to_token_select").onclick = openModal;
document.getElementById("modal_close").onclick = closeModal;