const songsData = [
    {
        "title": "Aankhon Me Teri",
        "album": "KK Hits",
        "path": "KK/Aankhon Me Teri.mp3"
    },
    {
        "title": "Aaya Re",
        "album": "KK Hits",
        "path": "KK/Aaya Re.mp3"
    },
    {
        "title": "Alvida",
        "album": "Life In A Metro",
        "path": "KK/Alvida - Life In A Metro 128 Kbps.mp3"
    },
    {
        "title": "Are Are Are",
        "album": "Makkhi",
        "path": "KK/Are Are Are - Makkhi 128 Kbps.mp3"
    },
    {
        "title": "Aur Tanha",
        "album": "Love Aaj Kal",
        "path": "KK/Aur Tanha - Love Aaj Kal 128 Kbps.mp3"
    },
    {
        "title": "Awarapan Banjarapan",
        "album": "KK Hits",
        "path": "KK/Awarapan Banjarapan.mp3"
    },
    {
        "title": "Aye Bekhabar Zeher 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Aye Bekhabar Zeher 128 Kbps.mp3"
    },
    {
        "title": "Bardaasht",
        "album": "KK Hits",
        "path": "KK/Bardaasht.mp3"
    },
    {
        "title": "Barhaan Dil (Male Version)",
        "album": "Mr. Singh Mrs. Mehta",
        "path": "KK/Barhaan Dil (Male Version) - Mr. Singh Mrs. Mehta 128 Kbps.mp3"
    },
    {
        "title": "Bas Ek Pal",
        "album": "Bas Ek Pal",
        "path": "KK/Bas Ek Pal - Bas Ek Pal 128 Kbps.mp3"
    },
    {
        "title": "Beete Lamhe",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Beete Lamhe - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Beetein Lamhein (Unplugged) KK",
        "album": "KK Hits",
        "path": "KK/Beetein Lamhein (Unplugged) KK.mp3"
    },
    {
        "title": "Bin Tum",
        "album": "KK Hits",
        "path": "KK/Bin Tum.mp3"
    },
    {
        "title": "Chand Ki Roshni Home Delivery 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Chand Ki Roshni Home Delivery 128 Kbps.mp3"
    },
    {
        "title": "Dil Ibaadat (Rock)",
        "album": "Tum Mile",
        "path": "KK/Dil Ibaadat (Rock) - Tum Mile 128 Kbps.mp3"
    },
    {
        "title": "Dil Ibaadat",
        "album": "Tum Mile",
        "path": "KK/Dil Ibaadat - Tum Mile 128 Kbps.mp3"
    },
    {
        "title": "Dil Ki Purani Sadak",
        "album": "Sadak 2",
        "path": "KK/Dil Ki Purani Sadak - Sadak 2 128 Kbps.mp3"
    },
    {
        "title": "Dil Kyun Yeh Mera",
        "album": "Kites",
        "path": "KK/Dil Kyun Yeh Mera - Kites 128 Kbps.mp3"
    },
    {
        "title": "Dilnashin Dilnashin",
        "album": "KK Hits",
        "path": "KK/Dilnashin Dilnashin.mp3"
    },
    {
        "title": "Duniya Ne Dil Toda",
        "album": "Showbiz",
        "path": "KK/Duniya Ne Dil Toda - Showbiz 128 Kbps.mp3"
    },
    {
        "title": "Dus Bahane",
        "album": "KK Hits",
        "path": "KK/Dus Bahane.mp3"
    },
    {
        "title": "Ek Nazar Mein Bhi",
        "album": "Taxi No. 9211",
        "path": "KK/Ek Nazar Mein Bhi - Taxi No. 9211 128 Kbps.mp3"
    },
    {
        "title": "Ek Pal Ke Liye",
        "album": "KK Hits",
        "path": "KK/Ek Pal Ke Liye.mp3"
    },
    {
        "title": "Gulon Mein (Upbeat Version)",
        "album": "Sikandar",
        "path": "KK/Gulon Mein (Upbeat Version) - Sikandar 128 Kbps.mp3"
    },
    {
        "title": "Haan Main Jitni Martaba",
        "album": "All The Best",
        "path": "KK/Haan Main Jitni Martaba - All The Best 128 Kbps.mp3"
    },
    {
        "title": "Haan Tu Hain",
        "album": "Jannat_128-(DJMaza)",
        "path": "KK/Haan Tu Hain - Jannat_128-(DJMaza).mp3"
    },
    {
        "title": "Hai Junoon",
        "album": "New York",
        "path": "KK/Hai Junoon - New York 128 Kbps.mp3"
    },
    {
        "title": "Hum Rahe Ya Na Rahe By..kk",
        "album": "KK Hits",
        "path": "KK/Hum Rahe Ya Na Rahe By..kk.mp3"
    },
    {
        "title": "Humko Pyar Hua (Chal Chale)",
        "album": "Ready",
        "path": "KK/Humko Pyar Hua (Chal Chale) - Ready 128 Kbps.mp3"
    },
    {
        "title": "I Am In Love",
        "album": "Once Upon A Time In Mumbaai",
        "path": "KK/I Am In Love - Once Upon A Time In Mumbaai 128 Kbps.mp3"
    },
    {
        "title": "Jaane Kaise",
        "album": "Raqeeb",
        "path": "KK/Jaane Kaise - Raqeeb 128 Kbps.mp3"
    },
    {
        "title": "Jaane Ye Kya Hua",
        "album": "Karthik Calling Karthik",
        "path": "KK/Jaane Ye Kya Hua - Karthik Calling Karthik 128 Kbps.mp3"
    },
    {
        "title": "Jaavedaan Hai 1920 Evil Returns 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Jaavedaan Hai 1920 Evil Returns 128 Kbps.mp3"
    },
    {
        "title": "Jab Kabhi 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Jab Kabhi 128 Kbps.mp3"
    },
    {
        "title": "Jannatein Kahan 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Jannatein Kahan 128 Kbps.mp3"
    },
    {
        "title": "Jeena isi ka naam",
        "album": "KK Hits",
        "path": "KK/Jeena isi ka naam.mp3"
    },
    {
        "title": "Kabhi Aayine Pe Likha Tujhe 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Kabhi Aayine Pe Likha Tujhe 128 Kbps.mp3"
    },
    {
        "title": "Kabhi Khushboo",
        "album": "Saaya",
        "path": "KK/Kabhi Khushboo - Saaya 128 Kbps.mp3"
    },
    {
        "title": "Kahaani (Male)",
        "album": "Kahaani",
        "path": "KK/Kahaani (Male) - Kahaani 128 Kbps.mp3"
    },
    {
        "title": "Kaisa Ye Raaz Hai",
        "album": "RAAZ",
        "path": "KK/Kaisa Ye Raaz Hai - RAAZ - The Mystery Continues 128 Kbps.mp3"
    },
    {
        "title": "Kaise Bataun Tujhe",
        "album": "KK Hits",
        "path": "KK/Kaise Bataun Tujhe.mp3"
    },
    {
        "title": "Kal Ki Hi Baat Hai",
        "album": "Chhichhore",
        "path": "KK/Kal Ki Hi Baat Hai - Chhichhore 128 Kbps.mp3"
    },
    {
        "title": "Khuda Jaane",
        "album": "K.K_128-(DJMaza)(1)",
        "path": "KK/Khuda Jaane - K.K_128-(DJMaza)(1).mp3"
    },
    {
        "title": "Khuda Jaane",
        "album": "K.K_128-(DJMaza)",
        "path": "KK/Khuda Jaane - K.K_128-(DJMaza).mp3"
    },
    {
        "title": "Khwabon Khwabon 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Khwabon Khwabon 128 Kbps.mp3"
    },
    {
        "title": "Kya Mujhe Pyar Hai",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Kya Mujhe Pyar Hai - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Labon Ko",
        "album": "KK Hits",
        "path": "KK/Labon Ko.mp3"
    },
    {
        "title": "Luk Chup Jaana Nazar Ko",
        "album": "KK Hits",
        "path": "KK/Luk Chup Jaana Nazar Ko.mp3"
    },
    {
        "title": "Main Agar",
        "album": "Film Version (Tubelight)",
        "path": "KK/Main Agar - Film Version (Tubelight) 128 Kbps.mp3"
    },
    {
        "title": "Main Khuda",
        "album": "Male",
        "path": "KK/Main Khuda - Male - (Raag.Fm).mp3"
    },
    {
        "title": "Main Kya Hoon",
        "album": "Love Aaj Kal",
        "path": "KK/Main Kya Hoon - Love Aaj Kal 128 Kbps.mp3"
    },
    {
        "title": "Maine Dil Se Kaha",
        "album": "Rog",
        "path": "KK/Maine Dil Se Kaha - Rog 128 Kbps.mp3"
    },
    {
        "title": "Mat Aazma Re",
        "album": "Murder 3",
        "path": "KK/Mat Aazma Re - Murder 3 128 Kbps.mp3"
    },
    {
        "title": "Mera Pehla Pehla Pyaar",
        "album": "MP3",
        "path": "KK/Mera Pehla Pehla Pyaar - MP3 - Mera Pehla Pehla Pyaar 128 Kbps.mp3"
    },
    {
        "title": "Mere Bina Crook 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Mere Bina Crook 128 Kbps.mp3"
    },
    {
        "title": "Mere Bina Unplugged Crook 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Mere Bina Unplugged Crook 128 Kbps.mp3"
    },
    {
        "title": "Mera Palak Ka Tu Hi Sitara",
        "album": "Showbiz",
        "path": "KK/Mere Palak Ka Tu Hi Sitara - Showbiz 128 Kbps.mp3"
    },
    {
        "title": "Meri Maa (Reprise)",
        "album": "Yaariyan",
        "path": "KK/Meri Maa (Reprise) - Yaariyan 128 Kbps.mp3"
    },
    {
        "title": "Mujhe Kuch Kehna Hai",
        "album": "Mujhe Kucch Kehna Hai",
        "path": "KK/Mujhe Kuch Kehna Hai - Mujhe Kucch Kehna Hai 128 Kbps.mp3"
    },
    {
        "title": "Nazar Nazar",
        "album": "Nazar",
        "path": "KK/Nazar Nazar - Nazar 128 Kbps.mp3"
    },
    {
        "title": "Nazrein kaha soti hai",
        "album": "KK Hits",
        "path": "KK/Nazrein kaha soti hai.mp3"
    },
    {
        "title": "O Jaana",
        "album": "Tere Naam",
        "path": "KK/O Jaana - Tere Naam 128 Kbps.mp3"
    },
    {
        "title": "O Mama",
        "album": "7 Khoon Maaf",
        "path": "KK/O Mama - 7 Khoon Maaf 128 Kbps.mp3"
    },
    {
        "title": "O Meri Jaan",
        "album": "Tum Mile",
        "path": "KK/O Meri Jaan - Tum Mile 128 Kbps.mp3"
    },
    {
        "title": "O Meri Jaan 128 Kbps",
        "album": "KK Hits",
        "path": "KK/O Meri Jaan 128 Kbps.mp3"
    },
    {
        "title": "O meri jaan(LIM)",
        "album": "KK Hits",
        "path": "KK/O meri jaan(LIM).mp3"
    },
    {
        "title": "Oh Lala Re",
        "album": "Taarzan",
        "path": "KK/Oh Lala Re - Taarzan - The Wonder Car.mp3"
    },
    {
        "title": "Piya Aaye Na",
        "album": "KK Hits",
        "path": "KK/Piya Aaye Na.mp3"
    },
    {
        "title": "Rafta Rafta",
        "album": "Raaz 3",
        "path": "KK/Rafta Rafta - Raaz 3 128 Kbps.mp3"
    },
    {
        "title": "Saanson Ke",
        "album": "KK Hits",
        "path": "KK/Saanson Ke.mp3"
    },
    {
        "title": "Sach Keh Raha Hai Deewana",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Sach Keh Raha Hai Deewana - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Sajde Ki Ye Hai Lakhoin",
        "album": "Khatta Meetha",
        "path": "KK/Sajde Ki Ye Hai Lakhoin - Khatta Meetha 128 Kbps.mp3"
    },
    {
        "title": "Sang Hoon Tere",
        "album": "Jannat 2_128-(DJMaza)",
        "path": "KK/Sang Hoon Tere - Jannat 2_128-(DJMaza).mp3"
    },
    {
        "title": "Soniye",
        "album": "Heartless",
        "path": "KK/Soniye - Heartless 128 Kbps.mp3"
    },
    {
        "title": "Soniye",
        "album": "KK Hits",
        "path": "KK/Soniye.mp3"
    },
    {
        "title": "Tadap Tadap Ke",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Tadap Tadap Ke - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Tanha Tere Bagair",
        "album": "KK Hits",
        "path": "KK/Tanha Tere Bagair.mp3"
    },
    {
        "title": "Tera Mera Rishta",
        "album": "Male (Jalebi)",
        "path": "KK/Tera Mera Rishta - Male (Jalebi) 128 Kbps.mp3"
    },
    {
        "title": "Tere Is Jahan Mein",
        "album": "Rog",
        "path": "KK/Tere Is Jahan Mein - Rog 128 Kbps.mp3"
    },
    {
        "title": "Teri Tamanna",
        "album": "The Train",
        "path": "KK/Teri Tamanna - The Train 128 Kbps.mp3"
    },
    {
        "title": "Teri Yaadon Mein",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Teri Yaadon Mein - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Tu Aashiqui Hai 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Tu Aashiqui Hai 128 Kbps.mp3"
    },
    {
        "title": "Tu Bhoola Jise",
        "album": "Airlift",
        "path": "KK/Tu Bhoola Jise - Airlift 128 Kbps.mp3"
    },
    {
        "title": "Tu Jo Mila",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Tu Jo Mila - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Tu Mujhe Soch Kabhi",
        "album": "Zindagi Tere Naam",
        "path": "KK/Tu Mujhe Soch Kabhi - Zindagi Tere Naam 128 Kbps.mp3"
    },
    {
        "title": "Tu Mujhse Jab Se Mila Hai",
        "album": "Showbiz",
        "path": "KK/Tu Mujhse Jab Se Mila Hai - Showbiz 128 Kbps.mp3"
    },
    {
        "title": "Tuhi Mere Hum Navaa",
        "album": "Knockout",
        "path": "KK/Tuhi Mere Hum Navaa - Knockout 128 Kbps.mp3"
    },
    {
        "title": "Tujh Sang Lagee",
        "album": "Special 26",
        "path": "KK/Tujh Sang Lagee - Special 26 128 Kbps.mp3"
    },
    {
        "title": "Tujhi Mein [320 kbps]",
        "album": "KK Hits",
        "path": "KK/Tujhi Mein [320 kbps].mp3"
    },
    {
        "title": "Tum Ho Mera Pyar",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Tum Ho Mera Pyar - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Yaara Re Roy 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Yaara Re Roy 128 Kbps.mp3"
    },
    {
        "title": "Yaaron-Dosti(PaglaSongs)",
        "album": "KK Hits",
        "path": "KK/Yaaron-Dosti(PaglaSongs).mp3"
    },
    {
        "title": "Ye Fizaein",
        "album": "Main Hoon Na",
        "path": "KK/Ye Fizaein - Main Hoon Na 128 Kbps.mp3"
    },
    {
        "title": "Yeh Kahan Mil Gaye",
        "album": "KK Hits",
        "path": "KK/Yeh Kahan Mil Gaye.mp3"
    },
    {
        "title": "Yeh Tanhai",
        "album": "Pal",
        "path": "KK/Yeh Tanhai - Pal 128 Kbps.mp3"
    },
    {
        "title": "Zara Sa (Power Ballad) 128 Kbps",
        "album": "KK Hits",
        "path": "KK/Zara Sa (Power Ballad) 128 Kbps.mp3"
    },
    {
        "title": "Zara Sa Dil Mein De Jagah Tu_128-(DJMaza)",
        "album": "KK Hits",
        "path": "KK/Zara Sa Dil Mein De Jagah Tu_128-(DJMaza).mp3"
    },
    {
        "title": "Zindagi Do Pal Ki",
        "album": "KK_128-(DJMaza)",
        "path": "KK/Zindagi Do Pal Ki - KK_128-(DJMaza).mp3"
    },
    {
        "title": "Zindagi Hosh Mein",
        "album": "KK Hits",
        "path": "KK/Zindagi Hosh Mein.mp3"
    },
    {
        "title": "abhi",
        "album": "KK Hits",
        "path": "KK/abhi.mp3"
    }
];

