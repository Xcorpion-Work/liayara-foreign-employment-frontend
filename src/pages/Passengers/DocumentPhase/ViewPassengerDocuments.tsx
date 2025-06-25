import { Badge, Box, Button, Divider, Group, Modal, Table, Text, Textarea } from "@mantine/core";
import { IconArrowLeft, IconLink } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect, useState } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getPassengerDocumentsView, updatePassengerDocuments } from "../../../store/passengerSlice/passengerSlice.ts";
import { statusPreview } from "../../../helpers/preview.tsx";
import { MAPPING_STATUS_COLORS } from "../../../utils/settings.ts";
import { useDisclosure } from "@mantine/hooks";

const ViewPassengerDocuments = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();

    const { id } = useParams<{ id: string }>();
    const selectedPassengerDocuments = useSelector((state: RootState) => state.passenger.passengerDocumentsView);
    const documents = selectedPassengerDocuments?.documents;

    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [modalMode, setModalMode] = useState<"VERIFY" | "REJECT" | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        fetchPassengerDocumentsView();
    }, []);

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
            id: selectedPassengerDocuments._id,
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

    return (
        <>
            <Box p="lg">
                <Group justify="space-between" align="center" mb="xs">
                    <Group className="cursor-pointer" onClick={() => navigate(-1)}>
                        <IconArrowLeft />
                        <Text size="xl" fw="bold">
                            View Passenger {selectedPassengerDocuments?.passengerData?.passengerId}
                        </Text>
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
                                    {selectedPassengerDocuments?.passengerData?.passengerId || "-"}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Name:</Table.Td>
                                <Table.Td>{selectedPassengerDocuments?.passengerData?.name}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Phone:</Table.Td>
                                <Table.Td>{selectedPassengerDocuments?.passengerData?.phone}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Email:</Table.Td>
                                <Table.Td>{selectedPassengerDocuments?.passengerData?.email || "N/A"}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={"bold"}>Passenger Status:</Table.Td>
                                <Table.Td>
                                    <Badge
                                        radius="sm"
                                        color={MAPPING_STATUS_COLORS[selectedPassengerDocuments?.mappingStatus]}
                                    >
                                        {statusPreview(selectedPassengerDocuments?.mappingStatus)}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Box>
            </Box>

            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box>
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
                                            disabled={!doc?.name || doc.isVerified}
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
        </>
    );
};

export default ViewPassengerDocuments;
