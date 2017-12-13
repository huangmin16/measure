import {
    Component, Input, Output, EventEmitter, ChangeDetectorRef,
    OnInit, ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';

export interface Message {
    severity?: string;
    message?: string;
    id?: any;
}

// TODO 可能没有必要
interface FormData {
    append(name: string, value: string | Blob, fileName?: string): void;
    delete(name: string): void;
    get(name: string): FormDataEntryValue | null;
    getAll(name: string): FormDataEntryValue[];
    has(name: string): boolean;
    set(name: string, value: string | Blob, fileName?: string): void;
}

@Component({
    selector: 'nb-uploader',
    templateUrl: './uploader.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    host: {
        'class': 'nb-widget nb-uploader',
        '[class.nb-uploader-horizontal]': 'direction==="horizontal"',
        '[class.nb-uploader-vertical]': 'direction==="vertical"'

    },
    exportAs: 'nbUploader'
})
export class UploaderComponent implements OnInit {

    @Input() name: string;

    @Input() url: string;

    @Input() method: string = 'POST';

    @Input() multiple: boolean;

    @Input() mode: string = 'image';

    @Input() accept: string = 'image/*';

    @Input() progressMode: string = 'text';

    // 暂时不定位file type
    // @Input() files: File[];
    // @Input() files: any[] = [];
    _files: any[] = [];
    @Input() set files(data) {
        this._files = data;
        this._files.forEach((file) => {
            file.state = 'success';
        });
    }

    get files () {
        return this._files;
    }

    @Input() direction: string = 'horizontal';

    @Input() auto: boolean = true;

    @Input() maxFileSize: number;

    @Input() maxFileCount: number;

    @Input() withCredentials: boolean;

    @Input() invalidFileCountMessage: string = '文件的数量超过限制';

    @Input() invalidFileSizeMessage: string = '{0}: 文件的大小不符合要求';

    @Input() invalidFileTypeMessage: string = '{0}: 文件的类型不符合要求';

    @Input() uploadFailedMessage: string = '{0}: 上传失败';

    @Output() onBeforeUpload: EventEmitter<any> = new EventEmitter();

    @Output() onBeforeSend: EventEmitter<any> = new EventEmitter();

    @Output() onUpload: EventEmitter<any> = new EventEmitter();

    @Output() onError: EventEmitter<any> = new EventEmitter();

    @Output() onClear: EventEmitter<any> = new EventEmitter();

    @Output() onRemove: EventEmitter<any> = new EventEmitter();

    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @Output() onProgress: EventEmitter<any> = new EventEmitter();

    @Output() uploadHandler: EventEmitter<any> = new EventEmitter();

    msgs: Message[];

    progress: number;

    /**
     * 文件上传的状态
     * 'uploading' | 'success' | 'error'
     */
    state: string;

    replacingFile: any = null;

    constructor(
        private cdRef: ChangeDetectorRef
    ) {

    }

    ngOnInit() {
        console.log(this.files);
    }

    onFileSelect(event) {
        this.msgs = [];

        let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;

        if (this.validateFileCount(files)) {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if (this.validate(file)) {
                    if (this.isImage(file)) {
                        // file.objectURL = this.sanitizer
                            // .bypassSecurityTrustUrl((window.URL.createObjectURL(files[i])));
                    }
                    file.state = 'toBeUpload';
                    if (this.replacingFile) {
                        this.files.splice(this.files.indexOf(this.replacingFile), 1, file);
                        this.replacingFile = null;
                    }
                    else {
                        this.files.push(file);
                    }
                    this.upload(file);
                }
            }
        }

        // this.onSelect.emit({originalEvent: event, files: files});

        this.clearInputElement();
    }

    upload(file) {
        file.state = 'uploading';
        let xhr = new XMLHttpRequest();
        file.xhr = xhr;

        this.onBeforeUpload.emit({
            'xhr': xhr,
            'file': file
        });

        xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
            if (e.lengthComputable) {
                file.progress = Math.round((e.loaded * 100) / e.total);
                this.cdRef.markForCheck();
            }

            this.onProgress.emit({originalEvent: e, progress: file.progress});
        }, false);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                file.progress = 0;

                if (xhr.status >= 200 && xhr.status < 300) {
                    this.onUpload.emit({xhr: xhr, file: file});
                    file.state = 'success';
                    file.xhr = null;
                    // 调用回调函数

                }
                else {
                    this.onError.emit({xhr: xhr, file: file});
                    file.state = 'error';
                    this.cdRef.markForCheck();
                    file.xhr = null;
                    // this.msgs.push({
                    //     severity: 'error',
                    //     message: this.uploadFailedMessage.replace('{0}', file.name),
                    // });
                }
                // TODO 先注释掉
                // this.clear();
            }
        };

        xhr.open(this.method, this.url, true);
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');

        this.onBeforeSend.emit({
            'xhr': xhr,
            'file': file
        });

        xhr.withCredentials = this.withCredentials;

        xhr.send(file);
    }

    validate(file: File): boolean {
        if (this.accept && !this.isFileTypeValid(file)) {
            this.msgs.push({
                severity: 'error',
                message: this.invalidFileTypeMessage.replace('{0}', file.name),
            });
            return false;
        }

        if (this.maxFileSize  && file.size > this.maxFileSize) {
            this.msgs.push({
                severity: 'error',
                message: this.invalidFileSizeMessage.replace('{0}', file.name),
            });
            return false;
        }

        return true;
    }

    validateFileCount(files): boolean {
        if (this.files.length + files.length > this.maxFileCount) {
            this.msgs.push({
                severity: 'error',
                message: this.invalidFileCountMessage,
            });
            return false;
        }

        return true;

    }

    isFileTypeValid(file: File): boolean {
        let acceptableTypes = this.accept.split(',');
        for (let type of acceptableTypes) {
            let acceptable = this.isWildcard(type) ?
                this.getTypeClass(file.type) === this.getTypeClass(type) :
                file.type === type || this.getFileExtension(file) === type;

            if (acceptable) {
                return true;
            }
        }

        return false;
    }

    isWildcard(fileType: string): boolean {
        return fileType.indexOf('*') !== -1;
    }

    getTypeClass(fileType: string): string {
        return fileType.substring(0, fileType.indexOf('/'));
    }

    getFileExtension(file: File): string {
        return '.' + file.name.split('.').pop();
    }

    formatSize(bytes) {
        if (bytes === 0) {
            return '0 B';
        }
        let k = 1000,
        dm = 3,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    isImage(file: File): boolean {
        return /^image\//.test(file.type);
    }

    hasFiles(): boolean {
        return this.files && this.files.length > 0;
    }

    clearInputElement() {
        // TODO 还应该有个input file用于重新上传
        // let inputViewChild = this.advancedFileInput||this.basicFileInput;
        // if(inputViewChild && inputViewChild.nativeElement) {
        //     inputViewChild.nativeElement.value = '';
        // }
    }

    clear() {
        this.files = [];
        this.onClear.emit();
        this.clearInputElement();
    }

    onCancelFile(file) {
        if (file.xhr) {
            file.xhr.abort();
        }
        this.onRemoveFile(file);
    }

    onRemoveFile(file) {
        this.files.splice(this.files.indexOf(file), 1);
        this.onRemove.emit({file: file});
    }

    onReuploadFile (file) {
        this.upload(file);
    }

    onReplaceFile(file) {
        this.replacingFile = file;
    }
}