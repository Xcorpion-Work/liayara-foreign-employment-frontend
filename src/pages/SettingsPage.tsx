import { ActionIcon, Box, Card, Divider, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import xcorpion from "../assets/xcorpion.png";
import {
    IconBriefcase,
    IconBuilding,
    IconFile,
    IconShieldLock,
    IconStairs,
    IconUser,
    IconUsersGroup,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { usePermission } from "../helpers/previlleges.ts";

const SettingsPage = () => {
    const navigate = useNavigate();
    const { hasAnyPrivilege} = usePermission();

    const settingsCards = [
        {
            title: "Company Profile",
            description: "View and update your Company profile information and preference.",
            icon: <IconBuilding size={20} />,
            color: "blue",
            permissions: ["VIEW.ORGANIZATION.DATA"],
            onClick: () => navigate("/app/settings/company-profile"),
        },
        {
            title: "Personal Profile",
            description: "View and update your personal profile information and preferences.",
            icon: <IconUser size={20} />,
            color: "green",
            onClick: () => navigate("/app/settings/personal-profile"),
        },
        {
            title: "User Management",
            description: "Add, update and view your company employees.",
            icon: <IconUsersGroup size={20} />,
            color: "teal",
            permissions: ["VIEW.ROLE"],
            onClick: () => navigate("/app/settings/user-management"),
        },
        {
            title: "Role Management",
            description: "Customize your company roles and permissions.",
            icon: <IconShieldLock size={20} />,
            color: "violet",
            permissions: ["VIEW.ROLE"],
            onClick: () => navigate("/app/settings/role-management"),
        },
        {
            title: "Passenger Status",
            description: "Customize passenger statuses, approval roles and sequences",
            icon: <IconStairs size={20} />,
            color: "orange",
            permissions: ["VIEW.PASSENGER.STATUS"],
            onClick: () => navigate("/app/settings/passenger-status"),
        },
        {
            title: "Document Types",
            description: "Customize passenger documents which required to process",
            icon: <IconFile size={20} />,
            color: "yellow",
            permissions: ["VIEW.PASSENGER.DOCUMENT.TYPE"],
            onClick: () => navigate("/app/settings/passenger-documents"),
        },
        {
            title: "Job Catalogs",
            description: "Customize job catalog of your company",
            icon: <IconBriefcase size={20} />,
            color: "grey",
            permissions: ["VIEW.JOB.CATALOG"],
            onClick: () => navigate("/app/settings/job-catalogs"),
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
                            <Text size="xs">Manage your settings and preference</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            <Box display="flex" px="lg" className="items-center justify-between">
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 4 }} spacing="lg">
                    {settingsCards.map((card, index) => {
                        const canShow = !card.permissions || hasAnyPrivilege(card.permissions);
                        return canShow && (
                            <Card
                                key={index}
                                withBorder
                                padding="lg"
                                radius="sm"
                                shadow="sm"
                                className="cursor-pointer"
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
                        );
                    })}
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
