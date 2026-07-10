/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallowEqual } from "shallow-equal";

export interface ValueObjectProps {
    [key: string]: any;
}

export abstract class ValueObject<Props extends ValueObjectProps> {
    constructor(protected readonly props: Props) {
        this.props = Object.freeze({ ...props });
    }

    equals(vo: ValueObject<Props>): boolean {
        if (vo === null || vo === undefined) return false;
        if (vo.props === undefined) return false;
        return shallowEqual(vo.props, this.props);
    }
}
