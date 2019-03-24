/**
 * This file contains the code for the Spotify-Player class:
 *      This object is used for displaying user information only.
 *
 *      I did not use the Node.js server provided at the source, but created my own. I am only using the Spotify-Player
 *      class provided by Spotify.
 *
 *      Source: https://github.com/JMPerez/spotify-player
 */
class SpotifyPlayer {
    constructor(options = {}) {
        this.options = options;
        this.listeners = {};
        this.accessToken = null;
        this.exchangeHost = options.exchangeHost || 'https://spotify-player.herokuapp.com';
        this.obtainingToken = false;
        this.loopInterval = null;
    }

    on(eventType, callback) {
        this.listeners[eventType] = this.listeners[eventType] || [];
        this.listeners[eventType].push(callback);
    }

    dispatch(topic, data) {
        const listeners = this.listeners[topic];
        if (listeners) {
            listeners.forEach(listener => {
                listener.call(null, data);
            });
        }
    }

    init() {
        this.fetchToken().then(r => r.json()).then(json => {
            this.accessToken = json['access_token'];
            this.expiresIn = json['expires_in'];
            this._onNewAccessToken();
        });
    }

    //get's a token
    fetchToken() {
        this.obtainingToken = true;
        return fetch(`${this.exchangeHost}/token`, {
            method: 'POST',
            body: JSON.stringify({
                refresh_token: localStorage.getItem('refreshToken')
            }),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(response => {
            this.obtainingToken = false;
            return response;
        }).catch(e => {
            console.error(e);
        });
    }

/**
 * This function is what pauses our music playback on spotify using the API
 * */
    pause_NowPlaying() {
        /*
        var ourToken = this.fetchToken().then(tokenResponse => {
            if (tokenResponse.status === 200) {
                return tokenResponse.json();
            } else {
                throw 'Could not refresh token';
            }
        });
            */

        var ourToken = this.fetchGeneric('https://api.spotify.com/v1/me/player/pause');

            /*
        document.getElementById('pause').addEventListener('click', function(){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    //do something after request
                }
            };
            xhttp.open("PUT", "https://api.spotify.com/v1/me/player/pause", true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.setRequestHeader('Authorization', ourToken);
            xhttp.send();
        })
        */

        //AJAX call
        return fetch(`https://api.spotify.com/v1/me/player/pause`, {
            method: 'PUT',
            headers: new Headers({
                'Content-Type': 'application/json', ourToken
            })
        }).then(response => {
            return response;
        }).catch(e => {
            console.error(e);
        });
    }

    _onNewAccessToken() {
        if (this.accessToken === '') {
            console.log('Got empty access token, log out');
            this.dispatch('login', null);
            this.logout();
        } else {
            const loop = () => {
                if (!this.obtainingToken) {
                    this.fetchPlayer()
                        .then(data => {
                            if (data !== null && data.item !== null) {
                                this.dispatch('update', data);
                            }
                        })
                        .catch(e => {
                            console.log('Logging user out due to error', e);
                            this.logout();
                        });
                }
            };
            this.fetchUser().then(user => {
                this.dispatch('login', user);
                this.loopInterval = setInterval(loop.bind(this), 1500);
                loop();
            });
        }
    }
/* USER LOGOUT */
    logout() {
        // clear loop interval
        if (this.loopInterval !== null) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        this.accessToken = null;
        this.dispatch('login', null);
    }

/* USER LOGIN */
    login() {
        return new Promise((resolve, reject) => {
            const getLoginURL = scopes => {
                return `${this.exchangeHost}/login?scope=${encodeURIComponent(scopes.join(' '))}`;
            };

            const url = getLoginURL(['user-read-playback-state']);

            const width = 450, height = 730, left = screen.width / 2 - width / 2, top = screen.height / 2 - height / 2;

            window.addEventListener(
                'message',
                event => {
                    const hash = JSON.parse(event.data);
                    if (hash.type == 'access_token') {
                        this.accessToken = hash.access_token;
                        this.expiresIn = hash.expires_in;
                        this._onNewAccessToken();
                        if (this.accessToken === '') {
                            reject();
                        } else {
                            const refreshToken = hash.refresh_token;
                            localStorage.setItem('refreshToken', refreshToken);
                            resolve(hash.access_token);
                        }
                    }
                },
                false
            );

            const w = window.open(
                url,
                'Spotify',
                'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' +
                width +
                ', height=' +
                height +
                ', top=' +
                top +
                ', left=' +
                left
            );
        });
    }

    fetchGeneric(url) {
        return fetch(url, {
            headers: {Authorization: 'Bearer ' + this.accessToken}
        });
    }

    fetchPlayer() {
        return this.fetchGeneric('https://api.spotify.com/v1/me/player').then(response => {
            if (response.status === 401) {
                return this.fetchToken()
                    .then(tokenResponse => {
                        if (tokenResponse.status === 200) {
                            return tokenResponse.json();
                        } else {
                            throw 'Could not refresh token';
                        }
                    })
                    .then(json => {
                        this.accessToken = json['access_token'];
                        this.expiresIn = json['expires_in'];
                        return this.fetchPlayer();
                    });
            } else if (response.status >= 500) {
                // assume an error on Spotify's site
                console.error('Got error when fetching player', response);
                return null;
            } else {
                return response.json();
            }
        });
    }

    fetchUser() {
        return this.fetchGeneric('https://api.spotify.com/v1/me').then(data => data.json());
    }
}