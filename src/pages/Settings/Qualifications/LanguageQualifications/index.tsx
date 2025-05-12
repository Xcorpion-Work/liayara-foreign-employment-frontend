import {
    Box,
    Button,
    Group,
    Stack,
    Text,
    Badge,
    Card,
    Menu,
    ActionIcon,
    Modal,
    Select,
    Switch,
} from "@mantine/core";
import { IconDatabaseOff, IconDotsVertical, IconMobiledataOff } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import { isNotEmpty, useForm } from "@mantine/form";
import { usePermission } from "../../../../helpers/previlleges";
import { AppDispatch, RootState } from "../../../../store/store.ts";
import { useLoading } from "../../../../helpers/loadingContext.tsx";
import {
    createLanguageQualification,
    getAllLanguageQualification, updateLanguageQualification,
} from "../../../../store/settingSlice/settingSlice.ts";
import toNotify from "../../../../helpers/toNotify.tsx";
import countriesJson from "../../../../assets/countries.json";
import ConfirmModal from "../../../../components/confirmModal.tsx";

const LanguageQualifications = () => {
    const { hasPrivilege } = usePermission();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const [isLoading, setIsLoading] = useState(false);
    const allLanguageQualifications = useSelector((state: RootState) => state.setting.languageQualifications);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [languageQualificationModalOpened, languageQualificatiomodalHandle] = useDisclosure(false);
    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        id: "",
        status: false,
    });
    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

    const languageMap = new Map<string, { label: string; value: string }>();

    countriesJson?.forEach((country) => {
        const key = country.language.name;
        if (!languageMap.has(key)) {
            languageMap.set(key, {
                label: `${country.language.name} - ${country.language.code}`,
                value: country.language.name,
            });
        }
    });

    const languageList = Array.from(languageMap.values());

    useEffect(() => {
        fetchAllLanguageQualifications();
    }, []);

    const fetchAllLanguageQualifications = async () => {
        setLoading(true);
        try {
            const filters = {};
            const response = await dispatch(getAllLanguageQualification({ filters }));
            if (response.type === "setting/getAllLanguageQualification/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const transformToTitle = (input: string): string => {
        return input
            ?.replace(/_/g, " ")
            ?.toLowerCase()
            ?.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const openConfirmModal = (id: string, newStatus: boolean) => {
        setConfirmModal({ opened: true, id, status: newStatus });
        setConfirmType(newStatus ? "activate" : "deactivate");
    };

    // 🔥 Extracted view
    let contentView;
    const langaugeQualifications = Array.isArray(allLanguageQualifications)
        ? [...allLanguageQualifications].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        : [];
    if (Array.isArray(langaugeQualifications) && langaugeQualifications.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {langaugeQualifications?.map((lq: any, index: number) => (
                    <Box key={lq._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Stack>
                                    <Badge radius="sm" variant="outline">
                                        {transformToTitle(lq.name)}
                                    </Badge>
                                    <Badge color={lq.status ? "green" : "red"} radius="sm">
                                        {lq.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Stack>

                                {hasPrivilege("EDIT.QUALIFICATION") && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("EDIT.QUALIFICATION") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={lq.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(lq._id, !lq.status)}
                                                >
                                                    {lq.status ? "Deactivate" : "Activate"}
                                                </Menu.Item>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                )}
                            </Group>
                        </Card>
                    </Box>
                ))}
            </Stack>
        ) : (
            <Stack gap="sm">
                {langaugeQualifications.map((lq: any, index: number) => (
                    <Card
                        key={lq._id || index}
                        shadow="sm"
                        padding="sm"
                        radius="sm"
                        withBorder
                    >
                        <Group justify="space-between">
                            {/* Country Name */}
                            <Badge radius="sm" variant="outline" >
                                {transformToTitle(lq.name)} - {lq.code}
                            </Badge>
                            {/* Status */}
                            <Badge color={lq.status ? "green" : "red"} radius="sm">
                                {lq.status ? "ACTIVE" : "INACTIVE"}
                            </Badge>

                            {/* Toggle */}
                            {hasPrivilege("EDIT.QUALIFICATION") && (
                                <Switch
                                    size="sm"
                                    checked={lq.status}
                                    onChange={() => openConfirmModal(lq._id, !lq.status)}
                                />
                            )}
                        </Group>
                    </Card>
                ))}
            </Stack>
        );
    } else {
        contentView = (
            <Group justify="center" align="center" h="300px">
                <Stack align="center" gap="xs">
                    <IconDatabaseOff size={40} color="gray" />
                    <Text size="sm" c="dimmed">
                        No data available
                    </Text>
                </Stack>
            </Group>
        );
    }

    const form = useForm({
        initialValues: {
            language: "",
        },
        validate: {
            language: isNotEmpty("Language is required"),
        },
    });

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const matchedCountry = countriesJson.find(
                (c) => c.language.name === form.values.language
            );

            const payload = matchedCountry?.language || null;
            const response = await dispatch(createLanguageQualification(payload));

            if (response.type === "setting/createLanguageQualification/rejected") {
                toNotify("Error", response.payload?.error || "Please contact system admin", "ERROR");
            } else if (response.type === "setting/createLanguageQualification/fulfilled") {
                await fetchAllLanguageQualifications();
                form.reset();
                languageQualificatiomodalHandle.close();
                toNotify("Success", "Language Qualification type added successfully", "SUCCESS");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmStatus = async () => {
        setConfirmModal((prev) => ({ ...prev, opened: false }));
        if (!confirmModal.id) return;

        setLoading(true);
        try {
            const payload = { id: confirmModal.id, status: confirmModal.status };
            const response = await dispatch(updateLanguageQualification(payload));
            if (response.type === "setting/updateLanguageQualification/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Language Qualification updated successfully", "SUCCESS");
                fetchAllLanguageQualifications();
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
            <Box display="flex" className="items-center justify-between">
                <Box className="h-full w-full">
                    <Stack gap={1}>
                        <Group justify="space-between" align="center" w="100%">
                            {hasPrivilege("CREATE.QUALIFICATION") && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        form.reset();
                                        form.resetDirty();
                                        languageQualificatiomodalHandle.open();
                                    }}
                                >
                                    + Add Language Qualification
                                </Button>
                            )}
                        </Group>
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box pb="xs" pt="lg" className="items-center justify-between">
                <Box className="h-full w-full">{contentView}</Box>
            </Box>

            <Modal
                opened={languageQualificationModalOpened}
                onClose={() => {
                    form.resetDirty();
                    languageQualificatiomodalHandle.close();
                }}
                title={<Text fw={500}>Add Language Qualification</Text>}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap={1}>
                        <Select
                            label="Language"
                            withAsterisk
                            placeholder="Select Language"
                            description="Select a language"
                            data={languageList}
                            searchable
                            clearable
                            {...form.getInputProps("language")}
                        />
                        <Button mt="sm" loading={isLoading} type="submit" disabled={!form.isDirty()}>
                            Submit
                        </Button>
                    </Stack>
                </form>
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                opened={confirmModal.opened}
                onClose={() => setConfirmModal({ opened: false, id: "", status: false })}
                onConfirm={handleConfirmStatus}
                title={confirmType === "activate" ? "Activate Language Qualification" : "Deactivate Language Qualification"}
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this language qualification?"
                        : "Are you sure you want to deactivate this language qualification?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default LanguageQualifications;
