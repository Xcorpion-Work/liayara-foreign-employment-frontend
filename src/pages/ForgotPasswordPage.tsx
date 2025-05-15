import logo from "../assets/logo1.png";
import {
    Box,
    Button,
    Group,
    Text,
    TextInput,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { useForm } from "@mantine/form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store.ts";
import { forgotPassword } from "../store/authSlice/authSlice.ts";
import toNotify from "../hooks/toNotify.tsx";
import { useLoading } from "../hooks/loadingContext.tsx";
import xcorpion from "../assets/xcorpion.png";

const ForgotPasswordPage = () => {
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch | any>();

    const form = useForm({
        mode: "controlled",
        initialValues: {
            email: "",
        },
        validate: {
            email: (value) => {
                if (!value) {
                    return "Email is required";
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return "Enter a valid email";
                }

                return null; // No error
            },
        },
    });

    const handleForgotPassword = async (values: typeof form.values, event: any) => {
        event.preventDefault();
        setLoading(true);
        try {
            const payload = await dispatch(forgotPassword(values));
            switch (payload.type) {
                case "auth/forgotPassword/rejected": {
                    const error = payload.payload.error;
                    console.log("error", error);
                    setLoading(false);
                    toNotify("Error", `${error ?? "Please contact system admin"}`, "ERROR");
                    break;
                }
                case "auth/forgotPassword/fulfilled":
                    console.log("Forgot password submit successful");
                    setLoading(false);
                    toNotify("Success", `Please check your email`, "SUCCESS");
                    navigate("/login");
                    break;
                default:
                    setLoading(false);
                    break;
            }
        } catch (e: any) {
            setLoading(false);
            console.error("Unexpected error:", e.message);
            toNotify("Error", "Please contact system admin", "WARNING");
        }
    };

    return (
        <Box className="w-screen h-screen flex flex-col md:flex-row">
            {/* Left Side (Shown on sm and above) */}
            <Box className="hidden sm:flex md:w-1/2 bg-black text-white p-4 flex-col justify-between">
                <Box>
                    <img src={logo} alt="logo" className="h-16" />
                </Box>
                <Box className="flex-1 flex flex-col justify-end">
                    <Text className="text-lg">Liyara Foreign Employment ⌘</Text>
                    <br />
                    <Text className="text-sm">
                        Wijekoon Distributors is a company located in Mawathagama,
                        Kurunegala, Sri Lanka, specializing in business operations across
                        the North Western Province. The company focuses on the
                        distribution of mineral and chemical products, in collaboration
                        with Keshara Minerals and Chemicals (Pvt) Limited. Their expertise
                        in combining these products ensures efficient and reliable supply
                        chain operations within the region.
                    </Text>
                </Box>
            </Box>

            {/* Right Side (Login area) */}
            <Box className="w-full md:w-1/2 h-full bg-white flex flex-col justify-center items-center p-4">
                {/* Logo on Mobile */}
                <Box className="flex md:hidden justify-center mb-4">
                    <img src={logo} alt="logo" className="h-32" />
                </Box>
                <Box className="max-w-[400px] w-full">
                    <form onSubmit={form.onSubmit(handleForgotPassword)}>
                        <TextInput
                            withAsterisk
                            label="Email"
                            placeholder="your@email.com"
                            {...form.getInputProps("email")}
                        />
                        <Text
                            size="xs"
                            mt="xs"
                            onClick={() => navigate("/login")}
                            component="span"
                        >
                            <a className="text-blue-700 underline cursor-pointer">
                                Click here to login
                            </a>
                        </Text>

                        <Group
                            mt="md"
                            className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 md:space-x-4"
                        >
                            <Button type="submit" color="black" fullWidth>
                                Submit
                            </Button>
                        </Group>
                    </form>
                </Box>
                <Group
                    className="mt-4 flex flex-row items-center gap-4 border w-fit px-2 py-2 cursor-pointer"
                    onClick={() => window.open("https://xcorpion.xyz", "_blank")}
                >
                    <img src={xcorpion} alt="xcorpion" className="w-4" />
                    <Text size="xs">XCORPION</Text>
                </Group>
            </Box>
        </Box>
    );
};

export default ForgotPasswordPage;
