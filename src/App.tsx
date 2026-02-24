import React, { JSX, JSXElementConstructor } from 'react'
import CustomComponent, { BaseProps, BaseState } from './libs/CustomComponent';
import TouchableArea from './libs/TouchableArea';
import './globals/Defaults.less';
import './App.less';
import _ from 'lodash';
import moment from 'moment';
import { time_to_minutes, seconds_to_time } from './libs/Functions';
import { io } from 'socket.io-client';
import PrinterOverview from './PrinterOverview';
import { Printer, PrinterState } from './Printer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare, faCog, faSquare1, faSquare2, faSquare3, faSquare4 } from '@fortawesome/pro-regular-svg-icons';
import { faSquare1 as faSquare1Solid, faSquare2 as faSquare2Solid, faSquare3 as faSquare3Solid, faSquare4 as faSquare4Solid } from '@fortawesome/pro-solid-svg-icons';
import PrinterView from './PrinterView';
import AuthenticateDialog from './Dialogs/AuthenticateDialog';
import Button from './libs/Button';
import SettingsView from './SettingsView';

moment.locale('nl');

const BUFFER_MINUTES_TIME_DJO = 30;
let djo_time_minutes: object = {
	// 3: {
	// 	start_time: time_to_minutes('11:32') - BUFFER_MINUTES_TIME_DJO,
	// 	end_time: 	time_to_minutes('22:00') + BUFFER_MINUTES_TIME_DJO,
	// },
	/*5: {
		start_time: time_to_minutes('19:00') - BUFFER_MINUTES_TIME_DJO,
		end_time: time_to_minutes('22:00') + BUFFER_MINUTES_TIME_DJO,
	},
	6: {
		start_time: time_to_minutes('09:30') - BUFFER_MINUTES_TIME_DJO,
		end_time: time_to_minutes('13:30') + BUFFER_MINUTES_TIME_DJO,
	},*/
}

interface State {
	printers: Printer[];
	djo_time_minutes: Object;
	active_page: Page;
	view_printer_index: number,
	unlock_dialog_printer_serial?: string;
}

enum Page {
	OVERVIEW,
	VIEW,
	SETTINGS
}

export default class App extends CustomComponent<{}, State> {
	socket: any;

	constructor(props: {}) {
		super(props);

		this.state = {
			printers: [
				{ title: 'printer 1', serial: '1', state: PrinterState.OFFLINE },
				{ title: 'printer 2', serial: '2', state: PrinterState.FINISH, last_print: { file: 'finished print.gcode' } },
				{ title: 'printer 3', serial: '3', state: PrinterState.PAUSE, last_print: { file: 'pending potato.gcode', md5: 'nothing' }, gcode_information: { length: 2280.2, weight: 6.86, estimated_time: 940 } },
				{ title: 'printer 4', serial: '4', state: PrinterState.RUNNING, last_print: { file: 'pretty_fly_for_my_wifi.gcode' } },
			],
			djo_time_minutes: {},
			active_page: Page.OVERVIEW,
			view_printer_index: 0,
			unlock_dialog_printer_serial: undefined,
		};

		if (process.env.NODE_ENV === 'development')
			this.server_url = 'http://printmanager.local:4000';
		else 
			this.server_url = 'http://' + location.hostname + ':4000';
		
		this.socket = io(this.server_url);
	}

	componentDidMount() {
		this.socket.on('update printer data', (printers) => {
			if(!_.isEqual(printers, this.state.printers))
			{
				this.setState({
					printers: printers
				});
				
				console.log('printers', printers);
			}
		});
		
		this.socket.on('update djo time minutes', (djo_time_minutes) => {
			this.setState({
				djo_time_minutes: djo_time_minutes
			});
			
			console.log('djo_time_minutes', djo_time_minutes);
		});
	}

	_isWithinDjoTime(): boolean {
		const now = moment();
		const iso_day: number = now.isoWeekday();
		const current_time_minutes = time_to_minutes(now.format('HH:mm'));

		return (this.state.djo_time_minutes[iso_day] && current_time_minutes >= this.state.djo_time_minutes[iso_day].start_time && current_time_minutes <= this.state.djo_time_minutes[iso_day].end_time);
	}