// State
let isPlaying = false;
let shuffleActive = false;
let repeatActive = false;
let favorites = JSON.parse(localStorage.getItem('kk_favs_mobile')) || [];
let currentView = "all"; 
let audioCtx = null, analyser = null, sourceNode = null;
let bassFilter, trebleFilter, midFilter, reverbNode;
let userVolume = 0.7;

const audio = new Audio();
audio.preload = "auto";
audio.volume = userVolume;

// DOM
const songsContainer = document.getElementById('songs-list-container');
const playPauseBtn = document.getElementById('play-pause-mobile');
const floatingPlay = document.getElementById('floating-play');
const nowTitle = document.getElementById('now-title');
const nowArtist = document.getElementById('now-artist');
const progressFill = document.getElementById('progress-fill-micro');
const progressTouch = document.getElementById('progress-touch');
const totalSpan = document.getElementById('total-songs-count');
const searchInput = document.getElementById('song-search');
const fsPlayer = document.getElementById('fullscreen-player');
const expandTrigger = document.getElementById('expand-trigger');
const closeFs = document.getElementById('close-fs');
const volumeSlider = document.getElementById('volume-slider');

function initAudioContext() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        analyser = audioCtx.createAnalyser();
        sourceNode = audioCtx.createMediaElementSource(audio);
        bassFilter = audioCtx.createBiquadFilter(); bassFilter.type = "lowshelf"; bassFilter.frequency.value = 200;
        midFilter = audioCtx.createBiquadFilter(); midFilter.type = "peaking"; midFilter.frequency.value = 1000;
        trebleFilter = audioCtx.createBiquadFilter(); trebleFilter.type = "highshelf"; trebleFilter.frequency.value = 3000;
        reverbNode = audioCtx.createConvolver();
        const impulseLength = audioCtx.sampleRate * 2;
        const impulse = audioCtx.createBuffer(2, impulseLength, audioCtx.sampleRate);
        for (let i = 0; i < 2; i++) {
            const channel = impulse.getChannelData(i);
            for (let j = 0; j < impulseLength; j++) channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / impulseLength, 2);
        }
        reverbNode.buffer = impulse;
        sourceNode.connect(bassFilter); bassFilter.connect(midFilter); midFilter.connect(trebleFilter); trebleFilter.connect(analyser); analyser.connect(audioCtx.destination);
        analyser.fftSize = 128;
        startVisualizer();
    } catch (e) { 
        console.warn("Web Audio API not supported or blocked:", e); 
    }
}

