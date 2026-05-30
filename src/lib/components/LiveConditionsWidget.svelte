<script lang="ts">
    import { t } from 'svelte-i18n';
    import { onMount, onDestroy } from 'svelte';

    const regions = [
        {
            name: 'Costa Occidental',
            beaches: [
                { name: 'Tapia de Casariego', lat: 43.57, lon: -6.94 },
                { name: 'Playa de Navia', lat: 43.55, lon: -6.72 },
                { name: 'Luarca (Playa del Barco)', lat: 43.55, lon: -6.54 },
                { name: 'Cabo Busto', lat: 43.57, lon: -6.24 }
            ]
        },
        {
            name: 'Costa Central',
            beaches: [
                { name: 'Salinas', lat: 43.57, lon: -5.96 },
                { name: 'Xagó', lat: 43.60, lon: -5.91 },
                { name: 'San Lorenzo (Gijón)', lat: 43.54, lon: -5.65 },
                { name: 'El Arbeyal (Gijón)', lat: 43.54, lon: -5.69 },
                { name: 'Playa de Verdicio', lat: 43.59, lon: -5.87 }
            ]
        },
        {
            name: 'Costa Oriental',
            beaches: [
                { name: 'Rodiles', lat: 43.53, lon: -5.38 },
                { name: 'Playa de Poo', lat: 43.43, lon: -4.80 },
                { name: 'San Antolín', lat: 43.44, lon: -4.87 },
                { name: 'Playa de Toró (Llanes)', lat: 43.42, lon: -4.76 },
                { name: 'Playa de Borizo (Llanes)', lat: 43.42, lon: -4.74 }
            ]
        }
    ];

    let selectedBeach = $state(regions[1].beaches[2]); // San Lorenzo as default
    let weatherData = $state(null);
    let marineData = $state(null);
    let loading = $state(true);
    let error = $state(false);
    let refreshInterval;

    function getWindDirection(degree) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degree / 45) % 8];
    }

    function getLightHours(sunset) {
        if (!sunset) return '--';
        const now = new Date();
        const end = new Date(sunset);
        const diffMs = end - now;
        if (diffMs < 0) return '0.0';
        return (diffMs / (1000 * 60 * 60)).toFixed(1);
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function findNearestBeach(userLat, userLon) {
        let nearest = null;
        let minDistance = Infinity;
        for (const region of regions) {
            for (const beach of region.beaches) {
                const distance = calculateDistance(userLat, userLon, beach.lat, beach.lon);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = beach;
                }
            }
        }
        return nearest;
    }

    async function fetchConditions(beach) {
        loading = true;
        error = false;
        try {
            const [weatherRes, marineRes] = await Promise.all([
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${beach.lat}&longitude=${beach.lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,visibility&daily=sunrise,sunset,uv_index_max&timezone=auto`),
                fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${beach.lat}&longitude=${beach.lon}&current=wave_height,wave_period`)
            ]);

            if (!weatherRes.ok || !marineRes.ok) throw new Error('API fetch failed');
            
            weatherData = await weatherRes.json();
            const marineJson = await marineRes.json();
            
            if (marineJson.current) {
                marineData = marineJson.current;
            } else if (marineJson.hourly) {
                marineData = {
                    wave_height: marineJson.hourly.wave_height[0],
                    wave_period: marineJson.hourly.wave_period[0]
                };
            }
        } catch (e) {
            console.error('Failed to fetch live conditions', e);
            error = true;
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        fetchConditions(selectedBeach);
    });

    onMount(() => {
        // Refresh every hour (3600000 ms)
        refreshInterval = setInterval(() => {
            fetchConditions(selectedBeach);
        }, 3600000);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const nearest = findNearestBeach(position.coords.latitude, position.coords.longitude);
                if (nearest) {
                    selectedBeach = nearest;
                }
            }, (error) => {
                console.warn("Geolocation denied or failed", error);
            });
        }
    });

    onDestroy(() => {
        if (refreshInterval) clearInterval(refreshInterval);
    });

    // Helper to map Open-Meteo WMO codes to human readable text/icons
    function getWeatherDescription(code) {
        if (code === 0) return { textKey: 'weather.clear_sky', icon: 'wb_sunny', color: '#fdd835' };
        if (code >= 1 && code <= 3) return { textKey: 'weather.partly_cloudy', icon: 'cloud', color: '#90a4ae' };
        if (code >= 45 && code <= 48) return { textKey: 'weather.fog', icon: 'foggy', color: '#b0bec5' };
        if (code >= 51 && code <= 67) return { textKey: 'weather.rain', icon: 'water_drop', color: '#4fc3f7' };
        if (code >= 71 && code <= 82) return { textKey: 'weather.snow', icon: 'ac_unit', color: '#e0f7fa' };
        if (code >= 95) return { textKey: 'weather.thunderstorm', icon: 'thunderstorm', color: '#5c6bc0' };
        return { textKey: 'weather.unknown', icon: 'help_outline', color: '#9e9e9e' };
    }
</script>

