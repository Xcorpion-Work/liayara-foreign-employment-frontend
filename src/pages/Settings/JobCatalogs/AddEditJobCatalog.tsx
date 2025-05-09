import { Box, Button, Divider, Flex, Group, Select, Stack, Switch, Text, TextInput } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../helpers/toNotify.tsx";
import { isNotEmpty, useForm } from "@mantine/form";
import { createJobCatalog, getJobCatalog, updateJobCatalog } from "../../../store/settingSlice/settingSlice.ts";
import { useMediaQuery } from "@mantine/hooks";

interface FormInterface {
    name: string;
    from: Date | null;
    to: Date | null;
    specification: string;
    gender: string;
    doesChargeByPassenger: boolean;
}

const AddEditJobCatalog = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const jobId = searchParams.get("id"); // 👈 extracted role ID
    const isEditMode = Boolean(jobId);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const selectedRole = useSelector((state: RootState) => state.user.selectedRole);

    useEffect(() => {
        if (isEditMode) {
            fetchJobCatalog();
        }
    }, []);

    useEffect(() => {
        if (selectedRole && isEditMode) {
            form.setValues({
                name: selectedRole.name || "",
            });
            form.resetDirty();
        }
    }, [selectedRole]);

    const fetchJobCatalog = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getJobCatalog(jobId));
            if (response.type === "user/getJobCatalog/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<FormInterface>({
        initialValues: {
            name: "",
            from: null,
            to: null,
            specification: "",
            gender: "",
            doesChargeByPassenger: false,
        },
        validate: {
            name: isNotEmpty("Name is required"),
            from: (value, values) => (values.to && !value ? "From date is required when To date is selected" : null),
            to: (value, values) => (values.from && !value ? "To date is required when From date is selected" : null),
            gender: isNotEmpty("Gender is required"),
        },
    });

    const handleSubmitRole = async () => {
        setLoading(true);
        try {
            const ageLimit = {
                from: form.values.from,
                to: form.values.to,
            };
            const payload = { ...form.values, ageLimit };

            let response;
            if (isEditMode) {
                response = await dispatch(updateJobCatalog({ id: jobId, ...payload }));
            } else {
                response = await dispatch(createJobCatalog(payload));
            }
            if (
                response.type === "setting/createJobCatalog/rejected" ||
                response.type === "setting/updateJobCatalog/rejected"
            ) {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify(
                    "Success",
                    isEditMode ? "Job catalog updated successfully" : "Job catalog saved successfully",
                    "SUCCESS"
                );
                navigate("/app/settings/job-catalogs");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };
    const ageOptions = Array.from({ length: 85 }, (_, i) => {
        const value = (i + 16).toString();
        return { value, label: value };
    });

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
                                    {isEditMode ? "Edit Job Catalog" : "Add Job Catalog"}
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">{isEditMode ? "Edit" : "Add"} job catalog of your organization</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitRole)}>
                        <Flex gap="xs" direction={isMobile ? "column" : "row"} mb="xs">
                            <TextInput
                                label="Name"
                                withAsterisk
                                placeholder="Enter name"
                                w={{ lg: "50%", sm: "100%" }}
                                {...form.getInputProps("name")}
                            />
                            <TextInput
                                label="Specification"
                                placeholder="Enter specification"
                                w={{ lg: "50%", sm: "100%" }}
                                maxLength={60}
                                {...form.getInputProps("specification")}
                            />
                        </Flex>
                        <Flex gap="sm" direction={isMobile ? "column" : "row"} mb="xs">
                            <Select
                                label="From Age"
                                placeholder="Select from age"
                                searchable
                                data={ageOptions}
                                clearable
                                w={{ lg: "50%", sm: "100%" }}
                                {...form.getInputProps("from")}
                            />
                            <Select
                                label="To Age"
                                placeholder="Select to age"
                                searchable
                                data={ageOptions}
                                clearable
                                w={{ lg: "50%", sm: "100%" }}
                                {...form.getInputProps("to")}
                            />
                        </Flex>

                        <Flex gap="sm" direction={isMobile ? "column" : "row"} mb="xs">
                            <Select
                                label="Gender"
                                placeholder="Select gender"
                                data={["Male", "Female"]}
                                withAsterisk
                                w={{ lg: "50%", sm: "100%" }}
                                {...form.getInputProps("gender")}
                            />

                            <Group align="flex-end">
                                <Switch
                                    size="sm"
                                    checked={form.values.doesChargeByPassenger}
                                    label="Does Charge By Passenger"
                                    onChange={() =>
                                        form.setFieldValue("doesChargeByPassenger", !form.values.doesChargeByPassenger)
                                    }
                                />
                            </Group>
                        </Flex>

                        <Group mt="md">
                            <Button type="submit" ml="auto" disabled={!form.isDirty()}>
                                {isEditMode ? "Update Job Catalog" : "Create Job Catalog"}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default AddEditJobCatalog;
