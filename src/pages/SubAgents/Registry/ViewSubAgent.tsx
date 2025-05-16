import { Badge, Box, Divider, Group, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getSubAgent } from "../../../store/subAgentSlice/subAgentSlice.ts";

const ViewSubAgent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();

    const { id } = useParams<{ id: string }>();

    const selectedSubAgent = useSelector((state: RootState) => state.subAgent.selectedSubAgent);

    useEffect(() => {
        fetchSubAgent();
    }, []);

    const fetchSubAgent = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getSubAgent(id));
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
                                    View Sub Agent
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">View sub agent details</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Text fw={500}>Sub Agent Details</Text>
                    <br />
                    <Table withRowBorders={false}>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Name:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedSubAgent?.name}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Phone:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedSubAgent?.phone}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Alternative Phone:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedSubAgent?.altPhone || "N/A"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Email:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedSubAgent?.email || "N/A"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Address:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedSubAgent?.address || "N/A"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Remark:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedSubAgent?.remark || "-"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Status:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    <Badge color={selectedSubAgent?.status ? "green" : "red"} radius="sm">
                                        {selectedSubAgent?.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                    <br />
                    <Text fw={500}>Passengers Details</Text>
                    <br />
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={"40%"}>Name</Table.Th>
                                    <Table.Th w={"60%"}>Phone</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {Array.isArray(selectedSubAgent?.passengers) && selectedSubAgent?.passengers.length > 0 ? (
                                    selectedSubAgent?.passengers.map((p: any, i: number) => (
                                        <Table.Tr key={p._id || i}>
                                            <Table.Td>{p.username}</Table.Td>
                                            <Table.Td>{p.phone}</Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={3}>
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

export default ViewSubAgent;
