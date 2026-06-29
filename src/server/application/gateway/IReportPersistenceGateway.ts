import type { Period } from "@/server/domain/value-object/Period";
import type { OrderInPeriod } from "@/server/domain/service/PeriodReportCalculator";

export type ReportOrder = OrderInPeriod & {
    orderNumber: string;
    recipientName: string | null;
};

export interface IReportPersistenceGateway {
    listByPeriod(period: Period): Promise<ReportOrder[]>;
}
