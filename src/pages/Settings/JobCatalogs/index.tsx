import { Box, Button, Divider, Group, Stack, Text, Table, Card, Menu, ActionIcon, Badge, Flex } from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff, IconDotsVertical, IconMobiledataOff, IconPencil } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useEffect, useState } from "react";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import toNotify from "../../../hooks/toNotify.tsx";
import { useMediaQuery } from "@mantine/hooks";
import { getAllJobCatalogs, updateJobCatalog } from "../../../store/settingSlice/settingSlice.ts";
import { usePermission } from "../../../helpers/previlleges.ts";
import ConfirmModal from "../../../components/confirmModal.tsx";

const JobCatalogs = () => {
    const navigate = useNavigate();
    const { hasPrivilege, hasAnyPrivilege } = usePermission();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const allJobCatalogs = useSelector((state: RootState) => state.setting.jobCatalogs);
    const isMobile = useMediaQuery("(max-width: 768px)");

    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        id: "",
        status: false,
    });
    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

    useEffect(() => {
        fetchAllJobCatalogs();
    }, []);

    const fetchAllJobCatalogs = async () => {
        setLoading(true);
        try {
            const filters = {};
            const response = await dispatch(getAllJobCatalogs({ filters }));
            if (response.type === "setting/getAllJobCatalogs/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Extracted view
    let contentView;
    const jobCatalogs = Array.isArray(allJobCatalogs)
        ? [...allJobCatalogs].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        : [];
    if (Array.isArray(jobCatalogs) && jobCatalogs.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {jobCatalogs.map((jc: any, index: number) => (
                    <Box key={jc._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={"xs"}>
                                    <Flex>
                                        <Text size="lg" fw={"bold"}>
                                            {jc?.name || "-"}
                                        </Text>
                                        <Text size="lg">: {jc.specification ? `(${jc.specification})` : "-"}</Text>
                                    </Flex>

                                    <Group>
                                        <Badge variant="outline" radius="md">
                                            {jc?.ageLimit?.from} - {jc?.ageLimit?.to}
                                        </Badge>{" "}
                                    </Group>
                                    <Badge color={jc.status ? "green" : "red"} radius="sm">
                                        {jc.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Stack>

                                {hasAnyPrivilege(["EDIT.JOB.CATALOG"]) && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>

                                        <Menu.Dropdown>
                                            {hasPrivilege("EDIT.JOB.CATALOG") && (
                                                <Menu.Item
                                                    leftSection={<IconPencil size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/settings/job-catalog/add-edit?id=${jc._id}`)
                                                    }
                                                >
                                                    Edit
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.JOB.CATALOG") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={jc.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(jc._id, !jc.status)}
                                                >
                                                    {jc.status ? "Deactivate" : "Activate"}
                                                </Menu.Item>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                        </Card>
                    </Box>
                ))}
            </Stack>
        ) : (
            <Table highlightOnHover withRowBorders={true}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th w="20%">Name</Table.Th>
                        <Table.Th w="20%">Age Limit</Table.Th>
                        <Table.Th w="20%">Specification</Table.Th>
                        <Table.Th w="10%">Status</Table.Th>
                        <Table.Th w="30%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {jobCatalogs.map((jc: any, index: number) => (
                        <Table.Tr key={jc._id || index}>
                            <Table.Td>{jc?.name || "-"}</Table.Td>
                            <Table.Td>
                                <Badge variant="outline" size="sm" radius="md">
                                    {jc?.ageLimit?.from} - {jc?.ageLimit?.to}
                                </Badge>
                            </Table.Td>
                            <Table.Td>{jc.specification || "-"}</Table.Td>
                            <Table.Td>
                                <Badge color={jc.status ? "green" : "red"} radius="sm">
                                    {jc.status ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasPrivilege("EDIT.JOB.CATALOG") && (
                                    <Button
                                        size="xs"
                                        leftSection={<IconPencil size={20} />}
                                        color="violet"
                                        onClick={() => navigate(`/app/settings/job-catalog/add-edit?id=${jc._id}`)}
                                    >
                                        Edit
                                    </Button>
                                )}{" "}
                                {hasPrivilege("EDIT.JOB.CATALOG") && (
                                    <Button
                                        size="xs"
                                        leftSection={<IconMobiledataOff size={20} />}
                                        color={jc.status ? "red" : "green"}
                                        onClick={() => openConfirmModal(jc._id, !jc.status)}
                                    >
                                        {jc.status ? "Deactivate" : "Activate"}
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
            const response = await dispatch(updateJobCatalog(payload));
            if (response.type === "setting/updateJobCatalog/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Job catalog updated successfully", "SUCCESS");
                fetchAllJobCatalogs();
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
                            <Group className="cursor-pointer" onClick={() => navigate("/app/settings")}>
                                <IconArrowLeft />
                                <Text size="xl" fw="bold">
                                    Job Catalog
                                </Text>
                            </Group>

                            {hasPrivilege("CREATE.JOB.CATALOG") && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        navigate("/app/settings/job-catalog/add-edit");
                                    }}
                                >
                                    + Add Job Catalog
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage your job catalog of your organization</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box p="lg" className="items-center justify-between">
                <Box className="h-full w-full">{contentView}</Box>
            </Box>

            {/* Confirm Modal */}
            <ConfirmModal
                opened={confirmModal.opened}
                onClose={() => setConfirmModal({ opened: false, id: "", status: false })}
                onConfirm={handleConfirmStatus}
                title={confirmType === "activate" ? "Activate Job Catalog" : "Deactivate Job Catalog"}
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this job catalog?"
                        : "Are you sure you want to deactivate this job catalog?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default JobCatalogs;
