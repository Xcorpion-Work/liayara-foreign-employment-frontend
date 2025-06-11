import { Badge, Box, Button, Divider, Group, Table, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
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

const ViewPassenger = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const { hasPrivilege, hasRolePrivilege } = usePermission();

    const { id } = useParams<{ id: string }>();
    const selectedPassenger = useSelector((state: RootState) => state.passenger.selectedPassenger);

    useEffect(() => {
        fetchPassenger();
    }, []);

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
            <Box p="lg">
                <Group justify="space-between" align="center" mb="xs">
                    <Group className="cursor-pointer" onClick={() => navigate(-1)}>
                        <IconArrowLeft />
                        <Text size="xl" fw="bold">
                            View Passenger {selectedPassenger?.passengerId}
                        </Text>
                    </Group>

                    {hasPrivilege("EDIT.PASSENGER") && !selectedPassenger?.isCompletedDetails && (
                        <Button
                            size="sm"
                            onClick={() => navigate(`/app/passengers/registry/add-edit?id=${selectedPassenger._id}`)}
                        >
                            Complete Details
                        </Button>
                    )}
                    {hasPrivilege("EDIT.PASSENGER") &&
                        selectedPassenger?.isCompletedDetails &&
                        hasRolePrivilege(selectedPassenger?.passengerStatusData?.roles) &&
                        selectedPassenger.passengerStatus === "NEW_PASSENGER" && (
                            <Button
                                size="sm"
                                color="violet"
                                onClick={() => navigate(`/app/passengers/registry/select-job/${selectedPassenger._id}`)}
                            >
                                Select Job
                            </Button>
                        )}
                </Group>

                <Text size="xs" mb="sm">
                    View passenger details
                </Text>
                <Divider />
            </Box>

            {/* Info Table */}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Box className="flex justify-between items-center w-full">
                        <Text fw={500}>Passenger Details</Text>
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
        </>
    );
};

export default ViewPassenger;
