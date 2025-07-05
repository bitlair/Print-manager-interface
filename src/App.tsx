import React from 'react'
import CustomComponent, { BaseProps, BaseState } from './libs/CustomComponent';
import TouchableArea from './libs/TouchableArea';
import './globals/Defaults.less';
import './App.less';
import _ from 'lodash';
import moment from 'moment';
import { is_empty, time_to_minutes, seconds_to_time } from './libs/Functions';
import { io } from 'socket.io-client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnooze, faExclamationTriangle, faBadgeCheck, faGear, faPause, faUnlock, faTimes, faArrowRight, faHandHoldingDollar, faSpinner } from '@fortawesome/pro-solid-svg-icons';
import { faCircleDot } from '@fortawesome/pro-regular-svg-icons';

const BUFFER_MINUTES_TIME_DJO = 30;

type Printer = {
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
}

type GcodeInformation = {
	length: number;
	weight: number;
	estimated_time: number;
}

enum PrinterState {
	IDLE = "IDLE",
	ERROR = "ERROR",
	FINISH = "FINISH",
	RUNNING = "RUNNING",
	PAUSE = "PAUSE",
}

interface State {
	printers: Printer[];
	unlock_dialog_printer_serial?: string;
}

function isWithinDjoTime(): boolean {
	// always return on the dev build, easier that way
	if (process.env.NODE_ENV === 'development')
		return true;

	const now = moment();
	const iso_day: number = now.isoWeekday();
	const is_djo_day: boolean = iso_day == 5 || iso_day == 6; // 1 = monday, 7 = sunday
	const djo_time_minutes: object = {
		// 3: {
		// 	start_time: time_to_minutes('11:32') - BUFFER_MINUTES_TIME_DJO,
		// 	end_time: 	time_to_minutes('22:00') + BUFFER_MINUTES_TIME_DJO,
		// },
		5: {
			start_time: time_to_minutes('19:00') - BUFFER_MINUTES_TIME_DJO,
			end_time: time_to_minutes('22:00') + BUFFER_MINUTES_TIME_DJO,
		},
		6: {
			start_time: time_to_minutes('09:30') - BUFFER_MINUTES_TIME_DJO,
			end_time: time_to_minutes('13:30') + BUFFER_MINUTES_TIME_DJO,
		},
	}
	const current_time_minutes = time_to_minutes(now.format('HH:mm'));

	return (is_djo_day && current_time_minutes >= djo_time_minutes[iso_day].start_time && current_time_minutes <= djo_time_minutes[iso_day].end_time);
}

export default class App extends CustomComponent<{}, State> {
	socket: any;

	constructor(props: {}) {
		super(props);

		this.state = {
			printers: [
				{ title: 'printer 1', state: PrinterState.IDLE },
				{ title: 'printer 2', state: PrinterState.FINISH, last_print: { file: 'finished print.gcode' } },
				{ title: 'printer 3', state: PrinterState.PAUSE, last_print: { file: 'pending potato.gcode', md5: 'nothing' }, gcode_information: { length: 2280.2, weight: 6.86, estimated_time: 940 } },
				{ title: 'printer 4', state: PrinterState.RUNNING, last_print: { file: 'pretty_fly_for_my_wifi.gcode' } },
			],
			unlock_dialog_printer_serial: undefined,
		};
		
		this.socket = io('http://' + location.hostname + ':4000'); // match your server
	}

	componentDidMount() {
		this.socket.on('update printer data', (printers) => {
			this.setState({
				printers: printers
			});
			console.log('printers', printers);
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
		})
	}

