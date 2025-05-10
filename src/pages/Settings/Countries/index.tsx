import {
    Box,
    Button,
    Divider,
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
import { IconArrowLeft, IconDatabaseOff, IconDotsVertical, IconMobiledataOff } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useEffect, useState } from "react";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import toNotify from "../../../helpers/toNotify.tsx";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { createCountry, getAllCountries, updateCountry } from "../../../store/settingSlice/settingSlice.ts";
import { usePermission } from "../../../helpers/previlleges.ts";
import { isNotEmpty, useForm } from "@mantine/form";
import countriesJson from "../../../assets/countries.json";
import ConfirmModal from "../../../components/confirmModal.tsx";

const Countries = () => {
    const navigate = useNavigate();
    const { hasPrivilege } = usePermission();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const [isLoading, setIsLoading] = useState(false);
    const allCountries = useSelector((state: RootState) => state.setting.countries);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [countryAddModalOpened, countryAddModalHandle] = useDisclosure(false);

    const [confirmModal, setConfirmModal] = useState({
        opened: false,
        id: "",
        status: false,
    });
    const [confirmType, setConfirmType] = useState<"activate" | "deactivate">("activate");

    useEffect(() => {
        fetchAllCountries();
    }, []);

    const fetchAllCountries = async () => {
        setLoading(true);
        try {
            const filters = {};
            const response = await dispatch(getAllCountries({ filters }));
            if (response.type === "setting/getAllCountries/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (id: string, newStatus: boolean) => {
        setConfirmModal({ opened: true, id, status: newStatus });
        setConfirmType(newStatus ? "activate" : "deactivate");
    };

    const handleConfirmStatus = async () => {
        setConfirmModal((prev) => ({ ...prev, opened: false }));
        if (!confirmModal.id) return;

        setLoading(true);
        try {
            const payload = { id: confirmModal.id, status: confirmModal.status };
            const response = await dispatch(updateCountry(payload));
            if (response.type === "setting/updateCountry/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Job catalog updated successfully", "SUCCESS");
                fetchAllCountries();
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

    // 🔥 Extracted view
    let contentView;
    const countries = Array.isArray(allCountries)
        ? [...allCountries].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        : [];
    if (Array.isArray(countries) && countries.length > 0) {
        contentView = isMobile ? (
            <Stack gap="md">
                {countries.map((country: any, index: number) => (
                    <Box key={country._id || index}>
                        <Card withBorder p="md">
                            <Group justify="space-between" align="flex-start">
                                <Stack>
                                    <Badge radius="sm" variant="outline">
                                        {transformToTitle(country.name)}
                                    </Badge>
                                    <Badge variant="light">
                                        {" "}
                                        {country?.language?.name} - {country?.language?.code}
                                    </Badge>
                                    <Badge variant="dot">
                                        {country?.currency?.name} - {country?.currency?.code}
                                    </Badge>
                                    <Badge color={country.status ? "green" : "red"} radius="sm">
                                        {country.status ? "ACTIVE" : "INACTIVE"}
                                    </Badge>
                                </Stack>

                                {hasPrivilege("EDIT.PASSENGER.DOCUMENT.TYPE") && (
                                    <Menu withinPortal position="bottom-end" shadow="md">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={18} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {hasPrivilege("EDIT.COUNTRY") && (
                                                <Menu.Item
                                                    leftSection={<IconMobiledataOff size={18} />}
                                                    color={country.status ? "red" : "green"}
                                                    onClick={() => openConfirmModal(country._id, !country.status)}
                                                >
                                                    {country.status ? "Deactivate" : "Activate"}
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
            {countries.map((country: any, index: number) => (
                <Card
                    key={country._id || index}
                    shadow="sm"
                    padding="sm"
                    radius="sm"
                    withBorder
                >
                    <Group justify="space-between">
                        {/* Country Name */}
                        <Badge radius="sm" variant="outline" >
                            {transformToTitle(country.name)}
                        </Badge>

                        {/* Language */}
                        <Badge variant="light" >
                            {country?.language?.name} - {country?.language?.code}
                        </Badge>

                        {/* Currency */}
                        <Badge variant="dot" >
                            {country?.currency?.name} - {country?.currency?.code}
                        </Badge>

                        {/* Status */}
                        <Badge color={country.status ? "green" : "red"} radius="sm">
                            {country.status ? "ACTIVE" : "INACTIVE"}
                        </Badge>

                        {/* Toggle */}
                        <Switch
                            size="sm"
                            checked={country.status}
                            onChange={() => openConfirmModal(country._id, !country.status)}
                        />
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
            country: "",
        },
        validate: {
            country: isNotEmpty("Country is required"),
        },
    });

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = countriesJson.find((country) => form.values.country === country.name);
            const response = await dispatch(createCountry(payload));

            if (response.type === "setting/createCountry/rejected") {
                toNotify("Error", response.payload?.error || "Please contact system admin", "ERROR");
            } else if (response.type === "setting/createCountry/fulfilled") {
                await fetchAllCountries();
                form.reset();
                countryAddModalHandle.close();
                toNotify("Success", "Country added successfully", "SUCCESS");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setIsLoading(false);
        }
    };

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
                                    Countries
                                </Text>
                            </Group>

                            {hasPrivilege("CREATE.PASSENGER.DOCUMENT.TYPE") && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        form.reset();
                                        form.resetDirty();
                                        countryAddModalHandle.open();
                                    }}
                                >
                                    + Add Country
                                </Button>
                            )}
                        </Group>
                        <Group>
                            <Text size="xs">Manage countries which your organization dealing with</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/* Content */}
            <Box p="lg" className="items-center justify-between">
                <Box className="h-full w-full">{contentView}</Box>
            </Box>

            <Modal
                opened={countryAddModalOpened}
                onClose={() => {
                    form.reset();
                    form.resetDirty();
                    countryAddModalHandle.close();
                }}
                title={<Text fw={500}>Add Country</Text>}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap={1}>
                        <Select
                            label="Country"
                            withAsterisk
                            searchable
                            description="Select countries which your company dealing with"
                            data={countriesJson?.map((country) => country.name)}
                            placeholder="Enter Countries"
                            {...form.getInputProps("country")}
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
                title={confirmType === "activate" ? "Activate Role" : "Deactivate Role"}
                message={
                    confirmType === "activate"
                        ? "Are you sure you want to activate this role?"
                        : "Are you sure you want to deactivate this role?"
                }
                confirmLabel={confirmType === "activate" ? "Activate" : "Deactivate"}
                cancelLabel="Cancel"
                confirmColor={confirmType === "activate" ? "green" : "red"}
            />
        </>
    );
};

export default Countries;
