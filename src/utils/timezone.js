const { DateTime } = require('luxon');

// Common timezone mappings for EVE players
const TIMEZONE_ALIASES = {
    // Americas
    'EST': 'America/New_York',
    'EDT': 'America/New_York',
    'CST': 'America/Chicago',
    'CDT': 'America/Chicago',
    'MST': 'America/Denver',
    'MDT': 'America/Denver',
    'PST': 'America/Los_Angeles',
    'PDT': 'America/Los_Angeles',
    'AKST': 'America/Anchorage',
    'AKDT': 'America/Anchorage',
    'HST': 'Pacific/Honolulu',
    'AST': 'America/Halifax',
    'ADT': 'America/Halifax',
    'BRT': 'America/Sao_Paulo',
    'ART': 'America/Argentina/Buenos_Aires',
    
    // Europe
    'GMT': 'Europe/London',
    'BST': 'Europe/London',
    'WET': 'Europe/Lisbon',
    'WEST': 'Europe/Lisbon',
    'CET': 'Europe/Paris',
    'CEST': 'Europe/Paris',
    'EET': 'Europe/Helsinki',
    'EEST': 'Europe/Helsinki',
    'MSK': 'Europe/Moscow',
    
    // Asia/Pacific
    'IST': 'Asia/Kolkata',
    'SGT': 'Asia/Singapore',
    'HKT': 'Asia/Hong_Kong',
    'JST': 'Asia/Tokyo',
    'KST': 'Asia/Seoul',
    'CST_CHINA': 'Asia/Shanghai',
    'AWST': 'Australia/Perth',
    'ACST': 'Australia/Adelaide',
    'AEST': 'Australia/Sydney',
    'AEDT': 'Australia/Sydney',
    'NZST': 'Pacific/Auckland',
    'NZDT': 'Pacific/Auckland',
    
    // EVE specific
    'EVE': 'UTC',
    'EVETIME': 'UTC',
    'EVE TIME': 'UTC',
};

/**
 * Resolve a timezone string to an IANA timezone
 * @param {string} tz - Timezone string (alias or IANA)
 * @returns {string|null} - IANA timezone or null if invalid
 */
function resolveTimezone(tz) {
    if (!tz) return null;
    
    const upperTz = tz.toUpperCase().trim();
    
    // Check aliases first
    if (TIMEZONE_ALIASES[upperTz]) {
        return TIMEZONE_ALIASES[upperTz];
    }
    
    // Try as IANA timezone
    const testDt = DateTime.now().setZone(tz);
    if (testDt.isValid) {
        return tz;
    }
    
    return null;
}

/**
 * Parse EVE time string to DateTime
 * @param {string} timeStr - Time string in various formats
 * @param {string} dateStr - Optional date string (YYYY-MM-DD)
 * @returns {DateTime|null} - Luxon DateTime in UTC or null if invalid
 */
function parseEveTime(timeStr, dateStr = null) {
    if (!timeStr) return null;
    
    // Clean up the time string
    timeStr = timeStr.trim().toUpperCase();
    
    // Get current date in UTC if not provided
    const now = DateTime.utc();
    let year = now.year;
    let month = now.month;
    let day = now.day;
    
    // Parse date if provided
    if (dateStr) {
        const dateParts = dateStr.split(/[-\/]/);
        if (dateParts.length === 3) {
            year = parseInt(dateParts[0]);
            month = parseInt(dateParts[1]);
            day = parseInt(dateParts[2]);
        }
    }
    
    // Try various time formats
    let hours = null;
    let minutes = 0;
    let matched = false;
    
    // Format: HH:MM or H:MM
    const colonMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (colonMatch) {
        hours = parseInt(colonMatch[1]);
        minutes = parseInt(colonMatch[2]);
        matched = true;
    }
    
    // Format: HHMM (only if not already matched)
    if (!matched) {
        const fourDigitMatch = timeStr.match(/^(\d{2})(\d{2})$/);
        if (fourDigitMatch) {
            hours = parseInt(fourDigitMatch[1]);
            minutes = parseInt(fourDigitMatch[2]);
            matched = true;
        }
    }
    
    // Format: HH or H (only if not already matched)
    if (!matched) {
        const twoDigitMatch = timeStr.match(/^(\d{1,2})$/);
        if (twoDigitMatch) {
            hours = parseInt(twoDigitMatch[1]);
            minutes = 0;
            matched = true;
        }
    }
    
    // If no format matched, return null
    if (!matched || hours === null) {
        return null;
    }
    
    // Validate hours and minutes
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    
    // Create DateTime in UTC (EVE Time)
    const dt = DateTime.utc(year, month, day, hours, minutes);
    
    return dt.isValid ? dt : null;
}

