const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

app.enable('trust proxy');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000 
  });
  
app.use(limiter);

app.get('/', (req, res) => {
  let ips = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',').map(ip => ip.trim()) : [];
  ips.push(req.socket.remoteAddress);

  const ipv4 = ips.find(ip => ip.includes('.'));
  const ipv6 = ips.find(ip => ip.includes(':'));
  const user_ip = req.headers['x-appengine-user-ip'];
  const user_long_lat = req.headers['x-appengine-citylatlong'];
  const user_country = (req.headers['x-appengine-country']).toString().toUpperCase();
  const user_city = req.headers['x-appengine-city'];
  const user_region = req.headers['x-appengine-region'].toString().toUpperCase();
  const user_agent = req.headers['user-agent'];
  const platform = req.headers['sec-ch-ua-platform'];

  res.json({
    "ipv4": ipv4,
    "ipv6": ipv6,
    "user_ip_address": user_ip,
    "long_lat": user_long_lat,
    "user_country": user_country,
    "user_city": user_city,
    "user_region": user_region,
    "user_agent": user_agent,
    "platform": platform
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
