import { Box, Divider, Group, Stack, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";

const RoleManagement = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* Header */}
            <Box display="flex" p="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group>
                            <Group onClick={() => navigate(-1)} className="cursor-pointer">
                                <IconArrowLeft/>
                            </Group>
                            <Text size="xl" fw="bold">
                                Role Management
                            </Text>
                        </Group>
                        <Group>
                            <Text size="xs">
                                Manage your company details
                            </Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>
        </>
    );
};

export default RoleManagement;
