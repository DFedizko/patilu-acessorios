import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, subDays } from "date-fns";
import { Period } from "@/server/domain/value-object/Period";
import type { PeriodQueryDTO } from "@/lib/schemas";

const SAO_PAULO_TZ = "America/Sao_Paulo";

const DAYS_BACK_FOR_PERIOD: Record<string, number> = { today: 0, week: 6, month: 29 };

export const resolvePeriod = (query: PeriodQueryDTO): Period => {
    if (query.period === "custom") {
        return Period.create(new Date(query.from!), new Date(query.to!));
    }
    const todayInSaoPaulo = startOfDay(toZonedTime(new Date(), SAO_PAULO_TZ));
    const daysBack = DAYS_BACK_FOR_PERIOD[query.period] ?? 0;
    const firstDayInSaoPaulo = subDays(todayInSaoPaulo, daysBack);
    return Period.create(fromZonedTime(firstDayInSaoPaulo, SAO_PAULO_TZ), fromZonedTime(todayInSaoPaulo, SAO_PAULO_TZ));
};
