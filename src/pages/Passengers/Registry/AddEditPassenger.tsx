import {
    Box,
    Button,
    Divider,
    Group,
    MultiSelect,
    NumberInput,
    Select,
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
import { useEffect, useState } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { isNotEmpty, useForm } from "@mantine/form";
import { isValidPhone } from "../../../utils/inputValidators.ts";
import { createPassenger, getPassenger, updatePassenger } from "../../../store/passengerSlice/passengerSlice.ts";
import { DatePickerInput } from "@mantine/dates";
import { getAllCountries, getAllJobCatalogs } from "../../../store/settingSlice/settingSlice.ts";
import { getAllSubAgents } from "../../../store/subAgentSlice/subAgentSlice.ts";
import { getAllLocalAgents } from "../../../store/localAgentSlice/localAgentSlice.ts";

interface UserFormValues {
    firstName: string;
    lastName: string;
    nic: string;
    birthday: Date | null;
    religion: "Buddhism" | "Hinduism" | "Islam" | "Christianity" | "Roman Catholic" | "";
    gender: "Male" | "Female" | "";
    maritalStatus: "Single" | "Married" | "Divorced" | "Widowed" | "";
    numberOfChildren: number;
    height: number;
    weight: number;
    desiredJobs: string[];
    desiredCountries: string[];
    phone: string;
    altPhone: string;
    email: string;
    address: string;
    covidVaccinated: string;
    abroadExperience: string;
    subAgent: string;
    localAgent: string;
    remark: string;
}

const AddEditPassenger = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const passengerId = searchParams.get("id");
    const isEditMode = Boolean(passengerId);

    const selectedPassenger = useSelector((state: RootState) => state.passenger.selectedPassenger);
    const jobs = useSelector((state: RootState) => state.setting.jobCatalogs);
    const countries = useSelector((state: RootState) => state.setting.countries);
    const subAgents = useSelector((state: RootState) => state.subAgent.subAgents);
    const localAgents = useSelector((state: RootState) => state.localAgent.localAgents);
    const [passengerType, setPassengerType] = useState<string>("Direct Passenger");

    useEffect(() => {
        if (isEditMode) {
            fetchPassenger();
        }
        fetchJobCatalog();
        fetchCountries();
        fetchAgents();
    }, []);

    useEffect(() => {
        if (selectedPassenger && isEditMode) {
            const [firstName = "", lastName = ""] = selectedPassenger?.name?.split(" ") || [];
            form.setValues({
                nic: selectedPassenger.nic || "",
                birthday: selectedPassenger.birthday ? new Date(selectedPassenger.birthday) : null,
                religion: selectedPassenger.religion || "",
                gender: selectedPassenger.gender || "",
                maritalStatus: selectedPassenger.maritalStatus || "",
                numberOfChildren: selectedPassenger.numberOfChildren || 0,
                height: selectedPassenger.height || 0,
                weight: selectedPassenger.weight || 0,
                desiredJobs: selectedPassenger.desiredJobs || [],
                desiredCountries: selectedPassenger.desiredCountries || [],
                address: selectedPassenger.address || "",
                altPhone: selectedPassenger.altPhone || "",
                email: selectedPassenger.email || "",
                phone: selectedPassenger.phone || "",
                covidVaccinated: selectedPassenger?.covidVaccinated ? "Yes" : "No",
                abroadExperience: selectedPassenger?.abroadExperience ? "Yes" : "No",
                subAgent: selectedPassenger.subAgent || "",
                localAgent: selectedPassenger.localAgent || "",
                remark: selectedPassenger.remark || "",
                firstName: firstName || "",
                lastName: lastName || "",
            });
            form.resetDirty();
        }
    }, [selectedPassenger]);

    const fetchPassenger = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getPassenger(passengerId));
            if (response.type === "passenger/getPassenger/rejected") {
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

    const fetchJobCatalog = async () => {
        setLoading(true);
        try {
            const filters = { status: true };
            const response = await dispatch(getAllJobCatalogs({ filters }));
            if (response.type === "setting/getAllJobCatalogs/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const filters = { status: true };
            const subAgents = await dispatch(getAllSubAgents({ filters }));
            const localAgents = await dispatch(getAllLocalAgents({ filters }));
            if (
                subAgents.type === "subAgent/getAllSubAgents/rejected" ||
                localAgents.type === "localAgent/getAllLocalAgents/rejected"
            ) {
                toNotify("Error", subAgents.payload.error || "Please contact system admin", "ERROR");
                toNotify("Error", localAgents.payload.error || "Please contact system admin", "ERROR");
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
            nic: "",
            birthday: null,
            religion: "",
            gender: "",
            maritalStatus: "",
            numberOfChildren: 0,
            height: 0,
            weight: 0,
            desiredJobs: [],
            desiredCountries: [],
            phone: "",
            altPhone: "",
            email: "",
            address: "",
            covidVaccinated: "No",
            abroadExperience: "No",
            subAgent: "",
            localAgent: "",
            remark: "",
        },
        validate: {
            firstName: (value) =>
                !value
                    ? "First name is required"
                    : /^[A-Za-z]+$/.test(value)
                      ? null
                      : "First name must contain only letters",
            lastName: (value) =>
                !value
                    ? "Last name is required"
                    : /^[A-Za-z]+$/.test(value)
                      ? null
                      : "Last name must contain only letters",
            nic: isNotEmpty("Nic is required"),
            birthday: isNotEmpty("Birthday is required"),
            religion: isNotEmpty("Religion is require"),
            gender: isNotEmpty("Gender is required"),
            maritalStatus: isNotEmpty("Marital status is required"),
            phone: (value) =>
                !value ? "Phone number is required" : isValidPhone(value) ? null : "Phone number is invalid",
            altPhone: (value) => (value && !isValidPhone(value) ? "Phone number is invalid" : null),
            address: isNotEmpty("Address is required"),
            subAgent: (value) => (passengerType === "Sub Agent" && !value ? "Sub agent is required" : null),
            localAgent: (value) => (passengerType === "Local Agent" && !value ? "Local agent is required" : null),
            height: (value) => {
                if (isEditMode && value == 0) {
                    return "Height should not br 0cm";
                }
                return null;
            },
            weight: (value) => {
                if (isEditMode && value == 0) {
                    return "Weight should not br 0cm";
                }
                return null;
            },
            desiredJobs: (value) => {
                if (isEditMode && value.length === 0) {
                    return "At least one desired job selected";
                }
                return null;
            },
            desiredCountries: (value) => {
                if (isEditMode && value.length === 0) {
                    return "At least one desired country selected";
                }
                return null;
            },
        },
    });

    const handleSubmitPassenger = async () => {
        setLoading(true);
        try {
            const name = `${form.values.firstName} ${form.values.lastName}`;
            const payload = { name, ...form.values };

            let response;
            if (isEditMode) {
                response = await dispatch(updatePassenger({ id: passengerId, ...payload }));
            } else {
                response = await dispatch(createPassenger(payload));
            }

            if (
                response.type === "passenger/createPassenger/rejected" ||
                response.type === "passenger/updatePassenger/rejected"
            ) {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify(
                    "Success",
                    isEditMode ? "Passenger updated successfully" : "Passenger saved successfully",
                    "SUCCESS"
                );
                if (isEditMode) {
                    navigate(-1);
                } else {
                    navigate("/app/passengers/registry");
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
                                        ? `Edit Passenger - ${selectedPassenger?.passengerId || "-"}`
                                        : "Add Passenger"}
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">{isEditMode ? "Edit" : "Add"} passenger details</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Form */}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitPassenger)}>
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
                                label="Nic"
                                placeholder="Enter nic nmber"
                                withAsterisk
                                {...form.getInputProps("nic")}
                            />
                            <DatePickerInput
                                label="Birthday"
                                placeholder="Enter birthay"
                                withAsterisk
                                maxDate={new Date()}
                                {...form.getInputProps("birthday")}
                            />
                            <Select
                                label="Religion"
                                data={["Buddhism", "Hinduism", "Islam", "Christianity", "Roman Catholic"]}
                                withAsterisk
                                placeholder="Select a religion"
                                {...form.getInputProps("religion")}
                            />
                            <Select
                                label="Gender"
                                data={["Male", "Female"]}
                                withAsterisk
                                placeholder="Select a gender"
                                {...form.getInputProps("gender")}
                            />
                            <Select
                                label="Marital Status"
                                data={["Single", "Married", "Divorced", "Widowed"]}
                                withAsterisk
                                placeholder="Select a religion"
                                {...form.getInputProps("maritalStatus")}
                            />
                            <NumberInput
                                label="Number of Children"
                                placeholder="Enter chilren count"
                                allowNegative={false}
                                disabled={form.values.maritalStatus === "Single"}
                                {...form.getInputProps("numberOfChildren")}
                            />
                            <NumberInput
                                label="Height"
                                suffix=" CM"
                                withAsterisk={isEditMode}
                                placeholder="Enter height"
                                allowNegative={false}
                                {...form.getInputProps("height")}
                            />
                            <NumberInput
                                label="Weight"
                                suffix=" KG"
                                withAsterisk={isEditMode}
                                placeholder="Enter weight"
                                allowNegative={false}
                                {...form.getInputProps("weight")}
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
                                withAsterisk
                                minRows={2}
                                {...form.getInputProps("address")}
                            />
                        </SimpleGrid>

                        <Text size="md" fw={500} mt="md" mb="sm">
                            Job Details
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <MultiSelect
                                data={
                                    jobs
                                        ?.filter((job:any) => job.gender === form.values.gender || !form.values.gender)
                                        ?.map((job:any) => ({
                                            label: `${job.name}${job.specification ? ` - ${job.specification}` : ""}${job.ageLimit?.from || job.ageLimit?.to ? ` (${job.ageLimit.from || ""}-${job.ageLimit.to || ""})` : ""}`,
                                            value: job._id,
                                        })) || []
                                }
                                placeholder="Select desired jobs"
                                label="Desired Job"
                                withAsterisk={isEditMode}
                                clearable
                                searchable
                                {...form.getInputProps("desiredJobs")}
                            />
                            <MultiSelect
                                data={countries?.map((country: any) => ({ label: country.name, value: country._id }))}
                                placeholder="Select a desired country"
                                label="Desired Country"
                                withAsterisk={isEditMode}
                                {...form.getInputProps("desiredCountries")}
                            />
                        </SimpleGrid>

                        <Text size="md" fw={500} mt="md" mb="sm">
                            Other Details
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <Select
                                label="Covid Vaccinated"
                                data={["Yes", "No"]}
                                placeholder="Select covid vaccinated or not"
                                {...form.getInputProps("covidVaccinated")}
                            />
                            <Select
                                label="Abroad Experience"
                                data={["Yes", "No"]}
                                placeholder="Select have abroad expreince or not"
                                {...form.getInputProps("abroadExperience")}
                            />
                            <Select
                                data={["Direct Passenger", "Sub Agent", "Local Agent"]}
                                value={passengerType}
                                label="Passenger Type"
                                onChange={(v: any) => setPassengerType(v)}
                            />
                            {passengerType === "Sub Agent" && (
                                <Select
                                    data={subAgents?.map((sa: any) => ({ label: sa.name, value: sa._id }))}
                                    value={passengerType}
                                    placeholder="Select a sub agent"
                                    label="Sub Agent"
                                    withAsterisk
                                    {...form.getInputProps("subAgent")}
                                />
                            )}
                            {passengerType === "Local Agent" && (
                                <Select
                                    data={localAgents?.map((sa: any) => ({ label: sa.name, value: sa._id }))}
                                    placeholder="Select a local agent"
                                    value={passengerType}
                                    withAsterisk
                                    label="Local Agent"
                                    {...form.getInputProps("localAgent")}
                                />
                            )}
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
                                {isEditMode ? "Update Passenger" : "Create Passenger"}
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default AddEditPassenger;
