import { createAsyncThunk, createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface SettingState {
    localAgents: any;
    selectedLocalAgent: any;
    status: string;
    error: string;
}

const initialState: SettingState = {
    localAgents: [],
    selectedLocalAgent: {},
    status: "idle",
    error: "",
};

export const getAllLocalAgents = createAsyncThunk(
    "localAgent/getAllLocalAgents",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/local-agents/local-agents`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getLocalAgent = createAsyncThunk("localAgent/getLocalAgent", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/local-agents/local-agent/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const createLocalAgent = createAsyncThunk(
    "localAgent/createLocalAgent",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/local-agents/local-agent`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const updateLocalAgent = createAsyncThunk(
    "localAgent/updateLocalAgent",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/local-agents/local-agent/${payload.id}`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

export const getPagedLocalAgents = createAsyncThunk(
    "localAgent/getPagedLocalAgents",
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/local-agents/paged-local-agents`, payload);
            return response.data;
        } catch (err: any) {
            throw rejectWithValue(err.response.data);
        }
    }
);

const localAgentSlice = createSlice({
    name: "localAgent",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllLocalAgents.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.localAgents = action.payload.response;
        });
        builder.addCase(getLocalAgent.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.selectedLocalAgent = action.payload.response;
        });
        builder.addCase(updateLocalAgent.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.localAgents = state.localAgents.map((agent: any) =>
                agent._id === action.payload.response._id ? action.payload.response : agent
            );
            state.selectedLocalAgent = null;
        });
        builder.addCase(createLocalAgent.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(getPagedLocalAgents.fulfilled, (state: Draft<SettingState>, action: PayloadAction<any>) => {
            state.localAgents = action.payload.response.result;
        });
    },
});

export default localAgentSlice.reducer;
