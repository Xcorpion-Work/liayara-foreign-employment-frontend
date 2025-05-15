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
import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";
import "./layout.css";

import { AuthLoaderChecker } from "./utils/authChecker.ts";
import { Notifications } from "@mantine/notifications";

const Loading = React.lazy(() => import("./components/Loading.tsx"));
import { LoadingProvider } from "./hooks/loadingContext.tsx";
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
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage.tsx"));
const PinInputPage = React.lazy(() => import("./pages/PinInputPage.tsx"));
const AppLayout = React.lazy(() => import("./layouts/AppLayout.tsx"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage.tsx"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage.tsx"));
const CompanyProfile = React.lazy(() => import("./pages/Settings/CompanyProfile/CompanyProfile.tsx"));
const PersonalProfile = React.lazy(() => import("./pages/Settings/PersonalProfile/PersonalProfile.tsx"));
const UserManagement = React.lazy(() => import("./pages/Settings/UserManagement"));
const RoleManagement = React.lazy(() => import("./pages/Settings/RoleManagement"));
const AddEditRole = React.lazy(() => import("./pages/Settings/RoleManagement/AddEditRole.tsx"));
const ViewRole = React.lazy(() => import("./pages/Settings/RoleManagement/ViewRole.tsx"));
const ViewUser = React.lazy(() => import("./pages/Settings/UserManagement/ViewUser.tsx"));
const AddEditUser = React.lazy(() => import("./pages/Settings/UserManagement/AddEditUser.tsx"));
const PassengerStatus = React.lazy(() => import("./pages/Settings/PassengerStatus"));
const EditPassengerStatus = React.lazy(() => import("./pages/Settings/PassengerStatus/EditPassengerStatus.tsx"));
const PassengerDocuments = React.lazy(() => import("./pages/Settings/PassengerDocumentTypes"));
const JobCatalogs = React.lazy(() => import("./pages/Settings/JobCatalogs"));
const AddEditJobCatalogs = React.lazy(() => import("./pages/Settings/JobCatalogs/AddEditJobCatalog.tsx"));
const Qualifications = React.lazy(() => import("./pages/Settings/Qualifications"));
const Countries = React.lazy(() => import("./pages/Settings/Countries"));

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
                path: "settings/user-management/view/:id",
                element: <ViewUser />,
            },
            {
                path: "settings/role-management",
                element: <RoleManagement />,
            },
            {
                path: "settings/role-management/add-edit",
                element: <AddEditRole />,
            },
            {
                path: "settings/user-management/add-edit",
                element: <AddEditUser />,
            },
            {
                path: "settings/role-management/view/:id",
                element: <ViewRole />,
            },
            {
                path: "settings/passenger-status",
                element: <PassengerStatus />,
            },
            {
                path: "settings/passenger-status/edit",
                element: <EditPassengerStatus />,
            },
            {
                path: "settings/passenger-documents",
                element: <PassengerDocuments />,
            },
            {
                path: "settings/job-catalog",
                element: <JobCatalogs />,
            },
            {
                path: "settings/job-catalog/add-edit",
                element: <AddEditJobCatalogs />,
            },
            {
                path: "settings/qualifications",
                element: <Qualifications />,
            },
            {
                path: "settings/countries",
                element: <Countries />,
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
    {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
    },
    {
        path: "pin-input",
        element: <PinInputPage />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <MantineProvider defaultColorScheme="light" theme={{ fontFamily: "Ubuntu, sans-serif" }}>
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
