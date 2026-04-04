// --- Переводы ---
const i18n = {
    ru: {
        thUptime: "Сложность",
        placeholder: "Введите никнейм DUCO...",
        btnSearch: "Поиск",
        waiting: "Ожидание ввода...",
        errUser: "Введите имя пользователя.",
        err404: "Пользователь не найден (404)",
        errFormat: "Неверный формат ответа API",
        loading: "Загрузка...",
        noMiners: "Нет активных майнеров",
        lblHashrate: "Общий Хешрейт",
        lblWorkers: "Активных Ригов",
        lblDifficulty: "Сложность сети",
        lblChart: "Динамика хешрейта",
        lblApprox: "Баланс в $",
        lblGreetings: "Приветствуем,",
        thWorker: "Worker ID",
        thAlgo: "Алгоритм",
        thHashrate: "Хешрейт",
        thEff: "Эффективность",
        thShares: "Шары (A/R)",
        thStatus: "Статус",
        statusOnline: "ОНЛАЙН",
        statusOffline: "ОФФЛАЙН"
    },
    en: {
        thUptime: "Complexity",
        placeholder: "Enter DUCO username...",
        btnSearch: "Search",
        waiting: "Waiting for input...",
        errUser: "Please enter a username.",
        err404: "User not found (404)",
        errFormat: "Invalid API response format",
        loading: "Loading...",
        noMiners: "No active miners",
        lblHashrate: "Total Hashrate",
        lblWorkers: "Active Workers",
        lblDifficulty: "Network Difficulty",
        lblChart: "Hashrate Dynamics",
        lblApprox: "Balance in $",
        lblGreetings: "Greetings,",
        thWorker: "Worker ID",
        thAlgo: "Algorithm",
        thHashrate: "Hashrate",
        thEff: "Efficiency",
        thShares: "Shares (A/R)",
        thStatus: "Status",
        statusOnline: "ONLINE",
        statusOffline: "OFFLINE"
    }
};

// --- Состояние приложения ---
let currentLang = localStorage.getItem('selectedLang') || 'ru'; 
let currentTheme = 'dark';
let lastFetchedResult = null; 
let currentUsername = '';
let updateInterval = null;
let isFirstLoad = true;
let cachedPrice = 0.002;

// --- Инициализация продвинутого графика ---
const ctx = document.getElementById('hashrateChart').getContext('2d');

function getChartGradient(context) {
    const chart = context.chart;
    const {ctx, chartArea} = chart;
    if (!chartArea) return null;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    const color = getComputedStyle(document.body).getPropertyValue('--duino-yellow').trim() || '#F4B400';
    
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    return gradient;
}

const hashrateChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Hashrate',
            data: [],
            borderColor: '#F4B400',
            backgroundColor: (context) => getChartGradient(context),
            borderWidth: 4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#F4B400',
            pointHoverBorderWidth: 3,
            fill: true,
            tension: 0.45,
            borderCapStyle: 'round'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, bottom: 0 } },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 15, 15, 0.95)',
                titleFont: { size: 13, weight: 'bold', family: 'Roboto Mono' },
                bodyFont: { size: 14, family: 'Roboto Mono' },
                padding: 12,
                cornerRadius: 10,
                displayColors: false,
                borderColor: 'rgba(244, 180, 0, 0.4)',
                borderWidth: 1,
                callbacks: {
                    label: (context) => ` ⚡ ${formatHashrate(context.parsed.y)}`
                }
            }
        },
        scales: {
            x: { 
                grid: { display: false },
                ticks: { 
                    color: '#888', 
                    font: { size: 10, family: 'Roboto Mono' },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6
                }
            },
            y: { 
                beginAtZero: true,
                grid: { color: 'rgba(150, 150, 150, 0.05)', drawBorder: false },
                ticks: { 
                    color: '#888', 
                    font: { size: 10, family: 'Roboto Mono' },
                    callback: (value) => value 
                }
            }
        }
    }
});

// --- Функции хелперы ---
const escapeHTML = (str) => String(str || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);

function formatHashrate(hs) {
    const h = parseFloat(hs) || 0;
    if (h >= 1e9) return (h / 1e9).toFixed(2) + ' GH/s';
    if (h >= 1e6) return (h / 1e6).toFixed(2) + ' MH/s';
    if (h >= 1e3) return (h / 1e3).toFixed(2) + ' kH/s';
    return h.toFixed(2) + ' H/s';
}

function resetChart() {
    hashrateChart.data.labels = [];
    hashrateChart.data.datasets[0].data = [];
    hashrateChart.update();
}

function showError(msg) {
    const errEl = document.getElementById('errorMessage');
    if (errEl) {
        errEl.innerText = msg;
        errEl.style.display = 'block';
        setTimeout(() => errEl.style.display = 'none', 5000);
    }
}

