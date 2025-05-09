import {
    Box,
    Button,
    Divider,
    Group,
    MultiSelect,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { useLoading } from "../../../helpers/loadingContext.tsx";
import { useEffect } from "react";
import toNotify from "../../../helpers/toNotify.tsx";
import {  getRoles } from "../../../store/userSlice/userSlice.ts";
import { isNotEmpty, useForm } from "@mantine/form";
import { confirmUserLogin } from "../../../store/authSlice/authSlice.ts";
import { getPassengerStatus, updatePassengerStatus } from "../../../store/settingSlice/settingSlice.ts";

const EditPassengerStatus = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { setLoading } = useLoading();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const passengerStatusId = searchParams.get("id");

    const roles = useSelector((state: RootState) => state.user.roles);
    const selectedPassengerStatus = useSelector((state: RootState) => state.setting.selectedPassengerStatus);

    useEffect(() => {
        fetchRoles();
        fetchSelectedPassengerStatus();
    }, []);

    useEffect(() => {
        if (selectedPassengerStatus) {
            form.setValues({
                name: selectedPassengerStatus.name || "",
                code: selectedPassengerStatus.code || "",
                roles: selectedPassengerStatus.roles || [],
            });
            form.resetDirty();
        }
    }, [selectedPassengerStatus]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const filters = { status: true };
            const response = await dispatch(getRoles({ filters }));
            if (response.type === "user/getRoles/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const fetchSelectedPassengerStatus = async () => {
        setLoading(true);
        try {
            const response = await dispatch(getPassengerStatus(passengerStatusId));
            if (response.type === "setting/getPassengerStatus/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            }
        } catch (e) {
            console.error(e);
            toNotify("Something went wrong", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
        }
    };

    const form = useForm({
        initialValues: {
            name: "",
            code: "",
            roles: [] as string[],
        },
        validate: {
            name: isNotEmpty("Name is required"),
            code: isNotEmpty("Code is required"),
            roles: (value) => {
                if (value.length < 1) {
                    return "At least need one role for approval";
                }
                return null;
            },
        },
    });

    const selectableRoles = Array.isArray(roles)
        ? roles.map((r: any) => ({ label: r.name, value: r._id }))
        : [];

    const handleSubmitPassengerStatus = async () => {
        setLoading(true);
        try {
            const payload = form.values;
            const response = await dispatch(updatePassengerStatus({ id: passengerStatusId, ...payload }));

            if (response.type === "setting/updatePassengerStatus/rejected") {
                toNotify("Error", response.payload.error || "Please contact system admin", "ERROR");
            } else {
                toNotify("Success", "Passenger status updated successfully" , "SUCCESS");
                navigate("/app/settings/passenger-status");
                await dispatch(confirmUserLogin());
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
                            <Group className="cursor-pointer" onClick={() => navigate(-1)}>
                                <IconArrowLeft />
                                <Text size="xl" fw="bold">
                                     Edit Passenger Status
                                </Text>
                            </Group>
                        </Group>
                        <Group>
                            <Text size="xs">Edit roles which have permissions to approve</Text>
                        </Group>
                        <Divider mt="sm" />
                    </Stack>
                </Box>
            </Box>

            {/*Form*/}
            <Box display="flex" px="lg" pb="lg" className="items-center justify-between">
                <Box className="h-full w-full">
                    <form onSubmit={form.onSubmit(handleSubmitPassengerStatus)}>
                        <TextInput
                            label="Name"
                            withAsterisk
                            placeholder="Enter Name"
                            disabled={true}
                            w={{ lg: "50%", sm: "100%" }}
                            {...form.getInputProps("name")}
                        />
                        <TextInput
                            label="Code"
                            withAsterisk
                            placeholder="Enter Code"
                            disabled={true}
                            w={{ lg: "50%", sm: "100%" }}
                            {...form.getInputProps("code")}
                        />

                        <MultiSelect
                            label="Approval Roles"
                            withAsterisk
                            data={selectableRoles || []}
                            placeholder="Select Roles"
                            w={{ lg: "50%", sm: "100%" }}
                            value={form.values.roles}
                            onChange={(selected) => {
                                const superAdmin = roles.find((r: any) => r.name === "Super Admin")?._id;
                                if (form.values.roles.includes(superAdmin) && !selected.includes(superAdmin)) {
                                    toNotify("Warning", "You cannot remove Super Admin", "WARNING");
                                    form.setFieldValue("roles", [...selected, superAdmin]);
                                } else {
                                    form.setFieldValue("roles", selected);
                                }
                            }}
                        />

                        <Group mt="md">
                            <Button type="submit" ml="auto" disabled={!form.isDirty()}>
                               Update Passenger Status
                            </Button>
                        </Group>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default EditPassengerStatus;
