import {
    Badge,
    Box,
    Button,
    Divider,
    Group,
    NumberInput,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useEffect, useState } from "react";
import {
    getAllJobsForPassenger,
    getPassenger,
    selectJobForPassenger,
} from "../../../store/passengerSlice/passengerSlice.ts";
import toNotify from "../../../hooks/toNotify.tsx";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { amountPreviewWithCurrency } from "../../../helpers/preview.tsx";
import { useForm } from "@mantine/form";
import { usePermission } from "../../../helpers/previlleges.ts";

const SelectJob = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch | any>();
    const { hasPrivilege } = usePermission();

    const selectedPassenger = useSelector((state: RootState) => state.passenger.selectedPassenger);
    console.log(selectedPassenger);
    const jobs = useSelector((state: RootState) => state.passenger.jobs);

    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    console.log("selectedJob", selectedJob);

    useEffect(() => {
        fetchPassenger();
        fetchJobsForPassenger();
    }, [id]);

    const fetchPassenger = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getPassenger(id));
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

    const fetchJobsForPassenger = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getAllJobsForPassenger({ passenger: id }));
            if (response.type === "passenger/getAllJobsForPassenger/rejected") {
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
            commission: 0,
            fee: 0,
        },
        validate: {
            commission: (value) =>
                selectedJob && !selectedJob.jobCatalogData.doesChargeByPassenger && !value
                    ? "Commission is required"
                    : null,
            fee: (value) =>
                selectedJob && selectedJob.jobCatalogData.doesChargeByPassenger && !value ? "Fee is required" : null,
        },
    });

    const savePassenger = async () => {
        setLoading(true);
        try {
            const values = {
                ...form.values,
                passengerId: id,
                jobOrderId: selectedJob._id,
                jobCatalogId: selectedJob.jobCatalogId,
                jobId: selectedJob.jobId,
                salary: selectedJob.salary,
                selectJob: true,
            };
            const response = await dispatch(selectJobForPassenger(values));
            if (response.type === "passenger/selectJobForPassenger/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
                return;
            }
            navigate("/app/passengers/registry");
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
                                    Select Job {selectedPassenger?.passengerId}
                                </Text>
                            </Group>
                            <Group>
                                {hasPrivilege("EDIT.PASSENGER") && (
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/app/passengers/registry/add-edit?id=${selectedPassenger._id}`)
                                        }
                                    >
                                        Edit Passenger
                                    </Button>
                                )}
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">Select a job for passenger</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Box className="flex justify-between items-center w-full">
                        <Text fw={500}>Passenger Details</Text>
                    </Box>

                    <Box>
                        <Table withRowBorders={false}>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                        Id:
                                    </Table.Td>
                                    <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                        {selectedPassenger?.passengerId || "-"}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Name:</Table.Td>
                                    <Table.Td>{selectedPassenger?.name}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Phone:</Table.Td>
                                    <Table.Td>{selectedPassenger?.phone}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Alternative Phone:</Table.Td>
                                    <Table.Td>{selectedPassenger?.altPhone || "N/A"}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Email:</Table.Td>
                                    <Table.Td>{selectedPassenger?.email || "N/A"}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Address:</Table.Td>
                                    <Table.Td>{selectedPassenger?.address || "N/A"}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>NIC:</Table.Td>
                                    <Table.Td>{selectedPassenger?.nic || "-"}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Gender:</Table.Td>
                                    <Table.Td>{selectedPassenger?.gender || "N/A"}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Desired Jobs:</Table.Td>
                                    <Table.Td>
                                        {selectedPassenger?.desiredJobsData.map((dj: any) => (
                                            <Badge key={dj._id} mr={"sm"} variant="outline">
                                                {dj.name}
                                            </Badge>
                                        ))}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td fw={"bold"}>Desired Countries:</Table.Td>
                                    <Table.Td>
                                        {selectedPassenger?.desiredCountriesData.map((dj: any) => (
                                            <Badge key={dj._id} mr={"sm"} variant="outline">
                                                {dj.name}
                                            </Badge>
                                        ))}
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </Box>

                    <Box mt="sm">
                        <Table withRowBorders withColumnBorders withTableBorder highlightOnHover striped>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w="20%">Job</Table.Th>
                                    <Table.Th w="20%">Foreign Agent</Table.Th>
                                    <Table.Th w="20%">Country</Table.Th>
                                    <Table.Th w="20%">Salary</Table.Th>
                                    <Table.Th w="10%">Vacancies</Table.Th>
                                    <Table.Th w="10%">Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                        </Table>

                        <ScrollArea mah={200} mb={"lg"}>
                            <Table withRowBorders withColumnBorders withTableBorder>
                                <Table.Tbody>
                                    {jobs?.map((job: any, index: any) => (
                                        <Table.Tr key={index}>
                                            <Table.Td w="20%">
                                                {job?.jobCatalogData?.name} - {job?.jobCatalogData?.specification} (
                                                {job?.jobCatalogData?.ageLimit?.from || "N/A"} -{" "}
                                                {job?.jobCatalogData?.ageLimit?.to || "N/A"} )
                                            </Table.Td>
                                            <Table.Td w="20%">{job.foreignAgentData?.name}</Table.Td>
                                            <Table.Td w="20%">{job?.countryData?.name}</Table.Td>
                                            <Table.Td w="20%">
                                                {amountPreviewWithCurrency(
                                                    job?.salary,
                                                    job?.countryData?.currency?.code
                                                )}
                                            </Table.Td>
                                            <Table.Td w="10%">
                                                {job?.leftVacancies === 0 ? job?.approvedVacancies : job?.leftVacancies}
                                            </Table.Td>
                                            <Table.Td w="10%">
                                                <Button
                                                    size="xs"
                                                    onClick={() =>
                                                        setSelectedJob(selectedJob?.jobId === job?.jobId ? null : job)
                                                    }
                                                    color={selectedJob?.jobId === job?.jobId ? "red" : "blue"}
                                                    disabled={selectedJob !== null && selectedJob?.jobId !== job?.jobId}
                                                >
                                                    {selectedJob?.jobId === job?.jobId ? "Deselect" : "Select"}
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Box>

                    <form onSubmit={form.onSubmit(savePassenger)}>
                        <Box>
                            <SimpleGrid cols={2}>
                                {selectedJob && !selectedJob?.jobCatalogData?.doesChargeByPassenger && (
                                    <NumberInput
                                        label="Commission"
                                        withAsterisk
                                        placeholder="Enter commission"
                                        thousandSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        hideControls
                                        prefix="Rs. "
                                        {...form.getInputProps("commission")}
                                    />
                                )}
                                {selectedJob && selectedJob?.jobCatalogData?.doesChargeByPassenger && (
                                    <NumberInput
                                        label="Fee"
                                        withAsterisk
                                        placeholder="Enter fee"
                                        thousandSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        hideControls
                                        prefix="Rs. "
                                        {...form.getInputProps("fee")}
                                    />
                                )}
                            </SimpleGrid>
                        </Box>

                        <Group mt="md">
                            <Button type="submit" ml="auto" disabled={!form.isDirty()}>
                                Save
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default SelectJob;
