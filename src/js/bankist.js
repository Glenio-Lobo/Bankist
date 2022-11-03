'use strict';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [
    [200, "2020-07-26T17:01:17.194Z"],
    [455.23, "2019-11-18T21:31:17.178Z"],
    [-306.5, "2019-12-23T07:42:02.383Z"],
    [25000, "2020-01-28T09:15:04.904Z"],
    [-642.21, "2020-04-01T10:17:24.185Z"],
    [-133.9, "2020-05-08T14:11:59.604Z"],
    [79.97, "2020-07-28T23:36:17.929Z"],
    [1300, "2020-08-01T10:51:36.790Z"]
  ],
  interestRate: 1.2, // %
  pin: 1111,
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [
    [5000, "2019-11-01T13:15:33.035Z"],
    [3400, "2019-11-30T09:48:16.867Z"],
    [-150, "2019-12-25T06:04:23.907Z"],
    [-790, "2020-01-25T14:18:46.235Z"],
    [-3210, "2020-02-05T16:33:06.386Z"],
    [-1000, "2020-04-10T14:43:26.374Z"],
    [8500, "2020-06-25T18:49:59.371Z"],
    [-30, "2020-07-26T12:01:20.894Z"],
  ],
  interestRate: 1.5,
  pin: 2222,
  currency: "USD",
  locale: "en-US",
};

/* Variáveis do Programa */
const accounts = [account1, account2];
let currentUser, currentUserIndex, timer;
let alreadySorted = false;

const mainSection = document.querySelector('.main');

const loginBtn = document.querySelector('.navbar__btn');
const loginUsername = document.getElementById('username');
const loginPin = document.getElementById('password');
const loginPresentation = document.querySelector('.navbar__loginSugestion');

const userBalance = document.querySelector('.balance__money');
const balanceDate = document.querySelector('.balance__date');
const userMovements = document.querySelector('.table');
const userAmountIn = document.querySelector('.info__amount--in');
const userAmountOut = document.querySelector('.info__amount--out');
const userAmountInterest = document.querySelector('.info__amount--interest');

const sortMovementsButton = document.querySelector('.info__sort');

const transferUserDestiny = document.getElementById('transfer__user');
const transferUserAmount = document.getElementById('transfer__amount');
const transferBtn = document.querySelector('.btn--transfer');

const resquestLoan = document.getElementById('loan__amount');
const loanBtn = document.querySelector('.btn--loan');

const closeAccountUser = document.getElementById('close__user');
const closeAccountPin = document.getElementById('close__pin');
const closeBtn = document.querySelector('.btn--interest');

const userCountdown = document.querySelector('.countdown');

/* Métodos da aplicação */

/* Inicializando a aplicação */

init();

function init(){
  criarUsernames();
}

function initiateLogOutTimer(){
  let countTime = 1000; // 9minuto e 45 segundos

  let minutes, seconds;

  const tickTack = function (){
    minutes = Math.trunc(countTime/60);
    seconds = (countTime%60);

    userCountdown.textContent = `${String(minutes).padStart(2,0)}:${String(seconds).padStart(2,0)}`;

    if(countTime === 0){
      logOut();
      clearInterval(timer);
    }

    countTime--;
  }

  tickTack(); //Para a função iniciar imediatamente, e não após 1 segundo como no setInterval.
  timer = setInterval(tickTack, 1000);
}

function resetTimer(timer){
  if(timer) clearInterval(timer);
}

/* Cria os Usernames para todas as contas atuais */
function criarUsernames(){
    accounts.forEach( function(acc){
      acc['username'] = acc.owner.split(' ').reduce(function(acumulator, value) {
        return acumulator.concat(value[0]).toLowerCase();
      }, '');
    });
}

/* Formata o número para o valor monetário especificado */
function formatMoneyString(currentUser, value){
  let dollarFormat = Intl.NumberFormat("pt-BR", {
      style: 'currency',
      currency: currentUser.currency,
      minimumFractionDigits: 2,
  });
  return dollarFormat.format(value);
}

function formatDateString(date){
  const movDate = new Date(date);
  const now = new Date();
  const dateDiff = Math.trunc(Math.abs((now-movDate)/(1000*60*60*24)));
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const dateFormart = new Intl.DateTimeFormat('pt-BR', options).format(movDate);

  if(dateDiff === 0)
    return 'TODAY'
  else if(dateDiff === 1)
    return 'YESTERDAY'
  else if(dateDiff <= 7)
    return `${dateDiff} days ago`;
  else
    return dateFormart;
}

/* Calcula o valor total do usuário */
function calculateBalance(movements){
  return movements.reduce(function (acumulator, value) {
    return acumulator + value[0];
  }, 0);
}

