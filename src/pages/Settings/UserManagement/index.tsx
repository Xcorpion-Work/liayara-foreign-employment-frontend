import {
    Box,
    Button,
    Divider,
    Group,
    Stack,
    Text,
    Pagination,
    Table,
    Badge,
    Card,
    Menu,
    ActionIcon,
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useEffect, useState } from "react";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { getPagedUsers, getRoles, updateUser } from "../../../store/userSlice/userSlice.ts";
import toNotify from "../../../hooks/toNotify.tsx";
import { pageRange } from "../../../helpers/preview.tsx";
import { useMediaQuery } from "@mantine/hooks";
import ConfirmModal from "../../../components/confirmModal.tsx";
import { usePermission } from "../../../helpers/previlleges.ts";
import { DynamicSearchBar } from "../../../components/DynamicSearchBar.tsx";
import { useSearchParams } from "react-router-dom";

const UserManagement = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const { hasPrivilege, hasAnyPrivilege } = usePermission();

    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get("page") ?? "1");
    const searchQuery = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const role = searchParams.get("role") ?? "";
    const [searchValues, setSearchValues] = useState<any[]>([
        searchQuery, // name/email/phone
        role,        // roleId
        status       // status
    ]);

    const pagedUsers = useSelector((state: RootState) => state.user.users);
    const roles = useSelector((state: RootState) => state.user.roles);

    const isMobile = useMediaQuery("(max-width: 768px)");
    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        id: "",
        status: false,
    });

    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

    useEffect(() => {
        fetchRoles();
    }, [dispatch]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const filters = {
                status: true,
            };
            const response = await dispatch(getRoles({ filters }));
            if (response.type === "user/getRoles/rejected") {
                console.error(response.payload.error);
                toNotify("Something went wrong", "Please contact system admin", "WARNING");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, searchQuery, status, role]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const filters = {
                pageSize,
                page,
                searchQuery,
                status,
                role
            };
            const response = await dispatch(getPagedUsers({ filters }));
            if (response.type === "user/getPagedUsers/rejected") {
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
            const response = await dispatch(updateUser(payload));
            if (response.type === "user/updateUser/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "User updated successfully", "SUCCESS");
                await fetchUsers();
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Extracted nested view logic
    let contentView;

    if (Array.isArray(pagedUsers) && pagedUsers.length > 0) {
        if (isMobile) {
            contentView = (
                <Stack gap="md">
                    {pagedUsers.map((user: any, index: number) => (
                        <Box key={user?._id || index}>
                            <Card withBorder p="md">
                                <Group justify="space-between" align="flex-start">
                                    <Text fw="bold">{user?.username}</Text>
                                    {hasAnyPrivilege(["VIEW.USER", "EDIT.USER"]) && (
                                        <Menu withinPortal position="bottom-end" shadow="md">
                                            <Menu.Target>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <IconDotsVertical size={18} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                {hasPrivilege("VIEW.USER") && (
                                                    <Menu.Item
                                                        leftSection={<IconEye size={18} />}
                                                        onClick={() =>
                                                            navigate(`/app/settings/user-management/view/${user?._id}`)
                                                        }
                                                    >
                                                        View
                                                    </Menu.Item>
                                                )}
                                                {user?.roleName !== "Super Admin" && (
                                                    <>
                                                        {hasPrivilege("EDIT.USER") && (
                                                            <>
                                                                <Menu.Item
                                                                    leftSection={<IconPencil size={18} />}
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/app/settings/user-management/add-edit?id=${user?._id}`
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    leftSection={<IconMobiledataOff size={18} />}
                                                                    color={user?.status ? "red" : "green"}
                                                                    onClick={() =>
                                                                        openConfirmModal(user._id, !user.status)
                                                                    }
                                                                >
                                                                    {user?.status ? "Deactivate" : "Activate"}
                                                                </Menu.Item>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </Menu.Dropdown>
                                        </Menu>
                                    )}
                                </Group>
                                <Stack gap={1} mt="xs">
                                    <Text size="sm">{user?.phone}</Text>
                                    <Text size="sm">{user?.email}</Text>
                                </Stack>
                                <Group mt="xs">
                                    <Badge variant="outline">{user?.roleName}</Badge>
                                </Group>
                                <Group mt="xs">
                                    <Badge radius="sm" color={user?.status ? "green" : "red"}>
                                        {user?.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Group>
                            </Card>
                        </Box>
                    ))}
                </Stack>
            );
        } else {
            contentView = (
                <Table highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w="20%">Name</Table.Th>
                            <Table.Th w="10%">Phone</Table.Th>
                            <Table.Th w="15%">Email</Table.Th>
                            <Table.Th w="15%">Role</Table.Th>
                            <Table.Th w="10%">Status</Table.Th>
                            <Table.Th w="30%">Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {pagedUsers.map((user: any, index: number) => (
                            <Table.Tr key={user?._id || index}>
                                <Table.Td>{user?.username}</Table.Td>
                                <Table.Td>{user?.phone}</Table.Td>
                                <Table.Td>{user?.email}</Table.Td>
                                <Table.Td>
                                    <Badge variant="outline">{user?.roleName}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={user?.status ? "green" : "red"} radius="sm">
                                        {user?.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    {hasPrivilege("VIEW.USER") && (
                                        <Button
                                            size="xs"
                                            leftSection={<IconEye size={20} />}
                                            onClick={() => navigate(`/app/settings/user-management/view/${user?._id}`)}
                                        >
                                            View
                                        </Button>
                                    )}{" "}
                                    {user?.roleName !== "Super Admin" && (
                                        <>
                                            {hasPrivilege("EDIT.USER") && (
                                                <>
                                                    <Button
                                                        size="xs"
                                                        leftSection={<IconPencil size={20} />}
                                                        color="violet"
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/settings/user-management/add-edit?id=${user?._id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>{" "}
                                                    <Button
                                                        size="xs"
                                                        leftSection={<IconMobiledataOff size={20} />}
                                                        color={user.status ? "red" : "green"}
                                                        onClick={() => openConfirmModal(user?._id, !user?.status)}
                                                    >
                                                        {user?.status ? "Deactivate" : "Activate"}
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            );
        }
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
                                <IconArrowLeft className="cursor-pointer" onClick={() => navigate("/app/settings")}/>
                                <Text size="xl" fw="bold">
                                    User Management
                                </Text>
                            </Group>

                            {hasPrivilege("CREATE.USER") && (
                                <Button size="sm" onClick={() => navigate("/app/settings/user-management/add-edit")}>
                                    + Add User
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage your company users</Text>
                        </Group>
                        <Divider mt="sm" />
                        <DynamicSearchBar
                            fields={[
                                { type: "text", placeholder: "User Name or phone or Email" },
                                {
                                    type: "select",
                                    placeholder: "Select a User Role",
                                    options: roles.map((r: any) => ({ label: r.name, value: r._id })),
                                },
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
                                    role: searchValues[1] || "",
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
                            setSearchParams(prev => {
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

            <ConfirmModal
                opened={confirmModal.opened}
                onClose={() => setConfirmModal({ opened: false, id: "", status: false })}
                onConfirm={handleConfirmStatus}
                title={confirmType === "activate" ? "Activate User" : "Deactivate User"}
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this user?"
                        : "Are you sure you want to deactivate this user?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default UserManagement;
