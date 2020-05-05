import axios from 'axios';

axios.defaults.baseURL = `http://${window.serverIP}:5005/api/v1`;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.common['Authorization'] = `Bearer ${window.b2ctk}`;

axios.interceptors.request.use(request => {
    // console.log(request);
    // Edit request config
    return request;
}, error => {
    console.log(error);
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    // console.log(response);
    // Edit response config
    return response;
}, error => {
    console.log(error);
    return Promise.reject(error);
});

const makeServerRequest = (opts) => {
    // Payload is params for GET and same for POST
    return axios[opts.requestType](opts.url, opts.payload)
        .then(r => r.data)
        .catch(e => console.log(e.data));
}

// export { __makeServerRequest};
export default makeServerRequest;