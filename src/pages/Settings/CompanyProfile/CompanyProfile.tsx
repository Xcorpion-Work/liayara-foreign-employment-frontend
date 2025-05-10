import { Box, Button, Divider, Group, SimpleGrid, Stack, Table, Text, Textarea, TextInput } from "@mantine/core";
import { IconArrowLeft, IconKeyboard } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizationData, updateOrganizationData } from "../../../store/userSlice/userSlice.ts";
import toNotify from "../../../helpers/toNotify.tsx";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import { isNotEmpty, useForm } from "@mantine/form";
import { isValidEmail, isValidPhone } from "../../../utils/inputValidators.ts";
import { useMediaQuery } from "@mantine/hooks";

interface UserFormValues {
    name: string;
    phone: string;
    altPhone: string;
    email: string;
    faxNo: string;
    address: string;
    licenceCode: string;
    embassyRegNo: string;
}

const CompanyProfile = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const dispatch = useDispatch<AppDispatch>();
    const [isEditMode, setIsEditMode] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const selectedUser = useSelector((state: RootState) => state.user.selectedUser);
    const organizationData = useSelector((state: RootState) => state.user.organizationData);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        setLoading(true);
        if (selectedUser && isEditMode) {
            form.setValues({
                name: organizationData.name || "",
                phone: organizationData.phone || "",
                altPhone: selectedUser.altPhone || "",
                email: selectedUser.email || "",
                faxNo: selectedUser.faxNo || "",
                address: selectedUser.address || "",
                licenceCode: selectedUser.licenceCode || "",
                embassyRegNo: selectedUser.embassyRegNo || "",
            });
            form.resetDirty();
        }
        setLoading(false);
    }, [isEditMode, organizationData]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getOrganizationData());
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
            name: "",
            phone: "",
            altPhone: "",
            email: "",
            faxNo: "",
            address: "",
            licenceCode: "",
            embassyRegNo: "",
        },
        validate: {
            name: (value) => {
                if (!value) {
                    return "First name is required";
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
            faxNo: (value) => {
                if (!value) {
                    return null;
                }
                if (!isValidPhone(value)) {
                    return "Fax number is invalid";
                }
                return null;
            },
            address: isNotEmpty("Address is required"),
            licenceCode: isNotEmpty("Licence code is required"),
            embassyRegNo: isNotEmpty("Embassy register number is required"),
        },
    });

    const handleSubmitOrganizationData = async () => {
        setLoading(true);
        try {
            const payload = form.values;

            const response = await dispatch(updateOrganizationData(payload));

            if (response.type === "user/updateOrganizationData/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Organization Data updated successfully", "SUCCESS");
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
                                Company Profile
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
                            <Button
                                leftSection={<IconKeyboard size={20} />}
                                fullWidth={isMobile}
                                onClick={() => setIsEditMode(true)}
                                size="sm"
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
                                    <Table.Td>{organizationData?.name}</Table.Td>
                                </Table.Tr>

                                {/* Phone */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Phone:</Table.Td>
                                    <Table.Td>{organizationData?.phone}</Table.Td>
                                </Table.Tr>

                                {/* Alternative Phone */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Phone 2:</Table.Td>
                                    <Table.Td>{organizationData?.altPhone || "-"}</Table.Td>
                                </Table.Tr>

                                {/* Email */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Email:</Table.Td>
                                    <Table.Td>{organizationData?.email || "-"}</Table.Td>
                                </Table.Tr>

                                {/* Fax No */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Fax No:</Table.Td>
                                    <Table.Td>{organizationData?.faxNo || "-"}</Table.Td>
                                </Table.Tr>

                                {/* Address */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Address:</Table.Td>
                                    <Table.Td>{organizationData?.address || "-"}</Table.Td>
                                </Table.Tr>

                                {/* Date of Birth */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Licence Code:</Table.Td>
                                    <Table.Td>{organizationData?.licenceCode || "-"}</Table.Td>
                                </Table.Tr>

                                {/* NIC */}
                                <Table.Tr>
                                    <Table.Td fw="bold">Embassy Registration Number:</Table.Td>
                                    <Table.Td>{selectedUser?.embassyRegNo || "-"}</Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <form onSubmit={form.onSubmit(handleSubmitOrganizationData)}>
                            <Text size="md" fw={500} mt="xs" mb="sm">
                                Contact Information
                            </Text>

                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <TextInput
                                    label="Name"
                                    placeholder="Enter name"
                                    withAsterisk
                                    disabled
                                    {...form.getInputProps("name")}
                                />
                                <TextInput
                                    label="Phone"
                                    placeholder="Enter phone number"
                                    withAsterisk
                                    {...form.getInputProps("phone")}
                                />
                                <TextInput
                                    label="Phone 2"
                                    placeholder="Enter phone number 2"
                                    withAsterisk
                                    {...form.getInputProps("altPhone")}
                                />
                                <TextInput
                                    label="Email"
                                    placeholder="Enter email"
                                    withAsterisk
                                    {...form.getInputProps("email")}
                                />
                                <TextInput
                                    label="Fax No"
                                    placeholder="Enter fax number"
                                    withAsterisk
                                    {...form.getInputProps("faxNo")}
                                />
                                <Textarea
                                    label="Address"
                                    placeholder="Enter address"
                                    withAsterisk
                                    {...form.getInputProps("address")}
                                />
                            </SimpleGrid>

                            {/* --- Contact Information Section --- */}
                            <Text size="md" fw={500} mt="xl" mb="sm">
                                Company Information
                            </Text>

                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <TextInput
                                    label="Licence Code"
                                    placeholder="Enter License Code"
                                    withAsterisk
                                    {...form.getInputProps("licenceCode")}
                                />
                                <TextInput
                                    label="Embassy Register Number"
                                    placeholder="Enter embassy register number"
                                    withAsterisk
                                    {...form.getInputProps("embassyRegNo")}
                                />
                            </SimpleGrid>

                            <Group mt="md">
                                <Group ml="auto">
                                    <Button color="red" onClick={() => setIsEditMode(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!form.isDirty()}>
                                        Update Organization Data
                                    </Button>
                                </Group>
                            </Group>
                        </form>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default CompanyProfile;
