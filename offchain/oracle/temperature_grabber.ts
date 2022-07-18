export async function grabTemperature(city: string): Promise<number> {
    const axios = require('axios').default;
    return axios.get(`https://goweather.herokuapp.com/weather/${city}`)
        .then(async function (response: any) {
            return response?.data?.temperature?.replace(/[^0-9-\.]/g, '');
        })
        .catch(function (error: any) {
            console.log(error);
        });
}
