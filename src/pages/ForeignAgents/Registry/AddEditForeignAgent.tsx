import { Box, Button, Divider, Group, Select, SimpleGrid, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { isNotEmpty, useForm } from "@mantine/form";
import { isValidPhone } from "../../../utils/inputValidators.ts";
import {
    createForeignAgent,
    getForeignAgent,
    updateForeignAgent,
} from "../../../store/foreignAgentSlice/foreignAgentSlice.ts";
import { getAllCountries } from "../../../store/settingSlice/settingSlice.ts";

interface ForeignAgentFormValues {
    firstName: string;
    lastName: string;
    companyName: string;
    country: string;
    phone: string;
    altPhone: string;
    email: string;
    fax: string;
    address: string;
    remark: string;
}

const AddEditForeignAgent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const foreignAgentId = searchParams.get("id"); // 👈 extracted role ID
    const isEditMode = Boolean(foreignAgentId);

    const selectedForeignAgent = useSelector((state: RootState) => state.foreignAgent.selectedForeignAgent);
    const countries = useSelector((state: RootState) => state.setting.countries);

    useEffect(() => {
        if (isEditMode) {
            fetchForeignAgent();
        }
        fetchCountries();
    }, []);

    useEffect(() => {
        if (selectedForeignAgent && isEditMode) {
            const [firstName = "", lastName = ""] = selectedForeignAgent?.name?.split(" ") || [];
            form.setValues({
                country: selectedForeignAgent.country || "",
                phone: selectedForeignAgent.phone || "",
                altPhone: selectedForeignAgent.altPhone || "",
                email: selectedForeignAgent.email || "",
                address: selectedForeignAgent.address || "",
                fax: selectedForeignAgent.fax || "",
                remark: selectedForeignAgent.remark || "",
                firstName: firstName || "",
                lastName: lastName || "",
            });
            form.resetDirty();
        }
    }, [selectedForeignAgent]);

    const fetchForeignAgent = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getForeignAgent(foreignAgentId));
            if (response.type === "foreignAgent/getForeignAgent/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const filters = { status: true };
            const response = await dispatch(getAllCountries({ filters }));
            if (response.type === "setting/getAllCountries/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<ForeignAgentFormValues>({
        initialValues: {
            firstName: "",
            lastName: "",
            companyName: "",
            country: "",
            phone: "",
            altPhone: "",
            email: "",
            fax: "",
            address: "",
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
            country: isNotEmpty("Country is required"),
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
        },
    });

    const handleSubmitForeignAgent = async () => {
        setLoading(true);
        try {
            const name = `${form.values.firstName} ${form.values.lastName}`;
            const payload = { name, ...form.values };

            let response;
            if (isEditMode) {
                response = await dispatch(updateForeignAgent({ id: foreignAgentId, ...payload }));
            } else {
                response = await dispatch(createForeignAgent(payload));
            }
            if (
                response.type === "foreignAgent/createForeignAgent/rejected" ||
                response.type === "foreignAgent/updateForeignAgent/rejected"
            ) {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify(
                    "Success",
                    isEditMode ? "Foreign agent updated successfully" : "Foreign agent saved successfully",
                    "SUCCESS"
                );
                if (isEditMode) {
                    navigate(-1);
                } else {
                    navigate("/app/foreign-agents/registry");
                }
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
                                    {isEditMode
                                        ? `Edit Foreign Agent - ${selectedForeignAgent?.foreignAgentId || "-"}`
                                        : "Add Foreign Agent"}
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">{isEditMode ? "Edit" : "Add"} foreign agents</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitForeignAgent)}>
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
                            <TextInput
                                label="Company Name"
                                placeholder="Enter company name"
                                {...form.getInputProps("companyName")}
                            />
                            <Select
                                label="Country"
                                placeholder="Select country"
                                withAsterisk
                                data={countries.map((c:any) => {return {label: c.name, value: c._id}})}
                                {...form.getInputProps("country")}
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
                                {...form.getInputProps("email")}
                            />
                            <Textarea
                                label="Address"
                                placeholder="Enter residential address"
                                autosize
                                minRows={2}
                                {...form.getInputProps("address")}
                            />
                        </SimpleGrid>

                        {/* --- Other Details Section --- */}
                        <Text size="md" fw={500} mt="md" mb="sm">
                            Other Details
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
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
                                {isEditMode ? "Update Foreign Agent" : "Create Foreign Agent"}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default AddEditForeignAgent;
