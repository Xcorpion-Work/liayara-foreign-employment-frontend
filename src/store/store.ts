import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice/authSlice";
import dashboardReducer from "./dashboardSlice/dashboardSlice";
import userReducer from "./userSlice/userSlice";
import settingReducer from "./settingSlice/settingSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        user: userReducer,
        setting: settingReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
