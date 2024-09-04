console.log("LIVE RELOAD ENABLED ")
let currentSong = new Audio();
let isPlaying = false;
let isMuted = false; // Track the mute state
let lastVolume = 1; // Track the last volume level before muting
let songs = []; // Store songs globally for next/previous controls
let currentIndex = 0; // Track the current song index

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Event listeners for sidebar buttons
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
});

const handlesubmit = async (e) => {
    e.preventDefault();
    let songName = document.getElementById("songname");
    await getSongs(songName.value);
};

const getSongs = async (songname) => {
    let cardContainer = document.querySelector(".cardcontainer");
    cardContainer.innerHTML = `<div class="spinner"></div>`;
    // let res = await fetch("https://saavn.dev/api/search/songs?query=" + songname);
    let res = await fetch(`https://saavn.dev/api/search/songs?query=${songname}&limit=18`);
    let result = await res.json();
    songs = result.data.results.map(song => ({
        url: song.downloadUrl[3].url,
        name: song.name
    })); // Store both URL and name
    cardContainer.innerHTML = ""; // Clear spinner after fetching

    // Create song cards
    songs.forEach((song, index) => {
        let songItem = `<div class="card" >
                                <img src="${result.data.results[index].image[2].url}" alt="" />
                                <h2>${song.name}</h2>
                                <button onclick="playMusic('${song.url}', '${song.name}', ${index})" class="play">
                                    <svg width="24px" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="12" fill="#00FF00" />
                                        <path d="M9 16V8L15 12L9 16Z" fill="#000000" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>`;
        cardContainer.innerHTML += songItem;
    });

    
};


const playMusic = (url, name, index) => {
    if (currentSong.src !== url) {
        currentSong.src = url;
        currentIndex = index; // Update current index
        currentSong.play();
        isPlaying = true;
        document.getElementById("play").src = "img/pause.svg";
    } else if (currentSong.paused) {
        currentSong.play();
        isPlaying = true;
        document.getElementById("play").src = "img/pause.svg";
    } else {
        currentSong.pause();
        isPlaying = false;
        document.getElementById("play").src = "img/play.svg";
    }

    // Update song info with actual song name
    document.querySelector(".songinfo").textContent = name;
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
};

// Attach event listeners to control buttons
document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused && currentSong.src) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
        isPlaying = true;
    } else {
        currentSong.pause();
        document.getElementById("play").src = "img/play.svg";
        isPlaying = false;
    }
});

document.getElementById("previous").addEventListener("click", () => {
    if (currentIndex > 0) {
        playMusic(songs[currentIndex - 1].url, songs[currentIndex - 1].name, currentIndex - 1);
    }
});

document.getElementById("next").addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
        playMusic(songs[currentIndex + 1].url, songs[currentIndex + 1].name, currentIndex + 1);
    }
});

currentSong.addEventListener("timeupdate", () => {
    if (currentSong.duration) {
        progress.max = currentSong.duration;
        progress.value = currentSong.currentTime;
        const percentage = (currentSong.currentTime / currentSong.duration) * 100;
        progress.style.background = `linear-gradient(to right, #00FF00 ${percentage}%, #ccc ${percentage}%)`;
    }
    document.querySelector(".songtime").textContent = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
});

document.getElementById("progress").addEventListener("input", (e) => {
    currentSong.currentTime = e.target.value;
    const percentage = (e.target.value / currentSong.duration) * 100;
    progress.style.background = `linear-gradient(to right, #00FF00 ${percentage}%, #ccc ${percentage}%)`;
});


const makeInitialSongs = async () => {
    await getSongs("beliver");
  };




// Add an event to volume
const volumeInput = document.querySelector(".volume input");
volumeInput.addEventListener("input", (e) => {
    const volume = parseInt(e.target.value) / 100;
    if (volume === 0) {
        currentSong.volume = 0;
        isMuted = true;
        volimg.src = "img/mute.svg";
    } else {
        currentSong.volume = volume;
        lastVolume = volume;
        isMuted = false;
        volimg.src = "img/volume.svg";
    }
});



// Add mute/unmute functionality
const volimg = document.getElementById("volimg");
volimg.addEventListener("click", () => {
    if (isMuted) {
        // Unmute
        currentSong.volume = lastVolume;
        volumeInput.value = lastVolume * 100;
        volimg.src = "img/volume.svg";
    } else {
        // Mute
        currentSong.volume = 0;
        volumeInput.value = 0;
        volimg.src = "img/mute.svg";
    }
    isMuted = !isMuted;
});
document.body.addEventListener("contextmenu",(e)=>{
    e.preventDefault(); // Prevents the default right-click menu from appearing
    alert("Whoa! Trying to right-click? This isn’t a secret cheat code zone!");
  
})
makeInitialSongs()