import type { HttpClient } from "@/lib/http/http-client";
import type { RenderLabelsZplDTO } from "@/lib/schemas";

export type LabelService = {
    renderZpl: (payload: RenderLabelsZplDTO) => Promise<{ zpl: string }>;
};

export const createLabelService = (http: HttpClient): LabelService => ({
    renderZpl: (payload) => http.post<{ zpl: string }, RenderLabelsZplDTO>("/labels/zpl", payload),
});
