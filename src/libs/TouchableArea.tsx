import React from 'react';
import _ from 'lodash';
import styles from './globals/Defaults.less';

interface CommonProps
{
    onPress?: (even?: any, params?: any) => void;
    onPressParams?: any;
    onPressWithEvent?: boolean;
    debounceTime?: number;
    animateClick?: boolean;
    children?: React.ReactNode;
    className?: string;
}

interface TouchableAreaState
{
    touched: boolean;
}

class TouchableArea extends React.Component<CommonProps, TouchableAreaState>
{
    private timeout: NodeJS.Timeout | null;
    private _isMounted: boolean = false;

    constructor(props: CommonProps)
    {
        super(props);

        this.state = {
            touched: false
        };

        this.timeout = null;
    }
	
	static defaultProps: CommonProps = {
		debounceTime: 500,
		onPressWithEvent: true,
		animateClick: true,
	}

    componentDidMount()
    {
        this._isMounted = true;
    }

    componentWillUnmount()
    {
        this._isMounted = false;
    }

    handlePress = (e: any) =>
    {
        const { onPress, onPressParams, debounceTime = 500, onPressWithEvent = true } = this.props;

        if (this.timeout)
            clearTimeout(this.timeout);
        else if (onPressWithEvent && onPress)
            onPress(e, onPressParams);
        else if (onPress)
            onPress(onPressParams);

        this.timeout = setTimeout(() =>
        {
            this.timeout = null;
        }, debounceTime);
    };

    render()
    {
        const {
            children,
            onPress,
        } = this.props;

        if (!onPress)
            return <div className={this.props.className}>{children}</div>;
		
        const props: any = {
            onClick: this.handlePress,
            className: this.props.className || ''
        };
		
        return <div {...props}>{children}</div>;
    }
}

TouchableArea.defaultProps = {
    debounceTime: 500,
    onPressWithEvent: true,
    animateClick: true,
};

export default TouchableArea;