function startVisualizer() {
    const canvasMain = document.getElementById('real-eq');
    const canvasFs = document.getElementById('fs-real-eq');
    const ctxMain = canvasMain.getContext('2d');
    const ctxFs = canvasFs.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let hue = 140;

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        hue = (hue + 1) % 360;
        
        const drawBars = (ctx, canvas) => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };

        drawBars(ctxMain, canvasMain);
        drawBars(ctxFs, canvasFs);
    }
    draw();
}

function applyFX(type) {
    if (!audioCtx) initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (!bassFilter) return;

    bassFilter.gain.value = 0; midFilter.gain.value = 0; trebleFilter.gain.value = 0;
    trebleFilter.disconnect(); trebleFilter.connect(analyser);
    if(type==='bass') bassFilter.gain.value = 15;
    else if(type==='rock') { bassFilter.gain.value=10; midFilter.gain.value=4; trebleFilter.gain.value=10; }
    else if(type==='treble') trebleFilter.gain.value=15;
    else if(type==='cinema') { trebleFilter.disconnect(); trebleFilter.connect(reverbNode); reverbNode.connect(analyser); }
}

function getDisplayList() {
    let list = (currentView === 'fav') ? songsData.filter(s => favorites.includes(s.path)) : songsData;
    const term = searchInput.value.toLowerCase();
    if (term) list = list.filter(s => s.title.toLowerCase().includes(term));
    return list;
}

