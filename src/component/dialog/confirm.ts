import {
    Component, Input, Output, EventEmitter, AfterViewInit, AfterContentInit, ElementRef,
    OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, ContentChild,
    ViewChild
} from '@angular/core';
import { OnChange } from '../core/decorators';
import { Event } from '@angular/router/src/events';
import { DialogComponent } from './dialog';

export type AlertType = 'info' | 'error' | 'success';

@Component({
    selector: 'nb-confirm',
    templateUrl: './confirm.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    exportAs: 'nbConfirm',
    host: {
        'class': 'nb-widget'
    }
})

export class ConfirmComponent {

    @ViewChild(DialogComponent) dialog;

    @Input() type: AlertType;
    @Input() title: string = '';
    @Input() content: string = '';

    @OnChange(true)
    @Input() modalable: boolean = false;

    @OnChange(true)
    @Input() closable: boolean = false;

    @Output() confirmEvent: EventEmitter<Object> = new EventEmitter();
    @Output() cancelEvent: EventEmitter<Object> = new EventEmitter();

    constructor(
        private cdRef: ChangeDetectorRef,
        private el: ElementRef,
        public renderer: Renderer2) {
    }

    open() {
        this.dialog.show();
    }

    close() {
        this.dialog.hide();
        this.cancelEvent.emit();
    }

    cancel() {
        this.dialog.hide();
        this.cancelEvent.emit();
    }

    confirm() {
        this.dialog.hide();
        this.confirmEvent.emit();
    }
}
