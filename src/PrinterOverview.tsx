import CustomComponent, { BaseProps, BaseState } from "./libs/CustomComponent";
import _ from "lodash";
import { Printer, PrinterState } from "./Printer";
import PrinterView from "./PrinterView";


interface PrinterOverviewProps extends BaseProps {
    printers: Printer[];
    isWithinDjoTime: boolean;
    openUnlockScreen: (arg: any, printer: Printer) => void;
}

export default class PrinterOverview extends CustomComponent<PrinterOverviewProps, {}>
{
    render()
    {
        return (
            <>
                <div className={'flex-direction-row flex-wrap center-children h-100 overview-block'}>
                    {_.map(this.props.printers, (printer, index) => {
                        return (
                            <PrinterView
                                key={index}
                                printer={printer}
                                isWithinDjoTime={this.props.isWithinDjoTime}
                                openUnlockScreen={this.props.openUnlockScreen}
                                smallDisplay={true}
                            />
                        );
                    })} 
                </div>
            </>
        );
    }
}