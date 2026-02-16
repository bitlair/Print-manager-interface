import CustomComponent, { BaseProps } from "./CustomComponent";

interface DisplayRowProps extends BaseProps {
	label: string;
	value: any;
	className?: string;
}

export default class DisplayRow extends CustomComponent<DisplayRowProps, {}> {
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