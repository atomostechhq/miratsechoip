const countryData = require('country-data');
const moment = require('moment-timezone');
const ct = require('countries-and-timezones');

function getCountryDetails(countryCode) {
    const country = countryData.countries[countryCode];
    return {
        alpha2: country.alpha2,
        alpha3: country.alpha3,
        countryCallingCodes: country.countryCallingCodes,
        currency: country.currencies[0],
        languages: country.languages,
        flag: country.emoji
    };
}

const getCountryTime = (countryCode) => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (timezones.length > 0) {
        const timezone = timezones[0].name;
        const now = moment.tz(timezone);
        return {
            timezone: timezone,
            localTime: now.format(),
            timezoneData: timezones[0]
        };
    } else {
        return { error: "No timezone found for this country code." };
    }
};


const details = getCountryDetails('US');
const countryTime = getCountryTime('JP');
console.log(details);
console.log(countryTime);
