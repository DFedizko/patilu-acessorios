import type { ITikTokOrdersGateway, TikTokOrderDTO } from "@/server/application/gateway/ITikTokOrdersGateway";

export class StubOrdersGateway implements ITikTokOrdersGateway {
    constructor(private order: TikTokOrderDTO) {}

    setOrder(order: TikTokOrderDTO): void {
        this.order = order;
    }

    async searchOrders(): Promise<TikTokOrderDTO[]> {
        return [this.order];
    }

    async getOrder(): Promise<TikTokOrderDTO> {
        return this.order;
    }
}
