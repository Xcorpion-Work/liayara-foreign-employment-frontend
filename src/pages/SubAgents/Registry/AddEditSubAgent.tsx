import { Box, Button, Divider, Group, SimpleGrid, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { useForm } from "@mantine/form";
import { isValidPhone } from "../../../utils/inputValidators.ts";
import { createSubAgent, getSubAgent, updateSubAgent } from "../../../store/subAgentSlice/subAgentSlice.ts";

interface UserFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    altPhone: string;
    email: string;
    address: string;
    remark: string;
}

const AddEditSubAgent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const userId = searchParams.get("id"); // 👈 extracted role ID
    const isEditMode = Boolean(userId);

    const selectedSubAgent = useSelector((state: RootState) => state.subAgent.selectedSubAgent);

    useEffect(() => {
        if (isEditMode) {
            fetchSubAgent();
        }
    }, []);

    useEffect(() => {
        if (selectedSubAgent && isEditMode) {
            const [firstName = "", lastName = ""] = selectedSubAgent?.name?.split(" ") || [];
            form.setValues({
                address: selectedSubAgent.address || "",
                altPhone: selectedSubAgent.altPhone || "",
                email: selectedSubAgent.email || "",
                phone: selectedSubAgent.phone || "",
                remark: selectedSubAgent.remark || "",
                firstName: firstName || "",
                lastName: lastName || "",
            });
            form.resetDirty();
        }
    }, [selectedSubAgent]);

    const fetchSubAgent = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getSubAgent(userId));
            if (response.type === "subAgent/getSubAgent/rejected") {
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
        },
    });

    const handleSubmitSubAgent = async () => {
        setLoading(true);
        try {
            const name = `${form.values.firstName} ${form.values.lastName}`;
            const payload = { name, ...form.values };

            let response;
            if (isEditMode) {
                response = await dispatch(updateSubAgent({ id: userId, ...payload }));
            } else {
                response = await dispatch(createSubAgent(payload));
            }
            if (
                response.type === "subAgent/createSubAgent/rejected" ||
                response.type === "subAgent/updateSubAgent/rejected"
            ) {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify(
                    "Success",
                    isEditMode ? "Sub agent updated successfully" : "Sub agent saved successfully",
                    "SUCCESS"
                );
                if (isEditMode) {
                    navigate(-1);
                } else {
                    navigate("/app/sub-agents/registry");
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
                                    {isEditMode ? `Edit Sub Agent - ${selectedSubAgent?.subAgentId || "-"}` : "Add Sub Agent"}
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
                    <form onSubmit={form.onSubmit(handleSubmitSubAgent)}>
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
                                {isEditMode ? "Update Sub Agent" : "Create Sub Agent"}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default AddEditSubAgent;
