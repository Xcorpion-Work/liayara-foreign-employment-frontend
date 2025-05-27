import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Divider,
    Group,
    Menu,
    Pagination,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff, IconDotsVertical, IconEye, IconPencil } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { usePermission } from "../../../helpers/previlleges.ts";
import { datePreview, pageRange } from "../../../helpers/preview.tsx";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import toNotify from "../../../hooks/toNotify.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { DynamicSearchBar } from "../../../components/DynamicSearchBar.tsx";
import { getAllForeignAgents, getPagedJobOrders } from "../../../store/foreignAgentSlice/foreignAgentSlice.ts";
import { JOB_ORDER_STATUS_COLORS } from "../../../utils/settings.ts";

const JobOrders = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch | any>();
    const { hasPrivilege, hasAnyPrivilege } = usePermission();
    const { setLoading } = useLoading();
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const pagedJobOrders = useSelector((state: RootState) => state.foreignAgent.jobOrders);
    const foreignAgents = useSelector((state: RootState) => state.foreignAgent.foreignAgents);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get("page") ?? "1");
    const searchQuery = searchParams.get("search") ?? "";
    const foreignAgent = searchParams.get("agent") ?? "";
    const jobOrderStatus = searchParams.get("status") ?? "";
    const [searchValues, setSearchValues] = useState<any[]>([
        searchQuery, // name/email/phone
        foreignAgent,
        jobOrderStatus, // status
    ]);

    useEffect(() => {
        fetchForeignAgents();
    }, [dispatch]);

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

    useEffect(() => {
        fetchJobOrders();
    }, [page, searchQuery, foreignAgent, jobOrderStatus, sortField, sortOrder]);

    const fetchJobOrders = async () => {
        setLoading(true);
        try {
            const filters = {
                pageSize,
                page,
                searchQuery,
                foreignAgent,
                jobOrderStatus,
                sortField,
                sortOrder,
            };
            const response = await dispatch(getPagedJobOrders({ filters }));
            if (response.type === "foreignAgent/getPagedJobOrders/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
            setTotalRecords(response?.payload?.response?.total || 0);
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Extracted view
    let contentView;
    if (Array.isArray(pagedJobOrders) && pagedJobOrders.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {pagedJobOrders?.map((jobOrder: any, index: number) => (
                    <Box key={jobOrder._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Text fw="bold">
                                    {jobOrder?.jobOrderId || "-"} : {jobOrder?.foreignAgentData?.name}
                                </Text>
                                {hasAnyPrivilege(["VIEW.JOB.ORDER", "EDIT.JOB.ORDER"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.JOB.ORDER") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/foreign-agents/job-orders/view/${jobOrder._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}

                                            {hasPrivilege("EDIT.JOB.ORDER") &&
                                                jobOrder.jobOrderStatus === "PENDING" && (
                                                    <Menu.Item
                                                        leftSection={<IconPencil size={18} />}
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/foreign-agents/job-orders/add-edit?id=${jobOrder._id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Menu.Item>
                                                )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Approval No.: {jobOrder.jobOrderApprovalNumber}</Text>
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Issued At: {datePreview(jobOrder.issuedDate)}</Text>
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Expired At: {datePreview(jobOrder.expiredDate)}</Text>
                            </Group>
                            <Group mt="xs">
                                <Badge radius="sm" color={JOB_ORDER_STATUS_COLORS[jobOrder.jobOrderStatus] || "gray"}>
                                    {jobOrder.jobOrderStatus}
                                </Badge>
                            </Group>
                        </Card>
                    </Box>
                ))}
            </Stack>
        ) : (
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th onClick={() => toggleSort("jobOrderId")}><Group gap={4}>Id {sortField === "jobOrderId" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}</Group></Table.Th>
                        <Table.Th w="20%">Foreign Agent</Table.Th>
                        <Table.Th onClick={() => toggleSort("jobOrderApprovalNumber")}><Group gap={4}>Approval No. {sortField === "jobOrderApprovalNumber" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}</Group></Table.Th>
                        <Table.Th onClick={() => toggleSort("issuedDate")}><Group gap={4}>Issued Date {sortField === "issuedDate" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}</Group></Table.Th>
                        <Table.Th onClick={() => toggleSort("expiredDate")}><Group gap={4}>Expired Date {sortField === "expiredDate" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}</Group></Table.Th>
                        <Table.Th onClick={() => toggleSort("jobOrderStatus")}><Group gap={4}>Status {sortField === "jobOrderStatus" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}</Group></Table.Th>
                        <Table.Th w="5%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {pagedJobOrders?.map((jobOrder: any, index: number) => (
                        <Table.Tr key={jobOrder._id || index}>
                            <Table.Td>{jobOrder?.jobOrderId || "-"}</Table.Td>
                            <Table.Td>{jobOrder?.foreignAgentData?.name}</Table.Td>
                            <Table.Td>{jobOrder?.jobOrderApprovalNumber}</Table.Td>
                            <Table.Td>{datePreview(jobOrder?.issuedDate)}</Table.Td>
                            <Table.Td>{datePreview(jobOrder?.expiredDate)}</Table.Td>
                            <Table.Td>
                                <Badge color={JOB_ORDER_STATUS_COLORS[jobOrder.jobOrderStatus] || "gray"} radius="sm">
                                    {jobOrder.jobOrderStatus}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasAnyPrivilege(["VIEW.JOB.ORDER", "EDIT.JOB.ORDER"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.JOB.ORDER") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/foreign-agents/job-orders/view/${jobOrder._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.JOB.ORDER") &&
                                                jobOrder.jobOrderStatus === "PENDING" && (
                                                    <Menu.Item
                                                        leftSection={<IconPencil size={18} />}
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/foreign-agents/job-orders/add-edit?id=${jobOrder._id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Menu.Item>
                                                )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        );
    } else {
        contentView = (
            <Group justify="center" align="center" h="300px">
                <Stack align="center" gap="xs">
                    <IconDatabaseOff size={40} color="gray" />
                    <Text size="sm" c="dimmed">
                        No data available
                    </Text>
                </Stack>
            </Group>
        );
    }

    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    return (
        <>
            {/* Header */}
            <Box display="flex" p="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group justify="space-between" align="center" w="100%">
                            <Group>
                                <IconArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
                                <Text size="xl" fw="bold">
                                    Job Orders
                                </Text>
                            </Group>

                            {hasPrivilege("CREATE.JOB.ORDER") && !isMobile && (
                                <Button size="sm" onClick={() => navigate("/app/foreign-agents/job-orders/add-edit")}>
                                    + Add Job Order
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage your company job orders</Text>
                        </Group>
                        <Divider mt="sm" />
                        <DynamicSearchBar
                            fields={[
                                { type: "text", placeholder: "Job Order Id, Approval No" },
                                {
                                    type: "select",
                                    placeholder: "Select a foreign agent",
                                    options: foreignAgents?.map((f) => ({ label: f.name, value: f._id })),
                                },
                                {
                                    type: "select",
                                    placeholder: "Select a status",
                                    options: ["PENDING", "ACTIVE", "EXPIRED"],
                                },
                            ]}
                            values={searchValues}
                            onChange={setSearchValues}
                            onSearch={() => {
                                setSearchParams({
                                    page: "1",
                                    search: searchValues[0] || "",
                                    agent: searchValues[1] || "",
                                    status: searchValues[2] || "",
                                });
                            }}
                            onClear={() => {
                                const cleared = ["", null, null];
                                setSearchValues(cleared);
                                setSearchParams({});
                            }}
                        />
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box p="lg" className="items-center justify-between">
                <Box className="h-full w-full">{contentView}</Box>

                {/* Pagination */}
                <Group my="md" justify="space-between">
                    <Group>{pageRange(page, pageSize, totalRecords)}</Group>
                    <Pagination.Root
                        total={Math.ceil(totalRecords / pageSize)}
                        value={page}
                        onChange={(p) => {
                            setSearchParams((prev: any) => {
                                const newParams = new URLSearchParams(prev);
                                newParams.set("page", p.toString());
                                return newParams;
                            });
                        }}
                        size="sm"
                        siblings={1}
                        boundaries={0}
                        disabled={totalRecords === 0}
                    >
                        <Group gap={5} justify="center">
                            <Pagination.First />
                            <Pagination.Previous />
                            <Pagination.Items />
                            <Pagination.Next />
                            <Pagination.Last />
                        </Group>
                    </Pagination.Root>
                </Group>
            </Box>
        </>
    );
};

export default JobOrders;
