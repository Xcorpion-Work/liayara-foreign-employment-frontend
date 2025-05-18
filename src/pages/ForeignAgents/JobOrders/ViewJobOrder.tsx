import { Badge, Box, Divider, Group, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getJobOrder } from "../../../store/foreignAgentSlice/foreignAgentSlice.ts";
import { amountPreview, datePreview } from "../../../helpers/preview.tsx";
import { JOB_ORDER_STATUS_COLORS } from "../../../utils/settings.ts";

const ViewJobOrder = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();

    const { id } = useParams<{ id: string }>();

    const selectedJobOrder = useSelector((state: RootState) => state.foreignAgent.selectedJobOrder);

    useEffect(() => {
        fetchJobOrder();
    }, []);

    const fetchJobOrder = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getJobOrder(id));
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
                                    View Job Order
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">View job order details</Text>
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
                                    {selectedJobOrder?.jobOrderId || "-"}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Foreign Agent:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {selectedJobOrder?.foreignAgentData?.name}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Job Order Approval Number:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {selectedJobOrder?.jobOrderApprovalNumber}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Facilities:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    <Group gap="xs" wrap="wrap">
                                        {selectedJobOrder.facilities?.map((f: any, index: number) => (
                                            <Badge key={index} variant="light">
                                                {f}
                                            </Badge>
                                        ))}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Issued Date:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {datePreview(selectedJobOrder?.issuedDate)}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Expired Date:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {datePreview(selectedJobOrder?.expiredDate)}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Reference Document:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    <Group>
                                        <Badge
                                            variant="outline"
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                                window.open(
                                                    selectedJobOrder?.reference?.filePath,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                )
                                            }
                                        >
                                            {selectedJobOrder?.reference?.name}
                                        </Badge>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Remark:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedJobOrder?.remark || "-"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Status:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    <Badge color={JOB_ORDER_STATUS_COLORS[selectedJobOrder.jobOrderStatus]} radius="sm">
                                        {selectedJobOrder?.jobOrderStatus}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                    <br />
                    <Text fw={500}>Job Details</Text>
                    <br />
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={"25%"}>Job Catalog</Table.Th>
                                    <Table.Th w={"25%"}>Vacancies</Table.Th>
                                    <Table.Th w={"25%"}>Approved Vacancies</Table.Th>
                                    <Table.Th w={"25%"}>
                                        Salary ({selectedJobOrder?.foreignAgentData?.countryData?.currency?.code} -{" "}
                                        {selectedJobOrder?.foreignAgentData?.countryData?.currency?.symbol})
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {Array.isArray(selectedJobOrder?.jobs) && selectedJobOrder?.jobs.length > 0 ? (
                                    selectedJobOrder?.jobs?.map((j: any, i: number) => (
                                        <Table.Tr key={j._id || i}>
                                            <Table.Td>
                                                {j.jobCatalogData?.name} - {j.jobCatalogData?.specification} (
                                                {j.ageLimit?.from} - {j.ageLimit?.to}) - {j?.gender}
                                            </Table.Td>
                                            <Table.Td>{j.vacancies}</Table.Td>
                                            <Table.Td>{j.approvedVacancies}</Table.Td>
                                            <Table.Td>{amountPreview(j.salary)}</Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={4}>
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

export default ViewJobOrder;
