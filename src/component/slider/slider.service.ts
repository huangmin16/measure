import { Injectable } from '@angular/core';
import { Scope } from './slider.config';
import { CoreValue } from './slider.config';
@Injectable()
export class SliderService {
    /**
     * 根据position计算slider-hand当前的value
     * @param pos trackerPos
     */
    getValue(pos: number, step: number, min: number, max: number): number {
        let value = Math.round((max - min) * pos / 100 + min);
        let remainder = value % step;
        let round = Math.floor(value / step);
        if (remainder < 5) {
            value = step * round;
        }
        else {
            value = step * (round + 1);
        }
        return value;
    }
}
