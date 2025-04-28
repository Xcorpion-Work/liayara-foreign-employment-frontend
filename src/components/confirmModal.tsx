import { Button, Group, Modal, Text } from "@mantine/core";

interface ConfirmModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: string;
}

const ConfirmModal = ({
    opened,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmColor = "red",
}: ConfirmModalProps) => {
    return (
        <Modal opened={opened} onClose={onClose} title={title} centered>
            <Text mb="md">{message}</Text>

            <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={onClose}>
                    {cancelLabel}
                </Button>
                <Button color={confirmColor} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </Group>
        </Modal>
    );
};

export default ConfirmModal;
