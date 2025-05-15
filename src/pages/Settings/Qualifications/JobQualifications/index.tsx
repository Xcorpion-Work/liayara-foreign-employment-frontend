// Converted JobQualifications component from LanguageQualifications

import {
    Box,
    Button,
    Group,
    Stack,
    Text,
    Badge,
    Card,
    Modal,
    TextInput,
    Textarea,
    Menu,
    ActionIcon,
    Table,
} from "@mantine/core";
import { IconDatabaseOff, IconDotsVertical, IconMobiledataOff, IconPencil } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { isNotEmpty, useForm } from "@mantine/form";
import { usePermission } from "../../../../helpers/previlleges";
import { AppDispatch, RootState } from "../../../../store/store.ts";
import { useLoading } from "../../../../hooks/loadingContext.tsx";
import {
    createJobQualification,
    getAllJobQualification,
    updateJobQualification,
} from "../../../../store/settingSlice/settingSlice.ts";
import toNotify from "../../../../hooks/toNotify.tsx";
import ConfirmModal from "../../../../components/confirmModal.tsx";

const JobQualifications = () => {
    const { hasPrivilege } = usePermission();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const [isLoading, setIsLoading] = useState(false);
    const allJobQualifications = useSelector((state: RootState) => state.setting.jobQualifications);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [jobQualificationModalOpened, jobQualificationModalHandle] = useDisclosure(false);
    const [confirmModal, setConfirmModal] = useState({ opened: false, id: "", status: false });
    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState("");

    useEffect(() => {
        fetchAllJobQualifications();
    }, []);

    const fetchAllJobQualifications = async () => {
        setLoading(true);
        try {
            const filters = {};
            const response = await dispatch(getAllJobQualification({ filters }));
            if (response.type === "setting/getAllJobQualification/rejected") {
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
            ?.replace(/_/g, " ")
            ?.toLowerCase()
            ?.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const openConfirmModal = (id: string, newStatus: boolean) => {
        setConfirmModal({ opened: true, id, status: newStatus });
        setConfirmType(newStatus ? "activate" : "deactivate");
    };

    const form = useForm({
        initialValues: { name: "", description: "" },
        validate: {
            name: isNotEmpty("Job qualification name is required"),
            description: isNotEmpty("Description is required"),
        },
    });

    const setDataForEdit = (data: any) => {
        setId(data._id);
        setIsEdit(true);
        form.setValues({
            name: data.name,
            description: data.description || "",
        });
        form.resetDirty();
        jobQualificationModalHandle.open(); // Ensure it's here at the end
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(
                isEdit ? updateJobQualification({ id, ...form.values }) : createJobQualification(form.values)
            );

            if (
                response.type === "setting/updateJobQualification/rejected" ||
                response.type === "setting/createJobQualification/rejected"
            ) {
                toNotify("Error", response.payload?.error || "Please contact system admin", "ERROR");
            } else if (
                response.type === "setting/updateJobQualification/fulfilled" ||
                response.type === "setting/createJobQualification/fulfilled"
            ) {
                await fetchAllJobQualifications();
                form.reset();
                jobQualificationModalHandle.close();
                toNotify(
                    "Success",
                    `${isEdit ? "Document type updated successfully" : "Document type added successfully"}`,
                    "SUCCESS"
                );
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmStatus = async () => {
        setConfirmModal((prev) => ({ ...prev, opened: false }));
        if (!confirmModal.id) return;

        setLoading(true);
        try {
            const payload = { id: confirmModal.id, status: confirmModal.status };
            const response = await dispatch(updateJobQualification(payload));
            if (response.type === "setting/updateJobQualification/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Job Qualification updated successfully", "SUCCESS");
                fetchAllJobQualifications();
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
    const jobQualifications = Array.isArray(allJobQualifications)
        ? [...allJobQualifications].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        : [];
    if (Array.isArray(jobQualifications) && jobQualifications.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {jobQualifications?.map((jq: any, index: number) => (
                    <Box key={jq._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Stack>
                                    <Badge radius="sm" variant="outline">
                                        {transformToTitle(jq.name)}
                                    </Badge>
                                    <Text>{jq.description || "-"}</Text>
                                    <Badge color={jq.status ? "green" : "red"} radius="sm">
                                        {jq.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Stack>

                                {hasPrivilege("EDIT.QUALIFICATION") && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("EDIT.QUALIFICATION") && (
                                                <Menu.Item
                                                    leftSection={<IconPencil size={18} />}
                                                    onClick={() => setDataForEdit(jq)}
                                                >
                                                    Edit
                                                </Menu.Item>
                                            )}
                                            {hasPrivilege("EDIT.QUALIFICATION") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={jq.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(jq._id, !jq.status)}
                                                >
                                                    {jq.status ? "Deactivate" : "Activate"}
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
                        <Table.Th w="30%">Description</Table.Th>
                        <Table.Th w="20%">Status</Table.Th>
                        <Table.Th w="30%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {jobQualifications.map((jq: any, index: number) => (
                        <Table.Tr key={jq._id || index}>
                            <Table.Td>
                                <Badge radius="sm" variant="outline">
                                    {transformToTitle(jq.name)}
                                </Badge>
                            </Table.Td>
                            <Table.Td>{jq.description || "-"}</Table.Td>
                            <Table.Td>
                                <Badge color={jq.status ? "green" : "red"} radius="sm">
                                    {jq.status ? "ACTIVE" : "INACTIVE"}
                                </Badge>
                            </Table.Td>{" "}
                            <Table.Td>
                                {hasPrivilege("EDIT.QUALIFICATION") && (
                                    <Button
                                        size="xs"
                                        leftSection={<IconPencil size={20} />}
                                        color="violet"
                                        onClick={() => setDataForEdit(jq)}
                                    >
                                        Edit
                                    </Button>
                                )}{" "}
                                {hasPrivilege("EDIT.QUALIFICATION") && (
                                    <Button
                                        size="xs"
                                        leftSection={<IconMobiledataOff size={20} />}
                                        color={jq.status ? "red" : "green"}
                                        onClick={() => openConfirmModal(jq._id, !jq.status)}
                                    >
                                        {jq.status ? "Deactivate" : "Activate"}
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
            <Box display="flex" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Group justify="space-between" align="center" w="100%">
                        {hasPrivilege("CREATE.QUALIFICATION") && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    form.reset();
                                    form.setValues({
                                        name: "",
                                        description: "",
                                    });
                                    jobQualificationModalHandle.open();
                                }}
                            >
                                + Add Job Qualification
                            </Button>
                        )}
                    </Group>
                </Box>
            </Box>

            <Box pb="xs" pt="lg" className="items-center justify-between">
                <Box className="h-full w-full">{contentView}</Box>
            </Box>

            <Modal
                opened={jobQualificationModalOpened}
                onClose={() => {
                    setId("");
                    setIsEdit(false);
                    form.setValues({ name: "", description: "" });
                    form.resetDirty();
                    jobQualificationModalHandle.close();
                }}
                title={<Text fw={500}>{isEdit ? "Edit" : "Add"} Document Type</Text>}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap={1}>
                        <TextInput
                            label="Name"
                            withAsterisk
                            placeholder="Enter Document type"
                            {...form.getInputProps("name")}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Add brief description"
                            withAsterisk
                            {...form.getInputProps("description")}
                        />
                        <Button mt="sm" loading={isLoading} type="submit" disabled={!form.isDirty()}>
                            Submit
                        </Button>
                    </Stack>
                </form>
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                opened={confirmModal.opened}
                onClose={() => setConfirmModal({ opened: false, id: "", status: false })}
                onConfirm={handleConfirmStatus}
                title={
                    confirmType === "activate" ? "Activate Job Qualification" : "Deactivate Job Qualification"
                }
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this job qualification?"
                        : "Are you sure you want to deactivate this job qualification?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default JobQualifications;
