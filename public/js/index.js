//Our two different "pages":
var mainContainer = document.getElementById('main-container'),
    loginContainer = document.getElementById('login-container'),
    //Our button element:
    loginButton = document.getElementById('login-button'),
    //Our background element:
    background = document.getElementById('background');

//Using the spotifyPlayer library
var spotifyPlayer = new SpotifyPlayer();

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
        <div class ="now-playing_button">
            <input type="button" id="pause" value="pause" onclick="spotifyPlayer.pause_NowPlaying()">
        </div>
        <div class="progress">
          <div class="progress_bar" style="width:${data.progress_ms * 100 / data.item.duration_ms}%"></div>
        </div>
      </div>
    </div>
    <div class="background" style="background-image:url(${data.item.album.images[0].url})"></div>
  `;
};

spotifyPlayer.on('update', response => {
    mainContainer.innerHTML = template(response);
});

//Don't display anything unless the user logs on...
spotifyPlayer.on('login', user => {
    if (user === null) {
        loginContainer.style.display = 'block';
        mainContainer.style.display = 'none';
    } else {
        loginContainer.style.display = 'none';
        mainContainer.style.display = 'block';
    }
});

loginButton.addEventListener('click', () => {
    spotifyPlayer.login();
});

spotifyPlayer.init();

