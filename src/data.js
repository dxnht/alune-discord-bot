const TAG_TRANSLATIONS = {
    Fighter: 'Đấu Sĩ', Tank: 'Đỡ Đòn', Assassin: 'Sát Thủ', Mage: 'Pháp Sư', Marksman: 'Xạ Thủ', Support: 'Hỗ Trợ',
};

let memoryVersion = null;

async function getLatestVersion(env) {
    if (memoryVersion) return memoryVersion;
    if (env?.ALUNE_BOT_KV) {
        try {
            const cached = await env.ALUNE_BOT_KV.get('lol_latest_version');
            if (cached) { memoryVersion = cached; return cached; }
        } catch (e) { console.error("KV Get Version Error:", e); }
    }

    try {
        const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await response.json();
        const version = versions[0];
        if (env?.ALUNE_BOT_KV) {
            await env.ALUNE_BOT_KV.put('lol_latest_version', version, { expirationTtl: 3600 }).catch(console.error);
        }
        memoryVersion = version;
        return version;
    } catch (error) {
        console.error("Fetch Version Error:", error);
        return '14.23.1';
    }
}

export async function getChampionData(language = 'en', env) {
    try {
        const version = await getLatestVersion(env);
        const langCode = language === 'en' ? 'en_US' : 'vi_VN';
        const cacheKey = `champs_${langCode}_${version}`;
        
        if (env?.ALUNE_BOT_KV) {
            const cached = await env.ALUNE_BOT_KV.get(cacheKey, 'json');
            if (cached) return cached.data;
        }

        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${langCode}/champion.json`);
        if (!response.ok) throw new Error(`Riot API returned ${response.status}`);
        const data = await response.json();
        
        if (language === 'vi') {
            for (const k in data.data) {
                data.data[k].tags = data.data[k].tags.map(t => TAG_TRANSLATIONS[t] || t);
            }
        }

        if (env?.ALUNE_BOT_KV) {
            // Không dùng ctx ở đây để tránh lỗi undefined
            await env.ALUNE_BOT_KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 86400 }).catch(console.error);
        }
        return data.data;
    } catch (error) {
        console.error("getChampionData Error:", error);
        return null;
    }
}

export async function getChampionDetails(championId, language = 'en', env) {
    try {
        const version = await getLatestVersion(env);
        const langCode = language === 'en' ? 'en_US' : 'vi_VN';
        const cacheKey = `detail_${championId}_${langCode}_${version}`;

        if (env?.ALUNE_BOT_KV) {
            const cached = await env.ALUNE_BOT_KV.get(cacheKey, 'json');
            if (cached) return cached;
        }

        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${langCode}/champion/${championId}.json`);
        if (!response.ok) throw new Error(`Riot API returned ${response.status}`);
        const data = await response.json();
        const championData = data.data[championId];

        if (language === 'vi') {
            championData.tags = championData.tags.map(t => TAG_TRANSLATIONS[t] || t);
        }

        if (env?.ALUNE_BOT_KV) {
            await env.ALUNE_BOT_KV.put(cacheKey, JSON.stringify(championData), { expirationTtl: 86400 }).catch(console.error);
        }

        return championData;
    } catch (error) {
        console.error("getChampionDetails Error:", error);
        return null;
    }
}

export async function getUserLanguage(userId, env) {
    try {
        if (env?.ALUNE_BOT_KV) return await env.ALUNE_BOT_KV.get(`user_lang_${userId}`) || 'en';
    } catch (e) { console.error("getUserLanguage Error:", e); }
    return 'en';
}

export async function setUserLanguage(userId, lang, env) {
    try {
        if (env?.ALUNE_BOT_KV) await env.ALUNE_BOT_KV.put(`user_lang_${userId}`, lang).catch(console.error);
    } catch (e) { console.error("setUserLanguage Error:", e); }
}
