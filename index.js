import express from "express";
import cors from "cors";
import NodeGeocoder from "node-geocoder";
import countryData from "country-data";
import moment from "moment-timezone";
import ct from "countries-and-timezones";
import fetch from "node-fetch";

const app = express();

const options = {
  provider: "openstreetmap",
};

app.set("trust proxy", true);

app.use(cors());
app.get("/get-ip", (req, res) => {
  let ips = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",").map((ip) => ip.trim())
    : [];
  ips.push(req.socket.remoteAddress);
  const ipv4 = ips.find((ip) => ip.includes("."));
  const ipv6 = ips.find((ip) => ip.includes(":"));
  const user_ip = req.headers["x-appengine-user-ip"];
  res.json({
    ipv4: ipv4,
    ipv6: ipv6,
    user_ip_address: user_ip,
  });
});
app.get("/ip-data", async (req, res) => {
  let ips = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",").map((ip) => ip.trim())
    : [];
  ips.push(req.socket.remoteAddress);
  const ipv4 = ips.find((ip) => ip.includes("."));
  const ipv6 = ips.find((ip) => ip.includes(":"));
  const user_ip = req.headers["x-appengine-user-ip"];
  const user_country = req.headers["x-appengine-country"]
    .toString()
    .toUpperCase();

  const getCountryTime = async (countryCode) => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (timezones.length > 0) {
      const timezone = timezones[0].name;
      const now = moment.tz(timezone);
      return {
        timezone: timezone,
        localTime: now.format(),
        timezoneData: timezones[0],
      };
    } else {
      return { error: "No timezone found for this country code." };
    }
  };
  const country_time_details = await getCountryTime(user_country);
  async function getCountryDetails(countryCode) {
    const country = countryData.countries[countryCode];
    return {
      country_code2: country.alpha2,
      country_code3: country.alpha3,
    };
  }
  const country_details = await getCountryDetails(user_country);
  res.json({
    ipv4: ipv4,
    ipv6: ipv6,
    ...country_details,
    country_name: user_country,
    ip: user_ip,
    time_zone: country_time_details,
  });
});
app.get("/", async (req, res) => {
  let ips = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",").map((ip) => ip.trim())
    : [];
  ips.push(req.socket.remoteAddress);

  const ua = req.headers["user-agent"];
  let deviceType = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = "Tablet";
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    deviceType = "Mobile";
  }

  async function getCountryDetails(countryCode) {
    const country = countryData.countries[countryCode];
    return {
      alpha2: country.alpha2,
      alpha3: country.alpha3,
      countryCallingCodes: country.countryCallingCodes,
      currency: country.currencies[0],
      languages: country.languages,
      flag: country.emoji,
    };
  }

  const getCountryTime = async (countryCode) => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (timezones.length > 0) {
      const timezone = timezones[0].name;
      const now = moment.tz(timezone);
      return {
        timezone: timezone,
        localTime: now.format(),
        timezoneData: timezones[0],
      };
    } else {
      return { error: "No timezone found for this country code." };
    }
  };

  async function fetchLocation(lat, long) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json&addressdetails=1`;

    try {
      const response = await fetch(url, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (err) {
      console.error("Error fetching location:", err);
      throw err;
    }
  }

  console.log(fetchLocation(26.846694, 80.946166));
  console.log(await fetchLocation(26.846694, 80.946166));

  const ipv4 = ips.find((ip) => ip.includes("."));
  const ipv6 = ips.find((ip) => ip.includes(":"));
  const user_ip = req.headers["x-appengine-user-ip"];
  const user_long_lat = req.headers["x-appengine-citylatlong"];
  const user_country = req.headers["x-appengine-country"]
    .toString()
    .toUpperCase();
  const user_city = req.headers["x-appengine-city"];
  const user_region = req.headers["x-appengine-region"]
    .toString()
    .toUpperCase();
  const user_agent = req.headers["user-agent"];
  const platform = req.headers["sec-ch-ua-platform"];
  const device_type = deviceType;

  const long = user_long_lat.toString().split(",")[0];
  const lat = user_long_lat.toString().split(",")[1];

  const user_geolocation = await fetchLocation(lat, long);
  const country_details = await getCountryDetails(user_country);
  const country_time_details = await getCountryTime(user_country);

  console.log(user_long_lat, long, lat, user_geolocation);

  res.json({
    ipv4: ipv4,
    ipv6: ipv6,
    user_ip_address: user_ip,
    long_lat: user_long_lat,
    user_country: user_country,
    user_city: user_city,
    user_region: user_region,
    user_agent: user_agent,
    platform: platform,
    device_type: device_type,
    user_geolocation: user_geolocation ? user_geolocation : "No data",
    country_details: country_details,
    country_time_details: country_time_details,
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
