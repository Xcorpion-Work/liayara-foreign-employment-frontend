import { Box, Divider, Group, Stack, Text, Tabs } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import JobQualifications from "./JobQualifications";
import LanguageQualifications from "./LanguageQualifications";

const Qualifications = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* Header */}
            <Box display="flex" p="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group justify="space-between" align="center" w="100%">
                            <Group className="cursor-pointer" onClick={() => navigate("/app/settings")}>
                                <IconArrowLeft />
                                <Text size="xl" fw="bold">
                                    Qualifications
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">Manage your passengers job and language qualifications</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            <Box px="lg" className="items-center justify-between">
                <Tabs variant="pills" defaultValue="job_q" color="violet">
                    <Tabs.List>
                        <Tabs.Tab value="job_q">Job Qualifications</Tabs.Tab>
                        <Tabs.Tab value="language_q">Language Qualifications</Tabs.Tab>
                    </Tabs.List>
                    <Divider my="xs" />

                    <Box py="lg">
                        <Tabs.Panel value="job_q">
                            <JobQualifications />
                        </Tabs.Panel>
                        <Tabs.Panel value="language_q">
                            <LanguageQualifications />
                        </Tabs.Panel>
                    </Box>
                </Tabs>
            </Box>
        </>
    );
};

export default Qualifications;
