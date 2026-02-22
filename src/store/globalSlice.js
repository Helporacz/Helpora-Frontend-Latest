import { createSlice } from "@reduxjs/toolkit";
import { api } from "services";
import { storeLocalStorageData } from "utils/helpers";

const initialState = {
  userState: null,
  apiError: {},
  servicesCategoryList: [],
  provinceList: [],
  adminData: {},
  businessList: [],
  clientList: [],
  checkClientList: [],
  brandCategory: [],
  demographyList: [],
  // featuresList: [],
  brandProductList: [],
  stepThreeData: [],
  fetchSubServiceType: [],
  productCategoryList: [],
  beauticianPhoneNumber: "",
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setUserState(state, action) {
      state.userState = action.payload;
    },
    setApiError(state, action) {
      state.apiError = action.payload;
    },
    setServicesCategoryList(state, action) {
      state.servicesCategoryList = action.payload;
    },
    setProvinceList(state, action) {
      state.provinceList = action.payload;
    },

    setAdminData(state, action) {
      state.adminData = action.payload;
    },

    setBusinessList(state, action) {
      state.businessList = action.payload;
    },

    setClientList(state, action) {
      state.clientList = action.payload;
    },

    setCheckClientList(state, action) {
      state.checkClientList = action.payload;
    },
    setBrandCategory(state, action) {
      state.brandCategory = action.payload;
    },
    setDemographyList(state, action) {
      state.demographyList = action.payload;
    },
    // setFeaturesList(state, action) {
    //   state.featuresList = action.payload;
    // },
    setBrandProductList(state, action) {
      state.brandProductList = action.payload;
    },

    setStepThreeData(state, action) {
      state.stepThreeData = action.payload;
    },

    setFetchSubServiceType(state, action) {
      state.fetchSubServiceType = action.payload;
    },
    setProductCategoryList(state, action) {
      state.productCategoryList = action.payload;
    },
    setBeauticianPhoneNumber(state, action) {
      state.beauticianPhoneNumber = action.payload;
    },
    reset: () => initialState,
  },
});

