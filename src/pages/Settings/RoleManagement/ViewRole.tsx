import { Badge, Box, Divider, Group, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconArrowLeft, IconDatabaseOff } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../hooks/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../hooks/toNotify.tsx";
import { getRole } from "../../../store/userSlice/userSlice.ts";

const ViewRole = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();

    const { id } = useParams<{ id: string }>();

    const selectedRole = useSelector((state: RootState) => state.user.selectedRole);

    useEffect(() => {
        fetchRole();
    }, []);

    const fetchRole = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getRole(id));
            if (response.type === "user/getRole/rejected") {
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
                                <IconArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
                                <Text size="xl" fw="bold">
                                    View Role
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">View role and view permissions</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Text fw={500}>Role Details</Text>
                    <br />
                    <Table withRowBorders={false}>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Name:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedRole.name}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Users Count:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>{selectedRole.users?.length} Users</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Permissions Count:
                                </Table.Td>
                                <Table.Td
                                    w={{
                                        lg: "70%",
                                        sm: "50%",
                                    }}
                                >
                                    {selectedRole.permissions?.length} Permissions
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Permissions:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    {selectedRole.permissionsData?.map((p: any, i: number) => (
                                        <Badge key={p._id || i} mr={1} mb={1} variant="light">
                                            {p.name}
                                        </Badge>
                                    ))}
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td w={{ lg: "30%", sm: "50%" }} fw={"bold"}>
                                    Status:
                                </Table.Td>
                                <Table.Td w={{ lg: "70%", sm: "50%" }}>
                                    <Badge color={selectedRole.status ? "green" : "red"} radius="sm">
                                        {selectedRole.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                    <br />
                    <Text fw={500}>Users Details</Text>
                    <br />
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={"20%"}>Name</Table.Th>
                                    <Table.Th w={"30%"}>Phone</Table.Th>
                                    <Table.Th w={"50%"}>Email</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {Array.isArray(selectedRole.users) && selectedRole.users.length > 0 ? (
                                    selectedRole.users.map((u: any, i: number) => (
                                        <Table.Tr key={u._id || i}>
                                            <Table.Td>{u.username}</Table.Td>
                                            <Table.Td>{u.phone}</Table.Td>
                                            <Table.Td>{u.email}</Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={3}>
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <IconDatabaseOff size={32} color="gray" />
                                                <Text size="sm" c="dimmed" mt="sm">
                                                    No data available
                                                </Text>
                                            </div>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Box>
            </Box>
        </>
    );
};

export default ViewRole;
