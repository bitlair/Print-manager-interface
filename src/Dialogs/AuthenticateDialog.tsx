import _ from "lodash";
import CustomComponent, { BaseProps, BaseState } from "../libs/CustomComponent";
import DisplayRow from "../libs/DisplayRow";
import { seconds_to_time } from "../libs/Functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faTimes, faArrowRight, faSpinner } from '@fortawesome/pro-solid-svg-icons';
import { faCircleDot } from '@fortawesome/pro-regular-svg-icons';
import Button from "../libs/Button";
import { Printer } from "../Printer";

interface AuthenticateDialogProps extends BaseProps {
	open: boolean;
	printer?: Printer;
	close: () => void;
	socket: any;
	isWithinDjoTime: boolean;
}

interface AuthenticateDialogState extends BaseState {
	authenticated_username?: string;
	resuming: boolean
}

export default class AuthenticateDialog extends CustomComponent<AuthenticateDialogProps, AuthenticateDialogState> {
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
	
	renderUnauthorizedContent(is_within_djo_time: boolean): React.ReactElement
	{
		return (is_within_djo_time ?
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
			:
			<div className={'center-children'}>
				<div className={'f-5'}>
					Bied je iButton aan <FontAwesomeIcon icon={faCircleDot} className={'ml-1'} />
				</div>
			</div>
		);
	}
	
	renderAuthorizedContent(is_within_djo_time: boolean): React.ReactElement
	{
		if(this.state.authenticated_username == '-1')
			return (
				<div className={'f-5 text-align-center'}>
					iButton niet herkend
				</div>
			);
		
		return (
			<>
				<div className={'f-3 text-align-center mb-3'}>
					Gebruiker gevonden: <b>{this.state.authenticated_username}</b>
				</div>
				<Button onPress={this._automaticPayment}>
					<FontAwesomeIcon icon={faArrowRight} className={'mr-2'} /> Automatisch afrekenen {is_within_djo_time ? '& hervatten' : ''}
				</Button>
				<Button onPress={this._manualPayment} className={'mt-3'} solid={false}>
					<FontAwesomeIcon icon={faArrowRight} className={'mr-2'} /> Handmatig afrekenen {is_within_djo_time ? ' & hervatten' : ''}
				</Button>
			</>
		);
	}

	renderContent(is_within_djo_time: boolean): React.ReactElement {
		if(this.state.resuming)
			return <FontAwesomeIcon icon={faSpinner} className={'f-12'} spin />
		
		return (
			<div className={'flex-direction-column'}>
				{(this.state.authenticated_username ? 
					this.renderAuthorizedContent(is_within_djo_time)
					:
					this.renderUnauthorizedContent(is_within_djo_time)
				)}
			</div>
		);
	}

	render(): React.ReactElement {
		return (
			<div className={'position-absolute authenticate-dialog-background center-children ' + (this.props.open && 'open')}>
				<div className={'border-radius-10-px background-color-white p-5 flex-direction-column b-2 border-color-grey min-width-450-px'}>
					<div className={'flex-direction-row-center mb-4'}>
						<div className={'f-8 flex-12'}>
							{this.props.isWithinDjoTime ? 'Vrijgeven' : 'Afrekenen'}
						</div>
						<Button onPress={this.props.close} square={true}>
							<FontAwesomeIcon icon={faTimes} className={'f-4 fa-square'} />
						</Button>
					</div>
					{this.renderContent(this.props.isWithinDjoTime)}
				</div>
			</div>
		);
	}
}