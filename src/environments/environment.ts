export const environment = {
  production: false,
  apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://admindashbackend2.onrender.com/api'
};
