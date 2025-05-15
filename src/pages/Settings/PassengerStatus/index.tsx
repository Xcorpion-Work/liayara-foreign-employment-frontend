import { Box, Button, Divider, Group, Stack, Text, Table, Badge, Card, Menu, ActionIcon } from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff, IconDotsVertical, IconPencil } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useEffect } from "react";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import toNotify from "../../../hooks/toNotify.tsx";
import { useMediaQuery } from "@mantine/hooks";
import { getAllPassengerStatus } from "../../../store/settingSlice/settingSlice.ts";
import { usePermission } from "../../../helpers/previlleges.ts";
import { STATUS_COLORS } from "../../../utils/settings.ts";

const RoleManagement = () => {
    const navigate = useNavigate();
    const { hasPrivilege } = usePermission();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const allPassengerStatus = useSelector((state: RootState) => state.setting.passengerStatus);
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        fetchAllPassengerStatus();
    }, []);

    const fetchAllPassengerStatus = async () => {
        setLoading(true);
        try {
            const filters = { isFinale: false };
            const response = await dispatch(getAllPassengerStatus({ filters }));
            if (response.type === "setting/getAllPassengerStatus/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const transformToTitle = (input: string): string => {
        return input
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // 🔥 Extracted view
    let contentView;
    const passengerStatus = Array.isArray(allPassengerStatus)
        ? [...allPassengerStatus].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        : [];
    if (Array.isArray(passengerStatus) && passengerStatus.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {passengerStatus.map((ps: any, index: number) => (
                    <Box key={ps._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Text fw="bold">{ps.name}</Text>

                                {hasPrivilege("EDIT.PASSENGER.STATUS") && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconPencil size={18} />}
                                                onClick={() =>
                                                    navigate(`/app/settings/passenger-status/edit?id=${ps._id}`)
                                                }
                                            >
                                                Edit
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                            <Group mt="xs">
                                <Badge
                                    variant="filled"
                                    color={STATUS_COLORS[ps.code] || "gray"}
                                    radius="sm"
                                >
                                    {transformToTitle(ps.code)}
                                </Badge></Group>
                        </Card>
                    </Box>
                ))}
            </Stack>
        ) : (
            <Table highlightOnHover withRowBorders={true}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th w="33%">Name</Table.Th>
                        <Table.Th w="33%">Code</Table.Th>
                        <Table.Th w="33%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {passengerStatus.map((ps: any, index: number) => (
                        <Table.Tr key={ps._id || index}>
                            <Table.Td>{ps.name}</Table.Td>
                            <Table.Td>
                                <Badge
                                    variant="filled"
                                    color={STATUS_COLORS[ps.code] || "gray"}
                                    radius="sm"
                                >
                                    {transformToTitle(ps.code)}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasPrivilege("EDIT.PASSENGER.STATUS") && (
                                    <Button
                                        size="xs"
                                        leftSection={<IconPencil size={20} />}
                                        color="violet"
                                        onClick={() => navigate(`/app/settings/passenger-status/edit?id=${ps._id}`)}
                                    >
                                        Edit
                                    </Button>
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
                            <Group className="cursor-pointer" onClick={() => navigate("/app/settings")}>
                                <IconArrowLeft />
                                <Text size="xl" fw="bold">
                                    Passenger Status
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">Manage your passengers and passenger approval roles</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box p="lg" className="items-center justify-between">
                <Box className="h-full w-full">{contentView}</Box>
            </Box>
        </>
    );
};

export default RoleManagement;
