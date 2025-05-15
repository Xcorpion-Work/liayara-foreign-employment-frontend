import { Box, Group, TextInput, Select, Checkbox, Button } from "@mantine/core";
import { IconClearAll, IconSearch } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";

interface FieldConfig {
    type: "text" | "select" | "checkbox" | "date";
    placeholder?: string;
    value?: any;
    options?: string[] | { label: string; value: string }[];
    clearable?: boolean;
    searchable?: boolean;
    label?: string;
    minDate?: Date;
    maxDate?: Date;
}

interface DynamicSearchBarProps {
    fields: FieldConfig[];
    values: any[]; // 👈 pass current values from parent
    onChange: (values: any[]) => void; // 👈 handle field change from parent
    onSearch: () => void;
    onClear: () => void;
}

export const DynamicSearchBar: React.FC<DynamicSearchBarProps> = ({ fields, values, onChange, onSearch, onClear }:DynamicSearchBarProps) => {
    const handleFieldChange = (index: number, value: any) => {
        const newValues = [...values];
        newValues[index] = value;
        onChange(newValues);
    };

    return (
        <Box mt="sm">
            <Group w={{ lg: "60%", sm: "100%" }}>
                {fields.map((field, index) => {
                    const commonProps = {
                        className: "w-full lg:w-1/4",
                        size: "sm" as const,
                        placeholder: field.placeholder,
                        value: values[index],
                    };

                    switch (field.type) {
                        case "text":
                            return (
                                <TextInput
                                    key={index}
                                    {...commonProps}
                                    onChange={(e) => handleFieldChange(index, e.target.value)}
                                    leftSection={<IconSearch size={14} />}
                                />
                            );
                        case "select":
                            return (
                                <Select
                                    key={index}
                                    {...commonProps}
                                    value={values[index] ?? null}
                                    data={field.options || []}
                                    searchable={field.searchable}
                                    clearable={field.clearable}
                                    onChange={(val) => handleFieldChange(index, val)}
                                />
                            );
                        case "checkbox":
                            return (
                                <Checkbox
                                    key={index}
                                    label={<span className="font-semibold">{field.label}</span>}
                                    checked={values[index]}
                                    onChange={(e) => handleFieldChange(index, e.currentTarget.checked)}
                                />
                            );
                        case "date":
                            return (
                                <DateInput
                                    key={index}
                                    {...commonProps}
                                    clearable
                                    minDate={field.minDate}
                                    maxDate={field.maxDate}
                                    onChange={(date) => handleFieldChange(index, date)}
                                />
                            );
                        default:
                            return null;
                    }
                })}
            </Group>

            <Group mt="md" w="100%" wrap="wrap" gap="sm">
                <Button
                    size="sm"
                    w={{ base: "calc(50% - 0.5rem)", sm: "auto" }} // 0.5rem = gap between buttons
                    onClick={onSearch}
                    leftSection={<IconSearch size={16} />}
                >
                    Search
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    w={{ base: "calc(50% - 0.5rem)", sm: "auto" }}
                    onClick={onClear}
                    leftSection={<IconClearAll size={16} />}
                >
                    Clear
                </Button>
            </Group>
        </Box>
    );
};
