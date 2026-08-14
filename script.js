const CONFIG = {
    startDate: new Date('2025-10-01T00:00:00+02:00'),
    typingSpeed: 45,
    soundEnabled: true,
    ambientMusicEnabled: false
};

const STORY_TEXT = `يوم 1 اكتوبر 2025 اليوم اللي دخلنا في مرحلة جديده من حياتنا وكانت من اجمل ايام حياتنا كلنا كـ طلبة في كلية التربية النوعية جامعة بنها😍💖

كلنا كنا داخلين تايهيين زي اي طالب في بداية اي مرحله جديده في حياته اكيد ، بس اللي مكناش نعرفه ان احنا هنقضي اجمل ايام عمرنا هنا وان دي فعلا الاوقات اللي تستاهل كل حلو في عمرنا بجد🫶🏻

عملنا صحاب كتير ،  ومش بس صحاب لاا احنا كلنا كـ دفعه كنا اقرب من الاخوات حرفياا كلنا علي قلب بعض سواء نعرف بعض او لاا كل الدفعه قلبها ابيض فعلا وتتحب💗

وطبعا مش هننسي اجمل دكاتره واحن عيله قضينا معاهم سنتنا من ناحية الدراسه ، دكاتره تحسسك فعلا انك منهم وجزء بنكمل بعض مش علاقة دكتور وطالب وبس وياما عملنا معاهم زكريات روعه

فـ استعد معاياا علشان نبدأ رحلة زكرياتنا القمر دي في اول سنه لينا وكمان اوريك عيليتنا الجديده اللي قضينه معاهم اجمل فترات😘🫶🏻`;

const voiceAudio = new Audio('assets/audio.mp3');
voiceAudio.preload = 'auto';

class SoundEffects {
    constructor() {
        this.ctx = null;
    }

    playVoice() {
        if (!CONFIG.soundEnabled) return;
        try {
            voiceAudio.currentTime = 0;
            voiceAudio.play().catch(e => console.log('Audio playback waiting for user interaction'));
        } catch (e) {}
    }

    stopVoice() {
        try {
            voiceAudio.pause();
            voiceAudio.currentTime = 0;
        } catch (e) {}
    }

    toggleVoice(enable) {
        if (enable) {
            if (voiceAudio.paused && !isTypingFinished) {
                voiceAudio.play().catch(e => {});
            }
        } else {
            voiceAudio.pause();
        }
    }

    playSuccessChime() {
        if (!CONFIG.soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
                
                gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.6);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.1);
                osc.stop(ctx.currentTime + idx * 0.1 + 0.6);
            });
        } catch (e) {}
    }
}

const sounds = new SoundEffects();

function updateLiveTimer() {
    const now = new Date();
    const start = CONFIG.startDate;

    if (now < start) {
        document.getElementById('years-count').innerText = '00';
        document.getElementById('months-count').innerText = '00';
        document.getElementById('days-count').innerText = '00';
        document.getElementById('hours-count').innerText = '00';
        document.getElementById('minutes-count').innerText = '00';
        document.getElementById('seconds-count').innerText = '00';
        return;
    }

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += prevMonthLastDay;
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    document.getElementById('years-count').innerText = String(years).padStart(2, '0');
    document.getElementById('months-count').innerText = String(months).padStart(2, '0');
    document.getElementById('days-count').innerText = String(days).padStart(2, '0');
    document.getElementById('hours-count').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes-count').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds-count').innerText = String(seconds).padStart(2, '0');
}

let typingTimeout = null;
let charIndex = 0;
let isTypingFinished = false;

function startTypewriter() {
    const textElement = document.getElementById('typed-content');
    const btnKhash = document.getElementById('btn-khash');
    const btnSubtext = document.getElementById('btn-subtext');
    const statusText = document.getElementById('status-text');

    textElement.textContent = '';
    charIndex = 0;
    isTypingFinished = false;
    btnKhash.classList.remove('show');
    btnSubtext.classList.remove('show');
    statusText.textContent = 'جاري الكتابة... 🖋️';

    sounds.playVoice();

    function typeNextChar() {
        if (charIndex < STORY_TEXT.length) {
            const char = STORY_TEXT.charAt(charIndex);
            textElement.textContent += char;
            charIndex++;

            let speed = CONFIG.typingSpeed;
            if (char === '.' || char === '!' || char === '؟') speed = 350;
            else if (char === '،' || char === '\n') speed = 200;

            typingTimeout = setTimeout(typeNextChar, speed);

            const cardBody = document.querySelector('.welcome-card');
            if (cardBody) cardBody.scrollTop = cardBody.scrollHeight;
        } else {
            finishTyping();
        }
    }

    typeNextChar();
}

