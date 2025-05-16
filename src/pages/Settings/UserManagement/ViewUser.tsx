import { Badge, Box, Divider, Group, Stack, Table, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getUser } from "../../../store/userSlice/userSlice.ts";
import { datePreview } from "../../../helpers/preview.tsx";
import { useMediaQuery } from "@mantine/hooks";

const ViewUser = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const { id } = useParams<{ id: string }>();

    const selectedUser = useSelector((state: RootState) => state.user.selectedUser);
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getUser(id));
            if (response.type === "user/getUser/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
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
                            <Group >
                                <IconArrowLeft className="cursor-pointer" onClick={() => navigate(-1)}/>
                                <Text size="xl" fw="bold">
                                    View User
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">View user details</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Text fw={500}>User Details</Text>
                    <br />

                    <Table withRowBorders={false} highlightOnHover>
                        <Table.Tbody>
                            {/* Name */}
                            <Table.Tr>
                                <Table.Td w="30%" fw="bold">
                                    Name:
                                </Table.Td>
                                <Table.Td>{selectedUser?.username}</Table.Td>
                            </Table.Tr>

                            {/* Phone */}
                            <Table.Tr>
                                <Table.Td fw="bold">Phone:</Table.Td>
                                <Table.Td>{selectedUser?.phone}</Table.Td>
                            </Table.Tr>

                            {/* Alternative Phone */}
                            <Table.Tr>
                                <Table.Td fw="bold">Phone 2:</Table.Td>
                                <Table.Td>{selectedUser?.altPhone || "-"}</Table.Td>
                            </Table.Tr>

                            {/* Email */}
                            <Table.Tr>
                                <Table.Td fw="bold">Email:</Table.Td>
                                <Table.Td>{selectedUser?.email}</Table.Td>
                            </Table.Tr>

                            {/* Address */}
                            <Table.Tr>
                                <Table.Td fw="bold">Address:</Table.Td>
                                <Table.Td>{selectedUser?.address}</Table.Td>
                            </Table.Tr>

                            {/* Date of Birth */}
                            <Table.Tr>
                                <Table.Td fw="bold">Date of Birth:</Table.Td>
                                <Table.Td>{datePreview(selectedUser?.dateOfBirth)}</Table.Td>
                            </Table.Tr>

                            {/* NIC */}
                            <Table.Tr>
                                <Table.Td fw="bold">NIC:</Table.Td>
                                <Table.Td>{selectedUser?.nic}</Table.Td>
                            </Table.Tr>

                            {/* Role */}
                            <Table.Tr>
                                <Table.Td fw="bold">Role:</Table.Td>
                                <Table.Td>
                                    <Badge variant="outline" size={isMobile ? "sm" : "md"}>
                                        {selectedUser?.role?.name || "-"}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>

                            {/* Status */}
                            <Table.Tr>
                                <Table.Td fw="bold">Status:</Table.Td>
                                <Table.Td>
                                    <Badge
                                        size={isMobile ? "sm" : "md"}
                                        radius="sm"
                                        color={selectedUser?.status ? "green" : "red"}
                                    >
                                        {selectedUser?.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>

                            {/* Remark */}
                            <Table.Tr>
                                <Table.Td fw="bold">Remark:</Table.Td>
                                <Table.Td>{selectedUser?.remark || "-"}</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Box>
            </Box>
        </>
    );
};

export default ViewUser;