/*Mostra o valor total do usuário na tela*/
function showBalance(movements){
  //Calcula o valor total do usuario
  let balanceValue =  calculateBalance(movements);
  let dateNow = new Date();
  let [day, month, year, hour, minute] = [`${dateNow.getDate()}`.padStart(2, 0), 
                                          `${dateNow.getMonth()}`.padStart(2, 0), 
                                             dateNow.getFullYear(),
                                          `${dateNow.getHours()}`.padStart(2, 0), 
                                          `${dateNow.getMinutes()}`.padStart(2, 0)];

  balanceDate.textContent = `As of ${day}/${month}/${year}, ${hour}:${minute}`;
  userBalance.textContent = `${formatMoneyString(currentUser, balanceValue)}`;
}

/* Mostra todos os movimentos da conta do usuário */
function showMovements(currentUser, toSort = false){
  let html;
  let type;
  let movDay, movMonth, movYear;

  //Ordena se necessário
  let auxiliarMovements = toSort ? currentUser.movements.slice().sort((a,b)=>a[0]-b[0]) : currentUser.movements;

  userMovements.innerHTML = ''; //Reseta os movimentos

  auxiliarMovements.forEach(function(mov, index){
    type = mov[0] > 0 ? 'deposit' : 'withdrawal';
    
    html = `<div class="table__card">
                <div class="table__info">
                    <p class="table__title table__title--${type}">${index+1} ${type}</p>
                    <p class="table__date">${formatDateString(mov[1])}</p>
                </div>
                
                <p class="table__value table__value--${type}">${formatMoneyString(currentUser, mov[0])}</p>
            </div>`;
    
    userMovements.insertAdjacentHTML('afterbegin', html);
  });
}

/* Funções para calcular o sumário da aplicação, recebem um array de movimentos*/
function calculateAmountIn(movements){
  return movements.filter((value) => value[0] > 0).reduce((acumulator,value) => acumulator+value[0], 0);
}

function calculateAmountOut(movements){
  return movements.filter((value) => value[0] < 0).reduce((acumulator,value) => acumulator+value[0], 0);
}

function calculateInterest(movements){
  return movements.filter((value) => value[0] > 0).map(dep => dep[0]*1.2/100).reduce((acc,value)=>acc+value, 0)
}

/* Atualiza o sumário da aplicação */
function showSummary(movements){
  userAmountIn.textContent = formatMoneyString(currentUser, calculateAmountIn(movements));
  userAmountOut.textContent = formatMoneyString(currentUser, calculateAmountOut(movements));
  userAmountInterest.textContent = formatMoneyString(currentUser, calculateInterest(movements));
}

function updateUI(currentUser){
  showBalance(currentUser.movements);
  showMovements(currentUser);
  showSummary(currentUser.movements);
}

function logOut(){
  currentUserIndex = -1;
  currentUser = {};
  mainSection.style.opacity = '0';
  loginPresentation.textContent = 'Log in to get started';
}

/* Manipulação da DOM */

loginBtn.addEventListener('click', function(e){
  e.preventDefault();

  let indexIfFind = -1;
  /*Verifica o username*/
  let loginTentativeUser = accounts.some(function(acc, index){
    if (acc.username === loginUsername.value) {
      indexIfFind = index;
      return true;
    }else return false;
  });

  /*Verifica o pin do usuário*/
  if (loginTentativeUser && accounts[indexIfFind].pin === Number(loginPin.value)){
    /*Seta o usuário atual*/
    currentUser = accounts[indexIfFind];
    currentUserIndex = indexIfFind;

    /* Atualiza o texto de apresentação */
    loginPresentation.textContent = `Good Night, ${accounts[indexIfFind].owner.split(' ')[0]}!`;

    /*Reseta o campo de login*/
    loginPin.value = '';
    loginUsername.value = '';

    mainSection.style.opacity = '100';
    resetTimer(timer);
    initiateLogOutTimer();
    updateUI(currentUser);
  }
})

sortMovementsButton.addEventListener('click', function (e) {
  e.preventDefault();
  alreadySorted = !alreadySorted;
  showMovements(currentUser, alreadySorted);
})  

transferBtn.addEventListener('click', function(e){
  e.preventDefault();
  let targetUserExist = accounts.findIndex((account) => account.username === transferUserDestiny.value);
  let transferAmount = Number(transferUserAmount.value);
  let dateOfTransfer = new Date().toISOString();

  if(targetUserExist != -1){
    accounts[targetUserExist].movements.push([transferAmount, dateOfTransfer]);
    currentUser.movements.push([-1*transferAmount, dateOfTransfer]);
    updateUI(currentUser);
  }

  transferUserDestiny.value = '';
  transferUserAmount.value = '';
})

loanBtn.addEventListener('click', function (e){
  e.preventDefault();

  let loanAmount = Number(resquestLoan.value);
  
  if(currentUser.movements.some((mov) => mov[0] > 0.1*loanAmount)){
    currentUser.movements.push([loanAmount, new Date().toISOString()]);
    updateUI(currentUser);
    resquestLoan.value = '';
  }
})

closeBtn.addEventListener('click', function(e){
  e.preventDefault();
  if(currentUser.username === closeAccountUser.value && Number(closeAccountPin.value) === currentUser.pin){
    closeAccountUser.value = '';
    closeAccountPin.value = '';
    accounts.splice(currentUserIndex, 1);
    logOut();
  }
})