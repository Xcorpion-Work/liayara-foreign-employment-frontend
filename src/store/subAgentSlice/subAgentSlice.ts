import { createAsyncThunk, createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface SettingState {
    subAgents: any;
    selectedSubAgent: any;
    status: string;
    error: string;
}

const initialState: SettingState = {
    subAgents: [],
    selectedSubAgent: {},
    status: "idle",
    error: "",
};

export const getAllSubAgents = createAsyncThunk(
    "subAgent/getAllSubAgents",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/sub-agents/sub-agents`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getSubAgent = createAsyncThunk("subAgent/getSubAgent", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/sub-agents/sub-agent/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const createSubAgent = createAsyncThunk("subAgent/createSubAgent", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/sub-agents/sub-agent`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const updateSubAgent = createAsyncThunk("subAgent/updateSubAgent", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/sub-agents/sub-agent/${payload.id}`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getPagedSubAgents = createAsyncThunk(
    "subAgent/getPagedSubAgents",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/sub-agents/paged-sub-agents`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

const subAgentSlice = createSlice({
    name: "subAgent",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllSubAgents.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.subAgents = action.payload.response;
        });
        builder.addCase(getSubAgent.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.selectedSubAgent = action.payload.response;
        });
        builder.addCase(updateSubAgent.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.subAgents = state.subAgents.map((sa: any) =>
                sa._id === action.payload.response._id ? action.payload.response : sa
            );
            state.selectedSubAgent = null;
        });
        builder.addCase(createSubAgent.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(getPagedSubAgents.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.subAgents = action.payload.response.result;
        });
    },
});

export default subAgentSlice.reducer;
