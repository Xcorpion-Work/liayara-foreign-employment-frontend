import { Alert, Badge, Box, Button, Divider, Group, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { IconArrowLeft, IconInfoCircle } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getPassenger } from "../../../store/passengerSlice/passengerSlice.ts";
import { datePreview, statusPreview } from "../../../helpers/preview.tsx";
import { STATUS_COLORS } from "../../../utils/settings.ts";
import { usePermission } from "../../../helpers/previlleges.ts";
import { useMediaQuery } from "@mantine/hooks";
import { getAllJobOrders } from "../../../store/foreignAgentSlice/foreignAgentSlice.ts";

const ViewPassenger = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const { hasPrivilege, hasRolePrivilege } = usePermission();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const { id } = useParams<{ id: string }>();
    const selectedPassenger = useSelector((state: RootState) => state.passenger.selectedPassenger);
    const selectableJobOrders = useSelector((state: RootState) => state.foreignAgent.jobOrders);
    console.log(selectableJobOrders);

    useEffect(() => {
        fetchPassenger();
        if (selectedPassenger?.isCompletedDetails) {
            fetchDesiredJobOrders();
        }
    }, []);

    const fetchDesiredJobOrders = async () => {
        setLoading(true);
        try {
            const filters = {
                desiredJobs: selectedPassenger?.desiredJobs,
                desiredCountries: selectedPassenger?.desiredCountries,
            };
            const response = await dispatch(getAllJobOrders({ filters, selectJobOrderForPassenger: true }));
            if (response.type === "foreignAgent/getAllJobOrders/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

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
                                    View Passenger
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">View passenger details</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Info Table */}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Box className="flex justify-between items-center w-full">
                        <Text fw={500}>Passenger Details</Text>
                        {!selectedPassenger?.isCompletedDetails && hasPrivilege("EDIT.PASSENGER") && (
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                    navigate(`/app/passengers/registry/add-edit?id=${selectedPassenger._id}`)
                                }
                            >
                                Complete Details
                            </Button>
                        )}
                    </Box>

                    <br />
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
                                <Table.Td>{selectedPassenger?.gender || "-"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Birthday:</Table.Td>
                                <Table.Td>{datePreview(selectedPassenger?.birthday)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Marital Status:</Table.Td>
                                <Table.Td>{selectedPassenger?.maritalStatus}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Number of Children:</Table.Td>
                                <Table.Td>{selectedPassenger?.numberOfChildren}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Height:</Table.Td>
                                <Table.Td>{selectedPassenger?.height} CM</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Weight:</Table.Td>
                                <Table.Td>{selectedPassenger?.weight} KG</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Covid Vaccinated:</Table.Td>
                                <Table.Td>
                                    <Badge variant="outline">{selectedPassenger?.covidVaccinated ? "Yes" : "No"}</Badge>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Abroad Experience:</Table.Td>
                                <Table.Td>
                                    <Badge variant="outline">
                                        {selectedPassenger?.abroadExperience ? "Yes" : "No"}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Sub Agent:</Table.Td>
                                <Table.Td>{selectedPassenger?.subAgentData?.name || "-"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Local Agent:</Table.Td>
                                <Table.Td>{selectedPassenger?.localAgentData?.name || "-"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Remark:</Table.Td>
                                <Table.Td>{selectedPassenger?.remark || "-"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Passenger Status:</Table.Td>
                                <Table.Td>
                                    <Badge radius="sm" color={STATUS_COLORS[selectedPassenger?.passengerStatus]}>
                                        {statusPreview(selectedPassenger?.passengerStatus)}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Status:</Table.Td>
                                <Table.Td>
                                    <Badge color={selectedPassenger?.status ? "green" : "red"} radius="sm">
                                        {selectedPassenger?.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Box>
            </Box>

            {!isMobile && hasRolePrivilege(selectedPassenger?.passengerStatusData?.roles) && (
                <>
                    <Box display="flex" px="lg" py="md" className="items-center justify-between">
                        <Box className="h-full w-full">
                            <Stack gap={1}>
                                <Divider mt="sm" />
                                <Group my="lg">
                                    {!selectedPassenger?.isCompletedDetails ? (
                                        <Alert color="yellow" icon={<IconInfoCircle />}>
                                            <Text c="yellow" fw={500}>
                                                Please complete the passenger&#39;s information.
                                            </Text>
                                        </Alert>
                                    ) : (
                                        <Stack gap={1}>
                                            <Text size="xl" fw="bold">
                                                Select Job for Passenger
                                            </Text>
                                            <Text size="xs">Select job for passenger by job orders</Text>
                                        </Stack>
                                    )}
                                </Group>
                            </Stack>
                        </Box>
                    </Box>

                    {selectedPassenger.isCompletedDetails && (
                        <>
                            <Box display="flex" px="lg" pb="md" className="items-center justify-between">
                                <Box className="h-full w-full">
                                    <SimpleGrid cols={4}>
                                        <Group>
                                            <Text fw="bold" size="sm">
                                                Desired Jobs:
                                            </Text>{" "}
                                        </Group>
                                        <Group>
                                            {selectedPassenger?.desiredJobsData?.map((dj: any) => (
                                                <Badge variant="outline" size="sm" key={dj._id}>
                                                    {`${dj.name} - ${dj.specification} (${dj.ageLimit.from} - ${dj.ageLimit.to})`}
                                                </Badge>
                                            ))}
                                        </Group>
                                        <Group>
                                            <Text fw="bold" size="sm">
                                                Desired Countries:
                                            </Text>
                                        </Group>
                                        <Group>
                                            {selectedPassenger?.desiredCountriesData?.map((dj: any) => (
                                                <Badge variant="outline" size="sm" key={dj._id}>
                                                    {dj.name}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </SimpleGrid>
                                </Box>
                            </Box>

                            <Box display="flex" px="lg" py="md" className="items-center justify-between">
                                <Box className="h-full w-full">
                                    <Table>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Job</Table.Th>
                                                <Table.Th>Foreign Agent</Table.Th>
                                                <Table.Th>Country</Table.Th>
                                                <Table.Th>Vacancies</Table.Th>
                                                <Table.Th>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {selectableJobOrders.map((sj: any) => (
                                                <Table.Tr key={sj._id}>
                                                    <Table.Td>{`${sj?.jobCatalogData?.name} - ${sj?.jobCatalogData?.specification} (${sj.jobCatalogData?.ageLimit.From || ""} - ${sj.jobCatalogData?.ageLimit.To || ""})`}</Table.Td>
                                                    <Table.Td>{sj?.foreignAgentData?.name}</Table.Td>
                                                    <Table.Td>{sj?.countryData?.name}</Table.Td>
                                                    <Table.Td>{sj?.approvedVacancies}</Table.Td>
                                                    <Table.Td>
                                                        <Button size="xs" variant="outline">
                                                            Select
                                                        </Button>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Box>
                            </Box>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default ViewPassenger;
