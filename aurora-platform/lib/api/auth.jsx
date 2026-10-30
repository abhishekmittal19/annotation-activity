import axios from "axios";

const API_URL = "/api/auth";

export const authApi = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    }); 

    return response.data;
  },

  register: async (payload) => {
    const response = await axios.post(`${API_URL}/register`, payload);

    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      email,
      otp,
    });

    return response.data;
  },
};
