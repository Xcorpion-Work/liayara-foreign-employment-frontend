import {
    ActionIcon,
    AppShell,
    Box,
    Burger,
    Divider,
    Group,
    NavLink,
    Paper,
    ScrollArea, Stack,
    Text,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import logo from "../assets/logo1.png";
import UserInfo from "./UserInfo.tsx";
import {
    IconLayoutDashboard,
    IconMoon,
    IconSettings,
    IconSun,
} from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../store/store.ts";
import cx from "clsx";
import classes from "./Demo.module.css";

const BasicAppShell = () => {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });
    const navigate = useNavigate();
    const location = useLocation();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
        useDisclosure(false);
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

    const greetingName = userDetails?.username?.split(" ")[0];
    const activePath = location?.pathname?.split("/")[2];

    const handleNavLinkClick = (path: any) => {
        navigate(path);
        closeMobile(); // Close the mobile navbar when a NavLink is clicked
    };

    const currentDate = new Date();
    const displayDate = currentDate.toISOString().split("T")[0];

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
            padding="md"
            zIndex={1}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Box display="flex" className="flex items-center">
                        <Burger
                            opened={mobileOpened}
                            onClick={toggleMobile}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <Burger
                            opened={desktopOpened}
                            onClick={toggleDesktop}
                            visibleFrom="sm"
                            size="sm"
                        />
                        <img
                            src={logo}
                            height={30}
                            className="h-10 ml-6"
                            alt="logo"
                        />
                    </Box>
                    <Group display="flex" justify="center">
                        <ActionIcon
                            onClick={() =>
                                setColorScheme(
                                    computedColorScheme === "light"
                                        ? "dark"
                                        : "light"
                                )
                            }
                            variant="light"
                            size="md"
                            aria-label="Toggle color scheme"
                            mr="sm"
                        >
                            <IconSun
                                className={cx(classes.icon, classes.light)}
                                stroke={1.5}
                            />
                            <IconMoon
                                className={cx(classes.icon, classes.dark)}
                                stroke={1.5}
                            />
                        </ActionIcon>
                        <UserInfo />
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar>
                <ScrollArea>
                    <NavLink
                        onClick={() => handleNavLinkClick("dashboard")}
                        label="Dashboard"
                        leftSection={
                            <IconLayoutDashboard size="1rem" stroke={1.5} />
                        }
                        variant="filled"
                        active={activePath === "dashboard"}
                    />
                </ScrollArea>
                <Group className="mt-auto">
                    <NavLink
                        onClick={() => handleNavLinkClick("settings")}
                        label="Settings"
                        leftSection={<IconSettings size="1rem" stroke={1.5} />}
                        variant="filled"
                        active={activePath === "settings"}
                    />
                </Group>
            </AppShell.Navbar>

            <AppShell.Main>
                <Paper shadow="md" mt="md" withBorder className="h-full w-full">
                    <Box className="h-full w-full">
                        {activePath === "dashboard" && (
                            <Stack p="md" gap={1}>
                                <Group>
                                    <Text size="xl" fw="bold">
                                        Hello {greetingName}.!
                                    </Text>
                                </Group>
                                <Group>
                                    <Text size="xs">{displayDate}</Text>
                                </Group>
                                <Divider mt="sm" />
                            </Stack>
                        )}

                        <Outlet />
                    </Box>
                </Paper>
            </AppShell.Main>
        </AppShell>
    );
};

export default BasicAppShell;
