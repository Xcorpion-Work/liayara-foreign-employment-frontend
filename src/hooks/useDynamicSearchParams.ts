import { useSearchParams } from "react-router-dom";

export const useDynamicSearchParams = (fieldCount: number) => {
    const [params, setParams] = useSearchParams();

    const values = Array.from({ length: fieldCount }, (_, i) =>
        params.get(`f${i}`) ?? ""
    );

    const update = (updated: string[]) => {
        const newParams = new URLSearchParams();
        updated.forEach((val, i) => {
            if (val) newParams.set(`f${i}`, val);
        });
        newParams.set("page", "1"); // Reset page on new search
        setParams(newParams);
    };

    const clear = () => {
        setParams({});
    };

    const page = parseInt(params.get("page") ?? "1");

    return { values, update, clear, page };
};
