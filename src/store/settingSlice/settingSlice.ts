import { createAsyncThunk, createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface SettingState {
    passengerStatus: any;
    selectedPassengerStatus: any;
    passengerDocumentTypes: any;
    selectedPassengerDocumentType: any;
    jobCatalogs: any;
    selectedJobCatalog: any;
    status: string;
    error: string;
}

const initialState: SettingState = {
    passengerStatus: [],
    selectedPassengerStatus: {},
    passengerDocumentTypes: [],
    selectedPassengerDocumentType: {},
    jobCatalogs: [],
    selectedJobCatalog: {},
    status: "idle",
    error: "",
};

export const getAllPassengerStatus = createAsyncThunk(
    "setting/getAllPassengerStatus",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/settings/passenger-statuses`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getPassengerStatus = createAsyncThunk(
    "setting/getPassengerStatus",
    async (id: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/settings/passenger-status/${id}`);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const createPassengerDocumentType = createAsyncThunk(
    "setting/createPassengerDocumentType",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/settings/passenger-document-type`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getAllPassengerDocumentTypes = createAsyncThunk(
    "setting/getAllPassengerDocumentTypes",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/settings/passenger-document-types`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const updatePassengerDocumentType = createAsyncThunk(
    "setting/updatePassengerDocumentType",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/settings/passenger-document-type/${payload.id}`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getPassengerDocumentType = createAsyncThunk(
    "setting/getPassengerDocumentType",
    async (id: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/settings/passenger-document-type/${id}`);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const updatePassengerStatus = createAsyncThunk(
    "setting/updatePassengerStatus",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/settings/passenger-status/${payload.id}`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getAllJobCatalogs = createAsyncThunk(
    "setting/getAllJobCatalogs",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/settings/job-catalogs`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const updateJobCatalog = createAsyncThunk(
    "setting/updateJobCatalog",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/settings/job-catalog/${payload.id}`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const createJobCatalog = createAsyncThunk(
    "setting/createJobCatalog",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/settings/job-catalog`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getJobCatalog = createAsyncThunk("setting/getJobCatalog", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/settings/job-catalog/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

const settingSlice = createSlice({
    name: "setting",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllPassengerStatus.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.passengerStatus = action.payload.response;
        });
        builder.addCase(getPassengerStatus.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.selectedPassengerStatus = action.payload.response;
        });
        builder.addCase(updatePassengerStatus.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.passengerStatus = state.passengerStatus.map((ps: any) =>
                ps._id === action.payload.response._id ? action.payload.response : ps
            );
            state.selectedPassengerStatus = null;
        });
        builder.addCase(createPassengerDocumentType.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(
            getAllPassengerDocumentTypes.fulfilled,
            (state: Draft<SettingState>, action: PayloadAction<any>) => {
                state.passengerDocumentTypes = action.payload.response;
            }
        );
        builder.addCase(
            getPassengerDocumentType.fulfilled,
            (state: Draft<SettingState>, action: PayloadAction<any>) => {
                state.selectedPassengerDocumentType = action.payload.response;
            }
        );
        builder.addCase(
            updatePassengerDocumentType.fulfilled,
            (state: Draft<SettingState>, action: PayloadAction<any>) => {
                state.passengerDocumentTypes = state.passengerDocumentTypes.map((pd: any) =>
                    pd._id === action.payload.response._id ? action.payload.response : pd
                );
                state.selectedPassengerDocumentType = null;
            }
        );
        builder.addCase(getAllJobCatalogs.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.jobCatalogs = action.payload.response;
        });
        builder.addCase(updateJobCatalog.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.jobCatalogs = state.jobCatalogs.map((jc: any) =>
                jc._id === action.payload.response._id ? action.payload.response : jc
            );
            state.selectedJobCatalog = null;
        });
        builder.addCase(createJobCatalog.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(getJobCatalog.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.selectedJobCatalog = action.payload.response;
        });
    },
});

export default settingSlice.reducer;
