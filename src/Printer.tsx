export type PrinterImage = {
    filename?: string,
    base64: string,
}

export type Printer = {
    serial?: string;
    title: string;
    last_print?: { 
        file?: string, 
        md5?: string, 
        title?: string
    } | null; // Optional property
    state: PrinterState,
    last_accepted_md5?: string,
    gcode_information?: GcodeInformation,
    remaining_time_min?: number,
    remaining_percentage?: number,
    processing_new_print?: boolean
}

export type GcodeInformation = {
    length: number;
    weight: number;
    estimated_time: number;
    preview_image_base64?: string;
    available_images?: Array<PrinterImage>;
}

export enum PrinterState {
    IDLE = "IDLE",
    ERROR = "ERROR",
    FINISH = "FINISH",
    RUNNING = "RUNNING",
    PAUSE = "PAUSE",
    OFFLINE = "OFFLINE",
}