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
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import { getPagedRoles } from "../store/userSlice/userSlice.ts";
import toNotify from "../hooks/toNotify.tsx";
import { AppDispatch, RootState } from "../store/store.ts";
import { useLoading } from "../hooks/loadingContext.tsx";
import { usePermission } from "../helpers/previlleges.ts";
import { pageRange } from "../helpers/preview.tsx";

const NotificationPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const {hasPrivilege, hasAnyPrivilege} = usePermission();
    const { setLoading } = useLoading();
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const pagedRoles = useSelector((state: RootState) => state.user.roles);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");

    useEffect(() => {
        fetchRoles();
    }, [page]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const filters = { pageSize, page, };
            const response = await dispatch(getPagedRoles({ filters }));
            if (response.type === "user/getPagedRoles/rejected") {
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
    if (Array.isArray(pagedRoles) && pagedRoles.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {pagedRoles.map((role: any, index: number) => (
                    <Box key={role._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Text fw="bold">{role.name}</Text>
                                {hasAnyPrivilege(["VIEW.ROLE", "EDIT.ROLE"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.ROLE") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/settings/role-management/view/${role._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}

                                            {role.name !== "Super Admin" && (
                                                <>
                                                    {hasPrivilege("EDIT.ROLE") && (
                                                        <Menu.Item
                                                            leftSection={<IconPencil size={18} />}
                                                            onClick={() =>
                                                                navigate(
                                                                    `/app/settings/role-management/add-edit?id=${role._id}`
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Menu.Item>
                                                    )}
                                                    {hasPrivilege("EDIT.ROLE") && (
                                                        <Menu.Item
                                                            leftSection={<IconMobiledataOff size={18} />}
                                                            color={role.status ? "red" : "green"}
                                                        >
                                                            {role.status ? "Deactivate" : "Activate"}
                                                        </Menu.Item>
                                                    )}
                                                </>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                            <Group mt="xs">
                                <Badge variant="dot">{role.permissions?.length || 0} Permissions</Badge>
                                <Badge variant="outline">{role.users?.length || 0} Users</Badge>
                            </Group>
                            <Group mt="xs">
                                <Badge radius="sm" color={role.status ? "green" : "red"}>
                                    {role.status ? "ACTIVE" : "INACTIVE"}
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
                        <Table.Th w="20%">Name</Table.Th>
                        <Table.Th w="20%">Permissions</Table.Th>
                        <Table.Th w="20%">Users</Table.Th>
                        <Table.Th w="10%">Status</Table.Th>
                        <Table.Th w="30%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {pagedRoles.map((role: any, index: number) => (
                        <Table.Tr key={role._id || index}>
                            <Table.Td>{role.name}</Table.Td>
                            <Table.Td>
                                <Badge>{role.permissions?.length || 0} Permissions</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Badge variant="outline">{role.users?.length || 0} Users</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Badge color={role.status ? "green" : "red"} radius="sm">
                                    {role.status ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasPrivilege("VIEW.ROLE") && (
                                    <Button
                                        size="xs"
                                        leftSection={<IconEye size={20} />}
                                        onClick={() => navigate(`/app/settings/role-management/view/${role._id}`)}
                                    >
                                        View
                                    </Button>
                                )}{" "}
                                {role.name !== "Super Admin" && (
                                    <>
                                        {hasPrivilege("EDIT.ROLE") && (
                                            <Button
                                                size="xs"
                                                leftSection={<IconPencil size={20} />}
                                                color="violet"
                                                onClick={() =>
                                                    navigate(`/app/settings/role-management/add-edit?id=${role._id}`)
                                                }
                                            >
                                                Edit
                                            </Button>
                                        )}{" "}
                                        {hasPrivilege("EDIT.ROLE") && (
                                            <Button
                                                size="xs"
                                                leftSection={<IconMobiledataOff size={20} />}
                                                color={role.status ? "red" : "green"}
                                            >
                                                {role.status ? "Deactivate" : "Activate"}
                                            </Button>
                                        )}
                                    </>
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
                                    Notifications
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">See your notifications</Text>
                        </Group>
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
                            setSearchParams((prev) => {
                                const newParams = new URLSearchParams(prev);
                                newParams.set("page", p.toString());
                                return newParams;
                            });
                        }}
                        size="sm"
                        siblings={1}
                        boundaries={0}
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

export default NotificationPage;
