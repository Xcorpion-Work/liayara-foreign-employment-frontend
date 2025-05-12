import { createAsyncThunk, createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../interceptors/axiosInterceptor.ts";

interface UserState {
    users: any;
    roles: any;
    permissions: any;
    selectedUser: any;
    selectedRole: any;
    organizationData: any;
    status: string;
    error: string;
}

const initialState: UserState = {
    users: [],
    roles: [],
    permissions: [],
    selectedUser: {},
    selectedRole: {},
    organizationData: {},
    status: "idle",
    error: "",
};

export const addUser = createAsyncThunk("user/addUser", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/users/signup`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const addRole = createAsyncThunk("user/addRole", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/users/role`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getUsers = createAsyncThunk("user/getUsers", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/users/users`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getOrganizationData = createAsyncThunk("user/getOrganizationData", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/users/organization-data`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const updateOrganizationData = createAsyncThunk("user/updateOrganizationData", async (payload:any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/users/organization-data/${payload.id}`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getRoles = createAsyncThunk("user/getRoles", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/users/roles`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getRole = createAsyncThunk("user/getRole", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/users/role/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getAllPermissions = createAsyncThunk("user/getAllPermissions", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/users/permissions`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getPagedUsers = createAsyncThunk("user/getPagedUsers", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/users/paged-users`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getPagedRoles = createAsyncThunk("user/getPagedRoles", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/users/paged-roles`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getUser = createAsyncThunk("user/getUser", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/users/user/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const getPersonalData = createAsyncThunk("user/getPersonalData", async (id: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/users/personal-data/${id}`);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const updatePersonalData = createAsyncThunk("user/updatePersonalData", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/users/personal-data/${payload.id}`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});


export const updateUser = createAsyncThunk("user/updateUser", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/users/user/${payload.id}`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const updateRole = createAsyncThunk("user/updateRole", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/users/role/${payload.id}`, payload);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

export const changeStatusUser = createAsyncThunk("user/changeStatus", async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/users/change-status/${payload.id}`, payload.values);
        return response.data;
    } catch (err: any) {
        throw rejectWithValue(err.response.data);
    }
});

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addUser.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(addRole.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
        builder.addCase(getUsers.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.users = action.payload.response;
        });
        builder.addCase(getRoles.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.roles = action.payload.response;
        });
        builder.addCase(getAllPermissions.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.permissions = action.payload.response;
        });
        builder.addCase(getPagedUsers.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.users = action.payload.response.result;
        });
        builder.addCase(getPagedRoles.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.roles = action.payload.response.result;
        });
        builder.addCase(getUser.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.selectedUser = action.payload.response;
        });
        builder.addCase(getRole.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.selectedRole = action.payload.response;
        });
        builder.addCase(getOrganizationData.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.organizationData = action.payload.response;
        });
        builder.addCase(updateUser.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.users = state.users.map((user: any) =>
                user._id === action.payload.response._id ? action.payload.response : user
            );
            state.selectedUser = null;
        });
        builder.addCase(updateRole.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.roles = state.roles.map((role: any) =>
                role._id === action.payload.response._id ? action.payload.response : role
            );
            state.selectedRole = {};
        });
        builder.addCase(changeStatusUser.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.users = state.users.map((supplier: any) =>
                supplier._id === action.payload.response._id ? action.payload.response : supplier
            );
            state.selectedUser = null;
        });
        builder.addCase(updateOrganizationData.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.organizationData = action.payload.response;
        });
        builder.addCase(getPersonalData.fulfilled, (state: Draft<UserState>, action: PayloadAction<any>) => {
            state.selectedUser = action.payload.response;
        });
        builder.addCase(updatePersonalData.fulfilled, (_, action: PayloadAction<any>) => {
            return action.payload;
        });
    },
});

export default userSlice.reducer;
