import {
    Component, Input, Output, EventEmitter,
    OnInit, ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'nb-schedule',
    templateUrl: './schedule.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    host: {
        'class': 'nb-widget nb-schedule'
    },
    exportAs: 'nbSchedule'
})
export class ScheduleComponent implements OnInit {
    schedules: any;
    weekSelect: any;
    startpoint: any;
    flag = false;
    week = ['一', '二', '三', '四', '五', '六', '日'];
    hour = [
        '0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00',
        '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
    hours = [
        '0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00',
        '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
    ];
    constructor() {
        this.schedules = Array(168).fill(0);
        this.weekSelect = Array(7).fill(0);
    }

    ngOnInit() {

    }
    select(i, j) {
        this.schedules[i * 24 + j] = (this.schedules[i * 24 + j] + 1) % 2;

        let sum = 0;
        for (let k = i * 24; k < (i + 1) * 24; k++) {
            sum = sum + this.schedules[k];
        }
        if (sum === 0) {
            this.weekSelect[i] = 0;
        } else if (sum === 24) {
            this.weekSelect[i] = 2;
        } else {
            this.weekSelect[i] = 1;
        }
    }
    checkDay(j) {
        this.weekSelect[j] = this.weekSelect[j] > 0 ? 0 : 2;

        let value = parseInt(this.weekSelect[j] / 2 + '');
        for (let i = j * 24; i < (j + 1) * 24; i++) {
            this.schedules[i] = value;
        }
    }
    mouseup(i, j) {
        this.flag = false;
    }
    mousedown(i, j) {
        this.startpoint = [i, j];
        this.flag = true;
        this.preSelect(i, j);
    }
    mouseover(i, j) {
        if (this.flag === true) {
            this.preSelect(i, j);
        }

    }
    mouseout(i, j) {
        if (this.flag === true) {
            this.preSelect(i, j);
        }
    }
    preSelect(i, j) {
        let x1 = this.startpoint[0] < i ? this.startpoint[0] : i;
        let x2 = this.startpoint[0] > i ? this.startpoint[0] : i;
        let y1 = this.startpoint[1] < j ? this.startpoint[1] : j;
        let y2 = this.startpoint[1] > j ? this.startpoint[1] : j;
        for (let p = x1; p <= x2; p++) {
            for (let q = y1; q <= y2; q++) {
                this.select(p, q);
            }
        }
    }
}
