import {
    Box,
    Button,
    Divider,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { useForm } from "@mantine/form";
import { isValidPhone } from "../../../utils/inputValidators.ts";
import {
    createLocalAgent,
    getLocalAgent,
    updateLocalAgent,
} from "../../../store/localAgentSlice/localAgentSlice.ts";

interface UserFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    altPhone: string;
    email: string;
    address: string;
    remark: string;
}

const AddEditLocalAgent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const userId = searchParams.get("id");
    const isEditMode = Boolean(userId);

    const selectedLocalAgent = useSelector((state: RootState) => state.localAgent.selectedLocalAgent);

    useEffect(() => {
        if (isEditMode) {
            fetchLocalAgent();
        }
    }, []);

    useEffect(() => {
        if (selectedLocalAgent && isEditMode) {
            const [firstName = "", lastName = ""] = selectedLocalAgent?.name?.split(" ") || [];
            form.setValues({
                address: selectedLocalAgent.address || "",
                altPhone: selectedLocalAgent.altPhone || "",
                email: selectedLocalAgent.email || "",
                phone: selectedLocalAgent.phone || "",
                remark: selectedLocalAgent.remark || "",
                firstName: firstName || "",
                lastName: lastName || "",
            });
            form.resetDirty();
        }
    }, [selectedLocalAgent]);

    const fetchLocalAgent = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getLocalAgent(userId));
            if (response.type === "localAgent/getLocalAgent/rejected") {
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
            firstName: (value) =>
                !value ? "First name is required" : /^[A-Za-z]+$/.test(value) ? null : "First name must contain only letters",
            lastName: (value) =>
                !value ? "Last name is required" : /^[A-Za-z]+$/.test(value) ? null : "Last name must contain only letters",
            phone: (value) =>
                !value ? "Phone number is required" : isValidPhone(value) ? null : "Phone number is invalid",
            altPhone: (value) =>
                value && !isValidPhone(value) ? "Phone number is invalid" : null,
        },
    });

    const handleSubmitLocalAgent = async () => {
        setLoading(true);
        try {
            const name = `${form.values.firstName} ${form.values.lastName}`;
            const payload = { name, ...form.values };

            let response;
            if (isEditMode) {
                response = await dispatch(updateLocalAgent({ id: userId, ...payload }));
            } else {
                response = await dispatch(createLocalAgent(payload));
            }

            if (
                response.type === "localAgent/createLocalAgent/rejected" ||
                response.type === "localAgent/updateLocalAgent/rejected"
            ) {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify(
                    "Success",
                    isEditMode ? "Local agent updated successfully" : "Local agent saved successfully",
                    "SUCCESS"
                );
                if (isEditMode) {
                    navigate(-1);
                } else {
                    navigate("/app/local-agents/registry");
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
                                        ? `Edit Local Agent - ${selectedLocalAgent?.localAgentId || "-"}`
                                        : "Add Local Agent"}
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">{isEditMode ? "Edit" : "Add"} local agents</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Form */}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitLocalAgent)}>
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
                                {isEditMode ? "Update Local Agent" : "Create Local Agent"}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default AddEditLocalAgent;
