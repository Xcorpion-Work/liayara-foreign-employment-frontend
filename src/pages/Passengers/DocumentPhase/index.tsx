import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Divider,
    FileInput,
    Flex,
    Group,
    Menu,
    Modal,
    Pagination,
    Stack,
    Table,
    Text,
} from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff, IconDotsVertical, IconEye, IconUpload } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { usePermission } from "../../../helpers/previlleges.ts";
import { pageRange, statusPreview } from "../../../helpers/preview.tsx";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import toNotify from "../../../hooks/toNotify.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { getPagedPassengersInDocumentPhase } from "../../../store/passengerSlice/passengerSlice.ts";
import { DynamicSearchBar } from "../../../components/DynamicSearchBar.tsx";
import { MAPPING_STATUS, MAPPING_STATUS_COLORS } from "../../../utils/settings.ts";
import { passengerDocumentFileUpload } from "../../../store/fileUploadSlice/fileUploadSlice.ts";

const DocumentPhase = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch | any>();
    const { hasPrivilege, hasAnyPrivilege } = usePermission();
    const { setLoading } = useLoading();
    const pageSize = 10;
    const [totalRecords, setTotalRecords] = useState(0);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const pagedPassengers = useSelector((state: RootState) => state.passenger.passengers);

    const [selectedPassenger, setSelectedPassenger] = useState<any>();
    const [documents, setDocuments] = useState([]);
    const [fileInputs, setFileInputs] = useState<{ [docId: string]: File | null }>({});
    const [documentUploadModal, documentUploadModelHandler] = useDisclosure();

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") ?? "1");
    const searchQuery = searchParams.get("search") ?? "";
    const mappingStatus = searchParams.get("status") ?? "";

    const [searchValues, setSearchValues] = useState<any[]>([searchQuery, mappingStatus]);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        fetchPassengers();
    }, [page, searchQuery, mappingStatus, sortField, sortOrder]);

    const fetchPassengers = async () => {
        setLoading(true);
        try {
            const filters = {
                pageSize,
                page,
                searchQuery,
                mappingStatus,
                sortField,
                sortOrder,
            };
            const response = await dispatch(getPagedPassengersInDocumentPhase({ filters }));
            if (response.type === "passenger/getPagedPassengersInDocumentPhase/rejected") {
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

    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleFileChange = (docId: string, file: File | null) => {
        setFileInputs((prev) => ({ ...prev, [docId]: file }));
    };

    const handleFileUpload = async (doc: any) => {
        const file = fileInputs[doc._id];
        if (!file) return;

        setLoading(true);
        documentUploadModelHandler.close();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "PASSENGER");
        formData.append("relatedId", selectedPassenger);
        formData.append("documentTypeId", doc?.documentTypeId?._id ?? doc?.documentTypeId);

        try {
            await dispatch(passengerDocumentFileUpload(formData));

            // Get updated passengers directly
            const filters = {
                pageSize,
                page,
                searchQuery,
                mappingStatus,
                sortField,
                sortOrder,
            };

            const response = await dispatch(getPagedPassengersInDocumentPhase({ filters }));
            const updatedList = response?.payload?.response?.result || [];

            const updatedPassenger = updatedList.find((p: any) => p.passengerId === selectedPassenger);

            console.log("updatedPassenger", updatedPassenger);
            setDocuments(updatedPassenger?.documents || []);
        } catch (error) {
            console.error(error);
            toNotify("Error", "Failed to upload document", "ERROR");
        } finally {
            setFileInputs({});
            documentUploadModelHandler.open(); // open modal after document is updated
            setLoading(false);
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
                                    {passenger?.passengerData?.passengerId || "-"} : {passenger?.passengerData?.name}
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
                                                <>
                                                <Menu.Item
                                                    leftSection={<IconUpload size={18} />}
                                                    onClick={() => {
                                                        setSelectedPassenger(passenger?.passengerId);
                                                        setDocuments(passenger?.documents);
                                                        documentUploadModelHandler.open();
                                                    }}
                                                >
                                                    Upload
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconEye size={18} />}
                                                    onClick={() =>
                                                        navigate(`/app/passengers/document-phase/view/${passenger._id}`)
                                                    }
                                                >
                                                    View
                                                </Menu.Item>
                                                </>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                            <Group mt="xs">
                                <Text size="sm">Phone: {passenger?.passengerData?.phone}</Text>
                            </Group>{" "}
                            <Group mt="xs">
                                <Text size="sm">Email: {passenger?.passengerData?.email || "N/A"}</Text>
                            </Group>
                            <Group mt="xs">
                                <Badge variant="light" radius="sm" color={MAPPING_STATUS_COLORS[passenger.mappingStatus]}>
                                    {statusPreview(passenger.mappingStatus)}
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
                        <Table.Th onClick={() => toggleSort("status")}>
                            <Group gap={4}>
                                Status{" "}
                                {sortField === "status" && <Text size="xs">{sortOrder === "asc" ? "▲" : "▼"}</Text>}
                            </Group>
                        </Table.Th>
                        <Table.Th w="15%">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {pagedPassengers?.map((passenger: any, index: number) => (
                        <Table.Tr key={passenger._id || index}>
                            <Table.Td>{passenger?.passengerData?.passengerId || "-"}</Table.Td>
                            <Table.Td>{passenger?.passengerData?.name}</Table.Td>
                            <Table.Td>{passenger?.passengerData?.phone}</Table.Td>
                            <Table.Td>
                                <Badge
                                    radius="sm"
                                    variant="light"
                                    color={MAPPING_STATUS_COLORS[passenger.mappingStatus]}
                                >
                                    {statusPreview(passenger.mappingStatus)}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                {hasAnyPrivilege(["VIEW.PASSENGER", "EDIT.PASSENGER"]) && (
                                    <Flex gap="4">
                                        <Button
                                            size="xs"
                                            color="violet"
                                            leftSection={<IconUpload size={16} />}
                                            onClick={() => {
                                                setSelectedPassenger(passenger?.passengerId);
                                                setDocuments(passenger?.documents);
                                                documentUploadModelHandler.open();
                                            }}
                                        >
                                            Upload
                                        </Button>
                                        <Button
                                            size="xs"
                                            leftSection={<IconEye size={16} />}
                                            onClick={() =>
                                                navigate(`/app/passengers/document-phase/view/${passenger._id}`)
                                            }
                                        >
                                            View
                                        </Button>
                                    </Flex>
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
                                    Document Phase
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">Manage your passengers in document phase</Text>
                        </Group>
                        <Divider mt="sm" />
                        <DynamicSearchBar
                            fields={[
                                { type: "text", placeholder: "Passenger Id, Name, Phone" },
                                {
                                    type: "select",
                                    placeholder: "Select a status",
                                    options: MAPPING_STATUS,
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

            <Modal
                opened={documentUploadModal}
                onClose={documentUploadModelHandler.close}
                title={
                    <Text fw={500} size="lg">
                        Upload Document
                    </Text>
                }
                size={ isMobile ? "100%" : "70%"}
            >
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Document Type</Table.Th>
                            <Table.Th>Uploaded Document</Table.Th>
                            <Table.Th>Select File</Table.Th>
                            <Table.Th>Upload File</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {documents?.map((doc: any, index: number) => (
                            <Table.Tr key={doc._id || index}>
                                <Table.Td>{doc.documentTypeData?.name}</Table.Td>
                                <Table.Td>{doc?.name || "N/A"}</Table.Td>
                                <Table.Td>
                                    <FileInput
                                        size="xs"
                                        disabled={doc?.isVerified}
                                        clearable
                                        placeholder="Select your file here"
                                        accept={
                                            doc.documentTypeData?.type === "Image"
                                                ? "image/jpeg,image/jpg,image/png"
                                                : ".pdf,.doc,.docx"
                                        }
                                        value={fileInputs[doc._id] || null}
                                        onChange={(file) => handleFileChange(doc._id, file)}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Button
                                        size="xs"
                                        disabled={doc?.isVerified || !fileInputs[doc._id]}
                                        onClick={() => handleFileUpload(doc)}
                                    >
                                        Upload
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Modal>
        </>
    );
};

export default DocumentPhase;
