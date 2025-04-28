import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const usePermission = () => {
    const loggedInUser = useSelector((state: RootState) => state.auth.user);
    const permissionCodes = loggedInUser?.permissionCodes || [];

    const hasPrivilege = (permission: string): boolean => {
        return permissionCodes.includes(permission);
    };

    const hasAnyPrivilege = (permissions: string[]): boolean => {
        return permissions.some(permission => permissionCodes.includes(permission));
    };

    return { hasPrivilege, hasAnyPrivilege };
};
