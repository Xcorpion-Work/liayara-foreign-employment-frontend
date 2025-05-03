import { createAsyncThunk, createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface SettingState {
    passengerStatus: any;
    selectedPassengerStatus: any;
    status: string;
    error: string;
}

const initialState: SettingState = {
    passengerStatus: [],
    selectedPassengerStatus: {},
    status: "idle",
    error: "",
};

export const getAllPassengerStatus = createAsyncThunk("setting/getAllPassengerStatus", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/settings/passenger-statuses`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getPassengerStatus = createAsyncThunk("setting/getPassengerStatus", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/settings/passenger-status/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});


export const updatePassengerStatus = createAsyncThunk("setting/updatePassengerStatus", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/settings/passenger-status/${payload.id}`, payload);
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
    },
});

export default settingSlice.reducer;
