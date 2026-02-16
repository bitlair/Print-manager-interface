import CustomComponent, { BaseProps } from "./CustomComponent";
import TouchableArea from "./TouchableArea";

interface ButtonProps extends BaseProps {
    onPress: (even?: any, params?: any) => void;
    onPressParams?: any;
    className?: string;
    children?: React.ReactNode;
    square?: boolean;
    solid?: boolean;
    color?: string;
    disabled?: boolean;
}

export default class Button extends CustomComponent<ButtonProps, {}> {
    
    static defaultProps = {
        ...CustomComponent.defaultProps,
        color: 'blue',
    };

    render(): React.ReactElement {
        return (
            <TouchableArea {...this.props} className={(this.props.square ? 'p-1-5' : 'px-2-5 py-1-5') + ' b-3 border-color-' + this.props.color + ' ' + (this.props.solid != false ? 'background-color-' + this.props.color + ' color-white' : 'background-color-white color-' + this.props.color) + ' border-radius-25-px ml-2 f-3 ' + (this.props.disabled ? '' : 'button') + ' ' + this.props.className}>
                {this.props.children}
            </TouchableArea>
        );
    }
}