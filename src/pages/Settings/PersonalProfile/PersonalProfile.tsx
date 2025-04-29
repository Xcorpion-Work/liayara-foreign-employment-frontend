import {
    Badge,
    Box,
    Button,
    Divider,
    Group,
    Modal,
    PasswordInput,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { IconArrowLeft, IconKey, IconKeyboard } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { datePreview } from "../../../helpers/preview.tsx";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { getUser, updateUser } from "../../../store/userSlice/userSlice.ts";
import toNotify from "../../../helpers/toNotify.tsx";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { isNotEmpty, useForm } from "@mantine/form";
import { isValidEmail, isValidPhone } from "../../../utils/inputValidators.ts";
import { changePassword } from "../../../store/authSlice/authSlice.ts";

interface UserFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    altPhone: string;
    email: string;
    address: string;
    nic: string;
    dateOfBirth: Date | undefined;
}

interface passwordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const PersonalProfile = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [passwordChangeModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);

    const loggedInUser = useSelector((state: RootState) => state.auth.user);
    const userId = loggedInUser._id;
    const selectedUser = useSelector((state: RootState) => state.user.selectedUser);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        setLoading(true);
        if (selectedUser && isEditMode) {
            const [firstName = "", lastName = ""] = selectedUser?.username?.split(" ") || [];
            form.setValues({
                address: selectedUser.address || "",
                altPhone: selectedUser.altPhone || "",
                email: selectedUser.email || "",
                nic: selectedUser.nic || "",
                phone: selectedUser.phone || "",
                firstName: firstName || "",
                lastName: lastName || "",
                dateOfBirth: selectedUser?.dateOfBirth ? new Date(selectedUser.dateOfBirth) : undefined,
            });
            form.resetDirty();
        }
        setLoading(false);
    }, [isEditMode, selectedUser]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getUser(loggedInUser._id));
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
            nic: "",
            dateOfBirth: undefined,
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
            nic: isNotEmpty("NIC is required"),
            dateOfBirth: isNotEmpty("Date of birth is required"),
        },
    });

    const handleSubmitUser = async () => {
        setLoading(true);
        try {
            const username = `${form.values.firstName} ${form.values.lastName}`;
            const payload = { username, ...form.values };

            const response = await dispatch(updateUser({ id: userId, ...payload }));

            if (response.type === "user/updateUser/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", isEditMode ? "User updated successfully" : "User saved successfully", "SUCCESS");
                await fetchUser();
                setIsEditMode(false);
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const passwordForm = useForm<passwordFormValues>({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validate: {
            currentPassword: isNotEmpty("Current password is required"),
            newPassword: isNotEmpty("New password is required"),
            confirmPassword: (value, values) => {
                if (!value) {
                    return "Confirm password is required";
                }
                if (value !== values.newPassword) {
                    return "Confirm password does not match new password";
                }
                return null;
            },
        },
    });

    const handlePasswordChange = async () => {
        setIsButtonLoading(true);
        try {
            const payload = passwordForm.values;
            const response = await dispatch(changePassword(payload));

            if (response.type === "auth/changePassword/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Password changed successfully", "SUCCESS");
                await fetchUser();
                setIsEditMode(false);
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setIsButtonLoading(false);
        }
    };

    return (
        <>
            {/* Header */}
            <Box display="flex" p="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group>
                            <Group onClick={() => navigate(-1)} className="cursor-pointer">
                                <IconArrowLeft />
                            </Group>
                            <Text size="xl" fw="bold">
                                Personal Profile
                            </Text>
                        </Group>
                        <Group>
                            <Text size="xs">Manage your company details</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    {!isEditMode && (
                        <Group>
                            <Button leftSection={<IconKey size={20} />} size="xs" onClick={openPasswordModal}>
                                Change Your Password
                            </Button>
                            <Button
                                leftSection={<IconKeyboard size={20} />}
                                size="xs"
                                onClick={() => setIsEditMode(true)}
                            >
                                Change Your User Details
                            </Button>
                        </Group>
                    )}
                    <br />

                    {!isEditMode ? (
                        <Table withRowBorders={false} highlightOnHover>
                            <Table.Tbody>
                                {/* Name */}
                                <Table.Tr>
                                    <Table.Td w="30%" fw="bold">
                                        Name:
                                    </Table.Td>
                                    <Table.Td>{selectedUser?.username}</Table.Td>
                                </Table.Tr>

                                {/* Phone */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Phone:</Table.Td>
                                    <Table.Td>{selectedUser?.phone}</Table.Td>
                                </Table.Tr>

                                {/* Alternative Phone */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Phone 2:</Table.Td>
                                    <Table.Td>{selectedUser?.altPhone || "-"}</Table.Td>
                                </Table.Tr>

                                {/* Email */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Email:</Table.Td>
                                    <Table.Td>{selectedUser?.email}</Table.Td>
                                </Table.Tr>

                                {/* Address */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Address:</Table.Td>
                                    <Table.Td>{selectedUser?.address}</Table.Td>
                                </Table.Tr>

                                {/* Date of Birth */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Date of Birth:</Table.Td>
                                    <Table.Td>{datePreview(selectedUser?.dateOfBirth)}</Table.Td>
                                </Table.Tr>

                                {/* NIC */}
                                <Table.Tr>
                                    <Table.Td fw="bold">NIC:</Table.Td>
                                    <Table.Td>{selectedUser?.nic}</Table.Td>
                                </Table.Tr>

                                {/* Role */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Role:</Table.Td>
                                    <Table.Td>
                                        <Badge variant="outline" size={isMobile ? "sm" : "md"}>
                                            {selectedUser?.role?.name || "-"}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>

                                {/* Status */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Status:</Table.Td>
                                    <Table.Td>
                                        <Badge
                                            size={isMobile ? "sm" : "md"}
                                            radius="sm"
                                            color={selectedUser?.status ? "green" : "red"}
                                        >
                                            {selectedUser?.status ? "ACTIVE" : "INACTIVE"}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <form onSubmit={form.onSubmit(handleSubmitUser)}>
                            <Text size="md" fw={500} mt="xs" mb="sm">
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

                            <Group mt="md">
                                <Group ml="auto">
                                    <Button color="red" onClick={() => setIsEditMode(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!form.isDirty()}>
                                        {isEditMode ? "Update User" : "Create User"}
                                    </Button>
                                </Group>
                            </Group>
                        </form>
                    )}
                </Box>
            </Box>

            {/*    Password change modal*/}
            <Modal
                opened={passwordChangeModalOpened}
                onClose={() => {
                    closePasswordModal();
                    passwordForm.reset();
                }}
                title={<Text fw={500}>Change Password</Text>}
            >
                <Stack>
                    <form onSubmit={passwordForm.onSubmit(handlePasswordChange)}>
                        <PasswordInput
                            label="Current Password"
                            placeholder="Enter your current password"
                            withAsterisk
                            {...passwordForm.getInputProps("currentPassword")}
                        />
                        <PasswordInput
                            mt="xs"
                            label="New Password"
                            placeholder="Enter your new password"
                            withAsterisk
                            {...passwordForm.getInputProps("newPassword")}
                        />
                        <PasswordInput
                            mt="xs"
                            label="Confirm New Password"
                            placeholder="Enter your new password again"
                            withAsterisk
                            {...passwordForm.getInputProps("confirmPassword")}
                        />
                        <Button mt="sm" fullWidth loading={isButtonLoading} type="submit">
                            Update Password
                        </Button>
                    </form>
                </Stack>
            </Modal>
        </>
    );
};

export default PersonalProfile;
