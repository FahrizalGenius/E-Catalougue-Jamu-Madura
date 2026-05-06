import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token_jamu')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
            
    }, (error) => {
        return Promise.reject(error)
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401){
            
            // 👇 TAMBAHANNYA DI SINI BANG 👇
            // Kalau errornya pas lagi nembak URL login, biarin aja!
            // Jangan ditendang ke "/", biar komponen Login nampilin pesan errornya.
            if (error.config && error.config.url === '/4dm13n') {
                return Promise.reject(error);
            }
            // 👆 ======================= 👆

            const token = localStorage.getItem('token_jamu')

            if (token) {
                alert ("sesi telah habis,silalhkan kembali")
                localStorage.removeItem('token_jamu')
                window.location.href = "/4dm13n"
            } else {
                window.location.href = "/"
            }
            
        }
        return Promise.reject(error);
    }
)

export default api;