function renderSongsList() {
    const displayList = getDisplayList();
    totalSpan.innerText = displayList.length;
    songsContainer.innerHTML = '';
    displayList.forEach((song, idx) => {
        const card = document.createElement('div');
        const currentAudioPath = decodeURI(audio.src);
        const isCurrent = currentAudioPath.endsWith(song.path);
        card.className = `song-card ${isCurrent ? 'active' : ''}`;
        if (isCurrent) card.id = 'active-song-card';
        card.innerHTML = `<div class="song-index">${idx + 1}</div><div class="song-info"><div class="song-title">${song.title}</div><div class="song-album">${song.album}</div></div><button class="fav-btn-card ${favorites.includes(song.path) ? 'active' : ''}" data-path="${song.path}"><i class="${favorites.includes(song.path) ? 'fas' : 'far'} fa-heart"></i></button>`;
        card.addEventListener('click', (e) => { if (e.target.closest('.fav-btn-card')) return; initAudioContext(); playSongByPath(song.path); });
        card.querySelector('.fav-btn-card').addEventListener('click', (e) => { e.stopPropagation(); toggleFav(song.path); });
        songsContainer.appendChild(card);
    });
    setTimeout(() => { const activeCard = document.getElementById('active-song-card'); if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
}

function playSongByPath(path) {
    initAudioContext();
    const song = songsData.find(s => s.path === path);
    if (!song) return;
    const currentAudioPath = decodeURI(audio.src);
    if (currentAudioPath.endsWith(path) && audio.src !== "") { togglePlay(); return; }

    if (isPlaying) {
        let fadeOutInt = setInterval(() => {
            if (audio.volume > 0.1) audio.volume -= 0.1;
            else { clearInterval(fadeOutInt); startNewSong(song); }
        }, 50);
    } else startNewSong(song);
}

function startNewSong(song) {
    audio.src = encodeURI(song.path);
    audio.load();
    nowTitle.innerText = song.title;
    nowArtist.innerText = "KK";
    document.getElementById('fs-title').innerText = song.title;
    document.getElementById('fs-album').innerText = song.album;
    updateTheme(song.path);
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    audio.play().then(() => {
        isPlaying = true;
        // Fade In
        audio.volume = 0;
        let fadeInInt = setInterval(() => {
            if (audio.volume < userVolume - 0.05) audio.volume += 0.05;
            else { audio.volume = userVolume; clearInterval(fadeInInt); }
        }, 50);
        updateUI();
    }).catch(err => {
        console.error("Playback failed:", err);
        isPlaying = false;
        updateUI();
    });
    renderSongsList();
}

function togglePlay() {
    if (!audio.src) { const list = getDisplayList(); if (list.length > 0) playSongByPath(list[0].path); return; }
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (audio.paused) { 
        audio.play().then(() => {
            isPlaying = true;
            updateUI();
        }).catch(err => {
            console.error("Play failed:", err);
            isPlaying = false;
            updateUI();
        });
    } else { 
        audio.pause(); 
        isPlaying = false; 
        updateUI();
    }
}

function updateUI() {
    const icon = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    playPauseBtn.innerHTML = icon;
    document.getElementById('fs-play').innerHTML = icon;
    if (floatingPlay) floatingPlay.innerHTML = icon;
    
    // Rotating image
    const fsArt = document.getElementById('fs-art');
    if (isPlaying) fsArt.classList.add('rotating');
    else fsArt.classList.remove('rotating');

    const currentAudioPath = decodeURI(audio.src);
    const isLiked = favorites.some(f => currentAudioPath.endsWith(f));
    const favIcon = isLiked ? '<i class="fas fa-heart" style="color:#1DB954;"></i>' : '<i class="far fa-heart"></i>';
    document.getElementById('fs-fav').innerHTML = favIcon;
    document.getElementById('fav-toggle-mobile').innerHTML = favIcon;
}

function nextSong() {
    const list = getDisplayList();
    if (list.length === 0) return;
    let idx = list.findIndex(s => decodeURI(audio.src).endsWith(s.path));
    if (shuffleActive) idx = Math.floor(Math.random() * list.length);
    else idx = (idx + 1) % list.length;
    playSongByPath(list[idx].path);
}

function prevSong() {
    const list = getDisplayList();
    if (list.length === 0) return;
    let idx = list.findIndex(s => decodeURI(audio.src).endsWith(s.path));
    idx = (idx - 1 + list.length) % list.length;
    playSongByPath(list[idx].path);
}

function updateTheme(path) {
    let hash = 0; for (let i = 0; i < path.length; i++) hash = path.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash % 360), s = 60, l = 40;
    const themeColor = `hsl(${h}, ${s}%, ${l}%)`;
    const themeColorDark = `hsl(${h}, ${s}%, 10%)`;
    const themeGlow = `hsl(${h}, 80%, 60%)`;
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--theme-color-dark', themeColorDark);
    document.documentElement.style.setProperty('--theme-glow', themeGlow);
}

function toggleFav(path) {
    const idx = favorites.indexOf(path);
    if (idx > -1) favorites.splice(idx, 1); else favorites.push(path);
    localStorage.setItem('kk_favs_mobile', JSON.stringify(favorites));
    renderSongsList(); updateUI();
}

// Progress
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        document.getElementById('fs-progress-fill').style.width = `${percent}%`;
        document.getElementById('fs-current').innerText = formatTime(audio.currentTime);
        document.getElementById('fs-duration').innerText = formatTime(audio.duration);
    }
});
function formatTime(sec) { let m = Math.floor(sec/60), s = Math.floor(sec%60); return `${m}:${s<10?'0':''}${s}`; }
audio.addEventListener('ended', nextSong);

