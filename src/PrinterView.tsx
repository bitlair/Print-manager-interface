import CustomComponent, { BaseProps, BaseState } from "./libs/CustomComponent";
import { seconds_to_time } from "./libs/Functions";
import TouchableArea from "./libs/TouchableArea";
import { Printer, PrinterState } from "./Printer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnooze, faExclamationTriangle, faBadgeCheck, faGear, faPause, faUnlock, faHandHoldingDollar, faSpinner, faCircle, faBoltSlash } from '@fortawesome/pro-solid-svg-icons';
import { faCamera, faSlash } from '@fortawesome/pro-regular-svg-icons';
import _ from "lodash";
import Button from "./libs/Button";

interface PrinterViewProps extends BaseProps {
    printer: Printer;
    openUnlockScreen: (arg: any, printer: Printer) => void;
    isWithinDjoTime: boolean;
    smallDisplay: boolean;
}

interface PrinterViewState extends BaseState {
    image_index: number;
}

export default class PrinterView extends CustomComponent<PrinterViewProps, PrinterViewState>
{
    static defaultProps = {
        ...CustomComponent.defaultProps,
        smallDisplay: false,
    };

    constructor(props)
    {
        super(props);
        
        this.state = {
            image_index: 0,
        }

        if(this.props.smallDisplay)
            this.changeImageInterval = setInterval(this._increaseShownImageIndex, 10000);
    }
    
    _increaseShownImageIndex()
    {
        this.setState({
            image_index: this.state.image_index + 1,
        })
    }

    _selectImageIndex(e, index)
    {
        this.setState({
            image_index: index
        })
    }

    _renderImages(gcode_information)
    {
        if(gcode_information)
        {
            if(!_.isEmpty(gcode_information.available_images) && gcode_information.available_images.length > 1)
            {
                const amount_of_images 	= _.size(gcode_information.available_images);
                const image_index 		= this.state.image_index % amount_of_images;

                return (
                    <>
                        <div className='flex-12 h-100 flex-direction-row flex-justify-content-center'>
                            <img src={'data:image/png;base64,' + gcode_information.available_images[image_index].base64} className={'h-100'} />
                        </div>
                        <div className={'flex-direction-column center-children'}>
                            
                            {_.map(_.times(amount_of_images), (index) => {
                                if(this.props.smallDisplay)
                                    return <FontAwesomeIcon key={index} icon={faCircle} className={'my-0-5 f-1 color-' + (index == image_index ? 'blue' : 'grey')} />;

                                return (
                                    <Button key={index} onPress={this._selectImageIndex} onPressParams={index} color={'blue'} className={'mb-2'}>
                                        <FontAwesomeIcon icon={faCircle} className={'my-0-5 f-5 color-' + (index == image_index ? 'white' : 'grey')} />
                                    </Button>
                                );
                            })}
                        </div>
                    </>
                );
            }

            if(gcode_information.preview_image_base64)
                return <img src={'data:image/png;base64,' + gcode_information.preview_image_base64} className={'h-100'} />;
        }

        return (
            <>
                <FontAwesomeIcon icon={faCamera} className={'f-14'} />
                <FontAwesomeIcon icon={faSlash} className={'f-14 position-absolute'} />
            </>
        );
    }
    
    render()
    {
        const printer = this.props.printer;

        if(!printer)
            return null;

        const loading = printer.processing_new_print;

        let background = 'background-color-grey-7';
        let border_color = 'border-color-grey';
        let icon = faSnooze;
        let color = 'color-dark-grey';
        let unpaid = false;
        let on_click = undefined;
        let display_state = '';

        if (printer.state == PrinterState.FINISH) {
            background = 'background-color-green';
            border_color = 'border-color-dark-green';
            color = 'color-white';
            icon = faBadgeCheck;
            display_state = 'Afgerond';
        }
        else if (printer.state == PrinterState.ERROR) {
            background = 'background-color-orange';
            border_color = 'border-color-red';
            color = 'color-white';
            icon = faExclamationTriangle;
            display_state = 'Foutmelding';
        }
        else if (printer.state == PrinterState.RUNNING) {
            background = 'background-color-light-blue';
            border_color = 'border-color-blue';
            color = 'color-white';
            icon = faGear;
            display_state = 'Bezig ' + (printer.remaining_percentage || 0) + '% ' + (printer.remaining_time_min > 0 ? printer.remaining_time_min + ' min.' : '' );
        }
        else if (printer.state == PrinterState.PAUSE) {
            background = 'background-color-yellow';
            border_color = 'border-color-orange';
            color = 'color-white';
            icon = faPause;
            display_state = 'Gepauzeerd';
        }
        else if(printer.state == PrinterState.OFFLINE)
        {
            background = 'background-color-black';
            border_color = 'border-color-grey';
            color = 'color-white';
            icon = faBoltSlash;
            display_state = 'Offline';
        }
        
        if (printer.state == PrinterState.RUNNING || printer.state == PrinterState.PAUSE)
            unpaid = !printer.last_print || printer.last_accepted_md5 != printer.last_print.md5;

        // only show within DJO times
        if (unpaid)
            on_click = this._openUnlockScreen;
        
        let print_title = (printer.last_print ? (printer.last_print.title || printer.last_print.file) : undefined);
        
        return (
            <TouchableArea
                onPress={on_click}
                onPressParams={printer}
                className={'position-relative border-radius-10-px b-3 flex-direction-column ' + border_color + ' printer-block text-bold ' + color + ' px-2 py-1 ' + background}
            >
                <div className={'flex-direction-row-center mb-1 ' + (this.props.smallDisplay ? 'f-2-5' : 'f-4-5')}>
                    <div className={'flex-12'}>{printer.title}</div>
                    {display_state}
                </div>
                {print_title &&
                    <div className={'line-height-4 active-print-filename mb-1 ' + (this.props.smallDisplay ? 'f-4' : 'f-8')}>
                        {print_title}
                    </div>
                }
                <div className={'flex-direction-row flex-12 mb-0-5'}>
                    <div className={'mr-3 flex-direction-column ' + (this.props.smallDisplay ? 'width-150-px' : 'width-200-px')}>
                        <div className={'flex-12 center-children'}>
                            <FontAwesomeIcon icon={icon} className={(icon == faGear && 'fa-spin') + ' ' + (this.props.smallDisplay ? 'f-16' : 'f-22')} />
                        </div>
                        <div className={(this.props.smallDisplay ? 'f-2-5 line-height-2-5 ' : 'f-4-5 line-height-4-5 ')}>
                            ~ {(printer.gcode_information && printer.gcode_information.weight) || 0} gram. <br />
                            ~ {seconds_to_time(_.round((printer.gcode_information && printer.gcode_information.estimated_time) || 0))}
                        </div>
                    </div>
                    <div className={'flex-12 center-children flex-direction-row'}>
                        {this._renderImages(printer.gcode_information)}
                    </div>
                </div>
                {unpaid && !loading &&
                    <div className={'unpaid-overlay position-absolute border-radius-20-px center-children'}>
                        <FontAwesomeIcon icon={(this.props.isWithinDjoTime ? faUnlock : faHandHoldingDollar)} className={'f-20 mr-4'} />
                    </div>
                }
                {loading &&
                    <div className={'loading-overlay color-white position-absolute border-radius-20-px flex-direction-column center-children'}>
                        <FontAwesomeIcon icon={faSpinner} className={'f-20 mr-4'} spin />
                        <div className={'f-5 margin-auto mt-3'}>
                            Bestand uitlezen
                        </div>
                    </div>
                }
            </TouchableArea>
        );
    }
}