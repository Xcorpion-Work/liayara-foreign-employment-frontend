import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

import { AuthLoaderChecker } from "./utils/authChecker.ts";
import { Notifications } from "@mantine/notifications";
// import Loading from "./components/Loading.tsx";
const Loading = React.lazy(() => import("./components/Loading.tsx"));
import { LoadingProvider } from "./helpers/loadingContext.tsx";
import { DatesProvider } from "@mantine/dates";
import { redirect } from "react-router-dom";

const authChecker = async () => {
    const isAuthenticated = Boolean(localStorage.getItem("ACCESS_TOKEN"));
    if (isAuthenticated) {
        return redirect("/app/dashboard"); // Redirect if already logged in
    }
    return null;
};

const LoginPage = React.lazy(() => import("./pages/LoginPage.tsx"));
const AppLayout = React.lazy(() => import("./layouts/AppLayout.tsx"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage.tsx"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage.tsx"));
const CompanyProfile = React.lazy(
    () => import("./pages/Settings/CompanyProfile.tsx")
);
const PersonalProfile = React.lazy(
    () => import("./pages/Settings/PersonalProfile.tsx")
);
const UserManagement = React.lazy(
    () => import("./pages/Settings/UserManagement.tsx")
);
const RoleManagement = React.lazy(
    () => import("./pages/Settings/RoleManagement.tsx")
);

const router = createBrowserRouter([
    {
        path: "app",
        element: <AppLayout />,
        loader: AuthLoaderChecker,
        children: [
            // dashboard route
            {
                path: "dashboard",
                element: <DashboardPage />,
            },

            // settings routes
            {
                path: "settings",
                element: <SettingsPage />,
            },
            // settings sub
            {
                path: "settings/company-profile",
                element: <CompanyProfile />,
            },
            {
                path: "settings/personal-profile",
                element: <PersonalProfile />,
            },
            {
                path: "settings/user-management",
                element: <UserManagement />,
            },
            {
                path: "settings/role-management",
                element: <RoleManagement />,
            },

            // etc.
            {
                path: "*",
                element: <Navigate to="/app/dashboard" replace />,
            },
        ],
    },
    {
        path: "/",
        element: <Navigate to="/app/dashboard" replace />,
    },
    {
        path: "login",
        element: <LoginPage />,
        loader: authChecker,
    },
]);

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <MantineProvider
            defaultColorScheme="light"
            theme={{ fontFamily: "Ubuntu, sans-serif" }}
        >
            <DatesProvider settings={{ timezone: "UTC" }}>
                <Suspense fallback={<Loading />}>
                    <LoadingProvider>
                        <Notifications position="top-right" mt={50} />
                        <StrictMode>
                            <RouterProvider router={router} />
                        </StrictMode>
                    </LoadingProvider>
                </Suspense>
            </DatesProvider>
        </MantineProvider>
    </Provider>
);
