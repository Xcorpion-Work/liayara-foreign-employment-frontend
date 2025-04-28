import { Box, Button, Divider, Group, Select, SimpleGrid, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../helpers/toNotify.tsx";
import { addUser, getRoles, getUser, updateUser } from "../../../store/userSlice/userSlice.ts";
import { isNotEmpty, useForm } from "@mantine/form";
import { isValidEmail, isValidPhone } from "../../../utils/inputValidators.ts";
import { DateInput } from "@mantine/dates";

interface UserFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    altPhone: string;
    email: string;
    address: string;
    role: string;
    nic: string;
    dateOfBirth: Date | undefined; // ✅ Important: allow Date
    remark: string;
}

const AddEditUser = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const userId = searchParams.get("id"); // 👈 extracted role ID
    const isEditMode = Boolean(userId);

    const roles = useSelector((state: RootState) => state.user.roles);
    const selectedUser = useSelector((state: RootState) => state.user.selectedUser);

    useEffect(() => {
        if (isEditMode) {
            fetchUser();
        }
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedUser && isEditMode) {
            const [firstName = "", lastName = ""] = selectedUser?.username?.split(" ") || [];
            form.setValues({
                address: selectedUser.address || "",
                altPhone: selectedUser.altPhone || "",
                email: selectedUser.email || "",
                nic: selectedUser.nic || "",
                phone: selectedUser.phone || "",
                remark: selectedUser.remark || "",
                role: selectedUser.role?._id || "",
                firstName: firstName || "",
                lastName: lastName || "",
                dateOfBirth: selectedUser?.dateOfBirth ? new Date(selectedUser.dateOfBirth) : undefined,
            });
            form.resetDirty();
        }
    }, [selectedUser]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const filters = { status: true };
            const response = await dispatch(getRoles({ filters }));
            if (response.type === "user/getRoles/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getUser(userId));
            if (response.type === "user/getUser/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<UserFormValues>({
        initialValues: {
            firstName: "",
            lastName: "",
            phone: "",
            altPhone: "",
            email: "",
            address: "",
            role: "",
            nic: "",
            dateOfBirth: undefined,
            remark: "",
        },
        validate: {
            firstName: (value) => {
                if (!value) {
                    return "First name is required";
                }
                if (!/^[A-Za-z]+$/.test(value)) {
                    return "First name must contain only letters";
                }
                return null;
            },
            lastName: (value) => {
                if (!value) {
                    return "Last name is required";
                }
                if (!/^[A-Za-z]+$/.test(value)) {
                    return "First name must contain only letters";
                }
                return null;
            },
            phone: (value) => {
                if (!value) {
                    return "Phone number is required";
                }
                if (!isValidPhone(value)) {
                    return "Phone number is invalid";
                }
                return null;
            },
            altPhone: (value) => {
                if (!value) {
                    return null;
                }
                if (!isValidPhone(value)) {
                    return "Phone number is invalid";
                }
                return null;
            },
            email: (value) => {
                if (!value) {
                    return "Email is required";
                }
                if (!isValidEmail(value)) {
                    return "Email is invalid";
                }
            },
            address: isNotEmpty("Address is required"),
            role: isNotEmpty("Role is required"),
            nic: isNotEmpty("NIC is required"),
            dateOfBirth: isNotEmpty("Date of birth is required"),
        },
    });

    const selectableRoles = roles
        ?.filter((r: any) => r.name !== "Super Admin")
        .map((r: any) => ({
            label: r?.name,
            value: r?._id,
        }));

    const handleSubmitUser = async () => {
        setLoading(true);
        try {
            const username = `${form.values.firstName} ${form.values.lastName}`;
            const payload = { username, ...form.values };

            let response;
            if (isEditMode) {
                response = await dispatch(updateUser({ id: userId, ...payload }));
            } else {
                response = await dispatch(addUser(payload));
            }
            if (response.type === "user/addUser/rejected" || response.type === "user/updateUser/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", isEditMode ? "User updated successfully" : "User saved successfully", "SUCCESS");
                navigate("/app/settings/user-management");
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
                                    {isEditMode ? "Edit User" : "Add User"}
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">{isEditMode ? "Edit" : "Add"} users to your company</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitUser)}>
                        <Text size="md" fw={500} mt="md" mb="sm">
                            Personal Information
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <TextInput
                                label="First Name"
                                placeholder="Enter first name"
                                withAsterisk
                                {...form.getInputProps("firstName")}
                            />
                            <TextInput
                                label="Last Name"
                                placeholder="Enter last name"
                                withAsterisk
                                {...form.getInputProps("lastName")}
                            />
                            <DateInput
                                label="Date of Birth"
                                placeholder="Select date of birth"
                                withAsterisk
                                maxDate={new Date()}
                                {...form.getInputProps("dateOfBirth")}
                            />
                            <TextInput
                                label="NIC"
                                placeholder="Enter NIC number"
                                withAsterisk
                                {...form.getInputProps("nic")}
                            />
                        </SimpleGrid>

                        {/* --- Contact Information Section --- */}
                        <Text size="md" fw={500} mt="xl" mb="sm">
                            Contact Information
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <TextInput
                                label="Phone Number"
                                placeholder="Enter phone number"
                                withAsterisk
                                {...form.getInputProps("phone")}
                            />
                            <TextInput
                                label="Alternative Phone"
                                placeholder="Enter alternative phone number"
                                {...form.getInputProps("altPhone")}
                            />
                            <TextInput
                                label="Email"
                                placeholder="Enter email address"
                                withAsterisk
                                {...form.getInputProps("email")}
                            />
                            <Textarea
                                label="Address"
                                placeholder="Enter residential address"
                                autosize
                                withAsterisk
                                minRows={2}
                                {...form.getInputProps("address")}
                            />
                        </SimpleGrid>

                        {/* --- Other Details Section --- */}
                        <Text size="md" fw={500} mt="md" mb="sm">
                            Other Details
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <Select
                                label="Role"
                                placeholder="Select user role"
                                withAsterisk
                                data={selectableRoles}
                                {...form.getInputProps("role")}
                            />
                            <Textarea
                                label="Remark"
                                placeholder="Enter any remarks"
                                autosize
                                minRows={2}
                                {...form.getInputProps("remark")}
                            />
                        </SimpleGrid>

                        <Group mt="md">
                            <Button type="submit" ml="auto" disabled={!form.isDirty()}>
                                {isEditMode ? "Update User" : "Create User"}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default AddEditUser;