function finishTyping() {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    const textElement = document.getElementById('typed-content');
    textElement.textContent = STORY_TEXT;
    isTypingFinished = true;

    sounds.stopVoice();

    const btnKhash = document.getElementById('btn-khash');
    const btnSubtext = document.getElementById('btn-subtext');
    const statusText = document.getElementById('status-text');

    statusText.textContent = 'مكتمل ✨';
    btnKhash.classList.add('show');
    btnSubtext.classList.add('show');

    sounds.playSuccessChime();
    triggerMiniConfetti();
}

function skipTypewriter() {
    if (!isTypingFinished) {
        finishTyping();
    }
}

function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(60, Math.floor(width / 25));

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 0.8,
            color: Math.random() > 0.5 ? 'rgba(255, 215, 0, ' : 'rgba(0, 230, 118, ',
            alpha: Math.random() * 0.75 + 0.25,
            speedY: - (Math.random() * 0.5 + 0.2),
            speedX: (Math.random() - 0.5) * 0.4
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;

            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < 0 || p.x > width) p.speedX *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color + '0.8)';
            ctx.fill();
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

function triggerMiniConfetti() {
    const colors = ['#ffd700', '#00e676', '#ff7b00', '#ffed4a', '#00ffa6', '#ffffff'];
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '998';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    for (let i = 0; i < 80; i++) {
        pieces.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 + 100,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.8) * 18,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }

    let frame = 0;
    function renderConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4;
            p.rotation += p.rotSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        frame++;
        if (frame < 90) {
            requestAnimationFrame(renderConfetti);
        } else {
            canvas.remove();
        }
    }

    renderConfetti();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('years-count')) {
        updateLiveTimer();
        setInterval(updateLiveTimer, 1000);
    }

    initParticleCanvas();

    const audioBtn = document.getElementById('sound-toggle-btn');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            CONFIG.soundEnabled = !CONFIG.soundEnabled;
            if (CONFIG.soundEnabled) {
                audioBtn.classList.add('active');
                sounds.toggleVoice(true);
            } else {
                audioBtn.classList.remove('active');
                sounds.toggleVoice(false);
            }
        });
    }

    const typedContentEl = document.getElementById('typed-content');
    if (typedContentEl) {
        sounds.playVoice();

        const enableAutoplayOnFirstInteraction = () => {
            if (voiceAudio.paused && !isTypingFinished && CONFIG.soundEnabled) {
                voiceAudio.play().catch(() => {});
            }
            window.removeEventListener('click', enableAutoplayOnFirstInteraction);
            window.removeEventListener('touchstart', enableAutoplayOnFirstInteraction);
            window.removeEventListener('keydown', enableAutoplayOnFirstInteraction);
        };

        window.addEventListener('click', enableAutoplayOnFirstInteraction);
        window.addEventListener('touchstart', enableAutoplayOnFirstInteraction);
        window.addEventListener('keydown', enableAutoplayOnFirstInteraction);

        setTimeout(startTypewriter, 300);

        const replayBtn = document.getElementById('replay-btn');
        if (replayBtn) replayBtn.addEventListener('click', startTypewriter);

        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn) skipBtn.addEventListener('click', skipTypewriter);
    }

    const btnKhash = document.getElementById('btn-khash');
    const modal = document.getElementById('next-modal');
    if (btnKhash && modal) {
        btnKhash.addEventListener('click', () => {
            sounds.playSuccessChime();
            triggerMiniConfetti();
            modal.classList.add('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.poster-overlay').forEach(poster => {
        poster.addEventListener('click', () => {
            poster.classList.add('hidden');
            sounds.playSuccessChime();
            triggerMiniConfetti();
        });
    });

    document.querySelectorAll('.theater-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const playerContainer = btn.closest('.custom-video-player');
            if (!playerContainer) return;
            playerContainer.classList.toggle('theater-mode');

            let overlay = document.querySelector('.theater-overlay');
            if (playerContainer.classList.contains('theater-mode')) {
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'theater-overlay';
                    document.body.appendChild(overlay);
                    overlay.addEventListener('click', () => {
                        playerContainer.classList.remove('theater-mode');
                        overlay.remove();
                    });
                }
            } else if (overlay) {
                overlay.remove();
            }
        });
    });

    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const shareUrl = btn.dataset.shareUrl;
            const toast = document.getElementById('toast-notification');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast('تم نسخ رابط فيديو الذكرى بنجاح! 📋✨');
                }).catch(() => {
                    showToast('رابط الفيديو: ' + shareUrl);
                });
            } else {
                showToast('رابط الفيديو: ' + shareUrl);
            }
        });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    if (lightbox && lightboxImage) {
        document.querySelectorAll('.leader-photo-card, .photo-card, .deck-card').forEach(card => {
            card.addEventListener('click', () => {
                const img = card.querySelector('img');
                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt;
                const caption = card.dataset.lightboxTitle || card.dataset.caption || '';
                if (lightboxCaption) lightboxCaption.textContent = caption;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                lucide.createIcons();
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
        });
    }

    const duoArea = document.getElementById('duo-video-area');
    if (duoArea) {
        const duoCards = duoArea.querySelectorAll('.duo-video-card');

        function collapseDuo() {
            duoArea.classList.remove('has-featured');
            duoCards.forEach(card => {
                card.classList.remove('featured');
                card.classList.remove('minimized');
            });
        }

        function featureCard(card) {
            duoCards.forEach(c => {
                c.classList.remove('featured');
                c.classList.remove('minimized');
            });
            card.classList.add('featured');
            duoCards.forEach(c => {
                if (c !== card) c.classList.add('minimized');
            });
            duoArea.classList.add('has-featured');

            const iframe = card.querySelector('iframe');
            if (iframe && iframe.dataset.src && !iframe.getAttribute('src')) {
                iframe.src = iframe.dataset.src;
            }
            sounds.playSuccessChime();
        }

        duoCards.forEach(card => {
            const poster = card.querySelector('.duo-poster');
            if (poster) {
                poster.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (card.classList.contains('featured')) {
                        collapseDuo();
                    } else {
                        featureCard(card);
                    }
                });
            }

            const restore = card.querySelector('.duo-restore');
            if (restore) {
                restore.addEventListener('click', (e) => {
                    e.stopPropagation();
                    collapseDuo();
                });
            }
        });
    }

    function showToast(message) {
        if (!toast) return;
        const toastText = document.getElementById('toast-text');
        if (toastText) toastText.textContent = message;
        toast.classList.add('show');
        sounds.playSuccessChime();
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    const REACTIONS_STORAGE_KEY = 'naw3yaa_reactions_v1';
    const reactionBtns = document.querySelectorAll('.reaction-btn');

    function loadReactionsData() {
        try {
            return JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveReactionsData(data) {
        try {
            localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    const reactionGroups = {};
    reactionBtns.forEach(btn => {
        const memory = btn.dataset.memory;
        const type = btn.dataset.type;
        if (!reactionGroups[memory]) reactionGroups[memory] = [];
        reactionGroups[memory].push({ type, countEl: btn.querySelector('.count'), btn });
    });

    const reactionsData = loadReactionsData();

    Object.keys(reactionGroups).forEach(memory => {
        if (!reactionsData[memory]) {
            reactionsData[memory] = { counts: {}, userReaction: null };
            reactionGroups[memory].forEach(({ type, countEl }) => {
                reactionsData[memory].counts[type] = parseInt(countEl.textContent, 10) || 0;
            });
        }
    });
    saveReactionsData(reactionsData);

    reactionBtns.forEach(btn => {
        const memory = btn.dataset.memory;
        const type = btn.dataset.type;
        const memoryData = reactionsData[memory];
        if (!memoryData) return;
        const countEl = btn.querySelector('.count');
        countEl.textContent = memoryData.counts[type] ?? 0;
        if (memoryData.userReaction === type) btn.classList.add('voted');
    });

    reactionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const memory = btn.dataset.memory;
            const type = btn.dataset.type;
            const memoryData = reactionsData[memory];
            if (!memoryData) return;

            const emojiEl = btn.querySelector('.emoji');
            const countEl = btn.querySelector('.count');

            if (memoryData.userReaction) {
                const prevType = memoryData.userReaction;
                const prevBtn = btn.closest('.reaction-buttons-group').querySelector(`[data-type="${prevType}"]`);
                memoryData.counts[prevType] = Math.max(0, (memoryData.counts[prevType] || 0) - 1);
                if (prevBtn) {
                    const prevCountEl = prevBtn.querySelector('.count');
                    if (prevCountEl) prevCountEl.textContent = memoryData.counts[prevType];
                    prevBtn.classList.remove('voted');
                }
            }

            if (memoryData.userReaction === type) {
                memoryData.userReaction = null;
                saveReactionsData(reactionsData);
                return;
            }

            memoryData.counts[type] = (memoryData.counts[type] || 0) + 1;
            countEl.textContent = memoryData.counts[type];
            btn.classList.add('voted');
            memoryData.userReaction = type;
            saveReactionsData(reactionsData);

            sounds.playSuccessChime();
            if (emojiEl) createFloatingEmoji(emojiEl.textContent, e.clientX, e.clientY);
        });
    });

    function createFloatingEmoji(emoji, x, y) {
        const floatingEl = document.createElement('div');
        floatingEl.textContent = emoji;
        floatingEl.style.position = 'fixed';
        floatingEl.style.left = `${x || window.innerWidth / 2}px`;
        floatingEl.style.top = `${y || window.innerHeight / 2}px`;
        floatingEl.style.fontSize = '2rem';
        floatingEl.style.pointerEvents = 'none';
        floatingEl.style.zIndex = '3000';
        floatingEl.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        document.body.appendChild(floatingEl);

        requestAnimationFrame(() => {
            floatingEl.style.transform = `translate(${(Math.random() - 0.5) * 80}px, -120px) scale(1.6)`;
            floatingEl.style.opacity = '0';
        });

        setTimeout(() => {
            floatingEl.remove();
        }, 1200);
    }
});

