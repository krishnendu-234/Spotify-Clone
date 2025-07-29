console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs = [];
let currfolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(infoJsonPath) {
    try {
        let response = await fetch(infoJsonPath);
        let json = await response.json();
        currfolder = infoJsonPath.split("/").slice(0, -1).join("/");
        songs = json.songs;

        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";

        for (const song of songs) {
            let filename = song.split("/").pop();
            songUL.innerHTML += `<li> 
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(filename)}</div>
                    <div>Artist</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div> 
            </li>`;
        }

        Array.from(songUL.getElementsByTagName("li")).forEach((e, i) => {
            e.addEventListener("click", () => {
                playMusic(songs[i]);
            });
        });

        return songs;
    } catch (err) {
        console.error("Error loading songs:", err);
    }
}

function playMusic(track, pause = false) {
    currentSong.src = track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track.split("/").pop());
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    const folders = ["ncs", "chill", "party"]; // 🔁 Your real folder names here
    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of folders) {
        try {
            let res = await fetch(`songs/${folder}/info.json`);
            let data = await res.json();

            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                        <path d="M18.89 12.846c-.354 1.343-2.024 2.292-5.365 4.19-3.23 1.835-4.845 2.753-6.146 2.384-.538-.153-1.028-.443-1.423-.842C5 17.614 5 15.743 5 12c0-3.742 0-5.614.956-6.579.395-.4.885-.69 1.423-.842 1.302-.369 2.916.548 6.146 2.384 3.341 1.898 5.011 2.847 5.365 4.19.146.554.146 1.137 0 1.692z" stroke="black" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpeg" alt="">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
        } catch (err) {
            console.warn(`Failed to load album ${folder}`);
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(`songs/${card.dataset.folder}/info.json`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/ncs/info.json");
    playMusic(songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = "img/volume.svg";
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
