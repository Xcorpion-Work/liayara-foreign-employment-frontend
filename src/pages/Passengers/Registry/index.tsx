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
import { pageRange, statusPreview } from "../../../helpers/preview.tsx";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import ConfirmModal from "../../../components/confirmModal.tsx";
import toNotify from "../../../hooks/toNotify.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { getPagedPassengers, updatePassenger } from "../../../store/passengerSlice/passengerSlice.ts";
import { DynamicSearchBar } from "../../../components/DynamicSearchBar.tsx";
import { STATUS_COLORS } from "../../../utils/settings.ts";
import { getAllPassengerStatus } from "../../../store/settingSlice/settingSlice.ts";

const PassengersRegistry = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch | any>();
    const { hasPrivilege, hasAnyPrivilege } = usePermission();
    const { setLoading } = useLoading();
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const pagedPassengers = useSelector((state: RootState) => state.passenger.passengers);
    const allPassengerStatus = useSelector((state: RootState) => state.setting.passengerStatus);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");
    const searchQuery = searchParams.get("search") ?? "";
    const passengerStatus = searchParams.get("passengerStatus") ?? "";
    const status = searchParams.get("status") ?? "";

    const [searchValues, setSearchValues] = useState<any[]>([searchQuery, passengerStatus, status]);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        id: "",
        status: false,
    });
    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

    useEffect(() => {
        fetchPassengers();
    }, [page, searchQuery, passengerStatus,status, sortField, sortOrder]);

    useEffect(() => {
        const fetchPassengerStatus = async () => {
            await dispatch(getAllPassengerStatus({ status: true }));
        };

        fetchPassengerStatus();
    }, []);

    const searchablePassengerStatus = allPassengerStatus?.map((p: any) => ({ label: p.name, value: p.code }));
    console.log(searchablePassengerStatus);

    const fetchPassengers = async () => {
        setLoading(true);
        try {
            const filters = {
                pageSize,
                page,
                searchQuery,
                passengerStatus,
                status,
                sortField,
                sortOrder,
            };
            const response = await dispatch(getPagedPassengers({ filters }));
            if (response.type === "passenger/getPagedPassengers/rejected") {
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
            const response = await dispatch(updatePassenger(payload));
            if (response.type === "passenger/updatePassenger/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Passenger updated successfully", "SUCCESS");
                fetchPassengers();
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    let contentView;
    if (Array.isArray(pagedPassengers) && pagedPassengers.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {pagedPassengers?.map((passenger: any, index: number) => (
                    <Box key={passenger._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Text fw="bold">
                                    {passenger?.passengerId || "-"} : {passenger?.name}
                                </Text>
                                {hasAnyPrivilege(["VIEW.PASSENGER", "EDIT.PASSENGER"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.PASSENGER") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/passengers/registry/view/${passenger._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.PASSENGER") && (
                                                <>
                                                    <Menu.Item
                                                        leftSection={<IconPencil size={18} />}
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/passengers/registry/add-edit?id=${passenger._id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconMobiledataOff size={18} />}
                                                        color={passenger.status ? "red" : "green"}
                                                        onClick={() =>
                                                            openConfirmModal(passenger._id, !passenger.status)
                                                        }
                                                    >
                                                        {passenger.status ? "Deactivate" : "Activate"}
                                                    </Menu.Item>
                                                </>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Phone: {passenger.phone}</Text>
                            </Group>
                            <Group mt="xs">
                                <Badge variant="light" radius="sm" color={STATUS_COLORS[passenger.passengerStatus]}>
                                    {statusPreview(passenger.passengerStatus)}
                                </Badge>
                            </Group>
                            <Group mt="xs">
                                <Badge radius="sm" color={passenger.status ? "green" : "red"}>
                                    {passenger.status ? "ACTIVE" : "INACTIVE"}
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
                        <Table.Th onClick={() => toggleSort("passengerId")}>
                            <Group gap={4}>
                                Id{" "}
                                {sortField === "passengerId" && (
                                    <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>
                                )}
                            </Group>
                        </Table.Th>
                        <Table.Th onClick={() => toggleSort("name")}>
                            <Group gap={4}>
                                Name {sortField === "name" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}
                            </Group>
                        </Table.Th>
                        <Table.Th onClick={() => toggleSort("phone")}>
                            <Group gap={4}>
                                Phone{" "}
                                {sortField === "phone" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}
                            </Group>
                        </Table.Th>
                        <Table.Th>Passenger Status</Table.Th>
                        <Table.Th onClick={() => toggleSort("status")}>
                            <Group gap={4}>
                                Status{" "}
                                {sortField === "status" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}
                            </Group>
                        </Table.Th>
                        <Table.Th w="5%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {pagedPassengers?.map((passenger: any, index: number) => (
                        <Table.Tr key={passenger._id || index}>
                            <Table.Td>{passenger.passengerId || "-"}</Table.Td>
                            <Table.Td>{passenger.name}</Table.Td>
                            <Table.Td>{passenger.phone}</Table.Td>
                            <Table.Td>
                                <Badge radius="sm" variant="light" color={STATUS_COLORS[passenger.passengerStatus]}>
                                    {statusPreview(passenger.passengerStatus)}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Badge color={passenger.status ? "green" : "red"} radius="sm">
                                    {passenger.status ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasAnyPrivilege(["VIEW.PASSENGER", "EDIT.PASSENGER"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("VIEW.PASSENGER") && (
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/passengers/registry/view/${passenger._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.PASSENGER") && (
                                                <>
                                                    <Menu.Item
                                                        leftSection={<IconPencil size={18} />}
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/passengers/registry/add-edit?id=${passenger._id}`
                                                            )
                                                        }
                                                    >
                                                        {passenger.isCompletedDetails ? "Edit" : "Complete Details"}
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        leftSection={<IconMobiledataOff size={18} />}
                                                        color={passenger.status ? "red" : "green"}
                                                        onClick={() =>
                                                            openConfirmModal(passenger._id, !passenger.status)
                                                        }
                                                    >
                                                        {passenger.status ? "Deactivate" : "Activate"}
                                                    </Menu.Item>
                                                </>
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
            <Box display="flex" p="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group justify="space-between" align="center" w="100%">
                            <Group>
                                <IconArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
                                <Text size="xl" fw="bold">
                                    Passengers Registry
                                </Text>
                            </Group>
                            {hasPrivilege("CREATE.PASSENGER") && (
                                <Button size="sm" onClick={() => navigate("/app/passengers/registry/add-edit")}>
                                    + Add Passenger
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage your passengers</Text>
                        </Group>
                        <Divider mt="sm" />
                        <DynamicSearchBar
                            fields={[
                                { type: "text", placeholder: "Passenger Id, Name, Phone" },
                                {
                                    type: "select",
                                    placeholder: "Select Passenger Status",
                                    options: searchablePassengerStatus,
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
                                    passengerStatus: searchValues[1] || "",
                                    status: searchValues[2] || "",
                                });
                            }}
                            onClear={() => {
                                setSearchValues(["", null]);
                                setSearchParams({});
                            }}
                        />
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            <Box p="lg">
                <Box>{contentView}</Box>

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

            <ConfirmModal
                opened={confirmModal.opened}
                onClose={() => setConfirmModal({ opened: false, id: "", status: false })}
                onConfirm={handleConfirmStatus}
                title={confirmType === "activate" ? "Activate Passenger" : "Deactivate Passenger"}
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this passenger?"
                        : "Are you sure you want to deactivate this passenger?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default PassengersRegistry;
