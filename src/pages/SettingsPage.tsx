import { Box, Divider, Group, Stack, Tabs, Text } from "@mantine/core";
import xcorpion from "../assets/xcorpion.png";
import CompanyDetails from "./Settings/Tabs/CompanyDetails.tsx";
import PersonalDetails from "./Settings/Tabs/PersonalDetails.tsx";
import PassengersDetails from "./Settings/Tabs/PassengersDetails.tsx";
import JobDetails from "./Settings/Tabs/JobDetails.tsx";
import DashboardDetails from "./Settings/Tabs/DashboardDetails.tsx";

const SettingsPage = () => {
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
                <Tabs variant="pills" defaultValue="company_details" className="w-full">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="company_details">
                            Company Details
                        </Tabs.Tab>
                        <Tabs.Tab value="personal_details">
                            Personal Details
                        </Tabs.Tab>
                        <Tabs.Tab value="passengers_details">
                            Passengers Details
                        </Tabs.Tab>
                        <Tabs.Tab value="job_details">Job Details</Tabs.Tab>
                        <Tabs.Tab value="dashboard_details">
                            Dashboard Details
                        </Tabs.Tab>
                    </Tabs.List>

                    <Box className="w-full" my="lg">
                        <Tabs.Panel value="company_details">
                            <CompanyDetails/>
                        </Tabs.Panel>

                        <Tabs.Panel value="personal_details">
                           <PersonalDetails/>
                        </Tabs.Panel>

                        <Tabs.Panel value="passengers_details">
                            <PassengersDetails/>
                        </Tabs.Panel>

                        <Tabs.Panel value="job_details">
                            <JobDetails/>
                        </Tabs.Panel>

                        <Tabs.Panel value="dashboard_details">
                            <DashboardDetails/>
                        </Tabs.Panel>
                    </Box>
                </Tabs>
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
