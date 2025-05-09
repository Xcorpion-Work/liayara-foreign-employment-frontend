import {
    Box,
    Button,
    Divider,
    Group,
    Stack,
    Text,
    Table,
    Badge,
    Card,
    Menu,
    ActionIcon,
    Modal,
    TextInput,
    Textarea,
} from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff, IconDotsVertical, IconPencil } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useEffect, useState } from "react";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import toNotify from "../../../helpers/toNotify.tsx";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
    createPassengerDocumentType,
    getAllPassengerDocumentTypes,
    updatePassengerDocumentType,
} from "../../../store/settingSlice/settingSlice.ts";
import { usePermission } from "../../../helpers/previlleges.ts";
import { isNotEmpty, useForm } from "@mantine/form";

const PassengerDocuments = () => {
    const navigate = useNavigate();
    const { hasPrivilege } = usePermission();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const [isLoading, setIsLoading] = useState(false);
    const allPassengerDocumentTypes = useSelector((state: RootState) => state.setting.passengerDocumentTypes);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [documentTypeAddModalOpened, documentTypeModalHandle] = useDisclosure(false);
    const [isEdit, setIsEdit] = useState(false);
    const [id, setId] = useState("");

    useEffect(() => {
        fetchAllPassengerDocumentTypes();
    }, []);

    const fetchAllPassengerDocumentTypes = async () => {
        setLoading(true);
        try {
            const filters = { status: true };
            const response = await dispatch(getAllPassengerDocumentTypes({ filters }));
            if (response.type === "setting/getAllPassengerDocumentTypes/rejected") {
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

    // 🔥 Extracted view
    let contentView;
    const passengerDocumentTypes = Array.isArray(allPassengerDocumentTypes)
        ? [...allPassengerDocumentTypes].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        : [];
    if (Array.isArray(passengerDocumentTypes) && passengerDocumentTypes.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {passengerDocumentTypes.map((psd: any, index: number) => (
                    <Box key={psd._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Badge radius="sm" variant="outline">
                                    {transformToTitle(psd.name)}
                                </Badge>

                                {hasPrivilege("EDIT.PASSENGER.DOCUMENT.TYPE") && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                leftSection={<IconPencil size={18} />}
                                                onClick={() => setDataForEdit(psd)}
                                            >
                                                Edit
                                            </Menu.Item>
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
                        <Table.Th w="30%">Name</Table.Th>
                        <Table.Th w="40%">Description</Table.Th>
                        <Table.Th w="30%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {passengerDocumentTypes.map((psd: any, index: number) => (
                        <Table.Tr key={psd._id || index}>
                            <Table.Td>
                                <Badge radius="sm" variant="outline">
                                    {transformToTitle(psd.name)}
                                </Badge>
                            </Table.Td>
                            <Table.Td>{psd.description || "-"}</Table.Td>
                            <Table.Td>
                                {hasPrivilege("EDIT.PASSENGER.DOCUMENT.TYPE") && (
                                    <Button
                                        size="xs"
                                        leftSection={<IconPencil size={20} />}
                                        color="violet"
                                        onClick={() => setDataForEdit(psd)}
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

    const form = useForm({
        initialValues: {
            name: "",
            description: "",
        },
        validate: {
            name: isNotEmpty("Name is required"),
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
        documentTypeModalHandle.open(); // Ensure it's here at the end
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(
                isEdit ? updatePassengerDocumentType({ id, ...form.values }) : createPassengerDocumentType(form.values)
            );

            if (
                response.type === "setting/updatePassengerDocumentType/rejected" ||
                response.type === "setting/createPassengerDocumentType/rejected"
            ) {
                toNotify("Error", response.payload?.error || "Please contact system admin", "ERROR");
            } else if (
                response.type === "setting/updatePassengerDocumentType/fulfilled" ||
                response.type === "setting/createPassengerDocumentType/fulfilled"
            ) {
                await fetchAllPassengerDocumentTypes();
                form.reset();
                documentTypeModalHandle.close();
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
                                    Passenger Document Types
                                </Text>
                            </Group>

                            {hasPrivilege("CREATE.PASSENGER.DOCUMENT.TYPE") && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setId("");
                                        setIsEdit(false);
                                        form.reset();
                                        form.resetDirty();
                                        documentTypeModalHandle.open();
                                    }}
                                >
                                    + Add Document Type
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage your document types which required from passengers</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box p="lg" className="items-center justify-between">
                <Box className="h-full w-full">{contentView}</Box>
            </Box>

            <Modal
                opened={documentTypeAddModalOpened}
                onClose={() => {
                    setId("");
                    setIsEdit(false);
                    form.setValues({ name: "", description: "" });
                    form.resetDirty();
                    documentTypeModalHandle.close();
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
        </>
    );
};

export default PassengerDocuments;
