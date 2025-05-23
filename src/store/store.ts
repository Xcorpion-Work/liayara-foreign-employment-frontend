import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice/authSlice";
import dashboardReducer from "./dashboardSlice/dashboardSlice";
import userReducer from "./userSlice/userSlice";
import settingReducer from "./settingSlice/settingSlice";
import subAgentReducer from "./subAgentSlice/subAgentSlice";
import foreignAgentReducer from "./foreignAgentSlice/foreignAgentSlice";
import localAgentReducer from "./localAgentSlice/localAgentSlice";
import fileUploadReducer from "./fileUploadSlice/fileUploadSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        user: userReducer,
        setting: settingReducer,
        subAgent: subAgentReducer,
        foreignAgent: foreignAgentReducer,
        localAgent: localAgentReducer,
        fileUpload: fileUploadReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