/**
 * Convert EVE time to a specific timezone
 * @param {DateTime} eveTime - DateTime in UTC
 * @param {string} targetTz - Target timezone
 * @returns {DateTime|null} - DateTime in target timezone or null if invalid
 */
function convertToTimezone(eveTime, targetTz) {
    const resolvedTz = resolveTimezone(targetTz);
    if (!resolvedTz) return null;
    
    return eveTime.setZone(resolvedTz);
}

/**
 * Format a DateTime for display
 * @param {DateTime} dt - Luxon DateTime
 * @param {boolean} includeDate - Whether to include the date
 * @returns {string} - Formatted string
 */
function formatTime(dt, includeDate = true) {
    if (includeDate) {
        return dt.toFormat('cccc, LLLL d, yyyy \'at\' HH:mm');
    }
    return dt.toFormat('HH:mm');
}

/**
 * Get Discord timestamp format
 * @param {DateTime} dt - Luxon DateTime
 * @param {string} style - Discord timestamp style (t, T, d, D, f, F, R)
 * @returns {string} - Discord timestamp string
 */
function getDiscordTimestamp(dt, style = 'F') {
    const unix = Math.floor(dt.toSeconds());
    return `<t:${unix}:${style}>`;
}

/**
 * Get all Discord timestamp formats for a DateTime
 * @param {DateTime} dt - Luxon DateTime
 * @returns {object} - Object with all timestamp formats
 */
function getAllDiscordTimestamps(dt) {
    const unix = Math.floor(dt.toSeconds());
    return {
        shortTime: `<t:${unix}:t>`,      // 16:20
        longTime: `<t:${unix}:T>`,       // 16:20:30
        shortDate: `<t:${unix}:d>`,      // 20/04/2021
        longDate: `<t:${unix}:D>`,       // 20 April 2021
        shortDateTime: `<t:${unix}:f>`,  // 20 April 2021 16:20
        longDateTime: `<t:${unix}:F>`,   // Tuesday, 20 April 2021 16:20
        relative: `<t:${unix}:R>`,       // 2 hours ago / in 2 hours
    };
}

/**
 * Get current EVE time
 * @returns {DateTime} - Current time in UTC
 */
function getCurrentEveTime() {
    return DateTime.utc();
}

/**
 * Get list of common timezones for autocomplete
 * @returns {Array} - Array of timezone objects
 */
function getCommonTimezones() {
    return [
        { name: 'EVE Time (UTC)', value: 'UTC' },
        { name: 'US Eastern (EST/EDT)', value: 'America/New_York' },
        { name: 'US Central (CST/CDT)', value: 'America/Chicago' },
        { name: 'US Mountain (MST/MDT)', value: 'America/Denver' },
        { name: 'US Pacific (PST/PDT)', value: 'America/Los_Angeles' },
        { name: 'UK (GMT/BST)', value: 'Europe/London' },
        { name: 'Central Europe (CET/CEST)', value: 'Europe/Paris' },
        { name: 'Eastern Europe (EET/EEST)', value: 'Europe/Helsinki' },
        { name: 'Moscow (MSK)', value: 'Europe/Moscow' },
        { name: 'India (IST)', value: 'Asia/Kolkata' },
        { name: 'Singapore (SGT)', value: 'Asia/Singapore' },
        { name: 'Japan (JST)', value: 'Asia/Tokyo' },
        { name: 'Australia Eastern (AEST/AEDT)', value: 'Australia/Sydney' },
        { name: 'New Zealand (NZST/NZDT)', value: 'Pacific/Auckland' },
    ];
}

module.exports = {
    TIMEZONE_ALIASES,
    resolveTimezone,
    parseEveTime,
    convertToTimezone,
    formatTime,
    getDiscordTimestamp,
    getAllDiscordTimestamps,
    getCurrentEveTime,
    getCommonTimezones,
};