function seek(e) {
    if (!audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = percent * audio.duration;
}
progressTouch.addEventListener('click', seek);
document.getElementById('fs-progress-touch').addEventListener('click', seek);

// Navigation
expandTrigger.addEventListener('click', () => fsPlayer.classList.add('active'));
closeFs.addEventListener('click', () => fsPlayer.classList.remove('active'));

document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault(); currentView = 'all'; document.getElementById('about-page').classList.remove('active'); 
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-home').classList.add('active');
    renderSongsList();
});

document.getElementById('nav-about').addEventListener('click', (e) => {
    e.preventDefault(); document.getElementById('about-page').classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-about').classList.add('active');
});

document.getElementById('nav-favs').addEventListener('click', (e) => {
    e.preventDefault(); currentView = 'fav'; document.getElementById('about-page').classList.remove('active'); 
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('nav-favs').classList.add('active');
    renderSongsList();
});

// FX Modal Logic
function toggleFXModal() {
    document.getElementById('fx-modal').classList.toggle('open');
    document.getElementById('fx-overlay').classList.toggle('open');
}

document.getElementById('fx-trigger-mobile').addEventListener('click', toggleFXModal);
document.getElementById('fs-fx').addEventListener('click', toggleFXModal);
document.getElementById('fx-overlay').addEventListener('click', toggleFXModal);

