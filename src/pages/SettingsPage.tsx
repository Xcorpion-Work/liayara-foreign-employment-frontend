import {
    ActionIcon,
    Box,
    Card,
    Divider,
    Group,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";
import xcorpion from "../assets/xcorpion.png";
import {
    IconBuilding,
    IconShieldLock,
    IconUser,
    IconUsersGroup,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";

const SettingsPage = () => {
    const navigate = useNavigate();

    const settingsCards = [
        {
            title: "Company Profile",
            description:
                "View and update your Company profile information and preference.",
            icon: <IconBuilding size={20} />,
            color: "blue",
            onClick: () => navigate("/app/settings/company-profile"),
        },
        {
            title: "Personal Profile",
            description:
                "View and update your personal profile information and preferences.",
            icon: <IconUser size={20} />,
            color: "green",
            onClick: () => navigate("/app/settings/personal-profile"),
        },
        {
            title: "User Management",
            description: "Add, update and view your company employees.",
            icon: <IconUsersGroup size={20} />,
            color: "teal",
            onClick: () => navigate("/app/settings/user-management"),
        },
        {
            title: "Role Management",
            description: "Customize your company roles and permissions.",
            icon: <IconShieldLock size={20} />,
            color: "violet",
            onClick: () => navigate("/app/settings/role-management"),
        },
    ];

    return (
        <>
            {/* Header */}
            <Box display="flex" p="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group>
                            <Text size="xl" fw="bold">
                                Settings
                            </Text>
                        </Group>
                        <Group>
                            <Text size="xs">
                                Manage your settings and preference
                            </Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            <Box
                display="flex"
                px="lg"
                className="items-center justify-between"
            >
                <SimpleGrid
                    cols={{ base: 1, sm: 2, md: 4, lg: 4 }}
                    spacing="lg"
                >
                    {settingsCards.map((card, index) => (
                        <Card
                            key={index}
                            withBorder
                            padding="lg"
                            radius="sm"
                            shadow="sm"
                            className={"cursor-pointer"}
                            onClick={card.onClick}
                        >
                            <Group justify="space-between">
                                <Text size="md" fw={500}>
                                    {card.title}
                                </Text>
                                <ActionIcon variant="light" color={card.color}>
                                    {card.icon}
                                </ActionIcon>
                            </Group>
                            <Text size="sm" mt="md" c="dimmed">
                                {card.description}
                            </Text>
                        </Card>
                    ))}
                </SimpleGrid>
            </Box>

            <Group
                className="mt-4 flex flex-row items-center gap-4 border w-fit px-2 py-2 cursor-pointer mx-4 my-4"
                onClick={() => window.open("https://xcorpion.xyz", "_blank")}
            >
                <img src={xcorpion} className="w-6" />
                <Text>XCORPION</Text>
            </Group>
        </>
    );
};

export default SettingsPage;