// --- Логика интерфейса ---
function updateLanguageUI() {
    const t = i18n[currentLang];
    
    const elements = {
        'usernameInput': { p: 'placeholder', v: t.placeholder },
        'lblHashrate': { p: 'innerText', v: t.lblHashrate },
        'lblWorkers': { p: 'innerText', v: t.lblWorkers },
        'lblDifficulty': { p: 'innerText', v: t.lblDifficulty },
        'lblChartTitle': { p: 'innerText', v: t.lblChart },
        'lblApprox': { p: 'innerText', v: t.lblApprox },
        'lblGreetings': { p: 'innerText', v: t.lblGreetings },
        'thWorker': { p: 'innerText', v: t.thWorker },
        'thAlgo': { p: 'innerText', v: t.thAlgo },
        'thHashrate': { p: 'innerText', v: t.thHashrate },
        'thEff': { p: 'innerText', v: t.thEff },
        'thShares': { p: 'innerText', v: t.thShares },
        'thStatus': { p: 'innerText', v: t.thStatus },
        'thUptime': { p: 'innerText', v: t.thUptime },
    };

    for (const [id, data] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el[data.p] = data.v;
    }

    const btnText = document.getElementById('btnSearchText');
    if (btnText) btnText.innerText = t.btnSearch;

    updateChartTheme();
}

function toggleLang() {
    currentLang = (currentLang === 'ru') ? 'en' : 'ru';
    localStorage.setItem('selectedLang', currentLang);
    const langLabel = document.getElementById('langLabel');
    if (langLabel) langLabel.innerText = currentLang.toUpperCase();
    updateLanguageUI();
    if (lastFetchedResult) updateUI(lastFetchedResult, false); 
}

function toggleTheme() {
    currentTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.innerHTML = currentTheme === 'light' 
            ? '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>'
            : '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>';
    }
    updateChartTheme();
}

function updateChartTheme() {
    const style = getComputedStyle(document.body);
    const color = style.getPropertyValue('--duino-yellow').trim() || '#F4B400';
    const text = style.getPropertyValue('--text-muted').trim() || '#888';
    hashrateChart.data.datasets[0].borderColor = color;
    hashrateChart.data.datasets[0].pointHoverBorderColor = color;
    hashrateChart.options.scales.x.ticks.color = text;
    hashrateChart.options.scales.y.ticks.color = text;
    hashrateChart.update('none');
}

function startAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => fetchDuinoData(true), 15000);
}

function stopAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = null;
}

