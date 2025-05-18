import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface SettingState {
    status: string;
    error: string;
}

const initialState: SettingState = {
    status: "idle",
    error: "",
};

export const fileUpload = createAsyncThunk("file/fileUpload", async (formData: FormData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/files/file-upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data || err.message);
    }
});

const fileUploadSlice = createSlice({
    name: "fileUpload",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fileUpload.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload.response;
        });
    },
});

export default fileUploadSlice.reducer;
