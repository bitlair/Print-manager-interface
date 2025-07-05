import React, { ReactNode, isValidElement } from 'react'
import _ from 'lodash'

export type BaseProps = {
    cache?: boolean;
    children?: ReactNode;
};

export type BaseState = {
    [key: string]: any;
};

export default class CustomComponent<
    P extends BaseProps = {},
    S extends BaseState = {}
> extends React.Component<P, S> {
    static defaultProps: { cache: boolean } = {
        cache: false
    }
    
    cache: boolean
    
    [key: string]: any  // Allow dynamic access to class methods

    constructor(props: P)
	{
        super(props)
        
        this.state = {} as S;
        this.cache = props.cache ?? false
        this.setStateAsync = this.setStateAsync.bind(this)

        const prototype = Object.getPrototypeOf(this)
        const bindedMethods: string[] = []

        // Bind methods that start with _
        let currentProto = prototype
        while (currentProto && currentProto !== CustomComponent.prototype) {
            const methods = Object.getOwnPropertyNames(currentProto)

            for (const methodName of methods) {
                if (
                    methodName.startsWith('_') &&
                    typeof this[methodName] === 'function' &&
                    !bindedMethods.includes(methodName)
                ) {
                    this[methodName] = this[methodName].bind(this)
                    bindedMethods.push(methodName)
                }
            }

            currentProto = Object.getPrototypeOf(currentProto)
        }
    }

    shouldComponentUpdate(nextProps: P, nextState: S): boolean {
        if (!this.cache)
            return true;

        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    }

    setStateAsync(state: Partial<S>): Promise<void> {
        return new Promise(resolve => this.setState(state as S, resolve));
    }

    render(): React.ReactElement {
        return <>{this.props.children}</>
    }
}