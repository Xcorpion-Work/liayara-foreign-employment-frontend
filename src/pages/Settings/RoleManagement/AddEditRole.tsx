import { Box, Button, Checkbox, Divider, Group, Stack, Table, Text, TextInput } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../helpers/toNotify.tsx";
import { addRole, getAllPermissions, getRole, updateRole } from "../../../store/userSlice/userSlice.ts";
import { isNotEmpty, useForm } from "@mantine/form";

const AddEditRole = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const roleId = searchParams.get("id"); // 👈 extracted role ID
    const isEditMode = Boolean(roleId);

    const permissions = useSelector((state: RootState) => state.user.permissions);
    const selectedRole = useSelector((state: RootState) => state.user.selectedRole);

    useEffect(() => {
        if (isEditMode) {
            fetchRole();
        }
        fetchPermissions();
    }, []);

    useEffect(() => {
        if (selectedRole && isEditMode) {
            form.setValues({
                name: selectedRole.name || "",
                permissions: selectedRole.permissions || [],
            });
            form.resetDirty();
        }
    }, [selectedRole]);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getAllPermissions());
            if (response.type === "user/getAllPermissions/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const fetchRole = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getRole(roleId));
            if (response.type === "user/getRole/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        initialValues: {
            name: "",
            permissions: [] as string[],
        },
        validate: {
            name: isNotEmpty("Name is required"),
        },
    });

    const togglePermission = (id: string) => {
        if (isEditMode && selectedRole?.permissions.includes(id)) {
            toNotify("Error", "Cannot remove already assigned permission", "ERROR");
            return;
        }
        form.setFieldValue(
            "permissions",
            form.values.permissions.includes(id)
                ? form.values.permissions.filter((pid) => pid !== id) // Remove
                : [...form.values.permissions, id] // Add
        );
    };

    const modules: any = Array.from(new Set(permissions?.map((p: any) => p.module)));

    const handleSubmitRole = async () => {
        setLoading(true);
        try {
            const payload = form.values;
            if (payload.permissions.length < 1) {
                toNotify("Error", "At least one permission should be added", "ERROR");
                return;
            }

            let response;
            if (isEditMode) {
                response = await dispatch(updateRole({ id: roleId, ...payload }));
            } else {
                response = await dispatch(addRole(payload));
            }
            if (response.type === "user/addRole/rejected" || response.type === "user/updateRole/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", isEditMode ? "Role updated successfully" : "Role saved successfully", "SUCCESS");
                navigate("/app/settings/role-management");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Header */}
            <Box display="flex" p="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group justify="space-between" align="center" w="100%">
                            <Group className="cursor-pointer" onClick={() => navigate(-1)}>
                                <IconArrowLeft />
                                <Text size="xl" fw="bold">
                                    {isEditMode ? "Edit Role" : "Add Role"}
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">{isEditMode ? "Edit" : "Add"} role and set permissions</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitRole)}>
                        <TextInput
                            label="Name"
                            withAsterisk
                            placeholder="Enter role name"
                            w={{ lg: "50%", sm: "100%" }}
                            {...form.getInputProps("name")}
                        />

                        <Table highlightOnHover mt="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Module</Table.Th>
                                    <Table.Th>Create</Table.Th>
                                    <Table.Th>Edit</Table.Th>
                                    <Table.Th>View</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {modules?.map((moduleName: any) => (
                                    <Table.Tr key={moduleName}>
                                        <Table.Td>{moduleName}</Table.Td>

                                        {/* Create Column */}
                                        <Table.Td>
                                            {(() => {
                                                const perm = permissions.find(
                                                    (p: any) => p.module === moduleName && p.code.includes("CREATE")
                                                );
                                                return perm ? (
                                                    <Checkbox
                                                        key={perm._id}
                                                        checked={form.values.permissions.includes(perm._id)}
                                                        onChange={() => togglePermission(perm._id)}
                                                    />
                                                ) : null;
                                            })()}
                                        </Table.Td>

                                        {/* Edit Column */}
                                        <Table.Td>
                                            {(() => {
                                                const perm = permissions.find(
                                                    (p: any) => p.module === moduleName && p.code.includes("EDIT")
                                                );
                                                return perm ? (
                                                    <Checkbox
                                                        key={perm._id}
                                                        checked={form.values.permissions.includes(perm._id)}
                                                        onChange={() => togglePermission(perm._id)}
                                                    />
                                                ) : null;
                                            })()}
                                        </Table.Td>

                                        {/* View Column */}
                                        <Table.Td>
                                            {(() => {
                                                const perm = permissions.find(
                                                    (p: any) => p.module === moduleName && p.code.includes("VIEW")
                                                );
                                                return perm ? (
                                                    <Checkbox
                                                        key={perm._id}
                                                        checked={form.values.permissions.includes(perm._id)}
                                                        onChange={() => togglePermission(perm._id)}
                                                    />
                                                ) : null;
                                            })()}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>

                        <Group mt="md">
                            <Button type="submit" ml="auto" disabled={!form.isDirty()}>
                                {isEditMode ? "Update Role" : "Create Role"}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default AddEditRole;