	render() {
		const is_within_djo_time = isWithinDjoTime();

		// 4 block design
		return (
			<div className={'w-100 h-100 position-relative'}>
				<div className={'width-800-px height-480-px b-2 border-color-grey flex-direction-row flex-wrap flex-justify-content-space-around flex-align-items-center'}>
					{_.map(this.state.printers, (printer, index) => {
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
							background = 'background-color-blue';
							border_color = 'border-color-dark-blue';
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
						
						console.log(printer.state, PrinterState.PAUSE);

						if (printer.state == PrinterState.RUNNING || printer.state == PrinterState.PAUSE)
							unpaid = !printer.last_print || printer.last_accepted_md5 != printer.last_print.md5;

						// only show within DJO times
						if (unpaid && is_within_djo_time)
							on_click = this._openUnlockScreen;

						return (
							<TouchableArea
								key={index}
								onPress={on_click}
								onPressParams={printer}
								className={'position-relative border-radius-10-px b-2 flex-direction-column ' + border_color + ' printer-block text-bold ' + color + ' px-2 py-1 ' + background}
							>
								<div className={'flex-direction-row-center mb-1 f-2-5'}>
									<div className={'flex-12'}>{printer.title}</div>
									{display_state}
								</div>
								<div className={'flex-direction-row-center flex-1'}>
									<div className={'flex-12 mr-3 f-6 line-height-6 active-print-filename'}>
										{printer.last_print ? (printer.last_print.title || printer.last_print.file) : '-'}
									</div>
									<div className={'width-80-px center-children'}>
										<FontAwesomeIcon icon={icon} className={'f-16 ' + (icon == faGear && 'fa-spin')} />
									</div>
								</div>
								<div className={'f-2-5 mt-1 flex-direction-row-center'}>
									{!is_empty(printer.gcode_information) ?
										<>
											<div className={'flex-12'}>
												~ {printer.gcode_information.weight} gram.
											</div>
											~ {seconds_to_time(_.round(printer.gcode_information.estimated_time))}
										</>
										:
										<>
											<div className={'flex-12'}>
												0 gram
											</div>
											00:00:00
										</>
									}
								</div>
								{unpaid &&
									<div className={'unpaid-overlay position-absolute border-radius-20-px center-children'}>
										<FontAwesomeIcon icon={(is_within_djo_time ? faUnlock : faHandHoldingDollar)} className={'f-20 mr-4'} />
									</div>
								}
							</TouchableArea>
						);
					})}
				</div>
				<AuthenticateDialog
					open={this.state.unlock_dialog_printer_serial !== undefined}
					printer={_.find(this.state.printers, printer => printer.serial == this.state.unlock_dialog_printer_serial)}
					close={this._closeUnlockDialog}
					socket={this.socket}
				/>
			</div>
		);
	}
}

interface AuthenticateDialogProps extends BaseProps {
	open: boolean;
	printer?: Printer;
	close: () => void;
	socket: any;
}

interface AuthenticateDialogState extends BaseState {
	authenticated_username?: string;
	resuming: boolean
}

class AuthenticateDialog extends CustomComponent<AuthenticateDialogProps, AuthenticateDialogState> {
	static defaultProps: { cache: boolean } = {
		cache: true
	}
	
	constructor(props) {
		super(props);
		
		this.state = {
			resuming: 				false,
			authenticated_username: undefined,
		};
	}
	
	componentDidMount(): void {
		this.props.socket.on('user authenticated', (username) => {
			this.setState({
				authenticated_username: username
			});
		});
	}

	componentDidUpdate(prevProps) {
		console.log(this.props.printer);
		if (this.props.open && this.props.printer)
		{
			this.props.socket.emit('select printer', this.props.printer.serial);
			
			if(this.state.resuming && this.props.printer.state != "PAUSE")
				this.props.close();
		}
		else {
			if (this.state.authenticated_username || this.state.resuming)
				this.setState({
					resuming:				false,
					authenticated_username: undefined
				});
			
			this.props.socket.emit('deselect printer');
		}
	}

	_manualPayment(): void {
		this.props.socket.emit('accept print', false);
		
		this.setState({
			resuming: true,
		});
	}
	
	_automaticPayment(): void {
		this.props.socket.emit('accept print', true);
		
		this.setState({
			resuming: true,
		});
	}

