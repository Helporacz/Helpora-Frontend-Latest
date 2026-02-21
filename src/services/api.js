import axios from "axios";
import { getHeaderData } from "utils/helpers";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401 || message === "Json web token is expired") {
      localStorage.removeItem("helpora");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
    }

    return Promise.reject(error);
  }
);
export const api = {
  header: () => {
    const header = getHeaderData();
    return header;
  },
  get: (url, options = {}) => {
    let headers = api.header();
    headers = { ...headers, ...(options.headers || {}) };

    return new Promise((resolve, reject) => {
      axios
        .get(process.env.REACT_APP_API_URL + url, {
          headers,
          params: options.params || {},
        })
        .then((res) => resolve(res.data))
        .catch((err) => {
          if (err?.response?.data) resolve(err.response.data);
          else reject(err);
        });
    });
  },

  delete: (url, data) => {
    let headers = api.header();
    headers = { ...headers };
    return new Promise((resolve, reject) => {
      axios
        .delete(process.env.REACT_APP_API_URL + url, {
          headers,
          data,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          if (err?.response?.data) {
            resolve(err?.response?.data);
          } else {
            reject(err);
          }
        });
    });
  },

  post: (url, data, header = {}) => {
    let headers = api.header();
    headers = { ...headers, ...header };
    if (data instanceof FormData) {
      // Let the browser/axios set multipart boundaries
      delete headers["Content-Type"];
    }

    return new Promise((resolve, reject) => {
      axios
        .post(process.env.REACT_APP_API_URL + url, data, {
          headers,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          if (err?.response?.data) {
            resolve(err?.response?.data);
          } else {
            reject(err);
          }
        });
    });
  },

  put: (url, data = {}, header = {}) => {
    let headers = api.header();
    headers = { ...headers, ...header };
    if (data instanceof FormData) {
      delete headers["Content-Type"];
    }

    return new Promise((resolve, reject) => {
      axios
        .put(process.env.REACT_APP_API_URL + url, data, {
          headers,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          if (err?.response?.data) {
            resolve(err?.response?.data);
          } else {
            reject(err);
          }
        });
    });
  },
};
