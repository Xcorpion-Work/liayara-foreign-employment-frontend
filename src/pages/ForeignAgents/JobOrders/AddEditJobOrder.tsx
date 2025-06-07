import {
    ActionIcon,
    Box,
    Button,
    Divider, FileInput,
    Group,
    MultiSelect,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { IconArrowLeft, IconFile, IconTrash } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { isNotEmpty, useForm } from "@mantine/form";
import {
    createJobOrder,
    getAllForeignAgents,
    getJobOrder,
    updateJobOrder,
} from "../../../store/foreignAgentSlice/foreignAgentSlice.ts";
import { JOB_ORDER_FACILITIES } from "../../../utils/settings.ts";
import { getAllJobCatalogs } from "../../../store/settingSlice/settingSlice.ts";
import { DatePickerInput } from "@mantine/dates";
import { fileUpload } from "../../../store/fileUploadSlice/fileUploadSlice.ts";

interface JobItem {
    jobCatalogId: string;
    vacancies: number;
    approvedVacancies: number;
    salary: number;
}

interface ForeignAgentFormValues {
    foreignAgent: string;
    jobOrderApprovalNumber: string;
    facilities: any;
    jobs: JobItem[];
    issuedDate: Date | null;
    expiredDate: Date | null;
    reference: File | { name: string; filePath: string } | null;
    remark: string;
}

const AddEditJobOrder = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const jobOrderId = searchParams.get("id"); // 👈 extracted role ID
    const isEditMode = Boolean(jobOrderId);

    const selectedJobOrder = useSelector((state: RootState) => state.foreignAgent.selectedJobOrder);
    const foreignAgents = useSelector((state: RootState) => state.foreignAgent.foreignAgents);
    const jobCatalogs = useSelector((state: RootState) => state.setting.jobCatalogs);

    useEffect(() => {
        if (isEditMode) {
            fetchJobOrder();
        }
        fetchForeignAgents();
        fetchJobCatalogs();
    }, []);

    useEffect(() => {
        if (selectedJobOrder && isEditMode) {
            form.setValues({
                foreignAgent: selectedJobOrder.foreignAgent || "",
                jobOrderApprovalNumber: selectedJobOrder.jobOrderApprovalNumber || "",
                facilities: selectedJobOrder?.facilities || [],
                jobs: selectedJobOrder.jobs || [],
                issuedDate: selectedJobOrder.issuedDate ? new Date(selectedJobOrder.issuedDate) : null,
                expiredDate: selectedJobOrder.expiredDate ? new Date(selectedJobOrder.expiredDate) : null,
                reference: selectedJobOrder.reference || null,
                remark: selectedJobOrder.remark || "",
            });
            form.resetDirty();
        }
    }, [selectedJobOrder]);
    useEffect(() => {
        if (selectedJobOrder && isEditMode) {
            form.setValues({
                foreignAgent: selectedJobOrder.foreignAgent || "",
                jobOrderApprovalNumber: selectedJobOrder.jobOrderApprovalNumber || "",
                facilities: selectedJobOrder?.facilities || [],
                jobs: selectedJobOrder.jobs || [],
                issuedDate: selectedJobOrder.issuedDate ? new Date(selectedJobOrder.issuedDate) : null,
                expiredDate: selectedJobOrder.expiredDate ? new Date(selectedJobOrder.expiredDate) : null,
                reference: selectedJobOrder.reference || null,
                remark: selectedJobOrder.remark || "",
            });
            form.resetDirty();
        }
    }, [selectedJobOrder]);

    const fetchJobOrder = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getJobOrder(jobOrderId));
            if (response.type === "foreignAgent/getJobOrder/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };



    const fetchForeignAgents = async () => {
        setLoading(true);
        try {
            const filters = { status: true };
            const response = await dispatch(getAllForeignAgents({ filters }));
            if (response.type === "foreignAgent/getAllForeignAgents/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const fetchJobCatalogs = async () => {
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

    const form = useForm<ForeignAgentFormValues>({
        initialValues: {
            foreignAgent: "",
            jobOrderApprovalNumber: "",
            facilities: [],
            jobs: [],
            issuedDate: null,
            expiredDate: null,
            reference: null,
            remark: "",
        },
        validate: {
            foreignAgent: isNotEmpty("Foreign agent is required"),
            jobOrderApprovalNumber: isNotEmpty("Job order approval number is required"),
            facilities: (value) => (value.length < 1 ? "At least one facility should be selected" : null),
            issuedDate: isNotEmpty("Issued date is required"),
            expiredDate: isNotEmpty("Expire date is required"),
            reference: isNotEmpty("Reference is required"),
            jobs: (jobs) => {
                if (jobs.length < 1) return "At least one job should be added";
                const errors = jobs?.map((job) => {
                    const jobErrors: any = {};
                    if (!job.jobCatalogId) jobErrors.jobCatalogId = "Job catalog is required";
                    if (job.vacancies < 1) jobErrors.vacancies = "Vacancies must be at least 1";
                    if (job.approvedVacancies < 1)
                        jobErrors.approvedVacancies = "Approved vacancies must be at least 1";
                    if (job.approvedVacancies > job.vacancies)
                        jobErrors.approvedVacancies = "Approved cannot exceed vacancies";
                    if (job.salary < 1) jobErrors.salary = "Salary must be greater than 0";
                    return Object.keys(jobErrors).length > 0 ? jobErrors : null;
                });
                return errors.some((e) => e !== null) ? errors : null;
            },
        },
        validateInputOnChange: true,
    });

    const handleSubmitJobOrder = async () => {
        setLoading(true);
        try {
            const payload = form.values;
            const formData = new FormData();

            if (form.values.reference instanceof File) {
                formData.append("file", form.values.reference);
                formData.append("type", "FOREIGN_AGENT");
                formData.append("relatedId", form.values.foreignAgent);

                const response: any = await dispatch(fileUpload(formData));

                if (response.type === "file/fileUpload/fulfilled") {
                    const uploaded: any = response.payload?.response || response.payload;

                    const uploadedFileInfo = {
                        name: form.values.reference.name,
                        filePath: uploaded?.filePath || uploaded?.url || uploaded,
                    };

                    form.setFieldValue("reference", uploadedFileInfo);

                    payload.reference = uploadedFileInfo;
                } else {
                    toNotify("Upload failed", "Could not upload the file", "ERROR");
                    return;
                }
            } else {
                console.warn("Reference is not a File. Skipping upload.");
            }


            let response;
            if (isEditMode) {
                response = await dispatch(updateJobOrder({ id: jobOrderId, ...payload }));
            } else {
                response = await dispatch(createJobOrder(payload));
            }
            if (
                response.type === "foreignAgent/createJobOrder/rejected" ||
                response.type === "foreignAgent/updateJobOrder/rejected"
            ) {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify(
                    "Success",
                    isEditMode ? "Job order updated successfully" : "Job order saved successfully",
                    "SUCCESS"
                );
                if (isEditMode) {
                    navigate(-1);
                } else {
                    navigate("/app/foreign-agents/job-orders");
                }
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = () => {
        form.insertListItem("jobs", {
            jobCatalogId: "",
            vacancies: 0,
            approvedVacancies: 0,
            salary: 0.0,
        });
    };

    const handleDeleteItem = (index: number) => {
        const updatedJobs = [...form.values.jobs];
        updatedJobs.splice(index, 1);
        form.setFieldValue("jobs", updatedJobs);
    };

    const getJobError = (field: keyof JobItem, index: number) =>
        Array.isArray(form.errors.jobs) ? form.errors.jobs[index]?.[field] : undefined;

    const currency = foreignAgents?.find((f) => f._id === form.values.foreignAgent)?.countryData?.currency || "-";

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
                                        ? `Edit Job Order - ${selectedJobOrder?.jobOrderId || "-"}`
                                        : "Add Job Order"}
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">{isEditMode ? "Edit" : "Add"} job orders</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitJobOrder)}>
                        <Text size="md" fw={500} mt="md" mb="sm">
                            Foreign Agent Information
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <Select
                                label="Foreign Agent"
                                placeholder="Select a foreign agent"
                                withAsterisk
                                data={foreignAgents?.map((f) => ({
                                    label: `${f?.foreignAgentId} - ${f?.name}`,
                                    value: f?._id,
                                }))}
                                {...form.getInputProps("foreignAgent")}
                            />
                            <TextInput
                                label="Job Order Approval Number"
                                placeholder="Enter job order approval number"
                                withAsterisk
                                {...form.getInputProps("jobOrderApprovalNumber")}
                            />
                        </SimpleGrid>

                        {/* --- Contact Information Section --- */}
                        <Text size="md" fw={500} mt="xl" mb="sm">
                            Job Order Information
                        </Text>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <MultiSelect
                                label="Job Facilities"
                                placeholder="Select job order facilities"
                                withAsterisk
                                data={JOB_ORDER_FACILITIES}
                                {...form.getInputProps("facilities")}
                            />
                        </SimpleGrid>

                        <Group my="lg">
                            <Table withTableBorder withRowBorders withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th w="45%">Job Catalog</Table.Th>
                                        <Table.Th w="15%">Vacancies</Table.Th>
                                        <Table.Th w="15%">Approved Vacancies</Table.Th>
                                        <Table.Th w="20%">
                                            Salary ({currency.code} - {currency.symbol})
                                        </Table.Th>
                                        <Table.Th w="5%"></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {form.values.jobs?.map((job: any, index: number) => {
                                        const selectedIds = form.values.jobs
                                            .filter((_: any, i: any) => i !== index)
                                            ?.map((j: any) => j.jobCatalogId);

                                        const options = jobCatalogs
                                            .filter(
                                                (catalog: any) =>
                                                    !selectedIds.includes(catalog._id) ||
                                                    catalog._id === job.jobCatalogId
                                            )
                                            ?.map((catalog: any) => ({
                                                label: `${catalog?.name} - ${catalog?.specification} (${catalog.ageLimit?.from || "N/A"} - ${catalog.ageLimit?.to || "N/A"})`,
                                                value: catalog._id,
                                            }));

                                        return (
                                            <Table.Tr key={job._id || index}>
                                                <Table.Td>
                                                    <Select
                                                        placeholder="Select a Job"
                                                        data={options}
                                                        error={getJobError("jobCatalogId", index)}
                                                        {...form.getInputProps(`jobs.${index}.jobCatalogId`, {
                                                            withError: false,
                                                        })}
                                                        onChange={(value) => {
                                                            form.setFieldValue(`jobs.${index}.jobCatalogId`, value);
                                                            form.validateField(`jobs`);
                                                        }}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <NumberInput
                                                        allowNegative={false}
                                                        hideControls
                                                        min={0}
                                                        error={getJobError("vacancies", index)}
                                                        {...form.getInputProps(`jobs.${index}.vacancies`, {
                                                            withError: false,
                                                        })}
                                                        onChange={(value) => {
                                                            form.setFieldValue(`jobs.${index}.vacancies`, value);
                                                            form.validateField(`jobs`);
                                                        }}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <NumberInput
                                                        allowNegative={false}
                                                        hideControls
                                                        min={0}
                                                        error={getJobError("approvedVacancies", index)}
                                                        {...form.getInputProps(`jobs.${index}.approvedVacancies`, {
                                                            withError: false,
                                                        })}
                                                        onChange={(value) => {
                                                            form.setFieldValue(
                                                                `jobs.${index}.approvedVacancies`,
                                                                value
                                                            );
                                                            form.validateField(`jobs`);
                                                        }}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <NumberInput
                                                        allowNegative={false}
                                                        hideControls
                                                        min={0}
                                                        fixedDecimalScale
                                                        decimalScale={2}
                                                        thousandSeparator={","}
                                                        error={getJobError("salary", index)}
                                                        {...form.getInputProps(`jobs.${index}.salary`, {
                                                            withError: false,
                                                        })}
                                                        onChange={(value) => {
                                                            form.setFieldValue(`jobs.${index}.salary`, value);
                                                            form.validateField(`jobs`);
                                                        }}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <ActionIcon
                                                        color="red"
                                                        variant="light"
                                                        className="mx-auto my-auto"
                                                        size="md"
                                                        onClick={() => handleDeleteItem(index)}
                                                    >
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}

                                    <Table.Tr>
                                        <Table.Td colSpan={5} align="center">
                                            <Button
                                                onClick={handleAddJob}
                                                disabled={jobCatalogs?.length === form?.values?.jobs.length}
                                            >
                                                Add Job
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Group>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <DatePickerInput
                                label="Issued Date"
                                placeholder="Select issued date"
                                withAsterisk
                                {...form.getInputProps("issuedDate")}
                            />

                            <DatePickerInput
                                label="Expire Date"
                                placeholder="Select expire date"
                                withAsterisk
                                minDate={new Date()}
                                {...form.getInputProps("expiredDate")}
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

                            <FileInput
                                label="Refernce Document"
                                withAsterisk
                                leftSection={<IconFile size={20} stroke={1.5} />}
                                placeholder="Select a Document"
                                clearable
                                {...form.getInputProps("reference")}
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

export default AddEditJobOrder;
