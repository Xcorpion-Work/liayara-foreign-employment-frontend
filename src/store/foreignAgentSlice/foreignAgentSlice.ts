import { createAsyncThunk, createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface SettingState {
    foreignAgents: any[];
    selectedForeignAgent: any;
    jobOrders: any[];
    selectedJobOrder: any;
    status: string;
    error: string;
}

const initialState: SettingState = {
    foreignAgents: [],
    selectedForeignAgent: {},
    jobOrders: [],
    selectedJobOrder: {},
    status: "idle",
    error: "",
};

export const getAllForeignAgents = createAsyncThunk(
    "foreignAgent/getAllForeignAgents",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/foreign-agents/foreign-agents`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getForeignAgent = createAsyncThunk(
    "foreignAgent/getForeignAgent",
    async (id: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/foreign-agents/foreign-agent/${id}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const createForeignAgent = createAsyncThunk(
    "foreignAgent/createForeignAgent",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/foreign-agents/foreign-agent`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateForeignAgent = createAsyncThunk(
    "foreignAgent/updateForeignAgent",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/foreign-agents/foreign-agent/${payload.id}`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getPagedForeignAgents = createAsyncThunk(
    "foreignAgent/getPagedForeignAgents",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/foreign-agents/paged-foreign-agents`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getAllJobOrders = createAsyncThunk(
    "foreignAgent/getAllJobOrders",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/foreign-agents/job-orders`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getJobOrder = createAsyncThunk(
    "foreignAgent/getJobOrder",
    async (id: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/foreign-agents/job-order/${id}`);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const createJobOrder = createAsyncThunk(
    "foreignAgent/createJobOrder",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/foreign-agents/job-order`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const updateJobOrder = createAsyncThunk(
    "foreignAgent/updateJobOrder",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/foreign-agents/job-order/${payload.id}`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const getPagedJobOrders = createAsyncThunk(
    "foreignAgent/getPagedJobOrders",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/foreign-agents/paged-job-orders`, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response.data);
        }
    }
);

const foreignAgentSlice = createSlice({
    name: "foreignAgent",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllForeignAgents.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.foreignAgents = action.payload.response;
        });
        builder.addCase(getForeignAgent.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.selectedForeignAgent = action.payload.response;
        });
        builder.addCase(updateForeignAgent.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.foreignAgents = state.foreignAgents.map((fa: any) =>
                fa._id === action.payload.response._id ? action.payload.response : fa
            );
            state.selectedForeignAgent = null;
        });
        builder.addCase(createForeignAgent.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(getPagedForeignAgents.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.foreignAgents = action.payload.response.result;
        });
        builder.addCase(getAllJobOrders.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.jobOrders = action.payload.response;
        });

        builder.addCase(getJobOrder.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.selectedJobOrder = action.payload.response;
        });
        builder.addCase(updateJobOrder.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.jobOrders = state.jobOrders.map((jo: any) =>
                jo._id === action.payload.response._id ? action.payload.response : jo
            );
            state.selectedJobOrder = null;
        });
        builder.addCase(createJobOrder.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(getPagedJobOrders.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.jobOrders = action.payload.response.result;
        });
    },
});

export default foreignAgentSlice.reducer;