document.querySelectorAll('.fx-option-mobile').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.fx-option-mobile').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        applyFX(opt.dataset.fx);
        setTimeout(toggleFXModal, 300);
    });
});

// Controls
document.getElementById('fs-play').addEventListener('click', togglePlay);
document.getElementById('fs-next').addEventListener('click', nextSong);
document.getElementById('fs-prev').addEventListener('click', prevSong);
document.getElementById('next-mobile').addEventListener('click', (e) => { e.stopPropagation(); nextSong(); });
document.getElementById('prev-mobile').addEventListener('click', (e) => { e.stopPropagation(); prevSong(); });
document.getElementById('vol-mobile').addEventListener('click', (e) => { e.stopPropagation(); toggleFXModal(); });
document.getElementById('fav-toggle-mobile').addEventListener('click', (e) => { 
    e.stopPropagation(); 
    const currentAudioPath = decodeURI(audio.src);
    const song = songsData.find(s => currentAudioPath.endsWith(s.path));
    if (song) toggleFav(song.path);
});
document.getElementById('fs-open-trigger').addEventListener('click', () => fsPlayer.classList.add('active'));

function toggleShuffle() {
    shuffleActive = !shuffleActive;
    const shuffleColor = shuffleActive ? `hsl(${Math.random() * 360}, 100%, 60%)` : '#f2994a';

    const elements = [document.getElementById('fs-shuffle'), document.getElementById('shuffle-mobile')];
    elements.forEach(el => {
        if (el) {
            el.style.setProperty('--shuffle-color', shuffleColor);
            el.style.opacity = shuffleActive ? '1' : '0.6';
        }
    });
}

document.getElementById('fs-shuffle').addEventListener('click', toggleShuffle);
document.getElementById('shuffle-mobile').addEventListener('click', toggleShuffle);

document.getElementById('fs-repeat').addEventListener('click', () => { 
    repeatActive = !repeatActive; 
    document.getElementById('fs-repeat').style.color = repeatActive ? '#1DB954' : '#f80759'; 
    document.getElementById('fs-repeat').style.opacity = repeatActive ? '1' : '0.6';
});
document.getElementById('fs-fav').addEventListener('click', () => { 
    const currentAudioPath = decodeURI(audio.src);
    const song = songsData.find(s => currentAudioPath.endsWith(s.path));
    if (song) toggleFav(song.path);
});

volumeSlider.addEventListener('input', (e) => { userVolume = e.target.value; audio.volume = userVolume; });
playPauseBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
floatingPlay.addEventListener('click', togglePlay);
searchInput.addEventListener('input', renderSongsList);

renderSongsList();
updateUI();
