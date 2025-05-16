import { Badge, Box, Divider, Group, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getForeignAgent } from "../../../store/foreignAgentSlice/foreignAgentSlice.ts";

const ViewForeignAgent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();

    const { id } = useParams<{ id: string }>();

    const selectedForeignAgent = useSelector((state: RootState) => state.foreignAgent.selectedForeignAgent);

    useEffect(() => {
        fetchForeignAgent();
    }, []);

    const fetchForeignAgent = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getForeignAgent(id));
            if (response.type === "foreignAgent/getForeignAgent/rejected") {
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
                                    View Foreign Agent
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">View foreign agent details</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Text fw={500}>Foreign Agent Details</Text>
                    <br />
                    <Table withRowBorders={false}>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Id:
                                </Table.Td>
                                <Table.Td
                                    w={{
                                        lg: "70%",
                                        sm: "50%",
                                    }}
                                >
                                    {selectedForeignAgent?.foreignAgentId || "-"}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Name:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedForeignAgent?.name}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Company Name:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {selectedForeignAgent?.companyName || "N/A"}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Country:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    <Badge variant="outline">{selectedForeignAgent?.countryData?.name}</Badge>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Phone:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedForeignAgent?.phone}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Alternative Phone:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {selectedForeignAgent?.altPhone || "N/A"}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Email:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedForeignAgent?.email || "N/A"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Fax:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedForeignAgent?.fax || "N/A"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Address:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {selectedForeignAgent?.address || "N/A"}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Remark:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedForeignAgent?.remark || "-"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Status:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    <Badge color={selectedForeignAgent?.status ? "green" : "red"} radius="sm">
                                        {selectedForeignAgent?.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                    <br />
                    <Text fw={500}>Job Orders Details</Text>
                    <br />
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={"40%"}>Id</Table.Th>
                                    <Table.Th w={"60%"}>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {Array.isArray(selectedForeignAgent?.jobOrdersData) &&
                                selectedForeignAgent?.jobOrdersData.length > 0 ? (
                                    selectedForeignAgent?.jobOrdersData.map((j: any, i: number) => (
                                        <Table.Tr key={j._id || i}>
                                            <Table.Td>{j.jobOrderId}</Table.Td>
                                            <Table.Td>{j.JobOrderStatus}</Table.Td>
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

export default ViewForeignAgent;
