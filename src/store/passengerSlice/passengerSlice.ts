import { createAsyncThunk, createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface PassengerState {
    passengers: any;
    selectedPassenger: any;
    jobs: any;
    status: string;
    error: string;
}

const initialState: PassengerState = {
    passengers: [],
    selectedPassenger: {},
    jobs: [],
    status: "idle",
    error: "",
};

// Thunks
export const getAllPassengers = createAsyncThunk(
    "passenger/getAllPassengers",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/passengers/passengers`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getPassenger = createAsyncThunk("passenger/getPassenger", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/passengers/passenger/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const createPassenger = createAsyncThunk(
    "passenger/createPassenger",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/passengers/passenger`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const updatePassenger = createAsyncThunk(
    "passenger/updatePassenger",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/passengers/passenger/${payload.id}`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getPagedPassengers = createAsyncThunk(
    "passenger/getPagedPassengers",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/passengers/paged-passengers`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getPagedPassengersInDocumentPhase = createAsyncThunk(
    "passenger/getPagedPassengersInDocumentPhase",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/passengers/paged-passengers-document-phase`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getAllJobsForPassenger = createAsyncThunk(
    "passenger/getAllJobsForPassenger",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/passengers/jobs`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const selectJobForPassenger = createAsyncThunk(
    "passenger/selectJobForPassenger",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/passengers/select-job`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);


// Slice
const passengerSlice = createSlice({
    name: "passenger",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllPassengers.fulfilled, (state: Draft<PassengerState>, action: PayloadAction<any>) => {
            state.passengers = action.payload.response;
        });
        builder.addCase(getPassenger.fulfilled, (state: Draft<PassengerState>, action: PayloadAction<any>) => {
            state.selectedPassenger = action.payload.response;
        });
        builder.addCase(updatePassenger.fulfilled, (state: Draft<PassengerState>, action: PayloadAction<any>) => {
            state.passengers = state.passengers.map((passenger: any) =>
                passenger._id === action.payload.response._id ? action.payload.response : passenger
            );
            state.selectedPassenger = null;
        });
        builder.addCase(createPassenger.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(getPagedPassengers.fulfilled, (state: Draft<PassengerState>, action: PayloadAction<any>) => {
            state.passengers = action.payload.response.result;
        });
        builder.addCase(getPagedPassengersInDocumentPhase.fulfilled, (state: Draft<PassengerState>, action: PayloadAction<any>) => {
            state.passengers = action.payload.response.result;
        });
        builder.addCase(getAllJobsForPassenger.fulfilled, (state: Draft<PassengerState>, action: PayloadAction<any>) => {
            state.jobs = action.payload.response;
        });
        builder.addCase(selectJobForPassenger.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
    },
});

export default passengerSlice.reducer;
