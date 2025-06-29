import { Badge, Box, Button, Divider, FileInput, Group, Modal, Table, Text, Textarea } from "@mantine/core";
import { IconArrowLeft, IconLink, IconUpload } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect, useState } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import {
    getPassengerDocumentsView,
    updatePassengerDocuments,
} from "../../../store/passengerSlice/passengerSlice.ts";
import { statusPreview } from "../../../helpers/preview.tsx";
import { MAPPING_STATUS_COLORS } from "../../../utils/settings.ts";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { usePermission } from "../../../helpers/previlleges.ts";
import { passengerDocumentFileUpload } from "../../../store/fileUploadSlice/fileUploadSlice.ts";

const ViewPassengerDocuments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const { hasPrivilege } = usePermission();

    const { id } = useParams<{ id: any }>();
    const selectedPassengerDocument = useSelector((state: RootState) => state.passenger.passengerDocumentsView);
    const documents = selectedPassengerDocument?.documents;

    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [modalMode, setModalMode] = useState<"VERIFY" | "REJECT" | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState("");

    const isMobile = useMediaQuery("(max-width: 768px)");
    const [documentUploadModal, documentUploadModelHandler] = useDisclosure();
    const [fileInputs, setFileInputs] = useState<{ [docId: string]: File | null }>({});

    useEffect(() => {
        fetchPassengerDocumentsView();
    }, [id]);

    const fetchPassengerDocumentsView = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getPassengerDocumentsView(id));
            if (response.type === "passenger/getPassengerDocumentsView/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDoc || !modalMode) return;

        const payload = {
            id: selectedPassengerDocument._id,
            documentTypeId: selectedDoc.documentTypeId,
            isVerified: modalMode === "VERIFY",
            isRejected: modalMode === "REJECT",
            reason: modalMode === "REJECT" ? rejectReason : undefined,
        };

        try {
            await dispatch(updatePassengerDocuments(payload));
            toNotify("Success", `Document ${modalMode === "VERIFY" ? "verified" : "rejected"} successfully`, "SUCCESS");
            await fetchPassengerDocumentsView(); // refresh list
        } catch (error) {
            console.error(error);
            toNotify("Error", "Something went wrong", "ERROR");
        }

        setRejectReason("");
        setSelectedDoc(null);
        setModalMode(null);
        closeModal();
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
        formData.append("relatedId", selectedPassengerDocument?.passengerId);
        formData.append("documentTypeId", doc?.documentTypeId?._id ?? doc?.documentTypeId);

        try {
            await dispatch(passengerDocumentFileUpload(formData));
        } catch (error) {
            console.error(error);
            toNotify("Error", "Failed to upload document", "ERROR");
        } finally {
            await fetchPassengerDocumentsView();
            setFileInputs({});
            setLoading(false);
        }
    };

    return (
        <>
            <Box p="lg">
                <Group justify="space-between" align="center" mb="xs">
                    <Group className="cursor-pointer" onClick={() => navigate(-1)}>
                        <IconArrowLeft />
                        <Text size="xl" fw="bold">
                            View Passenger {selectedPassengerDocument?.passengerData?.passengerId}
                        </Text>
                    </Group>
                    <Group>
                        {hasPrivilege("EDIT.PASSENGER") && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    documentUploadModelHandler.open();
                                }}
                                leftSection={<IconUpload size={18} />}
                                color="violet"
                            >
                                Upload Files
                            </Button>
                        )}
                    </Group>
                </Group>

                <Text size="xs" mb="sm">
                    View passenger details
                </Text>
                <Divider />
            </Box>

            {/* Info Table */}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Box className="flex justify-between items-center w-full">
                        <Text fw={500}>Passenger Details</Text>
                    </Box>

                    <br />
                    <Table withRowBorders={false}>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Id:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {selectedPassengerDocument?.passengerData?.passengerId || "-"}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Name:</Table.Td>
                                <Table.Td>{selectedPassengerDocument?.passengerData?.name}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Phone:</Table.Td>
                                <Table.Td>{selectedPassengerDocument?.passengerData?.phone}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Email:</Table.Td>
                                <Table.Td>{selectedPassengerDocument?.passengerData?.email || "N/A"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Passenger Status:</Table.Td>
                                <Table.Td>
                                    <Badge
                                        radius="sm"
                                        color={MAPPING_STATUS_COLORS[selectedPassengerDocument?.mappingStatus]}
                                    >
                                        {statusPreview(selectedPassengerDocument?.mappingStatus)}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Box>
            </Box>

            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Document Type</Table.Th>
                            <Table.Th>Uploaded File</Table.Th>
                            <Table.Th>Actions</Table.Th>
                            <Table.Th>Done By</Table.Th>
                            <Table.Th>Reason</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {documents?.map((doc: any, index: number) => (
                            <Table.Tr key={index || doc._id}>
                                <Table.Td>{doc?.documentTypeData?.name}</Table.Td>
                                <Table.Td>
                                    {doc?.path ? (
                                        <Group gap="xs">
                                            <Text
                                                component="a"
                                                href={doc.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                c="blue"
                                                td="underline"
                                            >
                                                {doc.name}
                                            </Text>
                                            <a href={doc.path} target="_blank" rel="noopener noreferrer">
                                                <IconLink size={16} color={"blue"} />
                                            </a>
                                        </Group>
                                    ) : (
                                        "N/A"
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Button
                                        size="xs"
                                        color="green"
                                        disabled={!doc?.name || doc.isVerified}
                                        onClick={() => {
                                            setSelectedDoc(doc);
                                            setModalMode("VERIFY");
                                            openModal();
                                        }}
                                        mb={4}
                                    >
                                        Verify
                                    </Button>{" "}
                                    <Button
                                        size="xs"
                                        color="red"
                                        disabled={!doc?.name || doc.isVerified || doc.isRejected}
                                        onClick={() => {
                                            setSelectedDoc(doc);
                                            setModalMode("REJECT");
                                            openModal();
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </Table.Td>
                                <Table.Td>
                                    {!doc?.name
                                        ? "N/A"
                                        : doc?.isVerified
                                          ? `Verified by ${doc?.verifiedByData?.username}`
                                          : doc?.isRejected
                                            ? `Rejected by ${doc?.rejectedByData?.username}`
                                            : `Uploaded by ${doc?.uploadedByData?.username}`}
                                </Table.Td>
                                <Table.Td>{doc?.reason || "-"}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Box>

            <Modal
                opened={modalOpened}
                onClose={() => {
                    setRejectReason("");
                    setSelectedDoc(null);
                    setModalMode(null);
                    closeModal();
                }}
                title={modalMode === "VERIFY" ? "Verify Document" : "Reject Document"}
                centered
                withCloseButton
            >
                {modalMode === "VERIFY" ? (
                    <Text>Are you sure you want to verify this document?</Text>
                ) : (
                    <Textarea
                        label="Reason for rejection"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.currentTarget.value)}
                        placeholder="Enter reason"
                        minRows={3}
                        required
                    />
                )}

                <Group mt="md" justify="flex-end">
                    <Button
                        variant="default"
                        onClick={() => {
                            setRejectReason("");
                            setSelectedDoc(null);
                            setModalMode(null);
                            closeModal();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color={modalMode === "VERIFY" ? "green" : "red"}
                        disabled={modalMode === "REJECT" && !rejectReason.trim()}
                        onClick={handleSubmit}
                    >
                        {modalMode === "VERIFY" ? "Confirm" : "Reject"}
                    </Button>
                </Group>
            </Modal>

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

export default ViewPassengerDocuments;
