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
import {
    IconArrowLeft,
    IconDatabaseOff,
    IconDotsVertical,
    IconEye,
    IconMobiledataOff,
    IconPencil,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { usePermission } from "../../../helpers/previlleges.ts";
import { pageRange } from "../../../helpers/preview.tsx";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import ConfirmModal from "../../../components/confirmModal.tsx";
import toNotify from "../../../hooks/toNotify.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { getPagedSubAgents, updateSubAgent } from "../../../store/subAgentSlice/subAgentSlice.ts";
import { DynamicSearchBar } from "../../../components/DynamicSearchBar.tsx";

const SubAgentsRegistry = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch | any>();
    const { hasPrivilege, hasAnyPrivilege } = usePermission();
    const { setLoading } = useLoading();
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const pagedSubAgents = useSelector((state: RootState) => state.subAgent.subAgents);

    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get("page") ?? "1");
    const searchQuery = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const [searchValues, setSearchValues] = useState<any[]>([
        searchQuery, // name/email/phone
        status, // status
    ]);

    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        id: "",
        status: false,
    });
    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

    useEffect(() => {
        fetchSubAgents();
    }, [page, searchQuery, status]);

    const fetchSubAgents = async () => {
        setLoading(true);
        try {
            const filters = { pageSize, page, searchQuery, status };
            const response = await dispatch(getPagedSubAgents({ filters }));
            if (response.type === "subAgent/getPagedSubAgents/rejected") {
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
    if (Array.isArray(pagedSubAgents) && pagedSubAgents.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {pagedSubAgents.map((subAgent: any, index: number) => (
                    <Box key={subAgent._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Text fw="bold">{subAgent?.subAgentId || "-"}{" "}:{" "}{subAgent?.name}</Text>
                                {hasAnyPrivilege(["VIEW.SUB.AGENT", "EDIT.SUB.AGENT"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.SUB.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/sub-agents/registry/view/${subAgent._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}

                                            {hasPrivilege("EDIT.SUB.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconPencil size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/sub-agents/registry/add-edit?id=${subAgent._id}`)
                                                    }
                                                >
                                                    Edit
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.SUB.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={subAgent.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(subAgent._id, !subAgent.status)}
                                                >
                                                    {subAgent.status ? "Deactivate" : "Activate"}
                                                </Menu.Item>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Phone: {subAgent.phone}</Text>
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Email: {subAgent.email || "N/A"}</Text>
                            </Group>
                            <Group mt="xs">
                                <Badge radius="sm" color={subAgent.status ? "green" : "red"}>
                                    {subAgent.status ? "ACTIVE" : "INACTIVE"}
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
                        <Table.Th w="10%">Id</Table.Th>
                        <Table.Th w="20%">Name</Table.Th>
                        <Table.Th w="15%">Phone</Table.Th>
                        <Table.Th w="20%">Email</Table.Th>
                        <Table.Th w="20%">Passengers</Table.Th>
                        <Table.Th w="10%">Status</Table.Th>
                        <Table.Th w="5%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {pagedSubAgents.map((subAgent: any, index: number) => (
                        <Table.Tr key={subAgent._id || index}>
                            <Table.Td>{subAgent.subAgentId || "-"}</Table.Td>
                            <Table.Td>{subAgent.name}</Table.Td>
                            <Table.Td>{subAgent.phone}</Table.Td>
                            <Table.Td>{subAgent?.email || "N/A"}</Table.Td>
                            <Table.Td>
                                <Badge variant="outline">{subAgent?.passengers?.length || 0} Passengers</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Badge color={subAgent.status ? "green" : "red"} radius="sm">
                                    {subAgent.status ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasAnyPrivilege(["VIEW.SUB.AGENT", "EDIT.SUB.AGENT"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.SUB.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/sub-agents/registry/view/${subAgent._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.SUB.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconPencil size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/sub-agents/registry/add-edit?id=${subAgent._id}`)
                                                    }
                                                >
                                                    Edit
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.SUB.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={subAgent.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(subAgent._id, !subAgent.status)}
                                                >
                                                    {subAgent.status ? "Deactivate" : "Activate"}
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

    const openConfirmModal = (id: string, newStatus: boolean) => {
        setConfirmModal({ opened: true, id, status: newStatus });
        setConfirmType(newStatus ? "activate" : "deactivate");
    };

    const handleConfirmStatus = async () => {
        setConfirmModal((prev) => ({ ...prev, opened: false }));
        if (!confirmModal.id) return;

        setLoading(true);
        try {
            const payload = { id: confirmModal.id, status: confirmModal.status };
            const response = await dispatch(updateSubAgent(payload));
            if (response.type === "subAgent/updateSubAgent/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Sub agent updated successfully", "SUCCESS");
                fetchSubAgents();
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
                            <Group>
                                <IconArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
                                <Text size="xl" fw="bold">
                                    Sub Agents Registry
                                </Text>
                            </Group>

                            {hasPrivilege("CREATE.SUB.AGENT") && (
                                <Button size="sm" onClick={() => navigate("/app/sub-agents/registry/add-edit")}>
                                    + Add Sub Agent
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage your sub agents</Text>
                        </Group>
                        <Divider mt="sm" />
                        <DynamicSearchBar
                            fields={[
                                { type: "text", placeholder: "Sub Agent Id, Name, Phone, Email" },
                                {
                                    type: "select",
                                    placeholder: "Select a status",
                                    options: ["ACTIVE", "INACTIVE"],
                                },
                            ]}
                            values={searchValues}
                            onChange={setSearchValues}
                            onSearch={() => {
                                setSearchParams({
                                    page: "1",
                                    search: searchValues[0] || "",
                                    status: searchValues[1] || "",
                                });
                            }}
                            onClear={() => {
                                const cleared = ["", null];
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

            {/* Confirm Modal */}
            <ConfirmModal
                opened={confirmModal.opened}
                onClose={() => setConfirmModal({ opened: false, id: "", status: false })}
                onConfirm={handleConfirmStatus}
                title={confirmType === "activate" ? "Activate Sub Agent" : "Deactivate Sub Agent"}
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this sub agent?"
                        : "Are you sure you want to deactivate this sub agent?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default SubAgentsRegistry;