async function fetchDuinoData(isAuto = false) {
    const input = document.getElementById('usernameInput');
    const user = input ? input.value.trim() : "";
    const t = i18n[currentLang];
    
    if (!user) {
        if (!isAuto) showError(t.errUser);
        return;
    }

    if (!isAuto) {
        currentUsername = user;
        const btn = document.getElementById('searchBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24" style="animation:spin 1s linear infinite;"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg> ${t.loading}`;
        }
        resetChart();
    }

    try {
        const [statsRes, userRes] = await Promise.all([
            fetch('https://server.duinocoin.com/statistics').then(r => r.json()),
            fetch(`https://server.duinocoin.com/users/${encodeURIComponent(user)}?t=${Date.now()}`).then(r => r.json())
        ]);

        cachedPrice = parseFloat(statsRes["Duco price"]) || 0.002;
        const diffDisp = document.getElementById('difficultyDisplay');
        if (diffDisp) diffDisp.innerText = statsRes["Current difficulty"] || 50;

        if (!userRes.success) throw new Error(t.err404);

        lastFetchedResult = userRes.result;
        updateUI(userRes.result, true); 
        
        if (isFirstLoad) { startAutoUpdate(); isFirstLoad = false; }
    } catch (err) {
        showError(err.message);
        if (isAuto) stopAutoUpdate();
    } finally {
        const btn = document.getElementById('searchBtn');
        if (btn && !isAuto) {
            btn.disabled = false;
            btn.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5, 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg> <span id="btnSearchText">${t.btnSearch}</span>`;
        }
    }
}

function updateUI(res, shouldUpdateChart = true) {
    const t = i18n[currentLang];
    const miners = res.miners || [];
    const totalHR = miners.reduce((acc, m) => acc + (parseFloat(m.hashrate) || 0), 0);

    const hrEl = document.getElementById('hashrate');
    const wrkEl = document.getElementById('workers');
    if (hrEl) hrEl.innerText = formatHashrate(totalHR);
    if (wrkEl) wrkEl.innerText = miners.length;

    const footer = document.getElementById('footerStats');
    if (footer) footer.style.display = 'flex';

    const user = res.balance.username || currentUsername;
    const footUser = document.getElementById('footerUsername');
    if (footUser) footUser.innerText = user;
    
    const avImg = document.getElementById('footerAvatarImg');
    const avLet = document.getElementById('footerAvatarLetter');
    if (avLet) avLet.innerText = user[0].toUpperCase();
    const imgUrl = `https://wallet.duinocoin.com/api/v1/users/${encodeURIComponent(user)}/avatar.png`;
    const check = new Image();
    check.onload = () => { if(avImg) {avImg.src = imgUrl; avImg.style.display='block';} if(avLet) avLet.style.display='none'; };
    check.onerror = () => { if(avImg) avImg.style.display='none'; if(avLet) avLet.style.display='flex'; };
    check.src = imgUrl;

    const bal = parseFloat(res.balance.balance) || 0;
    const balEl = document.getElementById('footerBalance');
    const usdEl = document.getElementById('footerUsd');

    if (balEl) balEl.innerText = bal.toFixed(2); 
    if (usdEl) usdEl.innerText = `$${(bal * cachedPrice).toFixed(4)}`; 
    
    if (shouldUpdateChart) {
        const labelTime = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
        hashrateChart.data.labels.push(labelTime);
        hashrateChart.data.datasets[0].data.push(totalHR);
        
        if (hashrateChart.data.labels.length > 40) {
            hashrateChart.data.labels.shift();
            hashrateChart.data.datasets[0].data.shift();
        }
        hashrateChart.update('active');
    }

    const tbody = document.getElementById('workersTableBody');
    if (tbody) {
        if (!miners.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted)">${t.noMiners}</td></tr>`;
        } else {
            tbody.innerHTML = miners.map(m => {
                const hr = parseFloat(m.hashrate) || 0;
                const accepted = m.accepted || 0;
                const rejected = m.rejected || 0;
                const total = accepted + rejected;
                const eff = total > 0 ? (accepted / total * 100) : (hr > 0 ? 100 : 0);
                const color = eff > 95 ? 'var(--duino-green)' : (eff > 80 ? 'var(--duino-yellow)' : 'var(--duino-red)');

                return `<tr>
                    <td><strong>${escapeHTML(m.identifier)}</strong></td>
                    <td><span style="color:var(--duino-yellow)">${escapeHTML(m.algorithm)}</span></td>
                    <td>${formatHashrate(hr)}</td>
                    <td>
                        <div style="font-size:11px; color:${color}">${eff.toFixed(1)}%</div>
                        <div class="efficiency-bar-bg"><div class="efficiency-bar-fill" style="width:${eff}%; background:${color}"></div></div>
                    </td>
                    <td>
                        <span style="color: var(--duino-green); font-weight: bold;">${accepted}</span> / <span style="${rejected > 0 ? 'color: var(--duino-red); font-weight: bold;' : 'color: var(--text-muted);'}">${rejected}</span>
                    </td>
                    <td><span style="color:var(--text-muted)">${m.diff || '---'}</span></td> 
                    <td><span class="status-badge ${hr > 0 ? 'online' : 'offline'}">${hr > 0 ? t.statusOnline : t.statusOffline}</span></td>
                </tr>`;
            }).join('');
        }
    }
}

document.getElementById('searchBtn')?.addEventListener('click', () => fetchDuinoData(false));
document.getElementById('usernameInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchDuinoData(false); });

document.addEventListener('DOMContentLoaded', () => {
    const langLabel = document.getElementById('langLabel');
    if (langLabel) langLabel.innerText = currentLang.toUpperCase();
    updateLanguageUI();
});

function handleSearch() {
    isFirstLoad = true;
    fetchDuinoData(false);
}

function startAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => fetchDuinoData(true), 10000);
}

function stopAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = null;
    const dot = document.getElementById('statusDot');
    if (dot) dot.classList.remove('active');
}

function resetChart() {
    hashrateChart.data.labels = [];
    hashrateChart.data.datasets[0].data = [];
    hashrateChart.update();
}

function showError(msg) {
    const el = document.getElementById('errorMessage');
    if (el) {
        el.innerText = msg;
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 5000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI();
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) searchBtn.onclick = handleSearch;
    const input = document.getElementById("usernameInput");
    if (input) input.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSearch(); });
    
    const s = document.createElement("style"); 
    s.innerText = `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .efficiency-bar-bg { width: 100%; height: 6px; background: rgba(150,150,150,0.1); border-radius: 10px; margin-top: 4px; overflow: hidden; }
        .efficiency-bar-fill { height: 100%; transition: width 0.5s ease; border-radius: 10px; }
        .status-badge { padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; }
        .status-badge.online { background: rgba(0, 230, 118, 0.1); color: var(--duino-green); }
        .status-badge.offline { background: rgba(255, 82, 82, 0.1); color: var(--duino-red); }
    `; 
    document.head.appendChild(s);
});
