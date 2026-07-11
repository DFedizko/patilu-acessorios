/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity } from "@/server/domain/entity/Entity";

export interface Translator<DTO> {
    toDomain(dto: DTO): Entity<any, any>;
    toDTO(entity: Entity<any, any>): DTO;
}
