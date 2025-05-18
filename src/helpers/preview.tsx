export const datePreview = (date: string) => date?.split("T")[0];

export const rolePreview = (role: string) => {
    return role
        .split("_") // Split the string by underscores
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(" "); // Join the words with spaces
};

export const amountPreview = (amount: number): string => {
    if (isNaN(amount)) {
        return "0.00";
    }
    return `${amount?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const pageRange = (pageIndex: number, pageSize: number, total: number) => {
    if (total === 0) {
        return "0 - 0 / 0";
    }

    const start: number = (pageIndex - 1) * pageSize + 1;
    const end: number = Math.min(pageIndex * pageSize, total);
    return `${start} - ${end} / ${total}`;
};