<div class="widget-container">
    <div class="widget-header">
        <div class="header-title">
            <span class="material-icons location-icon">location_on</span>
            <h3>{$t('weather.live_conditions')}</h3>
        </div>
        <select class="beach-selector" bind:value={selectedBeach}>
            {#each regions as region}
                <optgroup label={region.name}>
                    {#each region.beaches as beach}
                        <option value={beach}>{beach.name}</option>
                    {/each}
                </optgroup>
            {/each}
        </select>
    </div>

    {#if loading}
        <div class="skeleton-loader">
            <div class="skeleton-circle"></div>
            <div class="skeleton-lines">
                <div class="line"></div>
                <div class="line short"></div>
            </div>
        </div>
    {:else if error}
        <div class="error-state">
            <span class="material-icons">cloud_off</span>
            <p>{$t('weather.data_unavailable')}</p>
        </div>
    {:else}
        {@const weather = getWeatherDescription(weatherData.current.weather_code)}
        <div class="metrics-grid">
            <!-- Weather Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: {weather.color};">{weather.icon}</span>
                <div class="metric-info">
                    <span class="value">{weatherData.current.temperature_2m}°C</span>
                    <span class="label">{$t(weather.textKey)}</span>
                </div>
            </div>

            <!-- Wind Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: #4db6ac;">air</span>
                <div class="metric-info">
                    <span class="value">{weatherData.current.wind_speed_10m} km/h</span>
                    <span class="label">{$t('weather.wind')}</span>
                </div>
            </div>

            <!-- Waves Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: #1e88e5;">waves</span>
                <div class="metric-info">
                    <span class="value">{marineData?.wave_height || '--'} m</span>
                    <span class="label">{$t('weather.waves')}</span>
                </div>
            </div>

            <!-- Period Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: #00bcd4;">av_timer</span>
                <div class="metric-info">
                    <span class="value">{marineData?.wave_period || '--'} s</span>
                    <span class="label">{$t('weather.period')}</span>
                </div>
            </div>

            <!-- Wind Direction Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: #7986cb; transform: rotate({weatherData.current.wind_direction_10m}deg);">navigation</span>
                <div class="metric-info">
                    <span class="value">{getWindDirection(weatherData.current.wind_direction_10m)}</span>
                    <span class="label">Wind Dir</span>
                </div>
            </div>

            <!-- UVA Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: #ff9800;">light_mode</span>
                <div class="metric-info">
                    <span class="value">{weatherData.daily?.uv_index_max?.[0] ?? '--'}</span>
                    <span class="label">UVA Index</span>
                </div>
            </div>

            <!-- Light Hours Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: #ffb74d;">wb_twilight</span>
                <div class="metric-info">
                    <span class="value">{getLightHours(weatherData.daily?.sunset?.[0])} h</span>
                    <span class="label">Light Left</span>
                </div>
            </div>

            <!-- Visibility Metric -->
            <div class="metric-card">
                <span class="material-icons" style="color: #9e9e9e;">visibility</span>
                <div class="metric-info">
                    <span class="value">{weatherData.current.visibility ? (weatherData.current.visibility / 1000).toFixed(1) : '--'} km</span>
                    <span class="label">Visibility</span>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .widget-container {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: -3rem auto 3rem auto;
        color: #333;
    }

    .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
        border-bottom: 2px solid rgba(0,0,0,0.05);
        padding-bottom: 0.75rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .header-title {
        display: flex;
        align-items: center;
    }

    .beach-selector {
        padding: 0.5rem 2rem 0.5rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 600;
        color: #1d3557;
        background-color: var(--surface-color);
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231d3557' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 0.7rem center;
        background-size: 1em;
    }

    .beach-selector:focus {
        border-color: #e63946;
        box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
    }

    .location-icon {
        color: #e63946;
        margin-right: 8px;
        font-size: 1.5rem;
    }

    .widget-header h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        color: #1d3557;
        letter-spacing: 0.5px;
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }

    .metric-card {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.5);
        padding: 1rem;
        border-radius: 12px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .metric-card .material-icons {
        font-size: 2.2rem;
        margin-right: 1rem;
    }

    .metric-info {
        display: flex;
        flex-direction: column;
    }

    .metric-info .value {
        font-size: 1.25rem;
        font-weight: 800;
        color: #1d3557;
        line-height: 1.2;
    }

    .metric-info .label {
        font-size: 0.85rem;
        color: #666;
        font-weight: 500;
        text-transform: uppercase;
        margin-top: 2px;
    }

    .skeleton-loader {
        display: flex;
        align-items: center;
        gap: 1rem;
        opacity: 0.6;
        animation: pulse 1.5s infinite;
    }

    .skeleton-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e0e0e0;
    }

    .skeleton-lines .line {
        height: 12px;
        width: 100px;
        background: #e0e0e0;
        border-radius: 4px;
        margin-bottom: 6px;
    }

    .skeleton-lines .short {
        width: 60px;
    }

    .error-state {
        display: flex;
        align-items: center;
        color: #d32f2f;
        gap: 0.5rem;
    }

    @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 0.3; }
        100% { opacity: 0.6; }
    }
    
    @media (max-width: 600px) {
        .metrics-grid {
            grid-template-columns: 1fr 1fr;
        }
        .widget-container {
            padding: 1rem;
            margin: -2rem 1rem 2rem 1rem;
        }
        .widget-header {
            flex-direction: column;
            align-items: flex-start;
        }
        .beach-selector {
            width: 100%;
        }
    }
</style>