	renderContent(is_within_djo_time): React.ReactElement {
		if(this.state.resuming)
			return <FontAwesomeIcon icon={faSpinner} className={'f-12'} spin />
		
		return (
			<div className={'flex-direction-column'}>
				{is_within_djo_time ?
					(this.state.authenticated_username ? 
						<>
							<div className={'f-3 text-align-center mb-3'}>
								Gebruiker gevonden: <b>{this.state.authenticated_username}</b>
							</div>
							<Button onPress={this._automaticPayment}>
								<FontAwesomeIcon icon={faArrowRight} className={'mr-2'} /> Automatisch afrekenen & hervatten
							</Button>
							<Button onPress={this._manualPayment} className={'mt-3'} solid={false}>
								<FontAwesomeIcon icon={faArrowRight} className={'mr-2'} /> Handmatig afrekenen & hervatten
							</Button>
						</>
						:
						<>
							<div className={'f-6 text-align-center'}>
								Vraag een begeleider
							</div>
							{this.props.printer &&
								<>
									<DisplayRow label={'Bestand'} value={this.props.printer.last_print ? (this.props.printer.last_print.title || this.props.printer.last_print.file) : 'Onbekend'} className={'f-2-5 mt-3'} />
									{this.props.printer.gcode_information &&
										<>
											<DisplayRow label={'Gewicht'} value={'~ ' + this.props.printer.gcode_information.weight + ' gram'} className={'f-2-5'} />
											<DisplayRow label={'Duratie'} value={'~ ' + seconds_to_time(_.round(this.props.printer.gcode_information.estimated_time))} className={'f-2-5'} />
										</>
									}
								</>
							}
						</>
					)
					:
					<div className={'center-children'}>
						<div className={'f-5'}>
							Bied je iButton aan <FontAwesomeIcon icon={faCircleDot} className={'ml-1'} />
						</div>
						<div className={'f-2-5 my-2'}>
							Of
						</div>
						<Button onPress={this._manualPayment}>
							<FontAwesomeIcon icon={faArrowRight} className={'mr-2'} /> Ik reken handmatig af.
						</Button>
					</div>
				}
			</div>
		);
	}

	render(): React.ReactElement {
		const is_within_djo_time = isWithinDjoTime();
		
		return (
			<div className={'position-absolute authenticate-dialog-background center-children ' + (this.props.open && 'open')}>
				<div className={'border-radius-10-px background-color-white p-5 flex-direction-column b-2 border-color-grey min-width-450-px'}>
					<div className={'flex-direction-row-center mb-4'}>
						<div className={'f-8 flex-12'}>
							{is_within_djo_time ? 'Vrijgeven' : 'Afrekenen'}
						</div>
						<Button onPress={this.props.close} square={true}>
							<FontAwesomeIcon icon={faTimes} className={'f-4 fa-square'} />
						</Button>
					</div>
					{this.renderContent(is_within_djo_time)}
				</div>
			</div>
		);
	}
}

interface ButtonProps extends BaseProps {
	onPress: () => void;
	onPressParams?: any;
	className?: string;
	children?: React.ReactNode;
	square?: boolean;
	solid?: boolean;
}

class Button extends CustomComponent<ButtonProps, {}> {
	render(): React.ReactElement {
		return (
			<TouchableArea {...this.props} className={(this.props.square ? 'p-1-5' : 'px-2-5 py-1-5') + ' b-3 border-color-blue ' + (this.props.solid != false ? 'background-color-blue color-white' : 'background-color-white color-blue') + ' border-radius-25-px button ml-2 f-3 ' + this.props.className}>
				{this.props.children}
			</TouchableArea>
		);
	}
}

interface DisplayRowProps extends BaseProps {
	label: string;
	value: any;
	className?: string;
}

class DisplayRow extends CustomComponent<DisplayRowProps, {}> {
	render(): React.ReactElement {
		return (
			<div className={'flex-direction-row-center my-0-5 ' + this.props.className}>
				<div className={'flex-12 mr-2'}>
					{this.props.label}
				</div>
				{this.props.value}
			</div>
		);
	}
}