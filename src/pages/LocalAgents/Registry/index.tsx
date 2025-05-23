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
import { getPagedLocalAgents, updateLocalAgent } from "../../../store/localAgentSlice/localAgentSlice.ts";
import { DynamicSearchBar } from "../../../components/DynamicSearchBar.tsx";

const LocalAgentsRegistry = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch | any>();
    const { hasPrivilege, hasAnyPrivilege } = usePermission();
    const { setLoading } = useLoading();
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const pagedLocalAgents = useSelector((state: RootState) => state.localAgent.localAgents);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");
    const searchQuery = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";

    const [searchValues, setSearchValues] = useState<any[]>([
        searchQuery, // name/email/phone
        status,      // status
    ]);

    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        id: "",
        status: false,
    });
    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

    useEffect(() => {
        fetchLocalAgents();
    }, [page, searchQuery, status]);

    const fetchLocalAgents = async () => {
        setLoading(true);
        try {
            const filters = { pageSize, page, searchQuery, status };
            const response = await dispatch(getPagedLocalAgents({ filters }));
            if (response.type === "localAgent/getPagedLocalAgents/rejected") {
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
            const response = await dispatch(updateLocalAgent(payload));
            if (response.type === "localAgent/updateLocalAgent/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Local agent updated successfully", "SUCCESS");
                fetchLocalAgents();
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    let contentView;
    if (Array.isArray(pagedLocalAgents) && pagedLocalAgents.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {pagedLocalAgents.map((agent: any, index: number) => (
                    <Box key={agent._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Text fw="bold">{agent?.localAgentId || "-"}{" "}:{" "}{agent?.name}</Text>
                                {hasAnyPrivilege(["VIEW.LOCAL.AGENT", "EDIT.LOCAL.AGENT"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.LOCAL.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/local-agents/registry/view/${agent._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.LOCAL.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconPencil size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/local-agents/registry/add-edit?id=${agent._id}`)
                                                    }
                                                >
                                                    Edit
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.LOCAL.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={agent.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(agent._id, !agent.status)}
                                                >
                                                    {agent.status ? "Deactivate" : "Activate"}
                                                </Menu.Item>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Phone: {agent.phone}</Text>
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Email: {agent.email || "N/A"}</Text>
                            </Group>
                            <Group mt="xs">
                                <Badge radius="sm" color={agent.status ? "green" : "red"}>
                                    {agent.status ? "ACTIVE" : "INACTIVE"}
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
                    {pagedLocalAgents.map((agent: any, index: number) => (
                        <Table.Tr key={agent._id || index}>
                            <Table.Td>{agent.localAgentId || "-"}</Table.Td>
                            <Table.Td>{agent.name}</Table.Td>
                            <Table.Td>{agent.phone}</Table.Td>
                            <Table.Td>{agent.email || "N/A"}</Table.Td>
                            <Table.Td>
                                <Badge variant="outline">{agent.passengers?.length || 0} Passengers</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Badge color={agent.status ? "green" : "red"} radius="sm">
                                    {agent.status ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasAnyPrivilege(["VIEW.LOCAL.AGENT", "EDIT.LOCAL.AGENT"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.LOCAL.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/local-agents/registry/view/${agent._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.LOCAL.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconPencil size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/local-agents/registry/add-edit?id=${agent._id}`)
                                                    }
                                                >
                                                    Edit
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.LOCAL.AGENT") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={agent.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(agent._id, !agent.status)}
                                                >
                                                    {agent.status ? "Deactivate" : "Activate"}
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
                                    Local Agents Registry
                                </Text>
                            </Group>

                            {hasPrivilege("CREATE.LOCAL.AGENT") && (
                                <Button size="sm" onClick={() => navigate("/app/local-agents/registry/add-edit")}>
                                    + Add Local Agent
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage your local agents</Text>
                        </Group>
                        <Divider mt="sm" />
                        <DynamicSearchBar
                            fields={[
                                { type: "text", placeholder: "Local Agent Id, Name, Phone, Email" },
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
            <Box p="lg">
                <Box>{contentView}</Box>

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
                title={confirmType === "activate" ? "Activate Local Agent" : "Deactivate Local Agent"}
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this local agent?"
                        : "Are you sure you want to deactivate this local agent?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default LocalAgentsRegistry;
