import { ApiError } from "@/lib/api-error";

const ERROR_MESSAGES: Record<string, string> = {
    INTERNAL_ERROR: "Erro interno no servidor",
    VALIDATION_ERROR: "Verifique os campos e tente novamente",
    UNAUTHENTICATED: "Você precisa estar autenticado para continuar",
    TIER_COST_MUST_BE_POSITIVE: "O custo da faixa deve ser maior que zero",
    CATEGORY_NAME_REQUIRED: "O nome da categoria é obrigatório",
    NOT_FOUND: "Registro não encontrado",
    CATEGORY_NOT_FOUND: "Categoria não encontrada",
    TIER_NOT_FOUND: "Faixa não encontrada",
    DUPLICATE_BARCODE: "Não foi possível gerar um código de barras único. Tente novamente.",
    ORDER_CANNOT_BE_PACKED: "Este pedido não pode ser empacotado",
    ORDER_NOT_FOUND: "Pedido não encontrado",
    PACKING_NOT_FOUND: "Empacotamento não encontrado",
    PACKING_REQUIRES_ITEM: "O empacotamento precisa de pelo menos um item",
    TIKTOK_NOT_CONFIGURED: "Integração com o TikTok não configurada",
    TIKTOK_API_ERROR: "Erro na comunicação com o TikTok. Tente novamente em instantes.",
};

const FALLBACK_MESSAGE = "Ocorreu um erro inesperado. Tente novamente.";
const INTERNAL_ERROR_MESSAGE = "Erro interno no servidor";

export const resolveMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        if (error.httpStatus === 500) return INTERNAL_ERROR_MESSAGE;
        return ERROR_MESSAGES[error.code] ?? FALLBACK_MESSAGE;
    }
    return INTERNAL_ERROR_MESSAGE;
};
