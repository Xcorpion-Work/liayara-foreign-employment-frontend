import {
    ActionIcon,
    AppShell,
    Box,
    Burger,
    Divider,
    Group,
    NavLink,
    Paper,
    ScrollArea,
    Stack,
    Text,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import logo from "../assets/logo1.png";
import UserInfo from "./UserInfo.tsx";
import {
    IconBriefcase,
    IconCurrentLocation,
    IconLayoutDashboard,
    IconList,
    IconMoon,
    IconSettings,
    IconSun,
    IconUserPlus,
    IconUsersGroup,
    IconWorldSearch,
} from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../store/store.ts";
import { usePermission } from "../helpers/previlleges.ts";

const BasicAppShell = () => {
    const { setColorScheme } = useMantineColorScheme();
    const { hasAnyPrivilege } = usePermission();
    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });
    const navigate = useNavigate();
    const location = useLocation();
    const userDetails = useSelector((state: RootState) => state.auth.user);
    const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

    const greetingName = userDetails?.username?.split(" ")[0];
    const activePath = location?.pathname?.split("/")[2];
    const subActivePath = `${location?.pathname?.split("/")[2]}/${location?.pathname?.split("/")[3]}`;

    const handleNavLinkClick = (path: any) => {
        navigate(path);
        closeMobile();
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
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                        <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
                        <img src={logo} height={30} className="h-10 ml-6" alt="logo" />
                    </Box>
                    <Group display="flex" justify="center">
                        <ActionIcon
                            onClick={() => setColorScheme(computedColorScheme === "light" ? "dark" : "light")}
                            variant="light"
                            size="md"
                            aria-label="Toggle color scheme"
                            mr="sm"
                        >
                            {computedColorScheme === "light" ? <IconMoon stroke={1.5} /> : <IconSun stroke={1.5} />}
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
                        leftSection={<IconLayoutDashboard size="1rem" stroke={1.5} />}
                        variant="filled"
                        active={activePath === "dashboard"}
                    />
                    <NavLink
                        label="Passengers"
                        leftSection={<IconUsersGroup size="1rem" stroke={1.5} />}
                        variant="filled"
                        active={activePath === "passengers"}
                    >
                        <NavLink label="Registry" leftSection={<IconList size="1rem" stroke={1.5} />} variant="light" />
                    </NavLink>
                    {hasAnyPrivilege(["VIEW.SUB.AGENT", "CREATE.SUB.AGENT", "EDIT.SUB.AGENT"]) && (
                        <NavLink
                            label="Sub Agents"
                            leftSection={<IconUserPlus size="1rem" stroke={1.5} />}
                            variant="filled"
                            active={activePath === "sub-agents"}
                        >
                            {hasAnyPrivilege(["VIEW.SUB.AGENT", "CREATE.SUB.AGENT", "EDIT.SUB.AGENT"]) && (
                                <NavLink
                                    label="Registry"
                                    leftSection={<IconList size="1rem" stroke={1.5} />}
                                    variant="light"
                                    onClick={() => handleNavLinkClick("sub-agents/registry")}
                                    active={subActivePath === "sub-agents/registry"}
                                />
                            )}
                        </NavLink>
                    )}
                    {hasAnyPrivilege(["VIEW.FOREIGN.AGENT", "CREATE.FOREIGN.AGENT", "EDIT.FOREIGN.AGENT"]) && (
                        <NavLink
                            label="Foreign Agents"
                            leftSection={<IconWorldSearch size="1rem" stroke={1.5} />}
                            variant="filled"
                            active={activePath === "foreign-agents"}
                        >
                            {hasAnyPrivilege(["VIEW.FOREIGN.AGENT", "CREATE.FOREIGN.AGENT", "EDIT.FOREIGN.AGENT"]) && (
                                <NavLink
                                    label="Registry"
                                    leftSection={<IconList size="1rem" stroke={1.5} />}
                                    variant="light"
                                    onClick={() => handleNavLinkClick("foreign-agents/registry")}
                                    active={subActivePath === "foreign-agents/registry"}
                                />
                            )}
                            {hasAnyPrivilege(["VIEW.JOB.ORDER", "CREATE.JOB.ORDER", "EDIT.JOB.ORDER"]) && (
                                <NavLink
                                    label="Job Orders"
                                    leftSection={<IconBriefcase size="1rem" stroke={1.5} />}
                                    variant="light"
                                />
                            )}
                        </NavLink>
                    )}
                    <NavLink
                        label="Local Agents"
                        leftSection={<IconCurrentLocation size="1rem" stroke={1.5} />}
                        variant="filled"
                        active={activePath === "passengers"}
                    >
                        <NavLink label="Registry" leftSection={<IconList size="1rem" stroke={1.5} />} variant="light" />
                    </NavLink>
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