	_openOverview()
	{
		this.setState({
			active_page: Page.OVERVIEW
		});
	}

	_openPrinter(e, index: number)
	{
		this.setState({
			active_page: Page.VIEW,
			view_printer_index: index
		});
	}

	_openSettings()
	{
		this.setState({
			active_page: Page.SETTINGS
		})
	}

	_openUnlockScreen(e: any, printer: Printer) {
		this.setState({
			unlock_dialog_printer_serial: printer.serial
		});
	}

	_closeUnlockDialog() {
		this.setState({
			unlock_dialog_printer_serial: undefined
		});
	}

	render() {
		const is_within_djo_time = this._isWithinDjoTime();

		// 4 block design
		return (
			<div className={'w-100 h-100 position-relative'}>
				<div className={'screen-size b-2 border-color-grey flex-direction-row'}>
					<div className={'p-1 br-3 border-color-grey flex-direction-column flex-justify-content-space-between'}>
						<TouchableArea onPress={this._openOverview} className={'flex-direction-column line-height-3 border-radius center-children background-color-' + (this.state.active_page == Page.OVERVIEW ? 'dark-blue' : 'blue') + ' color-white height-80-px width-80-px f-5 mb-2'}>
							<div className='flex-direction-row'>
								<FontAwesomeIcon icon={faSquare} className='fa-square' />
								<FontAwesomeIcon icon={faSquare} className='fa-square' />
							</div>
							<div className='flex-direction-row'>
								<FontAwesomeIcon icon={faSquare} className='fa-square' />
								<FontAwesomeIcon icon={faSquare} className='fa-square' />
							</div>
						</TouchableArea>
						{_.map(this.state.printers, (printer: Printer, index: number) => {
							return (
								<TouchableArea key={printer.serial} onPress={this._openPrinter} onPressParams={index} className={'flex-direction-column border-radius center-children background-color-' + (this.state.active_page == Page.VIEW && this.state.view_printer_index == index ? 'dark-blue' : 'blue') + ' color-white height-80-px width-80-px f-5 mb-2'}>
									<div className='flex-direction-row'>
										<FontAwesomeIcon icon={(index == 0 ? faSquare1Solid : faSquare1)} className='fa-square' />
										<FontAwesomeIcon icon={(index == 1 ? faSquare2Solid : faSquare2)} className='fa-square' />
									</div>
									<div className='flex-direction-row'>
										<FontAwesomeIcon icon={(index == 2 ? faSquare3Solid : faSquare3)} className='fa-square' />
										<FontAwesomeIcon icon={(index == 3 ? faSquare4Solid : faSquare4)} className='fa-square' />
									</div>
								</TouchableArea>
							);
						})}
						<TouchableArea onPress={this._openSettings} className={'b-1 border-color-black border-radius center-children height-80-px width-80-px f-10'}>
							<FontAwesomeIcon icon={faCog} />
						</TouchableArea>
					</div>

					<div className={'p-1 flex-12'}>
						{this.state.active_page == Page.OVERVIEW &&
							<PrinterOverview
								isWithinDjoTime={is_within_djo_time}
								printers={this.state.printers}
								openUnlockScreen={this._openUnlockScreen}
							/>
						}

						{this.state.active_page == Page.VIEW &&
							<PrinterView
								printer={this.state.printers[this.state.view_printer_index]}
								openUnlockScreen={this._openUnlockScreen}
								isWithinDjoTime={is_within_djo_time}
							/>
						}

						{this.state.active_page == Page.SETTINGS &&
							<SettingsView
								printers={this.state.printers}
								socket={this.socket}
								isWithinDjoTime={is_within_djo_time}
							/>
						}
					</div>
				</div>
                <AuthenticateDialog
                    open={this.state.unlock_dialog_printer_serial !== undefined}
                    printer={_.find(this.state.printers, printer => printer.serial == this.state.unlock_dialog_printer_serial)}
                    close={this._closeUnlockDialog}
                    socket={this.socket}
                    isWithinDjoTime={is_within_djo_time}
                />
			</div>
		);
	}
}