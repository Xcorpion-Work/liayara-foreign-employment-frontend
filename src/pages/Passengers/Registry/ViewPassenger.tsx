import {
    Badge,
    Box,
    Divider,
    Group,
    ScrollArea,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getPassenger } from "../../../store/passengerSlice/passengerSlice.ts";

const ViewPassenger = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();

    const { id } = useParams<{ id: string }>();
    const selectedPassenger = useSelector(
        (state: RootState) => state.passenger.selectedPassenger
    );

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
                    <Text fw={500}>Passenger Details</Text>
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
                                <Table.Td fw={"bold"}>Remark:</Table.Td>
                                <Table.Td>{selectedPassenger?.remark || "-"}</Table.Td>
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

                    <br />
                    <Text fw={500}>Related Sub-Passengers</Text>
                    <br />
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Phone</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {Array.isArray(selectedPassenger?.passengers) &&
                                selectedPassenger?.passengers.length > 0 ? (
                                    selectedPassenger.passengers.map((p: any, i: number) => (
                                        <Table.Tr key={p._id || i}>
                                            <Table.Td>{p.username}</Table.Td>
                                            <Table.Td>{p.phone}</Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={2}>
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <IconDatabaseOff size={32} color="gray" />
                                                <Text size="sm" c="dimmed" mt="sm">
                                                    No data available
                                                </Text>
                                            </div>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Box>
            </Box>
        </>
    );
};

export default ViewPassenger;
