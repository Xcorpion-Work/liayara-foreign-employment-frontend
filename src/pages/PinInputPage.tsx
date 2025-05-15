import logo from "../assets/logo1.png";
import { Box, Group, PinInput, Text } from "@mantine/core";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store.ts";
import { loginByForgotPassword } from "../store/authSlice/authSlice.ts";
import toNotify from "../hooks/toNotify.tsx";
import { useLoading } from "../hooks/loadingContext.tsx";
import xcorpion from "../assets/xcorpion.png";
import { useState } from "react";

const PinInputPage = () => {
    const { setLoading } = useLoading();
    const [pin, setPin] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch | any>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const uuid = queryParams.get("uuid");

    const handleForgotPassword = async (recoveryCode: string, uuid: string) => {
        setLoading(true);
        try {
            const payload = await dispatch(
                loginByForgotPassword({ recoveryCode, uuid })
            );

            switch (payload.type) {
                case "auth/loginByForgotPassword/rejected": {
                    const error = payload.payload?.error;
                    console.log("error", error);
                    toNotify(
                        "Error",
                        `${error ?? "Please contact system admin"}`,
                        "ERROR"
                    );
                    break;
                }
                case "auth/loginByForgotPassword/fulfilled":
                    console.log("Login by forgot password successful");
                    navigate("/");
                    break;
                default:
                    console.warn("Unhandled dispatch type:", payload.type);
                    toNotify("Error", "Please contact system admin", "WARNING");
                    break;
            }
        } catch (e: any) {
            console.error("Unexpected error:", e.message);
            toNotify("Error", "Please contact system admin", "WARNING");
        } finally {
            setLoading(false);
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
                        Wijekoon Distributors is a company located in
                        Mawathagama, Kurunegala, Sri Lanka, specializing in
                        business operations across the North Western Province.
                        The company focuses on the distribution of mineral and
                        chemical products, in collaboration with Keshara
                        Minerals and Chemicals (Pvt) Limited. Their expertise in
                        combining these products ensures efficient and reliable
                        supply chain operations within the region.
                    </Text>
                </Box>
            </Box>

            {/* Right Side (Login area) */}
            <Box className="w-full md:w-1/2 h-full bg-white flex flex-col justify-center items-center p-4">
                {/* Logo on Mobile */}
                <Box className="flex md:hidden justify-center mb-4">
                    <img src={logo} alt="logo" className="h-32" />
                </Box>
                <Box className="max-w-[400px] w-full flex flex-col items-center">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (pin.length === 6 && uuid) {
                                handleForgotPassword(pin, uuid);
                            } else {
                                toNotify(
                                    "Error",
                                    "Please contact system admin",
                                    "WARNING"
                                );
                            }
                        }}
                    >
                        <Text>Enter your recovery code here</Text>
                        <Text mb="md" size="xs" c="dimmed">once you entered code, code will be changed. So if you entered code was wrong, request new code instead current one</Text>
                        <PinInput
                            length={6}
                            type="number"
                            value={pin}
                            onChange={(value) => {
                                setPin(value);
                                if (value.length === 6 && uuid) {
                                    handleForgotPassword(value, uuid);
                                }
                            }}
                            oneTimeCode
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
                    </form>
                </Box>

                <Group
                    className="mt-4 flex flex-row items-center gap-4 border w-fit px-2 py-2 cursor-pointer"
                    onClick={() =>
                        window.open("https://xcorpion.xyz", "_blank")
                    }
                >
                    <img src={xcorpion} alt="xcorpion" className="w-4" />
                    <Text size="xs">XCORPION</Text>
                </Group>
            </Box>
        </Box>
    );
};

export default PinInputPage;
