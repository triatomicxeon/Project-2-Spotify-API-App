//Our two different "pages":
var mainContainer = document.getElementById('main-container'),
    loginContainer = document.getElementById('login-container'),
    controlContainer = document.getElementById('control-container'),
    //Our button element:
    loginButton = document.getElementById('login-button'),
    //Our background element:
    background = document.getElementById('background');

//Using the spotifyPlayer library
var spotifyPlayer = new SpotifyPlayer();

/**
 * MAIN CONTAINER:======================================================================================================
 */
//Displaying our page in html:
//Everything marked with "$" is the data from the API.
var template = function (data) {
    return `
    <div class="main-wrapper">
      <div class="now-playing_img">
        <img src="${data.item.album.images[0].url}">
      </div>
      <div class="now-playing_side">
        <div class="now-playing_songName">${data.item.name}</div>
        <div class="now-playing_artist">${data.item.artists[0].name}</div>
        <div class="now-playing_status">${data.is_playing ? 'Playing' : 'Paused'}</div>
        <div class="progress">
          <div class="progress_bar" style="width:${data.progress_ms * 100 / data.item.duration_ms}%"></div>
        </div>

      </div>
    </div>
    <div class="background" style="background-image:url(${data.item.album.images[0].url})"></div>
  `;
};

/**
 * CONTROL CONTAINER:===================================================================================================
 */

var templateControl = function () {
    return `
    <div class="control-wrapper">
        <div class="play-button_img">
        <img src="../public/images/pause.png" width="100" height="100" alt="pause" id="pic" onclick="changePlayState()">
        </div>        
    </div>
  `;
};

//SCRIPT FOR PLAY/PAUSE BUTTON------------------------------------------------------------------------------------------
var current_state = 'playing';
var currentIcon = "play.png";

function changePlayState(){
    if ( current_state === 'playing' ){
        pausePlayback();
        changeIcon();
        current_state = 'paused';
    } else {
        resumePlayback();
        changeIcon();
        current_state = 'playing';
    }
}

function changeIcon(){
    if ( currentIcon === "play.png" ) {
        document.images["pic"].src = "../public/images/play.png";
        document.images["pic"].alt = "play";
        currentIcon  = "pause.png";
    }
    else {
        document.images["pic"].src = "../public/images/pause.png";
        document.images["pic"].alt = "pause";
        currentIcon  = "play.png";
    }
}

//These are our AJAX calls to the Spotify API that will actually pause/resume our music
    //TODO: Fix access_token OAuth
    // These work with tokens manually generated from Spotify! I am just still figuring out how to make them work with
    // the token I generate from the node server.
function pausePlayback(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/pause',
        type: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    });
}

function resumePlayback(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play',
        type: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
    });
}

//Updating on-screen containers:----------------------------------------------------------------------------------------
spotifyPlayer.on('update', response => {
    mainContainer.innerHTML = template(response);
});

//Use this to pass data to templateControl (like on line 70)....
controlContainer.innerHTML = templateControl();

//What to display and when:---------------------------------------------------------------------------------------------
    //none: The element is completely removed
    //block: 	Displays an element as a block element (like <p>).
    //          on a new line, and takes up the whole width

spotifyPlayer.on('login', user => {
    if (user === null) {
        loginContainer.style.display = 'block';
        mainContainer.style.display = 'none';
        controlContainer.style.display = 'none';
    } else {
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        controlContainer.style.display = 'block';
    }
});

loginButton.addEventListener('click', () => {
    spotifyPlayer.login();
});

spotifyPlayer.init();