//admin login
export const login = (formData) => async (dispatch) => {
  try {
    const res = await api.post("/auth/admin-signIn", formData);
    const response = await dispatch(handelResponse(res));
    if (response?.status === 200) {
      const userRole = response?.role;
      localStorage.setItem("userRole", userRole);
      storeLocalStorageData({ token: res?.token });
      dispatch(setUserState(JSON.stringify({ token: res?.token })));
    }
    return response;
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

//user login
export const userLogin =
  (formData, expectedRole = "user") =>
  async (dispatch) => {
    try {
      const res = await api.post("/auth/Signin", formData);
      const response = await dispatch(handelResponse(res));

      if (response?.status === 200) {
        const role = res?.user?.role;

        // Only allow login if role matches expectedRole (normalized + provider aliases)
        const normalizeRole = (r) => String(r || "").trim().toLowerCase();
        const roleNorm = normalizeRole(role);
        const expectedNorm = normalizeRole(expectedRole);
        const providerAliases = new Set(["provider", "serviceprovider", "service_provider"]);
        const roleOk =
          expectedNorm === "provider"
            ? providerAliases.has(roleNorm)
            : roleNorm === expectedNorm;
        if (!roleOk) {
          return { status: 403, message: `Only ${expectedRole}s can login here.` };
        }

        const token = res?.token;
        const userId = res?.user?._id;
        const capitalize = (str) =>
          str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

        const subscriptionStatus = res?.subscription?.status || "inactive";
        const subscriptionActive = !!res?.subscriptionActive;
        const requireProviderSubscription =
          role === "provider"
            ? typeof res?.requireProviderSubscription === "boolean"
              ? res.requireProviderSubscription
              : true
            : true;

        storeLocalStorageData({
          token,
          ...(role === "provider"
            ? {
                subscriptionStatus,
                subscriptionActive,
                requireProviderSubscription,
                subscriptionCurrentPeriodEnd:
                  res?.subscription?.currentPeriodEnd || null,
              }
            : {}),
        });

        localStorage.setItem("userId", userId);
        localStorage.setItem("userRole", role);
        if (role === "provider") {
          localStorage.setItem("subscriptionStatus", subscriptionStatus);
          localStorage.setItem(
            "subscriptionActive",
            subscriptionActive ? "true" : "false"
          );
          localStorage.setItem(
            "requireProviderSubscription",
            requireProviderSubscription ? "true" : "false"
          );
        } else {
          localStorage.removeItem("subscriptionStatus");
          localStorage.removeItem("subscriptionActive");
          localStorage.removeItem("requireProviderSubscription");
        }
        dispatch(setUserState(JSON.stringify({ token, userId })));
        dispatch(throwSuccess(`${capitalize(expectedRole)} Login Successful.`));
      }

      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };

export const forgetPassword = (data) => async (dispatch) => {
  try {
    const res = await api.post("/user/forgot-password", data);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

export const resetPassword = (data) => async (dispatch) => {
  try {
    const res = await api.post("/user/reset-password", data);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// user register
export const userRegister = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/user/addProvider", formData);
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(throwSuccess("Register Sucessfully."));
      }
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const addProvider = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/user/addProvider", formData);
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(throwSuccess("Add Provider Sucessfully."));
      }
      return dispatch(handelResponse(response));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get user profile
export const getUserProfile = (userId) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/user/getUser/${userId}`);
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(setAdminData(response?.data || {}));
      }
      return response;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get all provider
export const getAllProvider = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/user/getAllProviders`);
      return res.data; // return the data part
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get all clients
export const getAllClient = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/user/getAllClients`);
      return res.data; // return the data part
    } catch (error) {
      console.error("Error fetching clients:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// export provider emails data (super admin only, full dataset)
export const getProviderEmailsForExportData = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/user/admin/export-provider-emails`);
      return res.data; // { count, rows }
    } catch (error) {
      console.error("Error fetching provider export data:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// export client emails data (super admin only, full dataset)
export const getClientEmailsForExportData = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/user/admin/export-client-emails`);
      return res.data; // { count, rows }
    } catch (error) {
      console.error("Error fetching client export data:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// delete client (super admin only)
export const deleteClient = (id) => {
  return async (dispatch) => {
    try {
      const res = await api.delete(`/user/deleteUser/${id}`);
      return res;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// update provider
export const updateProvider = ({ id, payload }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(`/user/updateUser/${id}`, payload);
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// toggle provider status (block/unblock)
export const toggleProviderStatus = (id) => {
  return async (dispatch) => {
    try {
      const response = await api.put(`/user/toggleProviderStatus/${id}`);
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// delete providers
export const deleteProvider = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/user/removeProvider/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// get all Category
export const getAllCategory = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/category/getAllCategory`);
      return await dispatch(handelResponse(res));
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAllCategoryName = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/category/getAllCategoryName`);
      return await dispatch(handelResponse(res));
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getPublicRankedProviders = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/user/rankedProviders`, { params });
      return res;
    } catch (error) {
      console.error("Error fetching ranked providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const submitProviderRankingRequest = (payload = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.post(`/user/ranking-request`, payload);
      return res;
    } catch (error) {
      console.error("Error submitting ranking request:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAdminRankingRequests = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/user/admin/ranking-requests`, { params });
      return res;
    } catch (error) {
      console.error("Error fetching ranking requests:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const reviewAdminRankingRequest = (providerId, payload = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.patch(
        `/user/admin/ranking-requests/${providerId}`,
        payload
      );
      return res;
    } catch (error) {
      console.error("Error reviewing ranking request:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const deleteAdminRankingRequest = (providerId) => {
  return async (dispatch) => {
    try {
      const res = await api.delete(`/user/admin/ranking-requests/${providerId}`);
      return res;
    } catch (error) {
      console.error("Error deleting ranking request:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const searchServices = (params) => {
  return async (dispatch) => {
    try {
      const { category, city, district } = params;
      let query = [`category=${category}`];
      if (city && city.trim() !== "") {
        query.push(`city=${encodeURIComponent(city.trim())}`);
      }
      if (district && district.trim() !== "") {
        query.push(`district=${encodeURIComponent(district.trim())}`);
      }
      const url = `/services/search/services?${query.join("&")}`;
      const res = await api.get(url);
      return res;
    } catch (error) {
      console.error("Error searching services:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderServices = (providerId) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/provider-services/${providerId}/services`);
      return await dispatch(handelResponse(res));
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderComments = (providerId) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/comments/${providerId}`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// delete category
export const deleteCategory = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/category/removeCategory/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// update category
export const updateCategory = ({ id, payload }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(`/category/updatecategory/${id}`, payload);
      return dispatch(handelResponse(response));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// add category
export const addCategory = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/category/addCategory", formData);
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(throwSuccess("Add Category Sucessfully."));
      }
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get all provider
export const getAllServices = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/services/getAllServices`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get service by category
export const getServicesByCategory = (id) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/services/ServiceByCategory/${id}`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get provider services
export const getProviderServicesByCategory = (params) => {
  return async (dispatch) => {
    try {
      const { id, city, district } = params;
      const query = [];
      if (city && city.trim() !== "") {
        query.push(`city=${encodeURIComponent(city.trim())}`);
      }
      if (district && district.trim() !== "") {
        query.push(`district=${encodeURIComponent(district.trim())}`);
      }
      const qs = query.length ? `?${query.join("&")}` : "";
      const res = await api.get(`/services/by-category/${id}${qs}`);

      return res;
    } catch (error) {
      console.error("Error fetching provider services:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get provider service by id
export const getProviderServiceById = (id) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/services/${id}`);
      return res;
    } catch (error) {
      console.error("Error fetching provider service:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get service by id
export const getServiceById = (id) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/services/getService/${id}`);
      return res;
    } catch (error) {
      console.error("Error fetching service:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// delete services
export const deleteServices = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/services/removeService/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// add services
export const addService = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/services/addService", formData);
      return res;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// update services
export const updateService = ({ id, payload }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(`/services/updateService/${id}`, payload);
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// fetch provider service
export const fetchProviderServices = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/provider-services/getProviderServices`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// add provider services
export const addProviderService = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/provider-services/addService", formData);

      return res; // The modal can now check res.status === 200
    } catch (error) {
      // handelCatch should return a response-like object so the modal can handle it
      dispatch(handelCatch(error));
      return {
        status: error.response?.status || 500,
        message: error.message || "Something went wrong",
      };
    }
  };
};

// update services
export const updateProviderService = ({ id, data }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(
        `/provider-services/updtaeService/${id}`,
        data
      );
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// delete provider
export const deleteProviderServices = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/provider-services/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// create booking
export const createBooking = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/booking/addBooking", formData);
      return res;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get booking
export const getBookings = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/booking/provider`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// user booking
export const getUserBookings = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/booking/user`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// update booking status by provider
export const updateBookingStatus = ({ id, data }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(`/booking/${id}/status`, data);
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get chat list
export const getChatList = () => {
  return async (dispatch) => {
    try {
      const res = await api.get("/chat/chat-list");
      return res; // <-- changed
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get chat
export const getMessages = (chatId) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/chat/messages/${chatId}`);
      return res; // returns {success, messages}
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// mark read chat
export const markMessagesRead = (chatId) => {
  return async (dispatch) => {
    try {
      const res = await api.put(`/chat/${chatId}/read-all`);
      return res;
    } catch (error) {
      console.error("Error:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// delete chat conversation
export const deleteChatConversation = (chatId) => {
  return async (dispatch) => {
    try {
      const res = await api.delete(`/chat/${chatId}`);
      return res;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get notification
export const getNotification = () => {
  return async (dispatch) => {
    try {
      const res = await api.get("/notification");
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// read single notification
export const readNotification = (id) => {
  return async (dispatch) => {
    try {
      const res = await api.put(`/notification/${id}/read`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// read all notification
export const readAllNotification = () => {
  return async (dispatch) => {
    try {
      const res = await api.put(`/notification/read-all`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get weeks slots
export const fetchWeekSlotsAPI = (providerId, startDate, endDate) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/slot/${providerId}/availability-range`, {
        params: { startDate, endDate },
      });

      return res;
    } catch (error) {
      console.error("Error fetching weekly slots:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderDefaultAvailabilityAPI = (providerId) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/slot/${providerId}/default-availability`);
      return res;
    } catch (error) {
      console.error("Error fetching provider default availability:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderAvailabilitySlotsAPI = (providerId, date) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/slot/${providerId}/availability`, {
        params: { date },
      });
      return res;
    } catch (error) {
      console.error("Error fetching provider available slots:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// get provider Unavailability
export const fetchUnavailabilityAPI = (providerId) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/slot/${providerId}/unavailability`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// set provider default availability
export const saveDefaultAvailabilityAPI = (providerId, values) => {
  return async (dispatch) => {
    try {
      const res = await api.post(
        `/slot/${providerId}/default-availability`,
        values
      );
      return res;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// override default availability
export const overrideAvailabilityAPI = (providerId, overrideData) => {
  return async (dispatch) => {
    try {
      const res = await api.post(`/slot/${providerId}/override`, overrideData);
      return res;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// UPLOAD IMAGE TO CLOUDINARY
export const uploadImage = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/file-upload/image-upload", formData, {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      });
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(throwSuccess("Upload Image Sucessfully."));
      }
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const handelLogout = () => async (dispatch) => {
  localStorage.clear();
  dispatch(setUserState(new Date().toLocaleString()));
  dispatch(reset());
  window.location.href = "/";
};

//get details admin
export const getAdminProfile = () => {
  return async (dispatch) => {
    try {
      const res = await api.get("/admin/getadminProfile");
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(setAdminData(response?.data || {}));
      }
      return dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

//update admin profile
export const updateAdminProfile = (formData) => async (dispatch) => {
  try {
    const res = await api.post("/admin/updateProfile", formData, {
      "Content-Type": "multipart/form-data",
    });
    return await dispatch(handelResponse(res));
  } catch (error) {
    return await dispatch(handelCatch(error));
  }
};

//change passowrd
export const handlePassword = (payload) => async (dispatch) => {
  try {
    const res = await api.post("/admin/changePassword", payload);
    return await dispatch(handelResponse(res));
  } catch (error) {
    return await dispatch(handelCatch(error));
  }
};

// response, success, error, catch
export const throwSuccess = (msg) => async (dispatch) => {
  let message = msg || "Operation Done Successfully.";
  dispatch(
    setApiError({
      show: true,
      message: message,
      type: "success",
    })
  );
};

// get all bookings for admin
export const getAllBookings = (res) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/booking/getAllOrders`);
      return res;
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const throwError = (res) => async (dispatch) => {
  // let message = res?.message;
  let message = res;
  message = message || "Something went wrong!";
  dispatch(
    setApiError({
      show: true,
      message: message,
      type: "danger",
    })
  );
};

// Dashboard API calls - Provider
export const getProviderSummary = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/provider/summary`, { params });
      return res;
    } catch (error) {
      console.error("Error fetching provider summary:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderServiceStatus = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/provider/service-status`, {
        params,
      });
      return res;
    } catch (error) {
      console.error("Error fetching provider service status:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderOrdersSummary = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/provider/orders-summary`, {
        params,
      });
      return res;
    } catch (error) {
      console.error("Error fetching provider orders summary:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderMonthlyOrders = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/provider/monthly-orders`, {
        params,
      });
      return res;
    } catch (error) {
      console.error("Error fetching provider monthly orders:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderMonthlyEarnings = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/provider/monthly-earnings`, {
        params,
      });
      return res;
    } catch (error) {
      console.error("Error fetching provider monthly earnings:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// Dashboard API calls - Admin
export const getAdminOrdersList = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/orders-list`, { params });
      return res;
    } catch (error) {
      console.error("Error fetching admin orders list:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAdminEarningsOverview = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/earnings-overview`, {
        params,
      });
      return res;
    } catch (error) {
      console.error("Error fetching admin earnings overview:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getProviderVerificationStatus = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(
        `/dashboard/admin/provider-verification-status`,
        { params }
      );
      return res;
    } catch (error) {
      console.error("Error fetching provider verification status:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAllProviders = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/providers`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAdminSummary = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/summary`, { params });
      return res;
    } catch (error) {
      console.error("Error fetching admin summary:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAdminAppAccessSetting = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/app-access`);
      return res;
    } catch (error) {
      console.error("Error fetching app access setting:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const updateAdminAppAccessSetting = (payload) => {
  return async (dispatch) => {
    try {
      const res = await api.patch(`/dashboard/admin/app-access`, payload);
      return res;
    } catch (error) {
      console.error("Error updating app access setting:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAdminPublicAdsConfig = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/public-ads`);
      return res;
    } catch (error) {
      console.error("Error fetching admin public ads config:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const updateAdminPublicAdsConfig = (payload) => {
  return async (dispatch) => {
    try {
      const res = await api.patch(`/dashboard/admin/public-ads`, payload);
      return res;
    } catch (error) {
      console.error("Error updating admin public ads config:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getPublicAdsConfig = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/public-ads`);
      return res;
    } catch (error) {
      console.error("Error fetching public ads config:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAdminSubscribers = (params = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/subscribers`, { params });
      return res;
    } catch (error) {
      console.error("Error fetching admin subscribers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const getAdminSubscriberStats = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/dashboard/admin/subscribers/summary`);
      return res;
    } catch (error) {
      console.error("Error fetching subscriber stats:", error);
      return dispatch(handelCatch(error));
    }
  };
};

export const cancelAdminSubscriber = (id, payload = {}) => {
  return async (dispatch) => {
    try {
      const res = await api.post(
        `/dashboard/admin/subscribers/${id}/cancel`,
        payload
      );
      return res;
    } catch (error) {
      console.error("Error cancelling subscriber:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// add Review
export const addReview = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/review/addReview", formData);
      return res;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// delete services
export const deleteReview = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/review/deleteReview/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// update review
export const updateReview = ({ id, payload }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(`/review/updateReview/${id}`, payload);
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const getAllReview = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/review/getReviews`);
      return res;
    } catch (error) {
      console.error("Error fetching providers:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// KYC flows
export const getMyKyc = () => {
  return async (dispatch) => {
    try {
      const res = await api.get("/kyc/me");
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const startNewKyc = () => {
  return async (dispatch) => {
    try {
      const res = await api.post("/kyc/new");
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const saveKycBasicDetails = (payload) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/kyc/basic", payload);
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const uploadKycDocuments = (payload) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/kyc/documents", payload);
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// Admin KYC
export const getAllKycAdmin = () => {
  return async (dispatch) => {
    try {
      const res = await api.get("/kyc/admin");
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const getKycByIdAdmin = (id) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/kyc/admin/${id}`);
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const reviewKycAdmin = ({ id, action, adminReviewNotes }) => {
  return async (dispatch) => {
    try {
      const res = await api.post(`/kyc/admin/${id}/review`, {
        action,
        adminReviewNotes,
      });
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// add regions
export const addRegion = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/configration/addRegion", formData);
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(throwSuccess("Add City Sucessfully."));
      }
      return dispatch(handelResponse(response));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get all regions
export const getAllRegions = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/configration/getAllRegions`);
      return res;
    } catch (error) {
      console.error("Error fetching regions:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// update regions
export const updateRegion = ({ id, payload }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(
        `/configration/updateRegion/${id}`,
        payload
      );
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// delete regions
export const deleteRegion = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/configration/removeRegion/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// add city
export const addCity = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/configration/addcity", formData);
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(throwSuccess("Add City Sucessfully."));
      }
      return dispatch(handelResponse(response));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get all cities
export const getAllCities = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/configration/getAllCities`);
      return res;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// update city
export const updateCity = ({ id, payload }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(`/configration/updateCity/${id}`, payload);
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// delete city
export const deleteCity = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/configration/removeCity/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

// add district
export const addDistrict = (formData) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/configration/addDistrict", formData);
      const response = await dispatch(handelResponse(res));
      if (response?.status === 200) {
        dispatch(throwSuccess("Add District Sucessfully."));
      }
      return dispatch(handelResponse(response));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// get all districts
export const getAllDistricts = () => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/configration/getAllDistricts`);
      return res;
    } catch (error) {
      console.error("Error fetching districts:", error);
      return dispatch(handelCatch(error));
    }
  };
};

// update district
export const updateDistrict = ({ id, payload }) => {
  return async (dispatch) => {
    try {
      const response = await api.put(
        `/configration/updateDistrict/${id}`,
        payload
      );
      return response;
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

// delete district
export const deleteDistrict = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/configration/removeDistrict/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

export const getAllForm = () => {
  return async (dispatch) => {
    try {
      const res = await api.get("/contact-form/getAllForm");
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const getFormById = (id) => {
  return async (dispatch) => {
    try {
      const res = await api.get(`/contact-form/getForm/${id}`);
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const saveFormContactPage = (payload) => {
  return async (dispatch) => {
    try {
      const res = await api.post("/contact-form/addForm", payload);
      return await dispatch(handelResponse(res));
    } catch (error) {
      return dispatch(handelCatch(error));
    }
  };
};

export const deleteForm = (id) => async (dispatch) => {
  try {
    const res = await api.delete(`/contact-form/removeForm/${id}`);
    return dispatch(handelResponse(res));
  } catch (error) {
    return dispatch(handelCatch(error));
  }
};

export const handelResponse = (res) => async (dispatch) => {
  let returnValue = null;
  const status = res?.status;
  switch (status) {
    case 200:
      returnValue = res;
      break;
    case 201:
      returnValue = res;
      break;
    case 400:
      // dispatch(throwError(res));
      returnValue = res;
      // returnValue = null;
      break;
    case 401:
      dispatch(handelLogout());
      break;
    case 403:
      dispatch(handelLogout());
      break;
    default:
      throwError({ message: "Something went wrong!" });
      returnValue = null;
      break;
  }

  return returnValue;
};
export const handelCatch = (error) => async (dispatch) => {
  let status = error?.response?.status;
  let message = error?.response?.data?.message;
  if (status === 401 || status === 403) {
    dispatch(handelLogout());
  } else {
    message = message || "Something went wrong!";
    dispatch(
      setApiError({
        show: true,
        message: message,
        type: "danger",
      })
    );
  }
  return null;
};

export const {
  setUserState,
  setApiError,
  setServicesCategoryList,
  setProvinceList,
  setAdminData,
  setBusinessList,
  setClientList,
  setCheckClientList,
  setBrandCategory,
  setDemographyList,
  // setFeaturesList,
  setBrandProductList,
  setStepThreeData,
  setFetchSubServiceType,
  setProductCategoryList,
  setBeauticianPhoneNumber,
  reset,
} = globalSlice.actions;

export default globalSlice.reducer;
