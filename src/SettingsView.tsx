import { Socket } from "socket.io-client";
import Button from "./libs/Button";
import CustomComponent, { BaseProps, BaseState } from "./libs/CustomComponent";
import { Printer } from "./Printer";
import ActivityIndicator from "./libs/ActivityIndicator";
import DisplayRow from "./libs/DisplayRow";
import moment from "moment";
import _ from "lodash";
import { minutes_to_time, minutes_to_time_text } from "./libs/Functions";

interface SettingsViewProps extends BaseProps {
    printers: Printer[];
    socket: Socket;
    isWithinDjoTime: boolean;
}

interface SettingsViewState extends BaseState {
    fetching: boolean;
    ip_addresses: string[];
    root_active: boolean;
    djo_time_blocks: DjoTimeBlocks;
    last_paid_items: PaidItem[];
}

type TimeBlock = {
    start_time: number
    end_time: number
}

type DjoTimeBlocks = {
    [key: number]: TimeBlock
}

type PaidItem = {
    datetime: string;
	printer_index: number;
	weight: number;
	username?: string;
	ibutton_id?: string;
	filename: string;
}

export default class SettingsView extends CustomComponent<SettingsViewProps, SettingsViewState>
{
    constructor(props)
    {
        super(props);

        this.state = {
            fetching: true,
            ip_addresses: [],
            root_active: false,
            djo_time_blocks: {},
            last_paid_items: [],
        }
    }

    componentDidMount(): void {
        this.props.socket.on('settings', this._processSettingResponse);

        this.props.socket.emit('get settings');
    }

    componentWillUnmount(): void {
        this.props.socket.off('settings', this._processSettingResponse);
    }

    _processSettingResponse(response)
    {
        this.setState({
            ...response,
            fetching: false,
        });

        console.log('settings response', response);
    }

    _restart()
    {
        this.props.socket.emit('restart');
    }

    _shutdown()
    {
        this.props.socket.emit('shutdown');
    }

    _reload()
    {
        window.location.href = window.location.href;
    }

    render(): React.ReactElement {
        if(this.state.fetching)
            return (
                <div className="center-children h-100">
                    <ActivityIndicator className={'f-20'} />
                </div>
            );

        return (
            <div className="flex-12 flex-direction-column">
                <DisplayRow label={'IP adress(en)'} value={this.state.ip_addresses.join(', ')} className="mb-2" />
                {_.map(this.state.djo_time_blocks, (djo_time_block, day) => {
                    const date = moment().day(day);

                    return (
                        <DisplayRow key={day} label={'DJO tijden ' + date.format('dddd')} value={minutes_to_time(djo_time_block.start_time) + ' t/m ' + minutes_to_time(djo_time_block.end_time)} className="mb-2" />
                    );
                })}
                <div className="flex-direction-row-center mb-2">
                    <Button color={'dark-blue'} onPress={this._reload}>
                        Reload
                    </Button>
                    <Button color={(this.props.isWithinDjoTime ? 'grey' : 'orange')} onPress={this._restart} disabled={this.props.isWithinDjoTime}>
                        Restart
                    </Button>
                    <Button color={(this.props.isWithinDjoTime ? 'grey' : 'red')} onPress={this._shutdown} disabled={this.props.isWithinDjoTime}>
                        Shutdown
                    </Button>
                    {(process.env.NODE_ENV === 'development') &&
                        <Button onPress={(() => {this.props.socket.emit('debug', { clickedAt: Date.now() }); console.log('sending debug')})}>
                            DEBUG
                        </Button>
                    }
                </div>
                <div className="mb-5">
                    Systeem acties zijn beschikbaar buiten DJO tijden.
                </div>

                <div className="f-4 mb-2 text-bold">Afgerekende items</div>
                <div className="overflow-auto flex-12 flex-direction-column">
                    {_.size(this.state.last_paid_items) > 0 ? 
                        _.map(_.orderBy(this.state.last_paid_items, ['datetime'], ['desc']), (paid_item, paid_item_index) => {
                            return (
                                <div key={paid_item_index} className="mb-0-5 pb-0-5 bb-3 border-color-grey-15 flex-direction-row-center">
                                    <div className="width-125-px">
                                        [{moment(paid_item.datetime).format("DD MMM HH:mm")}]
                                    </div>
                                    <div className="flex-12 text-ellipsis">
                                        {paid_item.username} ({paid_item.ibutton_id}) heeft {paid_item.weight} gram. (&euro; {_.round((paid_item.weight * 0.03) + 0.1, 2)}) betaald voor {paid_item.filename}.
                                    </div>
                                </div>
                            );
                        })
                        :
                        <div className="text-italic f-2">
                            Geen afgerekende items gevonden
                        </div>
                    }
                </div>
            </div>
        );
    }
}